const AuditLog = require('../models/AuditLog');

const auditMiddleware = (actionDescription) => {
    return async (req, res, next) => {
        // We assume authMiddleware has run and req.user exists
        if (req.user && req.user.id) {
            // We can capture dynamic details from params or body if needed
            // For now, simple static description
            await AuditLog.create(req.user.id, actionDescription);
        }
        next();
    };
};

module.exports = auditMiddleware;
