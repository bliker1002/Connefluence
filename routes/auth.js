const express = require('express');
const passport = require('passport');
const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/influencer/signup');
});

// Instagram OAuth
router.get('/instagram', passport.authenticate('instagram'));
router.get('/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/influencer/signup');
});

// Twitter OAuth
router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/influencer/signup');
});

// TikTok OAuth
router.get('/tiktok', passport.authenticate('tiktok'));
router.get('/tiktok/callback', passport.authenticate('tiktok', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/influencer/signup');
});

module.exports = router;
