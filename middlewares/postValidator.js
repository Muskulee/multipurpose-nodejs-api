// import express validator
const { check, validationResult } = require("express-validator");

exports.postValidator = [
  check("title")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Post Title"),
  check("content")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Post Content"),
  check("meta")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Post Meta Description"),
  check("slug")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please Enter A Valid Post Slug!"),
  check("tags")
    .isArray()
    .withMessage("Tags must be array of strings!")
    .custom((tags) => {
      for (let t of tags) {
        if (typeof t !== "string") {
          throw Error("Tags must be arr");
        }
      }

      return true;
    }),

];


exports.validate = (req, res, next)  => {
    const error = validationResult(req).array();
    if(error.length){
        // console.log('error', error);
        res.status(401).json({error: error[0].msg});
    }

    next();
}
