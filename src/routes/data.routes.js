const express = require('express');
const multer = require('multer');
const { rateLimit } = require('express-rate-limit');
const { createRequireAuth } = require('../middlewares/auth.middleware');
const { InvalidSurveyCsvError, preprocessSurveyCsv } = require('../services/surveyPreprocessing.service');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
        fields: 0
    }
});

function createDataRouter({ User, authConfig }) {
    const router = express.Router();
    const requireAuth = createRequireAuth({ User, authConfig });
    const preprocessLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 10,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: 'Quá nhiều yêu cầu xử lý dữ liệu. Vui lòng thử lại sau 15 phút.' }
    });

    router.post('/preprocess', requireAuth, preprocessLimiter, upload.single('file'), (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ error: 'Vui lòng tải lên tệp CSV trong trường "file".' });
        }
        if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
            return res.status(400).json({ error: 'Chỉ chấp nhận tệp có phần mở rộng .csv.' });
        }

        try {
            const cleanedCsv = preprocessSurveyCsv(req.file.buffer.toString('utf8'));
            res.set({
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="survey-cleaned.csv"'
            });
            return res.status(200).send(cleanedCsv);
        } catch (error) {
            if (error instanceof InvalidSurveyCsvError) {
                return res.status(400).json({ error: error.message });
            }
            return next(error);
        }
    });

    return router;
}

module.exports = { createDataRouter };
