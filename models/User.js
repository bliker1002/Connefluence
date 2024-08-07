const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  googleId: String,
  instagramId: String,
  tiktokId: String,
  twitterId: String,
  name: String,
  avatar: String,
  stripeDetails: String,
  socialMedia: [String]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
