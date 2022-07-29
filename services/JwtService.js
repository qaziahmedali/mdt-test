// import { JWT_SECRET } from "../config";
// import jwt from "jsonwebtoken";
const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");
class JwtServices {
  static sign(payload, expiry = "24h", secret = JWT_SECRET) {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  }

  static verify(token, secret = JWT_SECRET) {
    return jwt.verify(token, secret);
  }
}

module.exports = JwtServices;
