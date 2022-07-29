const { User } = require("../models");
const CustomErrorHandler = require("../services/CustomErrorHandler");

const admin = async (req, res, next) => {
  console.log("req", req.user);
  try {
    const user = await User.findOne({ _id: req.user._id });

    if (user.role === "admin") {
      next();
    } else {
      return next(CustomErrorHandler.unAuthorized());
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = admin;
