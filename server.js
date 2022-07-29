// const express = require("express");
// const app = express();
// const server = require("http").createServer(app);
// const mongoose = require("mongoose");
// mongoose.connect(
//   "mongodb+srv://Ahmad:ahmad123@cluster0.jebnm.mongodb.net/admin?retryWrites=true&w=majority"
// );

// mongoose.connection.on("error", (err) => {
//   console.log("db connection failed");
// });
// mongoose.connection.on("connected", (connected) => {
//   console.log("db connected successfully");
// });

// server.listen(5000, console.log(`listening on the 5000`));
const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const { DB_URL } = require("./config");
const errorHandler = require("./middlewares/errorHandler");
const routes = require("./routes");
const cors = require("cors");

const APP_PORT = process.env.PORT || 5000;

// App Config
const app = express();

// Middleware
global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use("/api", routes);
app.use("/uploads", express.static("uploads"));
app.use(errorHandler);

app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  // res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Headers", "X-Requested-Width");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

// DB Config
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  console.log("DB connected...");
});

app.get("/", (req, res) => {
  res.send("Welcome admin Api");
});

// App Listener
const server = app.listen(APP_PORT, () => {
  console.log(`Listening on port ${APP_PORT}`);
});
