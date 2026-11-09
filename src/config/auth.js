function getAuthConfig(env = process.env) {
    const secret = env.JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET must be configured with at least 32 characters.');
    }

    const expiresIn = env.JWT_EXPIRES_IN || '7d';
    const durationMatch = /^([1-9]\d*)(s|m|h|d)$/.exec(expiresIn);
    if (!durationMatch) {
        throw new Error('JWT_EXPIRES_IN must be a positive duration such as 15m, 12h, or 7d.');
    }
    const durationUnitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const cookieMaxAgeMs = Number(durationMatch[1]) * durationUnitMs[durationMatch[2]];
    if (!Number.isSafeInteger(cookieMaxAgeMs)) {
        throw new Error('JWT_EXPIRES_IN is too large.');
    }

    const bcryptRounds = Number.parseInt(env.BCRYPT_ROUNDS || '12', 10);
    if (!Number.isInteger(bcryptRounds) || bcryptRounds < 10 || bcryptRounds > 15) {
        throw new Error('BCRYPT_ROUNDS must be an integer between 10 and 15.');
    }

    return {
        secret,
        expiresIn,
        cookieMaxAgeMs,
        cookieName: env.COOKIE_NAME || 'edushare_session',
        bcryptRounds,
        secureCookie: env.NODE_ENV === 'production'
    };
}

module.exports = { getAuthConfig };
