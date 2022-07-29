const { DEBUG_MODE } = require("../config");
const { ValidationError } = require("joi");
const CustomErrorHandler = require("../services/CustomErrorHandler");

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let data;
  if (DEBUG_MODE == true) {
    console.log("debug mode");
    data = {
      message: err.message,
      success: false,
      statusCode: err.statusCode ? err.statusCode : statusCode,
      data: null,
      stack: err.stack,
    };
  } else {
    data = {
      message: "Internal server error",
    };
  }
  if (err instanceof ValidationError) {
    statusCode = 422; // use for validation error
    data = {
      message: err.message,
      statusCode,
      success: false,
    };
  }

  if (err instanceof CustomErrorHandler) {
    statusCode = err.status;
    data = {
      message: err.message,
      statusCode,
      success: false,
    };
  }

  return res.status(statusCode).json(data);
};

module.exports = errorHandler;
