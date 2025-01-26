const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Serve static files
app.use(express.static(__dirname)); // Serve files from root directory
app.use(express.static('data')); // Allow direct access to data folder

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

// Mock data endpoints for profile
app.get('/api/orders', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.json({
        success: true,
        orders: [] // Add mock orders here
    });
});

app.get('/api/wishlist', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.json({
        success: true,
        items: [] // Add mock wishlist items here
    });
});

app.get('/api/reviews', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.json({
        success: true,
        reviews: [] // Add mock reviews here
    });
});

// Products API endpoint
app.get('/data/products.csv', (req, res) => {
    res.sendFile(path.join(__dirname, 'data', 'products.csv'));
});

// CSV file paths
const usersFile = path.join(__dirname, 'data', 'users.csv');
const ordersFile = path.join(__dirname, 'data', 'orders.csv');
const wishlistFile = path.join(__dirname, 'data', 'wishlist.csv');
const reviewsFile = path.join(__dirname, 'data', 'reviews.csv');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Create users.csv if it doesn't exist
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, 'id,name,email,password\n');
}

// Ensure data files exist
const ensureFileExists = (filePath, headers) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, headers.join(',') + '\n');
    }
};

ensureFileExists(ordersFile, ['email', 'userId', 'orderId', 'date', 'status', 'items', 'total']);
ensureFileExists(wishlistFile, ['userId', 'itemId', 'name', 'price', 'image']);
ensureFileExists(reviewsFile, ['userId', 'productName', 'date', 'rating', 'comment']);

// CSV Writer setup
const csvWriter = createCsvWriter({
    path: usersFile,
    header: [
        { id: 'id', title: 'id' },
        { id: 'name', title: 'name' },
        { id: 'email', title: 'email' },
        { id: 'password', title: 'password' }
    ]
});

// Helper function to read users
async function getUsers() {
    const users = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(usersFile)
            .pipe(csv())
            .on('data', (data) => users.push(data))
            .on('end', () => resolve(users))
            .on('error', (error) => reject(error));
    });
}

// Endpoint for user registration
app.post('/api/register', express.json(), async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const users = await getUsers();
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user ID
        const userId = Date.now().toString();

        // Append new user to CSV
        const newUser = { id: userId, name, email, password: hashedPassword };
        await csvWriter.writeRecords([...users, newUser]);

        // Set session or token
        req.session.user = { id: newUser.id, email: newUser.email, name: newUser.name };

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

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const users = await getUsers();
        const user = users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
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

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Update profile endpoint
app.put('/api/profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { name, email } = req.body;
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.id === req.session.user.id);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        users[userIndex].name = name || users[userIndex].name;
        users[userIndex].email = email || users[userIndex].email;

        await csvWriter.writeRecords(users);

        req.session.user = {
            ...req.session.user,
            name: users[userIndex].name,
            email: users[userIndex].email
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                name: users[userIndex].name,
                email: users[userIndex].email
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Profile update failed' });
    }
});

// Add these before the catch-all route

// Cart session storage
app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
});

// Cart API endpoints
app.post('/api/cart', async (req, res) => {
    try {
        const item = req.body;
        const existingItemIndex = req.session.cart.findIndex(cartItem => cartItem.id === item.id);

        if (existingItemIndex !== -1) {
            req.session.cart[existingItemIndex].quantity += 1;
        } else {
            req.session.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image
            });
        }

        res.json({ 
            success: true, 
            message: 'Item added to cart',
            cart: req.session.cart 
        });
    } catch (error) {
        console.error('Cart add error:', error);
        res.status(500).json({ success: false, message: 'Failed to add item to cart' });
    }
});

app.get('/api/cart', (req, res) => {
    try {
        res.json({ 
            success: true, 
            cart: req.session.cart 
        });
    } catch (error) {
        console.error('Cart fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cart' });
    }
});

