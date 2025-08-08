const Photo = require("../models/Photo");
const mongoose = require("mongoose");
const User = require("../models/User");

// Insert a photo, with an user related to it
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;
  const reqUser = req.user;
  const user = await User.findById(reqUser._id);

  // Create a photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  });

  // if photo was created successfully, return data
  if (!newPhoto) {
    res.status(422).json({
      errors: ["Houve um problema, por favor tente novamente mais tarde!"],
    });
    return;
  }

  res.status(201).json(newPhoto);
};

// Remove a photo from DB
const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    const photo = await Photo.findById(id);

    // Check if photo exists
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada!"] });
      return;
    }

    // Check if photo belong to user
    if (!photo.userId.equals(reqUser._id)) {
      res.status(422).json({
        errors: ["Ocorreu um erro, por favor tente novamente mais tarde!"],
      });
      return;
    }

    await Photo.findByIdAndDelete(photo._id);

    res
      .status(200)
      .json({ id: photo._id, message: "Foto exclúida com sucesso!" });
  } catch (error) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }
};

// Get all photos
const getAllphotos = async (req, res) => {
  const photos = await Photo.find({})
    .sort([["createdAt", -1]])
    .exec();

  return res.status(200).json(photos);
};

// Get user photos
const getUserPhotos = async (req, res) => {
  const { id } = req.params;

  const photos = await Photo.find({ userId: id })
    .sort([["createdAt", -1]])
    .exec();

  return res.status(200).json(photos);
};

// Get photo by id
const getPhotoById = async (req, res) => {
  const { id } = req.params;

  const photo = await Photo.findById(id);

  //Check if photo existis
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }
  res.status(200).json(photo);
};

// Update a photo
const updatePhoto = async (req, res) => {
  const { id } = req.params;

  const { title } = req.body;

  const reqUser = req.user;

  const photo = await Photo.findById(id);

  // Check if photo existis
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }

  // Check if photo belongs to user
  if (!photo.userId.equals(reqUser._id)) {
    res
      .status(422)
      .json({ errors: ["Ocorreu um erro, tente novamente mais tarde"] });
    return;
  }

  if (title) {
    photo.title = title;
  }
  await photo.save();
  res.status(200).json({ photo, message: "Foto atualizada com sucesso!" });
};

// Like functionaly
const likePhoto = async (req, res) => {
  const { id } = req.params;

  const reqUser = req.user;

  const photo = await Photo.findById(id);

  //Check if photo exists
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }

  //Check if user already liked the photo
  if (photo.likes.includes(reqUser._id)) {
    res.status(422).json({ errors: ["Você já curtiu a foto!"] });
    return;
  }

  // Put user id in likes array
  photo.likes.push(reqUser._id);
  photo.save();
  res
    .status(200)
    .json({ photoId: id, userId: reqUser._id, message: "A foto foi curtida!" });
};

// Comments Functionaly
const commentsPhoto = async (req, res) => {
  const { id } = req.params;
  const { comments } = req.body;
  const reqUser = req.user;

  const user = await User.findById(reqUser._id);
  const photo = await Photo.findById(id);

  // Check if photo exists
  if (!photo) {
    res.status(422).json({ errors: ["Foto não encontrada!"] });
    return;
  }

  // Put comment in the array comments
  const userComments = {
    comments,
    userName: user.name,
    userImage: user.profileImage,
    userId: user._id,
  };

  photo.comments.push(userComments);
  await photo.save();

  return res.status(200).json({
    comment: userComments,
    message: "O comentário foi adicionado com sucesso!",
  });
};

// Search Photos by title
const searchPhotos = async (req, res) => {
  const { q } = req.query;

  const photos = await Photo.find({ title: new RegExp(q, "i") }).exec();

  // Check if photos were found
  if (photos.length === 0) {
    return res.status(200).json({ mensage: ["Nenhuma foto entrada!"] });
  }
  res.status(200).json(photos);
};

module.exports = {
  insertPhoto,
  deletePhoto,
  getAllphotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  likePhoto,
  commentsPhoto,
  searchPhotos,
};
