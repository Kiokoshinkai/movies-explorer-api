const express = require('express');

const router = express.Router();

const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { validationCreateUser, validationLogin } = require('../middlewares/validations');
const NotFoundError = require('../errors/NotFoundError');

router.post('/signup', validationCreateUser, createUser);

router.post('/signin', validationLogin, login);

router.use(auth);

// Подключаем маршруты для пользователей и карточек
router.use('/users', require('./users'));
router.use('/movies', require('./movies'));

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

router.use('*', (req, res, next) => {
  const error = new NotFoundError('Запрашиваемый ресурс не найден');
  next(error);
});

module.exports = router;
