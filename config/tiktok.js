const passport = require('passport');
const TiktokStrategy = require('passport-tiktok').Strategy;
const User = require('../models/User');

passport.use(new TiktokStrategy({
    clientID: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    callbackURL: "/auth/tiktok/callback",
    profileURL: 'https://open-api.tiktok.com/platform/oauth/userinfo/'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ tiktokId: profile.id });
      if (!user) {
        user = new User({
          tiktokId: profile.id,
          name: profile.displayName,
          avatar: profile.photos[0].value
        });
        await user.save();
      }
      done(null, user);
    } catch (error) {
      done(error, false, error.message);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
