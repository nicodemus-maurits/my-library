const express = require('express');
const router = express.Router();
const Author = require('../models/author');

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
        // response.redirect(`authors/${newAuthor.id}`);
        response.redirect(`authors`);
    } catch {
        response.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        });
    }
});

module.exports = router;
