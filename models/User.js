const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  instagramId: {
    type: String
  },
  twitterId: {
    type: String
  },
  googleId: {
    type: String
  },
  tiktokId: {
    type: String
  },
  socialMedia: {
    instagram: Object,
    twitter: Object,
    youtube: Object,
    tiktok: Object
  },
  instagramAccessToken: {
    type: String
  },
  twitterAccessToken: {
    type: String
  },
  googleAccessToken: {
    type: String
  },
  tiktokAccessToken: {
    type: String
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
