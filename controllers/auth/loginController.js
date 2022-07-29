const { User } = require("../../models");
const { REFRESH_SECRET } = require("../../config");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const JwtServices = require("../../services/JwtService");
const CustomErrorHandler = require("../../services/CustomErrorHandler");

const loginController = {
  async login(req, res, next) {
    console.log(req.body);
    // Validation
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    });
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    // check if user exist in database already
    let user;
    try {
      user = await User.findOne({ email: req.body.email })
        .select("-updatedAt -__v")
        .populate("challengeId");
      if (!user) {
        return next(CustomErrorHandler.wrongCredentials());
      }
    } catch (err) {
      return next(err);
    }

    // compare password
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return next(CustomErrorHandler.wrongCredentials());
    }
    // tokens
    const access_token = JwtServices.sign({ _id: user._id, role: user.role });

    // database whitlist
    const result = {
      message: "success",
      access_token,
      data: user,
    };
    res.json(result);
  },

  async logout(req, res, next) {
    // validations
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });
    const { error } = refreshSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      await RefreshToken.deleteOne({ token: req.body.refresh_token });
    } catch (err) {
      return next(new Error("Something went wrong in the database"));
    }
    res.json({ status: 1 });
  },
};

module.exports = loginController;
