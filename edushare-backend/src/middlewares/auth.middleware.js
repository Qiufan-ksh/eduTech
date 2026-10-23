const jwt = require('jsonwebtoken');

function createRequireAuth({ User, authConfig }) {
    return async function requireAuth(req, res, next) {
        const token = req.cookies[authConfig.cookieName];
        if (!token) {
            return res.status(401).json({ error: 'Bạn cần đăng nhập để tiếp tục.' });
        }

        try {
            const payload = jwt.verify(token, authConfig.secret, { algorithms: ['HS256'] });
            const user = await User.findByPk(payload.sub);
            if (!user) {
                return res.status(401).json({ error: 'Phiên đăng nhập không còn hợp lệ.' });
            }

            req.user = user;
            return next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' });
            }

            return next(error);
        }
    };
}

module.exports = { createRequireAuth };
