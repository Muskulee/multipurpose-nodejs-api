//import mongoose

const mongoose = require("mongoose");

//create postSchema object
const postSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      trim: true,
    },

    likeCount: {
      type: Number,
    },
    postCount: {
      type: Number,
    },
    commentCount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", postSchema);

module.exports = User;
