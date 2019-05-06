const express = require('express');

const Book = require('../models/book');

const router = express.Router();

router.get('/', async (request, response) => {
    let books;
    try {
        books = await Book.find({}).sort({ createdAt: 'desc' }).limit(10).exec();
    } catch {
        books = [];
    }

    response.render('index', {
        books: books
    });
});

module.exports = router;
