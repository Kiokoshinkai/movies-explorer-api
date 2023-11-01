const Movie = require('../models/movie');

const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const AccessDeniedError = require('../errors/AccessDeniedError');

// Получение всех фильмов
const getMovies = (req, res, next) => {
  const owner = req.user._id;

  Movie.find({ owner })
    .then((movies) => {
      if (!movies || movies.length === 0) {
        throw new NotFoundError('Фильмы не найдены');
      }
      return res.send(movies);
    })
    .catch(next);
};

// Создание
const createMovie = (req, res, next) => {
  const {
    country, director, duration,
    year, description, image, trailerLink, thumbnail, movieId, nameRU, nameEN,
  } = req.body;
  const owner = req.user._id;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => {
      res.status(201).send(movie);
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        if (error.errors
          && error.errors.image && error.errors.trailerLink && error.errors.thumbnail) {
          next(new ValidationError('Некорректный URL'));
        } else {
          next(new ValidationError('Переданы некорректные данные'));
        }
      } else {
        next(error);
      }
    });
};

// Удаление фильма
const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;

  // Поиск
  Movie.findById(movieId)
    .orFail(new NotFoundError('Фильм не найден'))
    .then((movie) => {
      // Проверка, принадлежит ли карточка текущему пользователю
      if (movie.owner.toString() !== req.user._id.toString()) {
        next(new AccessDeniedError('Недостаточно прав для удаления'));
        return;
      }
      // Удаление
      Movie.deleteOne({ _id: movieId })
        .then(() => res.status(200).send({ message: 'Фильм удален' }))
        .catch((error) => {
          if (error.name === 'CastError') {
            next(new NotFoundError('Запрашиваемый ресурс не найден'));
          } else {
            next(error);
          }
        });
    })
    .catch((error) => next(error));
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
