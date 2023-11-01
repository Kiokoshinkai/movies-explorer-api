const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const routes = require('./routes/index');
const errorHandler = require('./middlewares/error-handler');
const { limiter } = require('./middlewares/rateLimiter');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/filmsdb' } = process.env;
const app = express();

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});
const allowedOrigins = [
  'https://vvg.nomoredomainsrocks.ru',
  'https://api.vvg.nomoredomainsrocks.ru',
  'http://vvg.nomoredomainsrocks.ru',
  'http://api.vvg.nomoredomainsrocks.ru',
  'localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // подключаем логгер запросов
app.use(limiter);
app.use(routes); // подключаем роуты

app.use(errorLogger); // Подключаем логгер ошибок после обработчиков роутов и до обработчиков ошибок
app.use(errors());
app.use(errorHandler);
// Запускаем сервер на заданном порту
app.listen(PORT, () => {
  console.log(`Приложение слушает порт ${PORT}`);
});
