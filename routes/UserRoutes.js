const express = require("express");
const router = express.Router();

//Controller
const {register, login, getCurrentUser, update, getUserById, deleteUser, getAllUsers} = require("../controllers/UserController.js");


//Middlewares 
 const validate = require("../middlewares/handleValidation.js");
 const { userCreateValidation, loginValidation, userUpdateValidation } = require("../middlewares/userValidations.js");
const authGuard = require("../middlewares/authGuard.js");
const { imageUpload } = require("../middlewares/imageUpload.js");

//Routes
router.post("/register", userCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile", authGuard, getCurrentUser);
router.put("/", authGuard, userUpdateValidation(), validate, imageUpload.single("profileImage"), update);
router.get("/:id", getUserById);
router.delete("/:id", authGuard, deleteUser);
router.get("/", authGuard, getAllUsers);

module.exports = router;

