const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class User {
    constructor() {
        this.csvPath = path.join(__dirname, '../data/users.csv');
        this.csvWriter = createCsvWriter({
            path: this.csvPath,
            header: [
                { id: 'id', title: 'ID' },
                { id: 'name', title: 'Name' },
                { id: 'email', title: 'Email' },
                { id: 'password', title: 'Password' },
                { id: 'avatar', title: 'Avatar' },
                { id: 'githubId', title: 'GitHub_ID' },
                { id: 'facebookId', title: 'Facebook_ID' },
                { id: 'products', title: 'Products' }
            ]
        });
    }

    // Read all users
    async getAllUsers() {
        const users = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(this.csvPath)
                .pipe(csv())
                .on('data', (row) => {
                    // Parse products from JSON string
                    row.products = JSON.parse(row.products || '[]');
                    users.push(row);
                })
                .on('end', () => resolve(users))
                .on('error', (error) => reject(error));
        });
    }

    // Find user by ID
    async findById(id) {
        const users = await this.getAllUsers();
        return users.find(user => user.id === id);
    }

    // Find user by social media ID
    async findBySocialId(platform, socialId) {
        const users = await this.getAllUsers();
        return users.find(user => user[`${platform}Id`] === socialId);
    }

    // Create new user
    async createUser(userData) {
        const users = await this.getAllUsers();
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            products: '[]'
        };
        users.push(newUser);
        await this.saveUsers(users);
        return newUser;
    }

    // Update user
    async updateUser(id, updates) {
        const users = await this.getAllUsers();
        const index = users.findIndex(user => user.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            await this.saveUsers(users);
            return users[index];
        }
        return null;
    }

    // Save users to CSV
    async saveUsers(users) {
        const records = users.map(user => ({
            ...user,
            products: JSON.stringify(user.products)
        }));
        await this.csvWriter.writeRecords(records);
    }
}

module.exports = new User(); 