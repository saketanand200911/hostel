use('campushaven');

db.users.find(
    {},
    {
        passwordHash: 0
    }
).sort({ createdAt: -1 }).limit(20);

db.authSessions.find(
    {},
    {
        tokenHash: 0
    }
).sort({ createdAt: -1 }).limit(20);