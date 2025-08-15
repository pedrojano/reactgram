const User = require("../models/User");
const Photo = require("../models/Photo");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { default: mongoose, Mongoose } = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

// Generate user token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// Register user and sign in
const register = async (req, res) => {

  const { name, email, password } = req.body;

  //check if user exists
  const user = await User.findOne({email});

  if (user) {
    res.status(422).json({ errors: ["Por favor, utilize outro e-mail."] });
    return;
  }

  // Generate password hash
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    name,
    email,
    password: passwordHash
  });

  //If user was created seccessfully, return the token
  if (!newUser) {
    res.status(422).json({
      errors: ["Houve um erro, por favor tente novamente mais tarde."],
    });
    return;
  }

  res.status(201).json({ 
    _id: newUser._id, 
    token: generateToken(newUser._id),
 });
};

// Sign user in 
const login = async (req, res) => {
  const {email, password} = req.body

  const user = await User.findOne({email})

  //Check if user exists 
  if(!user) {
    res.status(404).json({errors: ["Usuário não encontrado."]})
    return
  }

  // Check if password matches
  if(!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({errors: ["Senha inválida."]})
    return
  }

  // Return user with token
  res.status(201).json({
    _id: user._id,
    profileImage: user.profileImage,
    token: generateToken(user._id),
    message: [`${user.name} login realizado com sucesso!`]
  });

};

// Get current logged in user
const getCurrentUser = async (req, res) => {
  const user = req.user; 

  res.status(200).json(user);
};

//Update an user
const update = async (req, res) => {

const {name, password, bio} = req.body

let profileImage = null
if(req.file) {
  profileImage = req.file.filename
}

const reqUser = req.user

const user = await User.findById(new mongoose.Types.ObjectId(reqUser._id)).select("-password");

if(name){
  user.name = name
}

if(password) {
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  user.password = passwordHash;
}

if(profileImage) {
  user.profileImage = profileImage; 
}

if(bio){
  user.bio = bio;
}

await user.save();
res.status(200).json(user);

};

// Get user by id 
const getUserById = async (req,res) => { 

  const id = req.params.id


try {
  const user = await User.findById(id).select("-password");

  // Check if user exists
  if(!user){
    res.status(404).json({ errors: ["Usuário não encontrado! (A)"]});
    return;
  }

  res.status(200).json(user);

} catch (error) {
  res.status(502).json({ errors: ["Uauário não encontrado (B)!"]})
  return;
}

};

//Delete User
const deleteUser = async (req, res) => {
 const {id} = req.params;
  const reqUser = req.user;

  try {
    const user = await User.findById(id);

    // Check if user existis
    if(!user){
      res.status(404).json({ errors: ["Usuário não encontrado!"]});
      return;
    }

    // Check if user is the same as the one tryimg to delete the account
    if(!user._id.equals(reqUser._id)) {
      res.status(422).json({
        errors: ["Você não pode deletar este usuário!"]
      });
      return;
    }

    // Delete user photos first
    await Photo.deleteMany({userId: user._id});

    // Delete the user
    await User.findByIdAndDelete(user._id);

    res.status(200).json({id: user._id, message:`Usuário ${user.email} deletado com sucesso!`});

  } catch (error) {
    res.status(404).json({ errors: ["Usuário não encontrado!"]});
    return;
  } 
};

// Get all users
const getAllUsers = async (req, res) => {
  try{
    const users =  await User.find({}).select("-password");

    if(!users || users.length === 0){
      return res.status(200).json({message: "Nenhum, usuário cadastrado"})
    }
    res.status(200).json(users);    
  } catch(error){
    res.status(500).json({errors: ["Ocorreu um erro, tente novamente mais tarde!"]});
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  update,
  getUserById,
  deleteUser,
  getAllUsers,
};
