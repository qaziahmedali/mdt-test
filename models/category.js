const mongoose = require("mongoose");
const { APP_URL } = require("../config");

// const CustomErrorHandler = require("../services/CustomErrorHandler");
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true,
    },
    categoryImage: {
      type: String,
      required: true,
      get: (image) => {
        return `${APP_URL}/${image}`;
      },
    },
  },
  { timestamps: true, toJSON: { getters: true }, id: false }
);

module.exports = mongoose.model("Category", categorySchema, "categories");
