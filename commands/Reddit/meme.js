const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'meme',
  aliases: [],
  catagory: 'reddit',
  description: 'Get a random post from a meme subreddit',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    functions.getReddit(client, defaultEmbedColor, defaultEmbedErrorColor, extras.memeReddits[Math.floor(Math.random() * extras.memeReddits.length)], message)
  }
}
