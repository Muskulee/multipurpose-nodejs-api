const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL_KEY)
  .then(() => console.log("DB Status: ", "Connected"))
  .catch((err) =>
    console.log("Error Connecting to database", err.message || err)
  );

// 127.0.0.1
