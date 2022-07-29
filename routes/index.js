const express = require("express");
const router = express.Router();
const {
  registerController,
  loginController,
  userController,
  productController,
  categoryController,
  profileController,
} = require("../controllers");

//
const auth = require("../middlewares/auth");
const seller = require("../middlewares/seller");
const admin = require("../middlewares/admin");

//Change password
router.post("/email-send", userController.emailSend);
router.post("/resend-email", userController.resendEmail);
router.post("/code-verify", userController.codeVerify);
router.post("/change-password", userController.changePassword);

// Auth Routes
router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.get("/me", auth, userController.me);
router.post("/logout", auth, loginController.logout);
router.get("/users", auth, userController.index);

// profile update routes
router.put("/profile/edit/name/:id", auth, profileController.editName);
router.put("/profile/edit/:id", auth, profileController.update);
router.put("/profile/edit/email/:id", auth, profileController.editEmail);
router.put("/profile/edit/phone/:id", auth, profileController.editPhone);
router.put("/profile/edit/password/:id", auth, profileController.editPassword);
router.delete("/account/remove/:id", auth, profileController.accountRemove);

// Products Routes
router.post("/products", [auth, seller], productController.store);
router.put("/products/:id", [auth, admin, seller], productController.update);
router.delete(
  "/products/:id",
  [auth, admin, seller],
  productController.destroy
);
router.get("/products", productController.index);
router.get("/products/:id", productController.show);
router.get("/products/show/:categoryId", productController.showByCategoryId);

// Category Routes
router.post("/categories", [auth, admin], categoryController.store);
router.put("/categories/:id", [auth, admin], categoryController.update);
router.delete("/categories/:id", [auth, admin], categoryController.destroy);
router.get("/categories", categoryController.index);
router.get("/categories/:id", categoryController.show);

module.exports = router;
