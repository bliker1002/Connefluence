const TikTokStrategy = require('../passport-tiktok'); // Assuming you have a custom TikTok strategy
const User = require('../models/User');

module.exports = new TikTokStrategy({
  clientID: process.env.TIKTOK_CLIENT_KEY,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  callbackURL: '/auth/tiktok/callback',
  profileURL: 'https://open-api.tiktok.com/platform/oauth/userinfo/'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findById(profile.id);
    if (!user) {
      return done(new Error('User not found'));
    }
    user.tiktokId = profile.id;
    user.tiktokAccessToken = accessToken;
    await user.save();
    done(null, user);
  } catch (err) {
    done(err, false, err.message);
  }
});
