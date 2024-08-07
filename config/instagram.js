const InstagramStrategy = require('passport-instagram').Strategy;
const User = require('../models/User');

module.exports = new InstagramStrategy({
  clientID: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  callbackURL: '/auth/instagram/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findById(profile.id);
    if (!user) {
      return done(new Error('User not found'));
    }
    user.instagramId = profile.id;
    user.instagramAccessToken = accessToken;
    await user.save();
    done(null, user);
  } catch (err) {
    done(err, false, err.message);
  }
});
