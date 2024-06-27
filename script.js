document.addEventListener('DOMContentLoaded', function() {
    loadInventory();
    loadTodaysStats();

    document.getElementById('addBookBtn').addEventListener('click', addBook);
    document.getElementById('sellBookBtn').addEventListener('click', sellBook);
    document.getElementById('filterDateBtn').addEventListener('click', filterStatsByDate);
    document.getElementById('exportInventoryBtn').addEventListener('click', exportCurrentInventory);
    document.getElementById('exportStatsBtn').addEventListener('click', exportTodaysStatistics);
});

function loadInventory() {
    fetch('https://harvardbooks-328e81ecb17d.herokuapp.com/api/data')
        .then(response => response.json())
        .then(data => {
            const inventoryTable = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
            inventoryTable.innerHTML = '';

            data.books.forEach((book, index) => {
                const row = inventoryTable.insertRow();
                row.insertCell().textContent = book.title;
                row.insertCell().textContent = book.price.toLocaleString();
                row.insertCell().textContent = book.quantity;

                const editCell = row.insertCell();
                const editIcon = document.createElement('i');
                editIcon.classList.add('bi', 'bi-pencil-square', 'edit-icon');
                editIcon.addEventListener('click', () => editBook(index, book.title));
                editCell.appendChild(editIcon);
            });
        });
}

function loadTodaysStats() {
    fetch('https://harvardbooks-328e81ecb17d.herokuapp.com/api/data')
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
                deleteIcon.addEventListener('click', () => deleteTransaction(index));
                deleteCell.appendChild(deleteIcon);
            });
        });
}

function addBook() {
    const title = document.getElementById('bookTitle').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    fetch('https://harvardbooks-328e81ecb17d.herokuapp.com/api/books', {
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

    fetch('https://harvardbooks-328e81ecb17d.herokuapp.com/api/books', {
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

    fetch('https://harvardbooks-328e81ecb17d.herokuapp.com/api/transactions', {
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

    fetch('https://harvardbooks-328e81ecb17d.herokuapp.com/api/data')
        .then(response => response.json())
        .then(data => {
            const statsTable = document.getElementById('statsTable').getElementsByTagName('tbody')[0];
            statsTable.innerHTML = '';

            data.transactions.forEach((transaction, index) => {
                const transactionDate = new Date(transaction.timestamp).toISOString().split('T')[0];
                if (transactionDate === filterDate) {
                    const row = statsTable.insertRow();
                    row.insertCell().textContent = transaction.action;
                    row.insertCell().textContent = transaction.book;
                    row.insertCell().textContent = transaction.quantity;
                    row.insertCell().textContent = transaction.total.toLocaleString();
                    row.insertCell().textContent = transaction.timestamp;

                    const deleteCell = row.insertCell();
                    const deleteIcon = document.createElement('i');
                    deleteIcon.classList.add('bi', 'bi-trash', 'delete-icon');
                    deleteIcon.addEventListener('click', () => deleteTransaction(index));
                    deleteCell.appendChild(deleteIcon);
                }
            });
        });
}

function exportCurrentInventory() {
    fetch('https://harvardbooks-328e81ecb17d.herokuapp.com/api/data')
        .then(response => response.json())
        .then(data => {
            let csvContent = "data:text/csv;charset=utf-8,Title,Price,Quantity\n";

            data.books.forEach(book => {
                const row = `${book.title},${book.price},${book.quantity}\n`;
                csvContent += row;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'current_inventory.csv');
            document.body.appendChild(link);

            link.click();
        });
}

function exportTodaysStatistics() {
    fetch('https://harvardbooks-328e81ecb17d.herokuapp.com/api/data')
        .then(response => response.json())
        .then(data => {
            let csvContent = "data:text/csv;charset=utf-8,Action,Book,Quantity,Total,Timestamp\n";

            data.transactions.forEach(transaction => {
                const row = `${transaction.action},${transaction.book},${transaction.quantity},${transaction.total},${transaction.timestamp}\n`;
                csvContent += row;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'todays_statistics.csv');
            document.body.appendChild(link);

            link.click();
        });
}

function editBook(index, title) {
    const password = prompt('Enter password to edit:');

    if (password === 'Rasul9898aa') {
        const quantity = prompt('Enter new quantity:');

        if (quantity !== null) {
            fetch('https://harvardbooks-328e81ecb17d.herokuapp.com/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title, quantity: parseInt(quantity) })
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

function deleteTransaction(id) {
    const password = prompt('Enter password to delete:');

    if (password === 'Rasul9898aa') {
        fetch(`https://harvardbooks-328e81ecb17d.herokuapp.com/api/transactions/${id}`, {
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
