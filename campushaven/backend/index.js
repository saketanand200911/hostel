require('dotenv').config();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { promisify } = require('util');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 4000;
const CALENDAR_TIME_ZONE = 'Asia/Kolkata';
const googleSessions = new Map();
const LOG_SINK_NAME = process.env.GOOGLE_LOG_SINK_NAME || 'campushaven-bq-sink';
const LOG_SINK_DESTINATION = process.env.GOOGLE_LOG_SINK_DESTINATION || '';
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'campushaven';
const scryptAsync = promisify(crypto.scrypt);
let mongoDb;
let mongoConnectionPromise;

app.use(cors());
app.use(express.json());

function logEvent(severity, message, metadata = {}) {
  console.log(JSON.stringify({
    severity,
    message,
    service: 'campushaven-backend',
    timestamp: new Date().toISOString(),
    ...metadata
  }));
}

async function connectMongo() {
  if (!MONGODB_URI) return null;
  if (mongoDb) return mongoDb;
  if (!mongoConnectionPromise) {
    mongoConnectionPromise = MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    }).then(client => {
      mongoDb = client.db(MONGODB_DB_NAME);
      logEvent('INFO', 'mongodb_connected', { database: MONGODB_DB_NAME });
      return mongoDb;
    }).catch(error => {
      mongoConnectionPromise = null;
      logEvent('ERROR', 'mongodb_connection_failed', { error: error.message });
      return null;
    });
  }
  return mongoConnectionPromise;
}

async function requireMongo() {
  const database = await connectMongo();
  if (!database) {
    const error = new Error('MongoDB is not configured or unavailable. Set MONGODB_URI to your cluster0 connection string.');
    error.code = 'MONGODB_UNAVAILABLE';
    throw error;
  }
  return database;
}

function normalizeIdentifier(identifier) {
  return String(identifier || '').trim().toLowerCase();
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, expectedHex] = String(storedHash || '').split(':');
  if (!salt || !expectedHex) return false;
  const actual = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
}

function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user._id?.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    contact: user.identifier,
    role: user.role,
    provider: user.provider,
    institution: user.institution,
    gender: user.gender,
    floor: user.floor,
    roomNumber: user.roomNumber,
    picture: user.picture
  };
}

