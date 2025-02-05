const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/profiles');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Upload profile image
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id; // Assuming user is authenticated
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete old avatar if exists
        if (user.avatar && user.avatar.startsWith('/uploads/profiles/')) {
            try {
                await fs.unlink(`public${user.avatar}`);
            } catch (error) {
                console.error('Error deleting old avatar:', error);
            }
        }

        // Update user avatar path
        const avatarPath = `/uploads/profiles/${req.file.filename}`;
        const updatedUser = await User.updateUser(userId, {
            avatar: avatarPath
        });

        res.json({
            success: true,
            avatar: avatarPath,
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete profile image
router.delete('/delete-avatar', async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user is authenticated
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.avatar && user.avatar.startsWith('/uploads/profiles/')) {
            await fs.unlink(`public${user.avatar}`);
            
            // Reset avatar to default
            const updatedUser = await User.updateUser(userId, {
                avatar: '/default-avatar.png'
            });

            res.json({
                success: true,
                user: updatedUser
            });
        } else {
            res.status(400).json({ error: 'No custom avatar to delete' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get profile image
router.get('/avatar/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ avatar: user.avatar });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 