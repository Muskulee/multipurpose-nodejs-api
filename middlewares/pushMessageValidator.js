// import express validator
const { check, validationResult } = require("express-validator");

exports.tokenMessageValidator = [
  check("message")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Message!"),
];

exports.tokenMessageValidated = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    // console.log('error', error);
    res.status(401).json({ error: error[0].msg });
  }

  next();
};
