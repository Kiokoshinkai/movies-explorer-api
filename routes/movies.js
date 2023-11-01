const express = require('express');

const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');
const { validationCreateMovie, validationDeleteMovie } = require('../middlewares/validations');

const router = express.Router();

router.get('/', getMovies);

router.post('/', validationCreateMovie, createMovie);

router.delete('/:movieId', validationDeleteMovie, deleteMovie);

module.exports = router;
