require("dotenv/config");
// For parsing the req body.
const bodyParser = require("body-parser");
// For setting up apis.
const express = require("express");
const app = express();
// Middleware for api logging.
const morgan = require("morgan");
// Mondo DB database manager.
const mongoose = require("mongoose");
const productRouter = require("./routers/product");
const categoryRouter = require("./routers/category");
const userRouter = require("./routers/user");
const orderRouter = require("./routers/order");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

// For setting up envuronment variables.

const api = process.env.API_URL;

//////// Middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(cors());
app.options("*", cors());
app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

//////// Routes
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/orders`, orderRouter);

////// Database
mongoose
  .connect(
    "mongodb+srv://eshop:1234naman@clusternaman.scjfe.mongodb.net/eshop-database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "eshop-database",
    }
  )
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

// Server
app.listen(3000, () => {
  console.log(api);
  console.log("Server running");
});

var server = app.listen(process.env.PORT || 3000, function () {
  var port = server.address.
});
