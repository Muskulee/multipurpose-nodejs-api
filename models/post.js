//import mongoose

const mongoose = require("mongoose");

//create postSchema object
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    meta: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    tags: [String],
    //   author:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     res: 'User'

    //   },
    author: {
      type: String,
      default: "Admin",
    },
    thumbnail: {
      type: Object,
      url: {
        type: URL,
        required: true,
      },
      publicId: {
        type: URL,
        required: true,
      },
    },
    likeCount: {
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




const Post = mongoose.model('Post', postSchema);

module.exports = Post;
