const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple Login Route (using plain text for now as per dummy data simplicity, can add bcrypt later)
router.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        let user = await User.findOne({ username, role });

        if (!user) {
            // For this project, if user doesn't exist, we'll create one (Auto-registration for demo)
            user = new User({ username, password, role });
            await user.save();
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
