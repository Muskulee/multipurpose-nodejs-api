const mongoose = require("mongoose");

//create postSchema object
const pushSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    status : {
      type: Number,
    }
  },
  {
    timestamps: true,
  }
);

const Push = mongoose.model("Push", pushSchema);

module.exports = Push;
