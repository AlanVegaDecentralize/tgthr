require('dotenv').config();

module.exports = {
  TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER,
  TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
  CALLBACK_URL: process.env.CALLBACK_URL,
  DBURL: process.env.DBURL,
};

