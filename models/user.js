const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: mongoose.Schema.Types.String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: mongoose.Schema.Types.String,
    validate: {
      validator: (url) => validator.isURL(url, {
        allow_underscores: true, allow_trailing_dot: true, allow_protocol_relative_urls: true,
      }),
    },
    required: true,
  },
  email: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    validate: (email) => validator.isEmail(email),
  },
  password: {
    type: mongoose.Schema.Types.String,
    required: true,
    select: false,
  },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }
          return user;
        });
    });
};
userSchema.plugin(uniqueValidator);
module.exports = mongoose.model('user', userSchema);
