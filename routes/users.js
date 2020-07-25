const router = require('express').Router();
const path = require('path');
const { ObjectId } = require('mongoose').Types;
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
    password: Joi.string().required().min(8).max(30),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom((value) => {
      if (!validator.isURL(value)) {
        throw new Error('string is not URL');
      }
      return value;
    }, 'URL validation'),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(30),
  }),
}), createUser);
router.get('/users', auth, getUsers);
router.get('/users/:_id', auth, celebrate({
  params: Joi.object().keys({
    _id: Joi.string().length(24).custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid _id');
      }
      return value;
    }, 'ObjectId validation'),
  }),
}), getUserById);
router.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);
router.patch('/users/me/avatar', auth, celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom((value) => {
      if (!validator.isURL(value)) {
        throw new Error('string is not URL');
      }
      return value;
    }, 'URL validation'),
  }),
}), updateAvatar);

module.exports = router;
