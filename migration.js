const sqlite3 = require('sqlite3');

// Connect to SQLite database (replace 'library.db' with your desired database file name)

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// Create tables
db.serialize(() => {
    // Create Books table
    db.run(`CREATE TABLE IF NOT EXISTS Books (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        genre TEXT,
        ISBN TEXT UNIQUE
    )`);

    // Create Employees table
    db.run(`CREATE TABLE IF NOT EXISTS Employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT,
        email TEXT UNIQUE
    )`);

    // Create Customers table
    db.run(`CREATE TABLE IF NOT EXISTS Customers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT UNIQUE
    )`);

    // Create Subscriptions table
    db.run(`CREATE TABLE IF NOT EXISTS Subscriptions (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        start_date DATE,
        end_date DATE,
        FOREIGN KEY (customer_id) REFERENCES Customers(id)
    )`);
});


