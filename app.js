//add db

require('express-async-errors');

require("dotenv").config();


require("./db");

//import  express

const express = require("express");

//import dotenv

//import morgan
// const morgan = require("morgan");

//import router
const postRouter = require("./routers/post");
const pushRouter = require("./routers/pushnotification");
const userRouter = require("./routers/user");

// add corsOptions
const cors = require("cors");

//use express and morgan and dechunk post data
const app = express();

//add cors options
app.use(cors());




app.use(express.json());
// app.use(morgan("dev"));
app.use("/api/v1/post", postRouter);
app.use("/api/v1/push", pushRouter);
app.use("/api/v1/user", userRouter);

//set the error url
app.use((err, req, res, next) => {
    res.status(500).json({error: err.message});
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("port is listening " + PORT);
});
