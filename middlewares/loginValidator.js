// import express validator
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { facultyOfViolence } = require("../controllers/error");
const User = require("../models/user");

exports.loginValidator = [
  check("user_name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Username"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Password")
    .custom((password) => {
      if (password.length < 6)
        throw new Error(
          "Password Too Short, Minimum Of 6 Alphanumeric Letters!"
        );
      return true;
    }),
];

exports.validated = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    // console.log('error', error);
    res.status(401).json({ error: error[0].msg });
  }

  next();
};

exports.authToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send(facultyOfViolence.tokenError);
  }
  try {
    const decoded = jwt.verify(token, process.env.JSON_TOKEN_KEY);
    // req.user = decoded;
    const uu = await User.findById({ _id: decoded.user_id });
    req.user = uu;
  } catch (err) {
    return res.status(401).send(facultyOfViolence.tokenError);
  }
  return next();
};
