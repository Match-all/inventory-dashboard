require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const profileRoutes = require('./routes/profile');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/users', productRoutes);
app.use('/profile', profileRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 