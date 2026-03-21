// middleware/validate.js
//
// Tiny wrapper that reads express-validator results and short-circuits
// the request with a 422 if there are validation errors.

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validate };
