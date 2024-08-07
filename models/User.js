const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  googleId: String,
  googleAccessToken: String,
  instagramId: String,
  instagramAccessToken: String,
  twitterId: String,
  twitterAccessToken: String,
  tiktokId: String,
  tiktokAccessToken: String,
  socialMedia: {
    youtube: Object,
    instagram: Object,
    twitter: Object,
    tiktok: Object
  }
});

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
