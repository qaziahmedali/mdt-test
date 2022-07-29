const Joi = require("joi");
const fs = require("fs");
const { User, Product, Otp } = require("../../models");
const bcrypt = require("bcrypt");
const CustomErrorHandler = require("../../services/CustomErrorHandler");
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

  async editProfileImage(req, res, next) {
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

  // Edit name
  async editName(req, res, next) {
    console.log(req.body);
    const { name } = req.body;
    let document;

    try {
      document = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          name,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }

    res.status(201).json(document);
  },
  // Edit name
  async update(req, res, next) {
    console.log(req.body);
    const { name, phone } = req.body;
    let document;

    try {
      document = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          name,
          phone,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }

    res.status(201).json(document);
  },

  // Edit email
  async editEmail(req, res, next) {
    console.log(req.body);
    // Validation
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
    });
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }
    const { email } = req.body;
    let document;

    try {
      document = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          email,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }

    res.status(201).json(document);
  },

  // Edit Phone
  async editPhone(req, res, next) {
    console.log(req.body);

    const { phone } = req.body;
    let document;

    try {
      document = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          phone,
        },
        { new: true }
      );
    } catch (err) {
      return next(err);
    }

    res.status(201).json(document);
  },

  // Edit Password
  async editPassword(req, res, next) {
    // check if user exist in database already
    let user, document;
    const { oldPassword, password } = req.body;
    if (!oldPassword || !password) {
      return next(
        CustomErrorHandler.wrongCredentials("password or old password missing!")
      );
    }

    try {
      user = await User.findById({ _id: req.params.id });
      console.log("user", user);
      if (!user) {
        return next(CustomErrorHandler.wrongCredentials("User doesn't exist!"));
      }

      // compare password
      const match = await bcrypt.compare(oldPassword, user.password);

      if (!match) {
        return next(CustomErrorHandler.wrongCredentials("wrong password"));
      }

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is salt rounds
      document = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          password: hashedPassword,
        },
        { new: true }
      ).select("-__v -updatedAt -password");
    } catch (err) {
      return next(err);
    }

    return res.status(200).json({
      message: "Password updated successfully...",
      statusCode: 200,
      success: true,
      data: document,
    });
  },

  // delete account
  async accountRemove(req, res, next) {
    try {
      const user = await User.findById({ _id: req.params.id });
      const document = await User.findByIdAndRemove({ _id: req.params.id });
      if (document) {
        // const category = await Category.deleteMany({
        //   user: req.params.id,
        // });
        const product = await Product.deleteMany({ user: req.params.id });
        if (user) {
          const otp = await Otp.findOneAndRemove({ email: user.email });
        }
      } else {
        return next(CustomErrorHandler.notFound("Nothing to delete"));
      }
      // image delete
      const imagePath = document._doc.image;
      fs.unlink(`${appRoot}/${imagePath}`, (err) => {
        if (err) {
          return next(CustomErrorHandler.serverError());
        }
      });
    } catch (error) {
      return next(error);
    }
    return res.status(200).json({
      message: "Account deleted successfully",
      statusCode: 200,
      success: true,
      data: null,
    });
  },
};

module.exports = userController;
