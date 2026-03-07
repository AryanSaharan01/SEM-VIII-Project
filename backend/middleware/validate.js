const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  next(new ValidationError(errors.array()[0].msg));
};

module.exports = validate;
