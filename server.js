const express = require('express');
const path = require('path');
const http = require('http');

// Function to calculate Inventory Turnover
function calculateInventoryTurnover(cogs, averageInventory) {
    return cogs / averageInventory;
}

// Function to calculate Stockout Rate
function calculateStockoutRate(stockoutOccurrences, totalOrders) {
    return (stockoutOccurrences / totalOrders) * 100;
}

// Function to calculate Fill Rate
function calculateFillRate(ordersShippedComplete, totalOrders) {
    return (ordersShippedComplete / totalOrders) * 100;
}

// Function to calculate Days Sales of Inventory (DSI)
function calculateDSI(averageInventory, cogs) {
    return (averageInventory / cogs) * 365;
}

// Function to calculate Economic Order Quantity (EOQ)
function calculateEOQ(demand, orderingCost, holdingCost) {
    return Math.sqrt((2 * demand * orderingCost) / holdingCost);
}

// Function to calculate Inventory Shrinkage
function calculateInventoryShrinkage(recordedInventory, actualInventory) {
    return ((recordedInventory - actualInventory) / recordedInventory) * 100;
}

// Function to calculate Backorder Rate
function calculateBackorderRate(backorderedItems, totalItemsOrdered) {
    return (backorderedItems / totalItemsOrdered) * 100;
}

const app = express();
const PORT = 3000;

// Serve static files from the project directory
app.use(express.static(path.join(__dirname)));

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create an HTTP server
const server = http.createServer(app);

app.get('/calculate-kpis', (req, res) => {
    // Sample data
    const cogs = 100000;
    const averageInventory = 20000;
    const stockoutOccurrences = 10;
    const totalOrders = 100;
    const ordersShippedComplete = 95;
    const demand = 5000;
    const orderingCost = 50;
    const holdingCost = 5;
    const recordedInventory = 1000;
    const actualInventory = 950;
    const backorderedItems = 5;
    const totalItemsOrdered = 100;

    // Calculate KPIs
    const kpis = {
        inventoryTurnover: calculateInventoryTurnover(cogs, averageInventory),
        stockoutRate: calculateStockoutRate(stockoutOccurrences, totalOrders),
        fillRate: calculateFillRate(ordersShippedComplete, totalOrders),
        dsi: calculateDSI(averageInventory, cogs),
        eoq: calculateEOQ(demand, orderingCost, holdingCost),
        inventoryShrinkage: calculateInventoryShrinkage(recordedInventory, actualInventory),
        backorderRate: calculateBackorderRate(backorderedItems, totalItemsOrdered)
    };

    // Send response
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(kpis));
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
