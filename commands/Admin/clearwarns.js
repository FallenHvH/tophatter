const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'clearwarns',
  aliases: [],
  catagory: 'admin',
  description: 'Clear all warnings for a user',
  usage: '<@user>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (authorizedAdmin === true) {
      if (!message.mentions.users) {
        functions.embed(client, 'User not found', 'You need to tag a user', defaultEmbedErrorColor, message.channel.id)
      } else {
        functions.clearWarns(client, conn, message, defaultEmbedColor, defaultEmbedErrorColor)
      }
    } else {
      functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
    }
  }
}
