const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// eslint-disable-next-line import/no-dynamic-require
const User = require(path.join('..', 'models', 'user'));
const customError = new Error();
const AuthError = require('../errors/auth-error');
const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');

const { NODE_ENV, JWT_SECRET, JWT_DEV_SECRET = 'save-dev-and-enter' } = process.env;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new BadRequestError('Не указан email или пароль');
    } else {
      User.findUserByCredentials(email, password)
        .then((user) => {
          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : JWT_DEV_SECRET,
            { expiresIn: '7d' },
          );
          res
            .cookie('jwt', token, {
              maxAge: 3600 * 1000 * 24 * 7,
              httpOnly: true,
              sameSite: true,
            })
            .status(200)
            .send({ message: 'Авторизация успешна!' });
        }).catch(() => {
          next(new AuthError('Ошибка авторизации'));
        });
    }
  } catch (error) {
    next(error);
  }
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователя с указанным id не существует');
      } else {
        res.status(200).send({ data: user });
      }
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.status(200).send({ data: user }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password || password.length < 8) {
    throw new BadRequestError('Пароль должен состоять из латинских букв и цифр, длиной от 8 до 30 символов');
  } else {
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      }))
      .then(() => res.send({
        message: `Пользователь ${name} успешно создан`,
        data: {
          name,
          about,
          avatar,
          email,
        },
      }))
      .catch((err) => {
        if (err.errors.email && err.errors.email.kind === 'unique') {
          customError.statusCode = 409;
          customError.name = 'Conflict';
          customError.message = 'Пользователь с таким id уже существует';
          next(customError);
        } else {
          next(err);
        }
      });
  }
};

module.exports.updateProfile = (req, res, next) => {
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { name: req.body.name, about: req.body.about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      res.status(200).send({
        message: 'Данные профиля обновлены',
        data: user,
      });
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { avatar: req.body.avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      res.status(200).send({
        message: 'Аватар обновлен',
        data: user,
      });
    })
    .catch(next);
};
