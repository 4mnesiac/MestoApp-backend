const router = require('express').Router();
const path = require('path');
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const auth = require('../middlewares/auth');

const {
  getUserById,
  getUsers,
  updateProfile,
  updateAvatar,
  login,
  createUser,
  // eslint-disable-next-line import/no-dynamic-require
} = require(path.join('..', 'controllers', 'users'));

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(30)
      .pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required(),
    }, 'URL validation'),
    email: Joi.string().required().email(),
    password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')),
  }),
}), createUser);
router.get('/users', auth, getUsers);
router.get('/users/:_id', auth, celebrate({
  params: Joi.object().keys({
    _id: Joi.string().length(24),
  }),
}), getUserById);
router.patch('/users/me', auth, updateProfile);
router.patch('/users/me/avatar', auth, updateAvatar);

module.exports = router;
