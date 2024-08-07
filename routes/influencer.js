const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const { ensureAuth } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { generateResponse, fineTuneModel } = require('../services/aiService');
const passport = require('passport');
const fs = require('fs');
const path = require('path');

const { fetchYouTubeData } = require('../services/youtubeService');
const { fetchInstagramData } = require('../services/instagramService');
const { fetchTwitterData } = require('../services/twitterService');
const { fetchTikTokData } = require('../services/tiktokService');

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', req.user.username);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Link Google
router.get('/link/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'] }));

router.get('/link/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(`/influencer/${req.user.username}`);
});

// Conditionally include other social media routes
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  router.get('/link/instagram', passport.authenticate('instagram'));
  router.get('/link/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(`/influencer/${req.user.username}`);
  });
}

if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  router.get('/link/twitter', passport.authenticate('twitter'));
  router.get('/link/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(`/influencer/${req.user.username}`);
  });
}

if (process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
  router.get('/link/tiktok', passport.authenticate('tiktok'));
  router.get('/link/tiktok/callback', passport.authenticate('tiktok', { failureRedirect: '/login' }), (req, res) => {
    res.redirect(`/influencer/${req.user.username}`);
  });
}

// Fetch YouTube Data
router.get('/youtube-data', ensureAuth, async (req, res) => {
  try {
    const data = await fetchYouTubeData(req.user.id);
    res.json(data);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    res.status(500).send('Server error');
  }
});

// Fetch Instagram Data
router.get('/instagram-data', ensureAuth, async (req, res) => {
  try {
    const data = await fetchInstagramData(req.user.id);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    res.status(500).send('Server error');
  }
});

// Fetch Twitter Data
router.get('/twitter-data', ensureAuth, async (req, res) => {
  try {
    const data = await fetchTwitterData(req.user.id);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    res.status(500).send('Server error');
  }
});

// Fetch TikTok Data
router.get('/tiktok-data', ensureAuth, async (req, res) => {
  try {
    const data = await fetchTikTokData(req.user.id);
    res.json(data);
  } catch (error) {
    console.error('Error fetching TikTok data:', error);
    res.status(500).send('Server error');
  }
});

// Upload Data for AI Training
router.post('/upload-data', ensureAuth, upload.single('file'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const filePath = req.file.path;
    // Call fineTuneModel to process the file for AI training
    await fineTuneModel(user.username, filePath);
    res.json({ message: 'File uploaded successfully', file: req.file });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Generate AI Response
router.post('/generate-response', ensureAuth, async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await generateResponse(prompt);
    res.json({ response });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Set Up Stripe Payouts
router.post('/stripe-setup', ensureAuth, async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email: req.user.email,
    });
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://connefluence.com/reauth',
      return_url: 'https://connefluence.com/influencer/signup',
      type: 'account_onboarding',
    });
    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error setting up Stripe', error);
    res.status(500).send('Stripe setup failed');
  }
});

// Generate Unique Link for Fans
router.post('/generate-link', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const uniqueLink = `https://connefluence.com/chat/${user._id}`;
    user.uniqueLink = uniqueLink;
    await user.save();
    res.json({ uniqueLink });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
