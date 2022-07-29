const Joi = require("joi");

const { join } = require("path");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  repeat_password: Joi.ref("password"),
  profileImage: Joi.string() || Joi.object(),
  phone: Joi.string().min(3).max(11).required(),
  role: Joi.string().min(3).max(10).required(),
});

module.exports = registerSchema;
