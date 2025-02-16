const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Product Schema (same as in server.js)
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number,
    category: String,
    image: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Product data
const products = [
    {
        name: "Traditional Shema",
        description: "Beautiful handwoven traditional Ethiopian Shema",
        price: 199.99,
        image: "../images/shema1.jpg",
        stock: 10,
        category: "shema"
    },
    {
        name: "Classic Tibeb",
        description: "Elegant Ethiopian Tibeb with intricate patterns",
        price: 249.99,
        image: "../images/tibeb1.jpg",
        stock: 8,
        category: "tibeb"
    },
    {
        name: "White Netela",
        description: "Pure white Ethiopian Netela with decorative borders",
        price: 149.99,
        image: "../images/netela1.jpg",
        stock: 15,
        category: "netela"
    },
    {
        name: "Premium Shema Set",
        description: "Complete traditional outfit with premium cotton",
        price: 199.99,
        image: "https://via.placeholder.com/300x200?text=Premium+Shema+Set",
        stock: 15,
        category: "shema"
    },
    {
        name: "Decorative Tibeb Runner",
        description: "Table runner with traditional Ethiopian patterns",
        price: 59.99,
        image: "https://via.placeholder.com/300x200?text=Tibeb+Runner",
        stock: 40,
        category: "tibeb"
    },
    {
        name: "Modern Netela Wrap",
        description: "Contemporary take on traditional Netela design",
        price: 89.99,
        image: "https://via.placeholder.com/300x200?text=Modern+Netela",
        stock: 35,
        category: "netela"
    },
    {
        name: "Festival Shema",
        description: "Special occasion Shema with gold threading",
        price: 149.99,
        image: "https://via.placeholder.com/300x200?text=Festival+Shema",
        stock: 20,
        category: "shema"
    },
    {
        name: "Tibeb Cushion Cover",
        description: "Decorative cushion cover with traditional patterns",
        price: 29.99,
        image: "https://via.placeholder.com/300x200?text=Tibeb+Cushion",
        stock: 60,
        category: "tibeb"
    },
    {
        name: "Children's Netela",
        description: "Smaller sized Netela for children",
        price: 49.99,
        image: "https://via.placeholder.com/300x200?text=Kids+Netela",
        stock: 45,
        category: "netela"
    },
    {
        name: "Wedding Shema Set",
        description: "Luxurious Shema set for special ceremonies",
        price: 299.99,
        image: "https://via.placeholder.com/300x200?text=Wedding+Shema",
        stock: 10,
        category: "shema"
    }
];

async function migrateProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        const result = await Product.insertMany(products);
        console.log(`Successfully migrated ${result.length} products`);

        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

// Run the migration
migrateProducts(); 