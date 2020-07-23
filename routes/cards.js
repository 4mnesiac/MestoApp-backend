const router = require('express').Router();
const path = require('path');
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
  // eslint-disable-next-line import/no-dynamic-require
} = require(path.join('..', 'controllers', 'cards'));

router.route('/cards')
  .get(auth, getCards)
  .post(auth, celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().pattern(
      // eslint-disable-next-line no-useless-escape
        new RegExp('^(https?:/{2})?((([a-z0-9_-]{0,32}(:[a-z0-9_-]{1,32})?)(([a-z0-9-]{1,128}\.)+([a-z]{2,11})))|(((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)))(:(\d{1,4}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?((/(\w+[_#%&?=-]?(\w+)?)+/?)*|/)?$'),
      ),
    }),
  }), createCard);
router.route('/cards/:cardId/likes')
  .put(auth, celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().length(24),
    }),
  }), likeCard)
  .delete(auth, celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().length(24),
    }),
  }), dislikeCard);
router.delete('/cards/:_id', auth, celebrate({
  params: Joi.object().keys({
    _id: Joi.string().length(24),
  }),
}), deleteCard);

module.exports = router;
