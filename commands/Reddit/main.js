const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'reddit',
  aliases: ['subreddit'],
  catagory: 'reddit',
  description: 'Get a post from a reddit of your choice',
  usage: '<subreddit>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (args.length < 1) {
      functions.deletingEmbed(client, 'No subreddit', 'You need to include a subreddit to pick a post from!', defaultEmbedErrorColor, message.channel.id)
    } else {
      functions.getReddit(client, defaultEmbedColor, defaultEmbedErrorColor, args.join('-'), message)
    }
  }
}
