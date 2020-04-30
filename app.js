const express = require("express");
const app = express();
require("./utils/db"); //this is to connect to the DB

const cookieParser = require("cookie-parser");
const cors = require("cors");

const corsOptions = {
  credentials: true, //to enable cookies to be accepted by backend
  allowedHeaders: "content-type",
  origin: "http://localhost:3001", //process.env.FRONTEND_URL
};

app.use(cors(corsOptions));
//app.use(cookieParser());
app.use(cookieParser("someSecret"));

app.use(express.json());
const apiVersion1 = require("./routes/app_v1.route");
const apiVersion2 = require("./routes/app_v2.route");

app.use("/v1", apiVersion1);
app.use("/v2", apiVersion2);

// app.get("/error", (req, res) => {
//   throw new Error(" 😱! Error! Error!");
// });

app.use((err, req, res, next) => {
  //res.status(500);

  //  console.log(err.message);
  res.status(err.statusCode).json({ error: err.message });
  //res.status(err.statusCode).send(`${err.message} </br>`);
});

module.exports = app;
