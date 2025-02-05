const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const router = express.Router();

// GitHub OAuth configuration
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findBySocialId('github', profile.id);
        if (!user) {
            user = await User.createUser({
                name: profile.displayName,
                email: profile.emails[0].value,
                githubId: profile.id,
                avatar: profile.photos[0].value
            });
        }
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Facebook OAuth configuration
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findBySocialId('facebook', profile.id);
        if (!user) {
            user = await User.createUser({
                name: profile.displayName,
                email: profile.emails[0].value,
                facebookId: profile.id,
                avatar: profile.photos[0].value
            });
        }
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Auth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { 
    successRedirect: '/profile',
    failureRedirect: '/login'
}));

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}));

module.exports = router; 