function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Email này đã được đăng ký.' });
    }

    if (error.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Dữ liệu gửi lên vượt quá giới hạn cho phép.' });
    }

    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({ error: 'Nội dung JSON không hợp lệ.' });
    }

    console.error(error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại.' });
}

module.exports = { errorHandler };
