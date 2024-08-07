const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://connefluence.com/auth/google/callback',
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        socialMedia: { youtube: profile._json }
      });
      await user.save();
    }
    user.googleAccessToken = accessToken;
    await user.save();
    done(null, user);
  } catch (err) {
    done(err, false, err.message);
  }
});
