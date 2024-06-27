const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;
const dataFile = 'data.json';

app.use(bodyParser.json());
app.use(cors());

// Load data from JSON file
function loadData() {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile);
        return JSON.parse(data);
    }
    return { books: [], transactions: [] };
}

// Save data to JSON file
function saveData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// API endpoints
app.get('/api/data', (req, res) => {
    const data = loadData();
    res.json(data);
});

app.post('/api/books', (req, res) => {
    const data = loadData();
    const { title, price, quantity } = req.body;

    const existingBook = data.books.find(book => book.title === title);
    if (existingBook) {
        existingBook.quantity += quantity;
    } else {
        data.books.push({ title, price, quantity });
    }

    saveData(data);
    res.status(201).json(data);
});

app.post('/api/transactions', (req, res) => {
    const data = loadData();
    const { action, book, quantity, total, timestamp } = req.body;

    data.transactions.push({ action, book, quantity, total, timestamp });

    saveData(data);
    res.status(201).json(data);
});

app.delete('/api/transactions/:id', (req, res) => {
    const data = loadData();
    const transactionId = parseInt(req.params.id, 10);
    data.transactions = data.transactions.filter((_, index) => index !== transactionId);

    saveData(data);
    res.status(200).json(data);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
