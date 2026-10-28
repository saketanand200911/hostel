use('campushaven');

db.users.find(
    { lastLoginAt: { $exists: true } },
    {
        passwordHash: 0
    }
).sort({ lastLoginAt: -1, createdAt: -1 });

db.authSessions.find(
    {},
    {
        tokenHash: 0
    }
).sort({ createdAt: -1 }).limit(20);