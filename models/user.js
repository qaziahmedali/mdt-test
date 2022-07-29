const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    profileImage: {
      type: String,
      required: false,
      default: "/uploads/avatar.png",
    },
    emailVerified: { type: Boolean, default: false },
    reset_password: { type: Boolean, default: false },
    role: { type: String, default: "customer" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema, "users");
