const sqlite3 = require('sqlite3');

// Connect to SQLite database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Sample data to insert into tables
const books = [
    { title: 'Book 1', author: 'Author A', genre: 'Fiction', ISBN: '1234567890' },
    { title: 'Book 2', author: 'Author B', genre: 'Non-Fiction', ISBN: '0987654321' }
];

const employees = [
    { name: 'John Doe', position: 'Librarian', email: 'john@example.com' },
    { name: 'Jane Smith', position: 'Assistant Librarian', email: 'jane@example.com' }
];

const customers = [
    { name: 'Alice Johnson', address: '123 Main St', phone: '555-1234' },
    { name: 'Bob Brown', address: '456 Elm St', phone: '555-5678' }
];

const subscriptions = [
    { customer_id: 1, start_date: '2024-07-01', end_date: '2024-12-31' },
    { customer_id: 2, start_date: '2024-07-01', end_date: '2024-12-31' }
];

// Insert data into tables
db.serialize(() => {
    // Insert into Books table
    const insertBooks = db.prepare('INSERT INTO Books (title, author, genre, ISBN) VALUES (?, ?, ?, ?)');
    books.forEach(book => {
        insertBooks.run(book.title, book.author, book.genre, book.ISBN);
    });
    insertBooks.finalize();

    // Insert into Employees table
    const insertEmployees = db.prepare('INSERT INTO Employees (name, position, email) VALUES (?, ?, ?)');
    employees.forEach(employee => {
        insertEmployees.run(employee.name, employee.position, employee.email);
    });
    insertEmployees.finalize();

    // Insert into Customers table
    const insertCustomers = db.prepare('INSERT INTO Customers (name, address, phone) VALUES (?, ?, ?)');
    customers.forEach(customer => {
        insertCustomers.run(customer.name, customer.address, customer.phone);
    });
    insertCustomers.finalize();

    // Insert into Subscriptions table
    const insertSubscriptions = db.prepare('INSERT INTO Subscriptions (customer_id, start_date, end_date) VALUES (?, ?, ?)');
    subscriptions.forEach(subscription => {
        insertSubscriptions.run(subscription.customer_id, subscription.start_date, subscription.end_date);
    });
    insertSubscriptions.finalize();
});

// Close the database connection
db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Sample data inserted into tables.');
});
