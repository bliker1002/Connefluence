const InstagramStrategy = require('passport-instagram').Strategy;
const User = require('../models/User');

module.exports = new InstagramStrategy({
  clientID: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
  callbackURL: 'https://connefluence.com/auth/instagram/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ instagramId: profile.id });
    if (!user) {
      user = new User({
        instagramId: profile.id,
        name: profile.displayName,
        socialMedia: { instagram: profile._json.data }
      });
      await user.save();
    }
    user.instagramAccessToken = accessToken;
    await user.save();
    done(null, user);
  } catch (err) {
    done(err, false, err.message);
  }
});
