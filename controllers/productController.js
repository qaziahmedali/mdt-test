const { Product } = require("../models");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CustomErrorHandler = require("../services/CustomErrorHandler");
const productSchema = require("../validators/productValidator");

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
}).single("image"); // 5mb

const productController = {
  // store product
  async store(req, res, next) {
    console.log("req.body", req.body);
    // Multipart from data
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(err);
      }
      let filePath;
      if (req.file) {
        filePath = req.file.path;
      } else {
        filePath = "NA";
      }

      // validation
      const { error } = productSchema.validate(req.body);

      if (error) {
        // Delete the uploading image
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(err);
          }
        });

        return next(error);
      }

      const { name, price, category, user, location, payment, des } = req.body;
      let document;

      try {
        document = await Product.create({
          name,
          price,
          category,
          image: filePath,
          user,
          location,
          payment,
          des,
        });
      } catch (err) {
        return next(err);
      }

      res.status(201).json({
        message: "created",
        success: true,
        statusCode: 201,
        data: document,
      });
    });
  },

  //update product
  update(req, res, next) {
    // Multipart from data
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }

      // validation
      const { error } = productSchema.validate(req.body);
      if (error) {
        // Delete the uploading image
        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }

        return next(error);
      }

      const { name, price, category, user, location, payment, des } = req.body;
      let document;

      try {
        document = await Product.findOneAndUpdate(
          { _id: req.params.id },
          {
            name,
            price,
            location,
            payment,
            des,
            ...(req.file && { image: filePath }),
            category,
            user,
          },
          { new: true }
        );
      } catch (err) {
        return next(err);
      }

      res.status(201).json(document);
    });
  },

  // delete product
  async destroy(req, res, next) {
    const document = await Product.findByIdAndRemove({ _id: req.params.id });
    if (!document) {
      return next(new Error("Nothing to delete"));
    }
    // image delete
    const imagePath = document._doc.image;
    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }
    });

    res.json(document);
  },

  // Get all products
  async index(req, res, next) {
    let documents;
    // pagination mongoose pagination
    try {
      documents = await Product.find()
        .select("-updatedAt -__v")
        .sort({ createdAt: -1 })
        .populate("category")
        .populate("user");
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(documents);
  },

  // get single product
  async show(req, res, next) {
    let document;
    // pagination mongoose pagination
    try {
      document = await Product.findOne({ _id: req.params.id }).select(
        "-updatedAt -__v"
      );
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    console.log(document);
    return res.json(document);
  },
  // get show By CategoryId
  async showByCategoryId(req, res, next) {
    let document;
    // pagination mongoose pagination
    try {
      result = await Product.find({ category: req.params.categoryId })
        .select("-updatedAt -__v")
        .populate({
          path: "category",
          model: "Category",
          select: "-updatedAt -__v",
        })
        .populate({
          path: "user",
          model: "User",
          select: "-__v -password -updatedAt",
        });
      if (result.length > 0) {
        success = true;
        statusCode = 200;
        message = "get products successfully";
      } else {
        message = "not found";
        success = false;
        statusCode = 404;
      }
    } catch (err) {
      return next(err);
    }
    document = {
      statusCode,
      success,
      message,
      data: result,
    };

    res.status(statusCode).json(document);
  },

  // get single product
  async prod(req, res, next) {
    console.log("fsdf");
    let document;
    // pagination mongoose pagination
    try {
      document = await Product.findOne({ _id: req.params.id }).select(
        "-updatedAt -__v"
      );
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    console.log(document);
    return res.json(document);
  },
};

module.exports = productController;
