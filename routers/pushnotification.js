const {
  saveToken,
  getTokens,
  sendPush,
  updateTokenStatus,
} = require("../controllers/push");
const {
  tokenMessageValidator,
  tokenMessageValidated,
} = require("../middlewares/pushMessageValidator");
const { tokenValidator, validate } = require("../middlewares/tokenValidator");

const router = require("express").Router();

router.post("/save", tokenValidator, validate, saveToken);

router.get("/getall", getTokens);

router.post(
  "/sendpush",
  tokenMessageValidator,
  tokenMessageValidated,
  sendPush
);

router.post("/updatetoken", tokenValidator, validate, updateTokenStatus);

module.exports = router;
