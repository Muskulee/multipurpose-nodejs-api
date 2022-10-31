const { saveToken, getTokens } = require("../controllers/push");
const { saveUser, logIn, sendUser } = require("../controllers/user");
// const { logIn } = require("../controllers/user");
const {
  loginValidator,
  validated,
  authToken,
} = require("../middlewares/loginValidator");
const { userValidator, validate } = require("../middlewares/userValidator");

const router = require("express").Router();

router.post("/register", userValidator, validate, saveUser);

router.post("/login", loginValidator, validated, logIn);

router.post("/user", authToken, sendUser);

module.exports = router;

