const normalizeRole = (role) => {
    if (!role) return role;
    const r = String(role).toLowerCase().trim();
    const map = {
        'admin': 'Admin',
        'doctor': 'Doctor',
        'nurse': 'Nurse',
        'patient': 'Patient',
        'staff': 'Staff',
        'receptionist': 'Receptionist',
        'pharmacist': 'Pharmacist',
        'labtech': 'LabTech',
        'lab tech': 'LabTech',
        'lab technician': 'LabTech',
        'lab technican': 'LabTech', // common misspelling
        'lab': 'LabTech'
    };
    return map[r] || role;
};

const rbacMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRole = normalizeRole(req.user.role);
        const allowed = allowedRoles.map((r) => normalizeRole(r));

        if (!allowed.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission' });
        }

        next();
    };
};

module.exports = rbacMiddleware;
