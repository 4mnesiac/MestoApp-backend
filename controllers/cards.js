const path = require('path');
// eslint-disable-next-line import/no-dynamic-require
const Card = require(path.join('..', 'models', 'card'));
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточки с указанным id не существует');
      }
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Недостаточно прав');
      }
      return Card.findByIdAndRemove(req.params._id)
        .then(() => {
          res.status(200).send({ message: 'Карточка успешно удалена' });
        });
    })
    .catch(next);
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((card) => res.status(200).send(
      { data: card },
    ))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({
    name,
    link,
    owner,
  })
    .then((card) => res.send({
      message: `Ваша карточка ${name} успешно создана`,
      data: card,
    }))
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.status(200).send({ _id: req.params.cardId, likes: card.likes.length });
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.status(200).send({ _id: req.params.cardId, likes: card.likes.length });
    })
    .catch(next);
};
