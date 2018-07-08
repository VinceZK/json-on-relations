const express = require('express');
const router = express.Router();
const Auth = require('./controller/server_auth_ctrl.js');
const path = require('path');

// Basic login with username & password
router.delete('/api/logout',Auth.logout);

// Ensure all the APIs bellow are under authentication.
router.all('/api/*', Auth.ensureAuthenticated);

// Add this route to support page refresh
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

module.exports = router;
