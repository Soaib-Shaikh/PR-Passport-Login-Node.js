// models/userSchema.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['user','admin'],
    default: 'user'
  },

  fullName: { type: String },
  mobile:   { type: String },
  address:  { type: String },

  // ✅ New Fields
  birthdate: { type: Date },
  gender: { 
    type: String, 
    enum: ['male','female','other'], 
    default: 'other'
  },

  // avatar fields
  avatarLocal:    { type: String }, // filename in public/uploads
  avatarUrl:      { type: String }, // cloudinary secure url
  avatarPublicId: { type: String }, // cloudinary public id

  // ✅ For Author Spotlight: bio/description
  bio: { type: String, default: "Blogger" }  // short description for sidebar
}, { timestamps: true });

const User = mongoose.model('user', userSchema);
module.exports = User;
