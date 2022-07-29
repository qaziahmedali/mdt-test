// import { OAuth2Client } from "google-auth-library";
const { User } = require("../../models");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const bcrypt = require("bcrypt");
const SendGridService = require("../../services/SendGridService");
const otp = require("../../models/otp");

const userController = {
  async me(req, res, next) {
    try {
      const user = await User.findOne({ _id: req.user._id }).select(
        "-password -updatedAt -__v"
      );
      if (!user) {
        return next(CustomErrorHandler.notFound());
      }

      res.json(user);
    } catch (err) {
      return next(err);
    }
  },
  async codeVerify(req, res, next) {
    try {
      let data = await otp
        .findOne({
          email: req.body.email,
          code: req.body.code,
        })
        .limit(1)
        .sort({ $natural: -1 });

      if (data) {
        const date = new Date();
        const currenTime = date.getTime();

        console.log("db expireIn", data.expireIn);
        const diff = data.expireIn - currenTime;

        if (diff < 0) {
          return next(CustomErrorHandler.wrongCredentials("token expired"));
        } else {
          let user;
          if (req.body.type == "verification") {
            user = {
              emailVerified: true,
            };
          }
          if (req.body.type == "forgot_password") {
            user = {
              reset_password: true,
            };
          }
          const result = await User.findOneAndUpdate(
            { email: data.email },
            user,
            { new: true }
          );

          res
            .status(201)
            .json({ message: "verified", success: "true", statusCode: 200 });
        }
      } else {
        return next(CustomErrorHandler.notFound("verification code incorrect"));
      }
    } catch (error) {
      return next(error);
    }
    // res.status(response.statusText).json(response);
  },
  async emailSend(req, res, next) {
    try {
      const response = await SendGridService.sendEmail(req.body.email, next);
      const result = {
        message: response.message,
        statusCode: 201,
        success: true,
        data: null,
      };
      res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },

  // otp resend in email (one time password ) for verification
  async resendEmail(req, res, next) {
    try {
      const response = await SendGridService.sendEmail(req.body.email, next);
      const result = {
        message: response.message,
        statusCode: 201,
        success: true,
        data: null,
      };
      res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  },

  async changePassword(req, res, next) {
    console.log("req", req.body);
    const findData = await User.findOne({ email: req.body.email });
    try {
      console.log("findData", findData);
      if (findData) {
        if (findData.reset_password) {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          const user = await User.findOneAndUpdate(
            { email: req.body.email },
            { password: hashedPassword, reset_password: false }
            // { reset_password: false }
          );
          res.status(201).json({ message: "password updated" });
        } else {
          return next(CustomErrorHandler.notFound("unable to change password"));
        }
      } else {
        return next(CustomErrorHandler.notFound("email not correct"));
      }
      // res.json(response);
    } catch (error) {
      console.log(error);
      res.next(error);
    }
  },

  // Get all users
  async index(req, res, next) {
    let documents;
    // pagination mongoose pagination
    try {
      documents = await User.find({ role: { $eq: "customer" } })
        .select("-updatedAt -__v -password")
        .sort({ createdAt: -1 });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
  },
};

module.exports = userController;
