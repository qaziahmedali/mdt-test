const { User } = require("../models");

const CustomErrorHandler = require("../services/CustomErrorHandler");

const trainee = async (req, res, next) => {
  console.log("req", req.user);
  try {
    const user = await User.findOne({ _id: req.user._id });

    if (user.role === "seller") {
      next();
    } else {
      //   return next(CustomErrorHandler.unAuthorized());
      res.status(401).json({ message: "only seller can book a session" });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = trainee;
