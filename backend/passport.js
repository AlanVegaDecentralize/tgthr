/**
 * module dependencies for passport configuration
 */
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

const TWITTER_CONSUMER = require('../config/credentials').TWITTER_CONSUMER;
const TWITTER_CONSUMER_KEY = require('../config/credentials').TWITTER_CONSUMER_KEY;
const CALLBACK_URL = require('../config/credentials').CALLBACK_URL;

// controllers
const getUser = require('./entities/user/controller').getUser;
const signInTwitter = require('./entities/user/controller').signInTwitter;

/**
 * passport configuration
 */
const passportConfig = (app) => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    getUser(id).then(
      (user) => { done(null, user); },
      (error) => { done(error); }
    );
  });

  // Twitter strategy for passport using OAuth
  passport.use(new TwitterStrategy(
    {
      clientID: TWITTER_CONSUMER,
      clientSecret: TWITTER_CONSUMER_KEY,
      callbackURL: CALLBACK_URL,
      scope: 'user:email',
    },
    (accessToken, refreshToken, TwitterProfile, done) => {
      signInTwitter(TwitterProfile).then(
        (user) => { console.log('got the user'); done(null, user); },
        (error) => { console.log('something error occurs'); done(error); }
      );
    }
  ));
};

module.exports = passportConfig;
