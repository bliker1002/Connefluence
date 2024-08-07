const util = require('util');
const OAuth2Strategy = require('passport-oauth2');
const request = require('request');

class TikTokStrategy extends OAuth2Strategy {
  constructor(options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || 'https://open-api.tiktok.com/platform/oauth/connect/';
    options.tokenURL = options.tokenURL || 'https://open-api.tiktok.com/platform/oauth/token/';

    super(options, verify);

    this.name = 'tiktok';
    this._profileURL = options.profileURL || 'https://open-api.tiktok.com/platform/oauth/userinfo/';
  }

  userProfile(accessToken, done) {
    const url = `${this._profileURL}?access_token=${accessToken}`;

    request.get({ url, json: true }, (err, response, body) => {
      if (err) {
        return done(err);
      } else if (response.statusCode !== 200) {
        return done(new Error('Failed to fetch user profile'));
      }

      const profile = body.data;
      profile.provider = 'tiktok';

      done(null, profile);
    });
  }
}

module.exports = TikTokStrategy;
