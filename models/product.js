// import mongoose from "mongoose";
// import { APP_URL } from "../config";
const mongoose = require("mongoose");
const { APP_URL } = require("../config");

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    location: { type: String, required: true },
    payment: { type: String, required: false },
    des: { type: String, required: false },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    image: {
      type: String,
      required: true,
      get: (image) => {
        return `${APP_URL}/${image}`;
      },
    },
  },
  { timestamps: true, toJSON: { getters: true }, id: false }
);

module.exports = mongoose.model("Product", productSchema, "products");
