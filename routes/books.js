const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Book = require('../models/book');
const Author = require('../models/author');

const uploadPath = path.join('public', Book.coverImageBasePath);
const router = express.Router();
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (request, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

/* All Books Route */
router.get('/', async (request, response) => {
    let query = Book.find();
    if (request.query.title != null && request.query.title != '') {
        query = query.regex('title', new RegExp(request.query.title, 'i'));
    }
    if (request.query.publishedBefore != null && request.query.publishedBefore != '') {
        query = query.lte('publishDate', request.query.publishedBefore);
    }
    if (request.query.publishedAfter != null && request.query.publishedAfter != '') {
        query = query.gte('publishDate', request.query.publishedAfter);
    }

    try {
        const books = await query.exec();
        response.render('books/index', {
            books: books,
            searchOptions: request.query
        });
    } catch {
        response.redirect('/');
    }
});

/* New Book Route */
router.get('/new', async (request, response) => {
    // renderNewPage(response, new Book());
    renderFormPage(response, 'new', new Book());
});

/* Create Book Route */
router.post('/', upload.single('cover'), async (request, response) => {
    const fileName = request.file != null ? request.file.filename : null;

    const book = new Book({
        title: request.body.title,
        author: request.body.author,
        publishDate: new Date(request.body.publishDate),
        pageCount: request.body.pageCount,
        coverImageName: fileName,
        description: request.body.description
    });

    try {
        const newBook = await book.save();
        response.redirect(`books/${newBook.id}`);
    } catch{
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }
        renderNewPage(response, book, true);
    }
});

// Show Book route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', {
            book: book
        });
    } catch {
        res.redirect('/');
    }
});

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderFormPage(res, 'edit', book);
    } catch{
        res.redirect('/');
    }
});

// Update Book Route
router.put('/:id', async (req, res) => {
    let book;

    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover);
        }
        await book.save();
        res.redirect(`books/${book.id}`);
    } catch{
        if (book != null) {
            removeBookCover(book.coverImageName);
            renderFormPage(res, 'edit', book, true);
        } else {
            res.redirect('/');
        }
    }
});

// Delete Book Route
router.delete('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/');
    } catch {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not delete book'
            });
        } else {
            res.redirect('/');
        }
    }
});

const removeBookCover = (fileName) => {
    fs.unlink(path.join(uploadPath, fileName), error => {
        if (error) console.error(error);
    });
};

const renderNewPage = async (response, book, hasError = false) => {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError) params.errorMessage = 'Error Creating Book';
        response.render('books/edit', params);
    } catch{
        response.redirect('/books');
    }
};

const renderFormPage = async (response, form, book, hasError = false) => {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Book';
            } else {
                params.errorMessage = 'Error Creating Book';
            }
        }
        // if (hasError) params.errorMessage = 'Error Creating Book';
        response.render(`books/${form}`, params);
    } catch{
        response.redirect('/books');
    }
};

module.exports = router;
