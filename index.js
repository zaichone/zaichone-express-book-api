const express = require('express');
const uuid = require('uuid');
const books = require('./books');
const { body, validationResult } = require('express-validator');
if (typeof localStorage === "undefined" || localStorage === null) {
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./storage');
}
localStorage.setItem('books', JSON.stringify(books));

const app = express();

const createValidator = [
    body('title', 'username does not Empty').not().isEmpty(),
    body('description', 'Description does not Empty').not().isEmpty(),
    body('author', 'Author does not Empty').not().isEmpty(),
    body('year', 'Invalid date').isISO8601(), // check date is ISOString
    body('isbn', 'isbn does not Empty').not().isEmpty(),
    body('audioFileUrl', 'audioFileUrl does not Empty').not().isEmpty(),
];


app.get('/', (req, res) => {
    console.log(books);
    res.send('<h1>root path for api</h1>');
});

app.get('/api/books', (req, res) => {
    const books = JSON.parse(localStorage.getItem('books'));
    res.send(books);
});

app.get('/api/books/:id', (req, res) => {
    const books = JSON.parse(localStorage.getItem('books'));
    const found = books.some(book => book.id === parseInt(req.params.id));
    if (found) {
        res.json(books.filter(book => book.id === parseInt(req.params.id)));
    } else {
        res.status(400).json({ msg: 'Book not found' });
    }
});

app.post('/api/books/create', createValidator, (req, res) => {
    const books = JSON.parse(localStorage.getItem('books'));
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        const newBook = {
            id: uuid.v4(),
            title: req.body.title,
            description: req.body.description,
            author: req.body.author,
            year: req.body.year,
            isbn: req.body.isbn,
            audioFileUrl: req.body.audioFileUrl
        }
        books.push(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        return res.status(200).json(newBook)
    }
    res.status(422).json({ errors: errors.array() })


});

app.put('/api/books/:id', (req, res) => {
    const books = JSON.parse(localStorage.getItem('books'));
    const found = books.some(book => book.id === parseInt(req.params.id));
    if (found) {
        const updateBook = req.body;
        books.forEach(book => {
            if (book.id === parseInt(req.params.id)) {
                book.title = updateBook.title ? updateBook.title : book.title;
                book.description = updateBook.description ? updateBook.description : book.description;
                book.author = updateBook.author ? updateBook.author : book.author;
                book.year = updateBook.year ? updateBook.year : book.year;
                book.isbn = updateBook.isbn ? updateBook.isbn : book.isbn;
                book.audioFileUrl = updateBook.audioFileUrl ? updateBook.audioFileUrl : book.audioFileUrl;
                res.json({ msg: 'Book was updated', book });
            }
        });
        localStorage.setItem('books', JSON.stringify(books));
    } else {
        res.status(400).json({ msg: 'Book not found' });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server start`));