app.delete('/api/cart/:productId', (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        req.session.cart = req.session.cart.filter(item => item.id !== productId);
        
        res.json({ 
            success: true, 
            message: 'Item removed from cart',
            cart: req.session.cart 
        });
    } catch (error) {
        console.error('Cart remove error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove item from cart' });
    }
});

app.put('/api/cart/:productId', (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quantity must be at least 1' 
            });
        }

        const itemIndex = req.session.cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Item not found in cart' 
            });
        }

        req.session.cart[itemIndex].quantity = parseInt(quantity);
        
        res.json({ 
            success: true, 
            message: 'Cart updated',
            cart: req.session.cart 
        });
    } catch (error) {
        console.error('Cart update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
});

// Checkout endpoint
app.post('/api/cart/checkout', (req, res) => {
    try {
        if (!req.session.cart || req.session.cart.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cart is empty' 
            });
        }

        // Here you would typically:
        // 1. Process payment
        // 2. Create order record
        // 3. Clear cart
        // 4. Send confirmation email
        
        // For now, we'll just clear the cart
        req.session.cart = [];
        
        res.json({ 
            success: true, 
            message: 'Checkout successful' 
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, message: 'Checkout failed' });
    }
});

// Clear cart endpoint
app.delete('/api/cart', (req, res) => {
    try {
        req.session.cart = [];
        res.json({ 
            success: true, 
            message: 'Cart cleared',
            cart: [] 
        });
    } catch (error) {
        console.error('Cart clear error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear cart' });
    }
});

// Products and filter routes
app.get('/api/products', async (req, res) => {
    try {
        console.log('Received filter request:', req.query);
        
        // Read products from CSV
        const products = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(path.join(__dirname, 'data', 'products.csv'))
                .pipe(csv())
                .on('data', (data) => {
                    products.push({
                        ...data,
                        id: parseInt(data.id),
                        price: parseFloat(data.price),
                        stock: parseInt(data.stock)
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        let filteredProducts = [...products];

        // Apply price filter
        if (req.query.maxPrice) {
            const maxPrice = parseFloat(req.query.maxPrice);
            filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
        }

        // Apply category filter
        if (req.query.categories) {
            const categories = req.query.categories.split(',');
            filteredProducts = filteredProducts.filter(product => categories.includes(product.category.trim().toLowerCase()));
        }

        // Apply sorting
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'price-low':
                    filteredProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    filteredProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    filteredProducts.sort((a, b) => b.id - a.id);
                    break;
            }
        }

        res.json({ success: true, products: filteredProducts });
    } catch (error) {
        console.error('Error processing products:', error);
        res.status(500).json({ success: false, message: 'Error loading products' });
    }
});

// Serve payment page
app.get('/pages/payment', (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        res.redirect('/pages/products');
        return;
    }
    res.sendFile(path.join(__dirname, 'pages', 'payment.html'));
});

// Checkout endpoint
app.post('/api/checkout', async (req, res) => {
    try {
        console.log('Received checkout request:', req.body);

        if (!req.session.cart || req.session.cart.length === 0) {
            console.log('Checkout failed: Cart is empty');
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Simulate payment processing
        const paymentDetails = req.body;
        console.log('Processing payment for:', paymentDetails);

        // Simulate a successful payment
        const order = {
            id: Date.now().toString(),
            items: req.session.cart,
            total: req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            customer: {
                name: paymentDetails.customerName,
                email: paymentDetails.customerEmail,
                address: {
                    street: paymentDetails.address,
                    city: paymentDetails.city,
                    zipCode: paymentDetails.zipCode
                }
            },
            status: 'confirmed',
            date: new Date()
        };

        // Clear the cart after successful payment
        req.session.cart = [];

        console.log('Payment successful, order created:', order);

        res.json({
            success: true,
            message: 'Payment processed successfully',
            order: order
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed'
        });
    }
});

// Endpoint to get user profile
app.get('/api/user/profile', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const users = await getUsers();
        const user = users.find(u => u.id === req.session.user.id);
        console.log('Fetched User:', user); // Debugging line
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }
});

