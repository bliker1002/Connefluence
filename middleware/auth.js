const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
  },
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/dashboard');
    }
  },
  authenticateToken: function (req, res, next) {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  },
  verifyUser: async function (req, res, next) {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    next();
  }
};
