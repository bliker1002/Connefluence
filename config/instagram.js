const passport = require('passport');
const InstagramStrategy = require('passport-instagram').Strategy;
const User = require('../models/User');

passport.use(new InstagramStrategy({
    clientID: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: "/auth/instagram/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ instagramId: profile.id });
      if (!user) {
        user = new User({
          instagramId: profile.id,
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
