const { google } = require('googleapis');
const User = require('../models/User');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY // Use API Key for public data or OAuth token for private data
});

async function fetchYouTubeData(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.googleAccessToken) {
      throw new Error('User not authenticated with Google');
    }

    const response = await youtube.channels.list({
      part: 'snippet,contentDetails,statistics',
      mine: true,
      access_token: user.googleAccessToken // Use OAuth token
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    throw error;
  }
}

module.exports = { fetchYouTubeData };