async function issueAuthToken(database, user) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await database.collection('authSessions').insertOne({
    tokenHash,
    userId: user._id,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  return token;
}

async function upsertGoogleUser(profile) {
  const database = await requireMongo();
  const identifier = normalizeIdentifier(profile.email);
  const existing = await database.collection('users').findOne({ identifier });
  await database.collection('users').updateOne(
    { identifier },
    {
      $set: {
        name: profile.name || profile.email.split('@')[0],
        email: identifier,
        picture: profile.picture,
        provider: 'google',
        updatedAt: new Date(),
        lastLoginAt: new Date()
      },
      $setOnInsert: {
        identifier,
        role: 'student',
        institution: 'hi-tech',
        gender: 'boys',
        floor: 'GF',
        roomNumber: '101',
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
  return {
    user: await database.collection('users').findOne({ identifier }),
    isFirstLogin: !existing
  };
}

async function initializeMongo() {
  const database = await connectMongo();
  if (!database) return;
  await database.collection('users').createIndex({ identifier: 1 }, { unique: true });
  await database.collection('authSessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    const severity = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARNING' : 'INFO';
    logEvent(severity, 'http_request', {
      httpRequest: {
        requestMethod: req.method,
        requestUrl: `${req.protocol}://${req.get('host')}${req.path}`,
        status: res.statusCode,
        latency: `${Date.now() - startedAt}ms`,
        userAgent: req.get('user-agent')
      }
    });
  });
  next();
});

const CALENDAR_DOCUMENT_ID = 'campushaven-calendar';
const defaultCalendarStore = {
  calendar: null,
  menuByDate: {},
  events: [],
  timeZone: CALENDAR_TIME_ZONE,
  updatedAt: null
};

async function readCalendarStore() {
  const database = await requireMongo();
  const stored = await database.collection('calendar').findOne({ _id: CALENDAR_DOCUMENT_ID });
  if (!stored) return { ...defaultCalendarStore };
  const { _id, ...calendarStore } = stored;
  return { ...defaultCalendarStore, ...calendarStore };
}

async function writeCalendarStore(store) {
  const database = await requireMongo();
  await database.collection('calendar').replaceOne(
    { _id: CALENDAR_DOCUMENT_ID },
    { _id: CALENDAR_DOCUMENT_ID, ...store },
    { upsert: true }
  );
}

function getLocalDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CALENDAR_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

function getGoogleRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/api/auth/google/callback`;
}

function getGoogleReturnUrl(candidate) {
  const fallback = process.env.GOOGLE_RETURN_URL || 'http://localhost:5500/login';
  if (typeof candidate !== 'string') return fallback;

  try {
    const requested = new URL(candidate);
    const configured = new URL(fallback);
    const isLocalFrontend = ['localhost', '127.0.0.1'].includes(requested.hostname)
      && requested.port === '5500'
      && ['/login', '/hostel.html'].includes(requested.pathname);
    if (!isLocalFrontend && (requested.origin !== configured.origin || requested.pathname !== configured.pathname)) return fallback;
    return requested.toString();
  } catch {
    return fallback;
  }
}

function createGoogleState(returnTo) {
  const payload = Buffer.from(JSON.stringify({
    returnTo,
    createdAt: Date.now(),
    nonce: crypto.randomBytes(24).toString('hex')
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.GOOGLE_CLIENT_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readGoogleState(state) {
  if (typeof state !== 'string') return null;
  const [payload, signature] = state.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = crypto.createHmac('sha256', process.env.GOOGLE_CLIENT_SECRET).update(payload).digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed.returnTo || Date.now() - parsed.createdAt > 10 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getMailTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function sendWelcomeEmail(user) {
  if (!user?.email) return false;
  const transport = getMailTransport();
  if (!transport) return false;
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: 'Welcome to CampusHaven',
    text: `Welcome to CampusHaven, ${user.name}! Your hostel portal account is ready.`,
    html: `<p>Welcome to CampusHaven, <strong>${user.name}</strong>!</p><p>Your hostel portal account is ready.</p>`
  });
  return true;
}

// Sample rooms dataset per floor, gender, institution, and occupancy
const sampleRooms = [
  // Ground Floor (GF)
  { id: 'GF-101', floor: 'GF', roomNumber: '101', gender: 'boys', institution: 'hi-tech', capacity: 2, occupied: 2, status: 'Full' },
  { id: 'GF-102', floor: 'GF', roomNumber: '102', gender: 'boys', institution: 'hi-tech', capacity: 2, occupied: 1, status: 'Available' },
  { id: 'GF-103', floor: 'GF', roomNumber: '103', gender: 'girls', institution: 'hi-tech', capacity: 2, occupied: 2, status: 'Full' },
  { id: 'GF-104', floor: 'GF', roomNumber: '104', gender: 'girls', institution: 'hi-tech', capacity: 2, occupied: 0, status: 'Vacant' },
  { id: 'GF-105', floor: 'GF', roomNumber: '105', gender: 'boys', institution: 'mirai', capacity: 3, occupied: 2, status: 'Available' },
  { id: 'GF-106', floor: 'GF', roomNumber: '106', gender: 'girls', institution: 'mirai', capacity: 3, occupied: 3, status: 'Full' },

  // First Floor (1F)
  { id: '1F-201', floor: '1F', roomNumber: '201', gender: 'boys', institution: 'hi-tech', capacity: 2, occupied: 1, status: 'Available' },
  { id: '1F-202', floor: '1F', roomNumber: '202', gender: 'boys', institution: 'hi-tech', capacity: 2, occupied: 2, status: 'Full' },
  { id: '1F-203', floor: '1F', roomNumber: '203', gender: 'girls', institution: 'hi-tech', capacity: 2, occupied: 1, status: 'Available' },
  { id: '1F-204', floor: '1F', roomNumber: '204', gender: 'girls', institution: 'hi-tech', capacity: 2, occupied: 2, status: 'Full' },
  { id: '1F-205', floor: '1F', roomNumber: '205', gender: 'boys', institution: 'mirai', capacity: 3, occupied: 1, status: 'Available' },
  { id: '1F-206', floor: '1F', roomNumber: '206', gender: 'girls', institution: 'mirai', capacity: 3, occupied: 2, status: 'Available' }
];

// Health endpoint
app.get('/api/health', async (req, res) => {
  const database = await connectMongo();
  res.json({ status: 'ok', mongodb: database ? 'connected' : 'unavailable' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { identifier, password, name, institution, gender, floor, roomNumber } = req.body || {};
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier || typeof password !== 'string' || password.length < 8 || !name) {
    return res.status(400).json({ message: 'Name, email or phone, and a password of at least 8 characters are required.' });
  }

  try {
    const database = await requireMongo();
    const users = database.collection('users');
    const existing = await users.findOne({ identifier: normalizedIdentifier });
    if (existing) return res.status(409).json({ message: 'An account already exists for this email or phone number.' });

    const isEmail = normalizedIdentifier.includes('@');
    const now = new Date();
    const user = {
      identifier: normalizedIdentifier,
      ...(isEmail ? { email: normalizedIdentifier } : { phone: normalizedIdentifier }),
      passwordHash: await hashPassword(password),
      name: String(name).trim(),
      role: 'student',
      provider: 'password',
      institution: institution || 'hi-tech',
      gender: gender || 'boys',
      floor: floor || 'GF',
      roomNumber: String(roomNumber || '101').trim(),
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    };
    let result;
    try {
      result = await users.insertOne(user);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'An account already exists for this email or phone number.' });
      }
      throw error;
    }
    user._id = result.insertedId;
    const welcomeEmailSent = await sendWelcomeEmail(user);
    if (welcomeEmailSent) {
      user.welcomeEmailSentAt = new Date();
      await users.updateOne({ _id: user._id }, { $set: { welcomeEmailSentAt: user.welcomeEmailSentAt } });
    }
    const token = await issueAuthToken(database, user);
    res.status(201).json({ user: toPublicUser(user), token, welcomeEmailSent });
  } catch (error) {
    logEvent('ERROR', 'signup_failed', { error: error.message });
    res.status(error.code === 'MONGODB_UNAVAILABLE' ? 503 : 500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  const normalizedIdentifier = normalizeIdentifier(identifier);
  if (!normalizedIdentifier || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email or phone and password are required.' });
  }

  try {
    const database = await requireMongo();
    const users = database.collection('users');
    const user = await users.findOne({ identifier: normalizedIdentifier });
    if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email/phone or password.' });
    }
    const isFirstLogin = !user.welcomeEmailSentAt;
    await users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    const welcomeEmailSent = isFirstLogin && await sendWelcomeEmail(user);
    if (welcomeEmailSent) {
      await users.updateOne({ _id: user._id }, { $set: { welcomeEmailSentAt: new Date() } });
    }
    const token = await issueAuthToken(database, user);
    res.json({ user: toPublicUser(user), token, welcomeEmailSent });
  } catch (error) {
    logEvent('ERROR', 'login_failed', { error: error.message });
    res.status(error.code === 'MONGODB_UNAVAILABLE' ? 503 : 500).json({ message: error.message });
  }
});

app.get(['/api/auth/google/start', '/api/auth/google'], (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    logEvent('ERROR', 'google_oauth_not_configured');
    return res.status(503).json({ message: 'Google OAuth is not configured on the backend.' });
  }

  const returnTo = getGoogleReturnUrl(req.query.returnTo);
  const state = createGoogleState(returnTo);

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account'
  });
  logEvent('INFO', 'google_oauth_started');
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const session = readGoogleState(req.query.state);
  if (!session) return res.status(400).send('Google login session expired or invalid.');
  if (req.query.error) return res.redirect(`${session.returnTo}?google_error=${encodeURIComponent(req.query.error)}`);

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: getGoogleRedirectUri(),
        grant_type: 'authorization_code'
      })
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(tokens.error_description || 'Google token exchange failed');

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.email) throw new Error('Google profile email unavailable');

    const { user: storedUser, isFirstLogin } = await upsertGoogleUser(profile);
    const user = toPublicUser(storedUser);
    const welcomeEmailSent = (isFirstLogin || !storedUser.welcomeEmailSentAt) && await sendWelcomeEmail(user);
    if (welcomeEmailSent) {
      const database = await requireMongo();
      await database.collection('users').updateOne(
        { _id: storedUser._id },
        { $set: { welcomeEmailSentAt: new Date() } }
      );
    }
    const loginToken = crypto.randomBytes(32).toString('hex');
    const token = await issueAuthToken(database, storedUser);
    googleSessions.set(loginToken, { user, token, welcomeEmailSent, createdAt: Date.now() });
    res.redirect(`${session.returnTo}${session.returnTo.includes('?') ? '&' : '?'}google_session=${loginToken}`);
  } catch (error) {
    logEvent('ERROR', 'google_oauth_callback_failed', { error: error.message });
    res.redirect(`${session.returnTo}${session.returnTo.includes('?') ? '&' : '?'}google_error=${encodeURIComponent(error.message)}`);
  }
});

app.get('/api/auth/google/session', (req, res) => {
  const session = googleSessions.get(req.query.token);
  if (!session || !session.user) return res.status(401).json({ message: 'Google login session is invalid or expired.' });
  googleSessions.delete(req.query.token);
  res.json({ user: session.user, token: session.token, welcomeEmailSent: session.welcomeEmailSent });
});

// Mock rooms endpoint
app.get('/api/rooms', (req, res) => {
  const { gender, floor, institution } = req.query;
  let filtered = [...sampleRooms];
  if (gender) {
    filtered = filtered.filter(r => r.gender.toLowerCase() === gender.toLowerCase());
  }
  if (floor) {
    filtered = filtered.filter(r => r.floor.toUpperCase() === floor.toUpperCase());
  }
  if (institution) {
    filtered = filtered.filter(r => r.institution.toLowerCase() === institution.toLowerCase());
  }
  res.json(filtered);
});

app.get('/api/calendar', async (req, res) => {
  try {
    res.json({ ...await readCalendarStore(), timeZone: CALENDAR_TIME_ZONE, today: getLocalDateKey() });
  } catch (error) {
    res.status(error.code === 'MONGODB_UNAVAILABLE' ? 503 : 500).json({ message: error.message });
  }
});

app.get('/api/time', (req, res) => {
  const now = new Date();
  res.json({
    timeZone: CALENDAR_TIME_ZONE,
    date: getLocalDateKey(now),
    time: new Intl.DateTimeFormat('en-IN', {
      timeZone: CALENDAR_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(now),
    iso: now.toISOString()
  });
});

app.get('/api/calendar/menu', async (req, res) => {
  try {
    const requestedDate = typeof req.query.date === 'string' ? req.query.date : getLocalDateKey();
    const store = await readCalendarStore();
    const menu = store.menuByDate[requestedDate] || null;
    res.json({ date: requestedDate, menu, timeZone: CALENDAR_TIME_ZONE, calendar: store.calendar });
  } catch (error) {
    res.status(error.code === 'MONGODB_UNAVAILABLE' ? 503 : 500).json({ message: error.message });
  }
});

app.post('/api/calendar', async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ message: 'Calendar upload must be a JSON object.' });
  }

  try {
    const existing = await readCalendarStore();
    const menuByDate = payload.menuByDate && typeof payload.menuByDate === 'object' && !Array.isArray(payload.menuByDate)
      ? payload.menuByDate
      : existing.menuByDate;
    const calendar = payload.calendar || payload;
    const events = Array.isArray(payload.events) ? payload.events : Array.isArray(payload.items) ? payload.items : existing.events;
    const store = {
      calendar: { ...calendar, timeZone: CALENDAR_TIME_ZONE },
      menuByDate,
      events,
      timeZone: CALENDAR_TIME_ZONE,
      updatedAt: new Date().toISOString()
    };
    await writeCalendarStore(store);
    res.status(201).json(store);
  } catch (error) {
    res.status(error.code === 'MONGODB_UNAVAILABLE' ? 503 : 500).json({ message: error.message });
  }
});

initializeMongo().catch(error => {
  logEvent('ERROR', 'mongodb_initialization_failed', { error: error.message });
});

app.listen(PORT, () => {
  logEvent('INFO', 'server_started', {
    port: PORT,
    loggingSink: {
      name: LOG_SINK_NAME,
      destination: LOG_SINK_DESTINATION || undefined
    }
  });
});

