const rateLimit = require('express-rate-limit');

// За 10 минут не более 100 запросов с одного IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

module.exports = {
  limiter,
};
