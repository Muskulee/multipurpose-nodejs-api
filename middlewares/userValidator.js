// import express validator
const { check, validationResult } = require("express-validator");

exports.userValidator = [
  check("user_name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Username"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Post Password")
    .custom((password) => {
      if (password.length < 6)
        throw new Error(
          "Password Too Short, Minimum Of 6 Alphanumeric Letters!"
        );
      return true;
    }),
];

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    // console.log('error', error);
    res.status(401).json({ error: error[0].msg });
  }

  next();
};
