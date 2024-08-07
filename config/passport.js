const passport = require('passport');
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Always load the Google strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const googleStrategy = require('./google');
  passport.use(googleStrategy);
}

// Conditionally load other strategies
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  const instagramStrategy = require('./instagram');
  passport.use(instagramStrategy);
}

if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  const twitterStrategy = require('./twitter');
  passport.use(twitterStrategy);
}

if (process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
  const tiktokStrategy = require('./tiktok');
  passport.use(tiktokStrategy);
}

module.exports = passport;
