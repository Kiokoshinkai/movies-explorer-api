require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const ValidationError = require('../errors/ValidationError');
const ConflictError = require('../errors/ConflictError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');

const { NODE_ENV, JWT_SECRET } = process.env;

// Создаёт нового пользователя

const createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  // Хешируем пароль и создаем пользователя
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(200).send({
        _id: user._id, name: user.name, email: user.email,
      });
    })
    .catch((error) => {
      if (error.name === 'MongoServerError' && error.code === 11000) {
        const conflictError = new ConflictError('Пользователь с таким email уже существует');
        next(conflictError);
      } else if (error.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании пользователя'));
      } else {
        next(error);
      }
    });
};

// возвращает данные пользователя
const getUserInfo = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => res.status(200).send(user))
    .catch(next);
};

// Oбновление профиля
const updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, email }, { new: true, runValidators: true })
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.code === 11000 && error.name === 'MongoServerError') {
        const conflictError = new ConflictError('Пользователь с таким email уже существует');
        next(conflictError);
      } else if (error.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные'));
      } else {
        next(error);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }
          const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-sekret-key', { expiresIn: '7d' });
          res.status(200).send({ token }); // отправляем токен в теле ответа
        });
    })
    .catch(next);
};

module.exports = {
  createUser,
  getUserInfo,
  updateProfile,
  login,
};
