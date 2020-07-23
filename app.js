/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const users = require('./routes/users');
const cards = require('./routes/cards');
const error = require('./middlewares/errors');

const { PORT = 3000 } = process.env;

const app = express();
async function start() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mestodb', {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => {
      console.log(`App successfully starting on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(requestLogger);
app.use('/', users);
app.use('/', cards);

app.use(errorLogger);
app.use(errors());
app.use('/', error);
start();
