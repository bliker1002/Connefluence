const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

module.exports = new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: '/auth/twitter/callback'
},
async (token, tokenSecret, profile, done) => {
  try {
    let user = await User.findById(profile.id);
    if (!user) {
      return done(new Error('User not found'));
    }
    user.twitterId = profile.id;
    user.twitterAccessToken = token;
    await user.save();
    done(null, user);
  } catch (err) {
    done(err, false, err.message);
  }
});