// Endpoint to get user orders
app.get('/api/user/orders', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const orders = await readCsvData(ordersFile);
        const userOrders = orders.filter(order => order.userId === req.session.user.id);
        res.json({ success: true, orders: userOrders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});

// Endpoint to get user wishlist
app.get('/api/user/wishlist', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const wishlist = await readCsvData(wishlistFile);
        const userWishlist = wishlist.filter(item => item.userId === req.session.user.id);
        res.json({ success: true, items: userWishlist });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
    }
});

// Endpoint to get user reviews
app.get('/api/user/reviews', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const reviews = await readCsvData(reviewsFile);
        const userReviews = reviews.filter(review => review.userId === req.session.user.id);
        res.json({ success: true, reviews: userReviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});

// Helper function to read CSV data
const readCsvData = async (filePath) => {
    const data = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => data.push(row))
            .on('end', () => resolve(data))
            .on('error', (error) => reject(error));
    });
};

// Endpoint to save order
app.post('/api/saveOrder', async (req, res) => {
    const { userId, orderId, date, status, items, total } = req.body;

    // Calculate total if not provided
    const calculatedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    const csvWriter = createCsvWriter({
        path: path.join(__dirname, 'data', 'orders.csv'),
        header: [
            { id: 'email', title: 'email' },
            { id: 'userId', title: 'userId' },
            { id: 'orderId', title: 'orderId' },
            { id: 'date', title: 'date' },
            { id: 'status', title: 'status' },
            { id: 'items', title: 'items' },
            { id: 'total', title: 'total' }
        ],
        append: true
    });

    const orderData = {
        email: userId, // Assuming email is used as userId
        userId,
        orderId,
        date,
        status,
        items: JSON.stringify(items),
        total: total || calculatedTotal
    };

    try {
        await csvWriter.writeRecords([orderData]);
        res.json({ success: true, message: 'Order saved successfully' });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ success: false, message: 'Failed to save order' });
    }
});

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, message: 'Access denied' });
}

// Middleware to check if user is worker
function isWorker(req, res, next) {
    if (req.session.user && (req.session.user.role === 'worker' || req.session.user.role === 'admin')) {
        return next();
    }
    res.status(403).json({ success: false, message: 'Access denied' });
}

// Endpoint to list products
app.get('/api/inventory', isWorker, async (req, res) => {
    try {
        const products = await readCsvData(path.join(__dirname, 'data', 'products.csv'));
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
    }
});

// Endpoint to add a product
app.post('/api/inventory', isWorker, express.json(), async (req, res) => {
    try {
        const { name, price, stock, category } = req.body;
        const products = await readCsvData(path.join(__dirname, 'data', 'products.csv'));

        const newProduct = {
            id: Date.now().toString(),
            name,
            price: parseFloat(price),
            stock: parseInt(stock),
            category
        };

        products.push(newProduct);

        const csvWriter = createCsvWriter({
            path: path.join(__dirname, 'data', 'products.csv'),
            header: [
                { id: 'id', title: 'ID' },
                { id: 'name', title: 'Name' },
                { id: 'price', title: 'Price' },
                { id: 'stock', title: 'Stock' },
                { id: 'category', title: 'Category' }
            ]
        });

        await csvWriter.writeRecords(products);

        res.json({ success: true, message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, message: 'Failed to add product' });
    }
});

// Endpoint to delete a product
app.delete('/api/inventory/:id', isWorker, async (req, res) => {
    try {
        const productId = req.params.id;
        let products = await readCsvData(path.join(__dirname, 'data', 'products.csv'));

        products = products.filter(product => product.id !== productId);

        const csvWriter = createCsvWriter({
            path: path.join(__dirname, 'data', 'products.csv'),
            header: [
                { id: 'id', title: 'ID' },
                { id: 'name', title: 'Name' },
                { id: 'price', title: 'Price' },
                { id: 'stock', title: 'Stock' },
                { id: 'category', title: 'Category' }
            ]
        });

        await csvWriter.writeRecords(products);

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});

// Catch-all route for handling client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', '404.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});