const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB Models
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'user' }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
    email: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: String,
    date: { type: Date, default: Date.now },
    status: String,
    items: [{
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    total: Number
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number,
    category: String,
    image: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Product = mongoose.model('Product', productSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Serve static files
app.use(express.static(__dirname));
app.use(express.static('data'));

// Routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pages/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'auth.html'));
});

app.get('/pages/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'profile.html'));
});

app.get('/pages/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'products.html'));
});

// API endpoints
app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({
            success: true,
            user: req.session.user
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Set session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        res.json({ success: true, message: 'Registration successful', user: req.session.user });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Failed to register user' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Save order endpoint
app.post('/api/saveOrder', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
        const { email, orderId, items, total } = req.body;
        
        const order = new Order({
            email,
            userId: req.session.user.id,
            orderId,
            items,
            total,
            status: 'Completed'
        });

        await order.save();

        res.json({
            success: true,
            message: 'Order saved successfully',
            order
        });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save order',
            error: error.message
        });
    }
});

// Get user orders
app.get('/api/user/orders', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
        const orders = await Order.find({ userId: req.session.user.id })
            .sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ 
            success: true, 
            products 
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch products' 
        });
    }
});

// Get filtered products
app.get('/api/products/filter', async (req, res) => {
    try {
        const { maxPrice, categories, sort } = req.query;
        
        // Build filter query
        let query = {};
        
        // Add price filter
        if (maxPrice) {
            query.price = { $lte: parseFloat(maxPrice) };
        }
        
        // Add category filter
        if (categories && categories !== 'undefined' && categories !== '') {
            query.category = { 
                $in: categories.split(',') 
            };
        }
        
        // Build sort query
        let sortQuery = {};
        switch(sort) {
            case 'price-low':
                sortQuery = { price: 1 };
                break;
            case 'price-high':
                sortQuery = { price: -1 };
                break;
            case 'newest':
            default:
                sortQuery = { createdAt: -1 };
        }

        const products = await Product.find(query).sort(sortQuery);
        
        res.json({ 
            success: true, 
            products 
        });
    } catch (error) {
        console.error('Error filtering products:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to filter products' 
        });
    }
});

// Get user profile
app.get('/api/user/profile', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    try {
        const user = await User.findById(req.session.user.id)
            .select('-password'); // Exclude password from the response
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile'
        });
    }
});

// Update user profile
app.post('/api/user/profile/update', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    try {
        const { name, email } = req.body;

        // Check if email is being changed and if it's already in use
        if (email !== req.session.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.session.user.id,
            { name, email },
            { new: true }
        ).select('-password');

        // Update session with new user data
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to logout'
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});