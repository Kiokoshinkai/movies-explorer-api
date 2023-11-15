const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const routes = require('./routes/index');
const errorHandler = require('./middlewares/error-handler');
const { limiter } = require('./middlewares/rateLimiter');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;
const app = express();

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

const options = {
  origin: [
    'http://localhost:3000',
    'https://vvg.nomoredomainsrocks.ru',
    'https://api.vvg.nomoredomainsrocks.ru',
    'http://vvg.nomoredomainsrocks.ru',
    'http://api.vvg.nomoredomainsrocks.ru',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};

app.use('*', cors(options));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // Подключаем логгер запросов
app.use(limiter);
app.use(routes); // подключаем роуты

app.use(errorLogger); // Подключаем логгер ошибок после обработчиков роутов и до обработчиков ошибок
app.use(errors());
app.use(errorHandler);
// Запускаем сервер на заданном порту
app.listen(PORT, () => {
  console.log(`Приложение слушает порт ${PORT}`);
});
