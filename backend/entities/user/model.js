/**
 * user model
 */
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  avatarUrl: String,
  role: { type: String, default: 'user' }, // ['admin', 'moderator', 'user']
  twitter: {
    id: Number,
    url: String,
    verified: Boolean,
    followers: Number,
    following: Number,
  },
});

module.exports = mongoose.model('user', userSchema);
