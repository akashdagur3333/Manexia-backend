exports.ok = (res, data) => res.json({ success: true, data });
exports.fail = (res, msg) => res.status(400).json({ success: false, msg });
