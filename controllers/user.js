// import post schemna
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const FeaturedPost = require("../models/featuredPost");
const cloudinary = require("../cloud");
const { isValidObjectId } = require("mongoose");
const { facultyOfViolence } = require("./error");

exports.saveUser = async (req, res) => {
  //   console.log("req.body(", req.body);

  //destructure the body data

  //   return res.json({ message: "I amm what I am" });

  const { user_name, password } = req.body;

  //check if post already exists with slug

  const isAlreadyExists = await User.findOne({ username: user_name });
  if (isAlreadyExists) {
    return res.json({
      error: "Please use unique username",
    });
  } else {
    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    const freshUser = new User({
      username: user_name,
      password: encryptedPassword,
    });

    // console.log("newPost", freshUser);
    const token = jwt.sign(
      {
        user_id: freshUser._id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: process.env.JSON_TOKEN_EXPIRE,
      }
    );

    freshUser.token = token;

    await freshUser.save();
    // res.send(json(newPost));

    //if featured post is available, save featured post using postObject Id

    // return res.json({post: newPost});

    return res.json({
      user: {
        id: freshUser._id,
        username: freshUser.username,
        token: freshUser.token,
        createdAt: freshUser.createdAt,
      },
    });
  }
};

exports.logIn = async (req, res) => {
  //
  //destructure the body data

  const { user_name, password } = req.body;

  //check if post already exists with slug

  const isAlreadyExists = await User.findOne({ username: user_name });

  if (!isAlreadyExists)
    return res.status(400).json({ error: facultyOfViolence.incorrectPassword });

  const verfiyPassword = await bcrypt.compare(
    password,
    isAlreadyExists.password
  );

  if (isAlreadyExists && verfiyPassword) {
    // console.log("newPost", freshUser);
    const token = jwt.sign(
      {
        user_id: isAlreadyExists._id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: process.env.JSON_TOKEN_EXPIRE,
      }
    );

    isAlreadyExists.token = token;

    await isAlreadyExists.save();

    return res.status(200).json({
      user: isAlreadyExists,
    });
  } else {
    return res.status(200).json({
      error: facultyOfViolence.incorrectPassword,
    });

    // res.send(json(newPost));

    //if featured post is available, save featured post using postObject Id

    // return res.json({post: newPost});
  }
};

exports.sendUser = (req, res) => {
  return res.json({ user: req.user });
};
