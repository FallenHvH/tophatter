const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'cursed',
  aliases: [],
  catagory: 'reddit',
  description: 'Get a post from a cursed subreddit',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    functions.getReddit(client, defaultEmbedColor, defaultEmbedErrorColor, extras.cursedReddits[Math.floor(Math.random() * extras.cursedReddits.length)], message)
  }
}
