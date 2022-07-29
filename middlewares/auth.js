const CustomErrorHandler = require("../services/CustomErrorHandler");
const JwtServices = require("../services/JwtService");

const auth = async (req, res, next) => {
  let authHeader = req.headers.authorization;
  console.log("hello");
  if (!authHeader) {
    return next(CustomErrorHandler.unAuthorized());
  }

  const token = authHeader.split(" ")[1];

  try {
    const { _id, role } = await JwtServices.verify(token);
    const user = {
      _id,
      role,
    };
    req.user = user;
    next();
  } catch (err) {
    return next(CustomErrorHandler.unAuthorized());
  }
  console.log(token);
};

module.exports = auth;
