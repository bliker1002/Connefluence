const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const { ensureAuth } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { generateResponse } = require('../services/aiService');
const passport = require('passport');

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure the 'uploads' folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Link Google
router.get('/link/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'] }));

router.get('/link/google/callback', passport.authenticate('google', { failureRedirect: '/profile' }), (req, res) => {
  res.redirect('/profile');
});

// Conditionally include other social media routes
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  router.get('/link/instagram', passport.authenticate('instagram'));
  router.get('/link/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/profile' }), (req, res) => {
    res.redirect('/profile');
  });
}

if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  router.get('/link/twitter', passport.authenticate('twitter'));
  router.get('/link/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/profile' }), (req, res) => {
    res.redirect('/profile');
  });
}

if (process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
  router.get('/link/tiktok', passport.authenticate('tiktok'));
  router.get('/link/tiktok/callback', passport.authenticate('tiktok', { failureRedirect: '/profile' }), (req, res) => {
    res.redirect('/profile');
  });
}

// Upload Data for AI Training
router.post('/upload-data', ensureAuth, upload.single('file'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Process the uploaded file (req.file.path)
    // You can extract text, images, etc., from the file for AI training
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
router.post('/setup-payouts', ensureAuth, async (req, res) => {
  const { payoutInfo } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.payoutInfo = payoutInfo;
    await user.save();
    res.json({ message: 'Payout information set up' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Generate Unique Link for Fans
router.post('/generate-link', ensureAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const uniqueLink = `https://yourdomain.com/chat/${user._id}`;
    user.uniqueLink = uniqueLink;
    await user.save();
    res.json({ uniqueLink });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
