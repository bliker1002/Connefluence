const express = require('express');
const passport = require('passport');
const router = express.Router();

router.post('/influencer/login', passport.authenticate('local'), (req, res) => {
  res.redirect(`/influencer/${req.user.username}`);
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }), (req, res) => {
  res.redirect(`/influencer/${req.user.username}`);
});

router.get('/instagram', passport.authenticate('instagram'));
router.get('/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/auth/login' }), (req, res) => {
  res.redirect(`/influencer/${req.user.username}`);
});

router.get('/tiktok', passport.authenticate('tiktok'));
router.get('/tiktok/callback', passport.authenticate('tiktok', { failureRedirect: '/auth/login' }), (req, res) => {
  res.redirect(`/influencer/${req.user.username}`);
});

router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/auth/login' }), (req, res) => {
  res.redirect(`/influencer/${req.user.username}`);
});

module.exports = router;
