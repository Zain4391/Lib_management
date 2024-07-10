const booksRouter = require('express').Router();
const sqlite3 = require('sqlite3');

module.exports = booksRouter;

//set up database connection
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//get all books
booksRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Books`, (err, rows) => {
        if (err) {
            next(err);
        }else{
            res.status(200).json({books: rows});
        }
    });
});

//search by a field (will return matching values)
booksRouter.get('/search', (req, res, next) => {
    const searchParam = req.query.search;

    if (!searchParam) {
        return res.status(400).json({ message: 'Search parameter is required.' });
    }

    let sql_query = `SELECT * FROM Books WHERE 
                        title LIKE '%${searchParam}%' 
                        OR author LIKE '%${searchParam}%' 
                        OR genre LIKE '%${searchParam}%' 
                        OR ISBN LIKE '%${searchParam}%'`;

    db.all(sql_query, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ books: rows });
        }
    });
});

//create a new book
// Create a new book
booksRouter.post('/', (req, res, next) => {
    const { title, author, genre, ISBN } = req.body;

    if (!title || !author || !genre || !ISBN) {
        return res.status(400).json({ message: 'Please fill all the fields.' });
    }

    db.run('INSERT INTO Books (title, author, genre, ISBN) VALUES ($title, $author, $genre, $ISBN)', {
        $title: title,
        $author: author,
        $genre: genre,
        $ISBN: ISBN
    }, function (err) {
        if (err) {
            next(err);
        } else {
            const newId = this.lastID;
            db.get('SELECT * FROM Books WHERE id = $newId', { $newId: newId }, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ book: row });
                }
            });
        }
    });
});



//handle common parameters
booksRouter.param('bookId',(req,res,next,id) => {
    db.get('SELECT * FROM Books WHERE id = $bookid',{
        $bookid: id
    },(err,row) => {
        if(err){
            next(err);
        }else{
            req.book = row;
            next();
        }
    });
});

//get book via id
booksRouter.get('/:bookId', (req, res, next) => {
    res.status(200).json({book: req.book});
});

//Update book via id
booksRouter.put('/:bookId', (req, res, next) => {
    const title = req.body.title;
    const author = req.body.author;
    const genre = req.body.genre;
    const ISBN = req.body.ISBN;

    if(!title || !author || !genre || !ISBN){
        return res.status(400).json({message: 'Please fill all the fields.'});
    }

    db.run('UPDATE Books SET title = $title, author = $author, genre = $genre, ISBN = $ISBN WHERE id = $bookId',{
        $title: title,
        $author: author,
        $genre: genre,
        $ISBN: ISBN,
        $bookId: req.params.bookId
    },function(err){
        if(err){
            return next(err);
        }else{
            db.get('SELECT * FROM Books WHERE id = $bookId',{
                $bookId: req.params.bookId
            },(err,row) => {
                res.status(200).json({book: row});
            });
        }
    });
});

//delete via id
booksRouter.delete('/:bookId', (req, res, next) => {
    db.run('DELETE FROM Books WHERE id = $bookId',{
        $bookId: req.params.bookId
    },function(err){
        if(err){
            return next(err);
        }else{
            res.status(204).json({message: 'Book deleted successfully.'});
        }
    });
});

