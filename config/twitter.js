const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "/auth/twitter/callback"
  },
  async (token, tokenSecret, profile, done) => {
    try {
      let user = await User.findOne({ twitterId: profile.id });
      if (!user) {
        user = new User({
          twitterId: profile.id,
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
