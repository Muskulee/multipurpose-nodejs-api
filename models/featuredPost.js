//import mongoose

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema

//create postSchema object
const featuredPostSchema = new mongoose.Schema(
  {
    //get the post schema object
    // title: String,
    post: {
      type: "ObjectId",
    //   type: ObjectId,
      ref: "Post",
      required: true
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FeaturedPost", featuredPostSchema);
