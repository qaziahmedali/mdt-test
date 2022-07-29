// import { JWT_SECRET } from "../config";
// import { User } from "../models";
// import otp from "../models/otp";
// import sgMail from "@sendgrid/mail";
// import { API_KEY } from "../config/";

const { JWT_SECRET } = require("../config");
const { SANDGRID_API_KEY } = require("../config");
const { User } = require("../models/");
const otp = require("../models/otp");
const sgMail = require("@sendgrid/mail");
const CustomErrorHandler = require("./CustomErrorHandler");
class SendGridService {
  static async sendEmail(email, next) {
    const otpCode = Math.floor(10000 + Math.random() * 90000);
    let result, user;
    let isEmailExist = await User.findOne({ email }).select(
      "name email phone emailVerified role"
    );
    if (isEmailExist) {
      // check if otp already exist
      result = await otp
        .findOne({ email: email })
        .limit(1)
        .sort({ $natural: -1 });

      //if exist then update the otp otherwise create new one
      if (result) {
        const upDate = await otp.findByIdAndUpdate(
          { _id: result._id },
          { code: otpCode, expireIn: new Date().getTime() + 600000 }
        );
      } else {
        console.log("user", user);
        const otpData = new otp({
          email,
          code: otpCode,
          expireIn: new Date().getTime() + 600000,
        });
        result = await otpData.save();
      }

      if (result) {
        console.log("mailer if");
        mailer(result.email, otpCode, next);
        console.log("mailer");
        return {
          user: isEmailExist,
          message: "OTP sent to your email, please check your email",
        };
      } else {
        return next(CustomErrorHandler.notFound("email not correct"));
      }
    } else {
      return next(CustomErrorHandler.notFound("email not correct"));
    }
  }
}
//mailer function call
function mailer(email, otp, next) {
  try {
    const resp = sgMail.setApiKey(SANDGRID_API_KEY);

    const message = {
      from: "protechgiant@gmail.com",
      to: { email },
      subject: "OTP Genrate from Adwoa Linda App",
      text: `Your verification code is ${otp} from Adwoa Linda & Financial Associates`,
      html: `<p>Your verification code is  <h4> ${otp} </h4> for adwoa linda app </p>`,
    };

    sgMail
      .send(message)
      .then((res) => {
        console.log("Email Send Successfully...", res);
        return res;
      })
      .catch((error) => {
        console.log("error", error.message);
        return next(error);
      });
  } catch (error) {
    console.log("catch error", error);
    return next(error);
  }
}
module.exports = SendGridService;
