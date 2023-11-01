const express = require('express');

const router = express.Router();
const { validationUpdateProfile } = require('../middlewares/validations');
const { getUserInfo, updateProfile } = require('../controllers/users');

router.get('/me', getUserInfo);

router.patch('/me', validationUpdateProfile, updateProfile);

module.exports = router;
