const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'unmute',
  aliases: [],
  catagory: 'admin',
  description: 'Unmute a user',
  usage: '<@user>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (authorizedAdmin === true) {
      if (message.mentions.users.first()) {
        try {
          functions.unmuteUser(client, defaultEmbedColor, defaultEmbedErrorColor, message)
        } catch (err) {
          functions.embed(client, 'Error', `The following error was thrown: ${err}`, defaultEmbedErrorColor, message.channel.id)
        }
      } else {
        functions.deletingEmbed(client, 'No user tagged', 'Tag a user to unmute', defaultEmbedErrorColor, message.channel.id)
      }
    } else {
      functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
    }
  }
}
