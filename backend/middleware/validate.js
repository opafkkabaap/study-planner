const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    return next();
  } catch (e) {
    return next(e);
  }
};

module.exports = { validate };
