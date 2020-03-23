const _ = require('lodash');
const asyncEach = require('async/each');

// controllers
const getAllOpinions = require('../opinion/controller').getAllOpinions;

// models
const User = require('./model');
const Discussion = require('../discussion/model');
const Opinion = require('../opinion/model');

/**
 * get user doc by user id
 * @param  {ObjectId} user_id
 * @return {promise}
 */
const getUser = (user_id) => {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: user_id }, (error, user) => {
      if (error) { console.log(error); reject(error); }
      else if (!user) reject(null);
      else resolve(user);
    });
  });
};

/**
 * sign in/up user via twitter provided info
 * this will signin the user if user existed
 * or will create a new user using Twitter infos
 * @param  {Object} twitterProfile    profile information provided by twitter
 * @return {promise}              user doc
 */
const signInViaTwitter = (twitterProfile) => {
  return new Promise((resolve, reject) => {

    // find if user exist on db
    User.findOne({ username: twitterProfile.username }, (error, user) => {
      if (error) { console.log(error); reject(error); }
      else {
        // get the email from emails array of twitterProfile
        const email = _.find(twitterProfile.emails, { verified: true }).value;

        // user existed on db
        if (user) {
          // update the user with latest Twitter profile info
          user.name = twitterProfile.displayName;
          user.username = twitterProfile.username;
          user.avatarUrl = twitterProfile._json.profile_image_url_https;
          user.twitter.id = twitterProfile._json.id,
          user.twitter.url = twitterProfile._json.html_url,
          user.twitter.followers = twitterProfile._json.followers,
          user.twitter.following = twitterProfile._json.following,

          // save the info and resolve the user doc
          user.save((error) => {
            if (error) { console.log(error); reject(error); }
            else { resolve(user); }
          });
        }

        // user doesn't exists on db
        else {
          // check if it is the first user (adam/eve) :-p
          // assign him/her as the admin
          User.count({}, (err, count) => {
            console.log('usercount: ' + count);

            let assignAdmin = false;
            if (count === 0) assignAdmin = true;

            // create a new user
            const newUser = new User({
              name: twitterProfile._json.name,
              username: twitterProfile._json.screen_name,
              avatarUrl: twitterProfile._json.profile_image_url_https,
              role: assignAdmin ? 'admin' : 'user',
              twitter: {
                id: twitterProfile._json.id,
                url: `https://twitter.com/${twitterProfile._json.screen_name}`,
                followers: twitterProfile._json.followers,
                following: twitterProfile._json.following,
              },
            });

            // save the user and resolve the user doc
            newUser.save((error) => {
              if (error) { console.log(error); reject(error); }
              else { resolve(newUser); }
            });

          });
        }
      }
    });

  });
};

/**
 * get the full profile of a user
 * @param  {String} username
 * @return {Promise}
 */
const getFullProfile = (username) => {
  return new Promise((resolve, reject) => {
    User
    .findOne({ username })
    .lean()
    .exec((error, result) => {
      if (error) { console.log(error); reject(error); }
      else if (!result) reject('not_found');
      else {
        // we got the user, now we need all discussions by the user
        Discussion
        .find({ user_id: result._id })
        .populate('forum')
        .lean()
        .exec((error, discussions) => {
          if (error) { console.log(error); reject(error); }
          else {
            // we got the discussions by the user
            // we need to add opinion count to each discussion
            asyncEach(discussions, (eachDiscussion, callback) => {
              getAllOpinions(eachDiscussion._id).then(
                (opinions) => {
                  // add opinion count to discussion doc
                  eachDiscussion.opinion_count = opinions ? opinions.length : 0;
                  callback();
                },
                (error) => { console.error(error); callback(error); }
              );
            }, (error) => {
              if (error) { console.log(error); reject(error); }
              else {
                result.discussions = discussions;
                resolve(result);
              }
            });
          }
        });
      }
    });
  });
};

module.exports = {
  signInViatwitter,
  getUser,
  getFullProfile,
};
