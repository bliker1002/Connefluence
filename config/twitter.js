const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

module.exports = new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: 'https://connefluence.com/auth/twitter/callback'
},
async (token, tokenSecret, profile, done) => {
  try {
    let user = await User.findOne({ twitterId: profile.id });
    if (!user) {
      user = new User({
        twitterId: profile.id,
        name: profile.displayName,
        socialMedia: { twitter: profile._json }
      });
      await user.save();
    }
    user.twitterAccessToken = token;
    await user.save();
    done(null, user);
  } catch (err) {
    done(err, false, err.message);
  }
});
