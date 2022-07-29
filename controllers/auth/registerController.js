const { User } = require("../../models");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const JwtServices = require("../../services/JwtService");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
const registerSchema = require("../../validators/registerValidator");
const SendGridService = require("../../services/SendGridService");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("profileImage"); // 5mb

const registerController = {
  async register(req, res, next) {
    // Checklist
    // validate the request
    // authorise the request
    // check if user exist in database already
    // prepare model
    // store in database
    // generate jwt token
    // send response
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      let filePath, email_message;
      if (req.file) {
        filePath = req.file.path;
      }
      // validation
      const { error } = registerSchema.validate(req.body);

      if (error) {
        // Delete the uploading image
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });

        return next(error);
      }

      if (error) {
        return next(error);
      }

      // check if user exist in database already
      try {
        const exist = await User.exists({ email: req.body.email });
        if (exist) {
          return next(
            CustomErrorHandler.alreadyExist("This email is already taken.")
          );
        }
      } catch (err) {
        return next(err);
        `1`;
      }

      const { name, email, password, phone, role } = req.body;

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is salt rounds

      // prepare model
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        profileImage: req.file ? filePath : null,
        role,
      });

      let access_token;
      let data;
      try {
        data = await user.save();
        response = await SendGridService.sendEmail(req.body.email, next);

        // Token
        access_token = JwtServices.sign({ _id: data._id, role: data.role });
      } catch (err) {
        return next(err);
      }
      console.log("response", response);
      const result = {
        message: response.message,
        statusCode: 201,
        success: true,
        data: { access_token, user: response.user },
      };

      res.status(201).json(result);
    });
  },
};

module.exports = registerController;
