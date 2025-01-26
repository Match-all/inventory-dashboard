const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());

// In-memory user storage (replace with a database in production)
const users = [];

// In-memory cart storage (replace with a database in production)
const carts = {};

// Register endpoint
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword });
    res.status(201).send({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
        res.send({ token });
    } else {
        res.status(401).send({ message: 'Invalid credentials' });
    }
});

// Middleware to authenticate requests
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Add to cart endpoint
app.post('/cart', authenticateToken, (req, res) => {
    const { email } = req.user;
    const { productId } = req.body;
    if (!carts[email]) carts[email] = [];
    carts[email].push(productId);
    res.send({ message: 'Product added to cart' });
});

// Get cart endpoint
app.get('/cart', authenticateToken, (req, res) => {
    const { email } = req.user;
    res.send(carts[email] || []);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 