const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

/* All Authors Route */
router.get('/', async (request, response) => {
    let searchOptions = {};
    if (request.query.name != null && request.query.name !== '') {
        searchOptions.name = new RegExp(request.query.name, 'i');
    }

    try {
        const authors = await Author.find(searchOptions);
        response.render('authors/index', {
            authors: authors,
            searchOptions: request.query
        });
    } catch {
        response.redirect('/');
    }
});

/* Neu Author Route */
router.get('/new', (request, response) => {
    response.render('authors/new', { author: new Author() });
});

/* Create Author Route */
router.post('/', async (request, response) => {
    const author = new Author({
        name: request.body.name
    });

    try {
        const newAuthor = await author.save();
        response.redirect(`authors/${newAuthor.id}`);
        // response.redirect(`authors`);
    } catch {
        response.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        });
    }
});

// Get single author
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const books = await Book.find({ author: author.id }).limit(5).exec();
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        });
    } catch {
        res.redirect('/');
    }
});

// Edit single author
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', {
            author: author
        });
    } catch (err) {
        res.redirect('/authors');
    }
});

// Update single author
router.put('/:id', async (req, res) => {
    // Create var here to be able to use that on both try and catch
    let author;
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        // response.redirect(`authors/${newAuthor.id}`);
        res.redirect(`/authors/${author.id}`);
    } catch {
        if (author == null) {
            res.redirect('/');
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
            });
        }
    }
});

router.delete('/:id', async (req, res) => {
    // Create var here to be able to use that on both try and catch
    let author;
    try {
        author = await Author.findById(req.params.id);
        await author.remove();
        // response.redirect(`authors/${newAuthor.id}`);
        res.redirect(`/authors`);
    } catch {
        if (author == null) {
            res.redirect('/');
        } else {
            res.redirect(`/authors/${author.id}`);
        }
    }
});

module.exports = router;
