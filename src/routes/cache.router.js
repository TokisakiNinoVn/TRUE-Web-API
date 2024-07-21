const express = require('express');
const router = express.Router();
const { clearCache } = require('../services/cache');

/**
 * Xóa toàn bộ cache trên hệ thống.
 * Chỉ sử dụng để test khi nghi ngờ có bug liên quan tới cache.
 */
router.post('/clear', (req, res, next)=> {
    clearCache();
    next({
        statusCode: 200,
        message: 'Xóa tất cả cache thành công'
    }, req, res, next)
})

module.exports = router;