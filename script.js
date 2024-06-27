const BASE_URL = 'https://harvardbooks-328e81ecb17d.herokuapp.com/';

function loadInventory() {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const inventoryTable = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
            inventoryTable.innerHTML = '';

            data.books.forEach((book, index) => {
                const row = inventoryTable.insertRow();
                row.insertCell().textContent = book.title;
                row.insertCell().textContent = book.price.toLocaleString();
                row.insertCell().textContent = book.quantity;
                row.insertCell().textContent = (book.price * book.quantity).toLocaleString();

                const editCell = row.insertCell();
                const editIcon = document.createElement('i');
                editIcon.classList.add('bi', 'bi-pencil-square', 'edit-icon');
                editIcon.style.cursor = 'pointer';
                editIcon.addEventListener('click', () => editBook(index, book.title));
                editCell.appendChild(editIcon);
            });
        });
}

function loadTodaysStats() {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const statsTable = document.getElementById('statsTable').getElementsByTagName('tbody')[0];
            statsTable.innerHTML = '';

            data.transactions.forEach((transaction, index) => {
                const row = statsTable.insertRow();
                row.insertCell().textContent = transaction.action;
                row.insertCell().textContent = transaction.book;
                row.insertCell().textContent = transaction.quantity;
                row.insertCell().textContent = transaction.total.toLocaleString();
                row.insertCell().textContent = transaction.timestamp;

                const deleteCell = row.insertCell();
                const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('bi', 'bi-trash', 'delete-icon');
                deleteIcon.style.cursor = 'pointer';
                deleteIcon.addEventListener('click', () => deleteTransaction(index));
                deleteCell.appendChild(deleteIcon);
            });
        });
}

function addBook() {
    const title = document.getElementById('bookTitle').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    fetch(`${BASE_URL}/api/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title, price: getPrice(title), quantity: quantity })
    })
        .then(response => response.json())
        .then(() => {
            loadInventory();
            addTransaction('Added', title, quantity);
        });
}

function sellBook() {
    const title = document.getElementById('sellBookTitle').value;
    const quantity = parseInt(document.getElementById('sellQuantity').value);

    fetch(`${BASE_URL}/api/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title, quantity: -quantity })
    })
        .then(response => response.json())
        .then(() => {
            loadInventory();
            addTransaction('Sold', title, quantity);
        });
}

function addTransaction(action, book, quantity) {
    const total = getPrice(book) * quantity;
    const timestamp = new Date().toLocaleString();

    fetch(`${BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: action, book: book, quantity: quantity, total: total, timestamp: timestamp })
    })
        .then(response => response.json())
        .then(() => {
            loadTodaysStats();
        });
}

function filterStatsByDate() {
    const filterDate = document.getElementById('filterDate').value;

    fetch(`${BASE_URL}/api/transactions?date=${filterDate}`)
        .then(response => response.json())
        .then(transactions => {
            const statsTable = document.getElementById('statsTable').getElementsByTagName('tbody')[0];
            statsTable.innerHTML = '';

            transactions.forEach((transaction, index) => {
                const row = statsTable.insertRow();
                row.insertCell().textContent = transaction.action;
                row.insertCell().textContent = transaction.book;
                row.insertCell().textContent = transaction.quantity;
                row.insertCell().textContent = transaction.total.toLocaleString();
                row.insertCell().textContent = transaction.timestamp;

                const deleteCell = row.insertCell();
                const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('bi', 'bi-trash', 'delete-icon');
                deleteIcon.style.cursor = 'pointer';
                deleteIcon.addEventListener('click', () => deleteTransaction(index));
                deleteCell.appendChild(deleteIcon);
            });
        });
}

function editBook(index, title) {
    const password = prompt('Enter password to edit:');
    if (password === 'Rasul9898aa') {
        const newQuantity = prompt('Enter new quantity:');
        if (newQuantity !== null) {
            fetch(`${BASE_URL}/api/books/${index}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: parseInt(newQuantity) })
            })
                .then(response => response.json())
                .then(() => {
                    loadInventory();
                });
        }
    } else {
        alert('Incorrect password.');
    }
}

function deleteTransaction(index) {
    const password = prompt('Enter password to delete:');
    if (password === 'Rasul9898aa') {
        fetch(`${BASE_URL}/api/transactions/${index}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(() => {
                loadTodaysStats();
            });
    } else {
        alert('Incorrect password.');
    }
}

function getPrice(title) {
    const prices = {
        "Beginner": 85000,
        "Elementary": 85000,
        "Pre-Intermediate": 85000,
        "Intermediate": 85000,
        "Kids Level 1": 60000,
        "Kids Level 2": 60000,
        "Kids Level 3": 60000,
        "Kids Level 4": 60000,
        "Kids Level 5": 60000,
        "Kids Level 6": 60000,
        "Kids High Level 1": 60000,
        "Kids High Level 2": 60000,
        "Listening Beginner": 30000,
        "Listening Elementary": 30000,
        "Listening Pre-Intermediate": 30000,
        "Listening Intermediate": 35000
    };
    return prices[title];
}

function exportCurrentInventory() {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const csv = convertToCSV(data.books);
            downloadCSV(csv, 'current_inventory.csv');
        });
}

function exportTodaysStatistics() {
    fetch(`${BASE_URL}/api/data`)
        .then(response => response.json())
        .then(data => {
            const csv = convertToCSV(data.transactions);
            downloadCSV(csv, 'todays_statistics.csv');
        });
}

function convertToCSV(data) {
    const array = [Object.keys(data[0])].concat(data);

    return array.map(row => {
        return Object.values(row).map(value => {
            return typeof value === 'string' ? JSON.stringify(value) : value;
        }).toString();
    }).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

document.addEventListener('DOMContentLoaded', function () {
    loadInventory();
    loadTodaysStats();
});
