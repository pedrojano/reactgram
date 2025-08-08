const express =  require("express");
const router = express.Router();

// Controller
const {insertPhoto, deletePhoto, getAllphotos, getUserPhotos, getPhotoById, updatePhoto, likePhoto, commentsPhoto, searchPhotos } = require("../controllers/PhotoController");

// Middlewares 
const {photoInsertValidation, photoUpdateValidation, commentValidation } = require("../middlewares/photoValidation");
const authGuard = require("../middlewares/authGuard");
const validate = require("../middlewares/handleValidation");
const {imageUpload } = require("../middlewares/imageUpload");

// Routes
router.post("/", authGuard, imageUpload.single("image"), photoInsertValidation(), validate, insertPhoto);
router.delete("/:id", authGuard, deletePhoto);
router.get("/", authGuard, getAllphotos);
router.get("/user/:id", authGuard, getUserPhotos );
router.get("/search", authGuard, validate, searchPhotos);
router.get("/:id",authGuard, getPhotoById);
router.put("/:id", authGuard, photoUpdateValidation(), validate, updatePhoto);
router.put("/like/:id", authGuard, likePhoto);
router.put("/comment/:id", authGuard, commentValidation(), validate, commentsPhoto);

module.exports = router;