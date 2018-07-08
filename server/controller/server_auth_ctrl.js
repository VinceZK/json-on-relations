/**
 * Created by VinceZK on 5/27/18.
 */
const passport = require('passport');
const Authorization = require('node-authorization').Authorization;

/**
 * Cache all the identity information to Redis session store
 * This method is only called after successfully login
 */
passport.serializeUser(function (identity, done) {
  console.log('serialize the user in portal: ');
  done(null, identity);
},);

/**
 * Express Session helps to get identity from Redis session store
 * and pass to this method for *EVERY* request (should exclude static files).
 * Here, we pass the identity together with Authorization object to req.user.
 * We should not change the identity object as it will reflect to req.session.passport.user,
 * which afterwards will be saved back to Redis session store for every HTTP response.
 */
passport.deserializeUser(function (identity, done) {
  console.log('deserialize the user in portal');
  const user = {
    identity: identity,
    Authorization: null
  };

  if(identity.userid && identity.profile)
    user.Authorization = new Authorization(identity.userid, identity.profile);

  done(null, user); // be assigned to req.user
},);

module.exports = {
  logout: function (req, res) {
    console.log(req.user);
    if (req.user) {
      req.logout();
      req.session = null; // To forbid the session recreation
      res.status(200).end();
    } else {
      res.status(400).send('Not Logged in');
    }
  },

  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401).send('Unauthenticated!');
    }
  }
};

