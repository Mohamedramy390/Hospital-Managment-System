const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    // role here is the RoleName strings (e.g. 'Doctor')
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if user exists
        const [existingUsers] = await db.query('SELECT * FROM User WHERE Username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Get RoleID from Role Table
        // Default to 'Staff' is not valid anymore, let's default to 'Nurse' or throw error
        // But for safety, user must provide valid role.
        let targetRoleName = role;
        

        const [roles] = await db.query('SELECT RoleID FROM Role WHERE RoleName = ?', [targetRoleName]);
        if (roles.length === 0) {
            return res.status(400).json({ message: 'Invalid Role specified' });
        }
        const roleId = roles[0].RoleID;

        console.log(roleId);
        console.log(targetRoleName);

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Insert with RoleID (and legacy Role enum for safety if not dropped, keeping both in sync ideally, 
        // but here we primarily care about RoleID. Use 'Staff' for legacy column to satisfy ENUM constraint if needed)
        // Actually, we'll try to insert just RoleID if we rely on it. 
        // But the legacy column might have NOT NULL default 'Staff'. Let's check schema.
        // We will insert RoleID. We also pass 'Staff' to the old column to be safe/lazy, or matches enum.
        // Wait, if I insert RoleID, I validly link them.

        const [result] = await db.query(
            'INSERT INTO User (Username, PasswordHash, RoleID, Role) VALUES (?, ?, ?, ?)',
            [username, hash, roleId, targetRoleName === 'Lab Technician' ? 'LabTech' : targetRoleName]
            // We map back to ENUM for legacy column compatibility
        );
        const userId = result.insertId;

        // If role is Patient, create a basic Patient profile
        if (targetRoleName === 'Patient') {
            await db.query(
                'INSERT INTO Patient (UserID, FirstName, LastName, DateOfBirth) VALUES (?, ?, ?, ?)',
                [userId, username, 'Patient', '2000-01-01']
            );
        } else {
            // Create Staff profile for ALL other roles
            await db.query(
                'INSERT INTO Staff (UserID, FirstName, LastName) VALUES (?, ?, ?)',
                [userId, username, targetRoleName]
            );
        }

        res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Updated Query: Join with Role table
        const [users] = await db.query(`
            SELECT u.*, r.RoleName 
            FROM User u 
            LEFT JOIN Role r ON u.RoleID = r.RoleID 
            WHERE u.Username = ?`,
            [username]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Use RoleName from table, fallback to legacy enum column if null
        const roleName = user.RoleName || user.Role;

        const token = jwt.sign(
            { id: user.UserID, role: roleName },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.UserID,
                username: user.Username,
                role: roleName
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.UserID as id, u.Username as username, r.RoleName as role 
            FROM User u 
            LEFT JOIN Role r ON u.RoleID = r.RoleID 
            WHERE u.UserID = ?`,
            [req.user.id]);

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
