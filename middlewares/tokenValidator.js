// import express validator
const { check, validationResult } = require("express-validator");

exports.tokenValidator = [
  check("token")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Expo Push Token"),
];

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    // console.log('error', error);
    res.status(401).json({ error: error[0].msg });
  }

  next();
};
