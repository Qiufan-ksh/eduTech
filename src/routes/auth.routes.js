const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { createRequireAuth } = require('../middlewares/auth.middleware');

function normalizeEmail(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function serializeUser(user) {
    return {
        id: user.id,
        displayName: user.displayName,
        email: user.email
    };
}

function createAuthRouter({ User, authConfig }) {
    const router = express.Router();
    const requireAuth = createRequireAuth({ User, authConfig });
    const loginLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.' }
    });

    function setSessionCookie(res, user) {
        const token = jwt.sign(
            { sub: user.id },
            authConfig.secret,
            { expiresIn: authConfig.expiresIn, algorithm: 'HS256' }
        );

        res.cookie(authConfig.cookieName, token, {
            httpOnly: true,
            secure: authConfig.secureCookie,
            sameSite: 'strict',
            path: '/',
            maxAge: authConfig.cookieMaxAgeMs
        });
    }

    router.post('/register', loginLimiter, async (req, res, next) => {
        try {
            const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';
            const email = normalizeEmail(req.body?.email);
            const password = req.body?.password;

            if (displayName.length < 2 || displayName.length > 80) {
                return res.status(400).json({ error: 'Tên hiển thị phải có từ 2 đến 80 ký tự.' });
            }
            if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ error: 'Vui lòng nhập địa chỉ email hợp lệ.' });
            }
            if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
                return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự và tối đa 72 byte.' });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ error: 'Email này đã được đăng ký.' });
            }

            const passwordHash = await bcrypt.hash(password, authConfig.bcryptRounds);
            const user = await User.create({ displayName, email, passwordHash });
            setSessionCookie(res, user);
            return res.status(201).json({ user: serializeUser(user) });
        } catch (error) {
            return next(error);
        }
    });

    router.post('/login', loginLimiter, async (req, res, next) => {
        try {
            const email = normalizeEmail(req.body?.email);
            const password = req.body?.password;

            if (!email || typeof password !== 'string') {
                return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu.' });
            }

            const user = await User.scope('withPassword').findOne({ where: { email } });
            const passwordMatches = user
                ? await bcrypt.compare(password, user.passwordHash)
                : false;

            if (!user || !passwordMatches) {
                return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác.' });
            }

            setSessionCookie(res, user);
            return res.json({ user: serializeUser(user) });
        } catch (error) {
            return next(error);
        }
    });

    router.get('/me', requireAuth, (req, res) => {
        return res.json({ user: serializeUser(req.user) });
    });

    router.post('/logout', (req, res) => {
        res.clearCookie(authConfig.cookieName, {
            httpOnly: true,
            secure: authConfig.secureCookie,
            sameSite: 'strict',
            path: '/'
        });
        return res.status(204).end();
    });

    return router;
}

module.exports = { createAuthRouter };
