const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'mute',
  aliases: [],
  catagory: 'admin',
  description: 'Mute the tagged user',
  usage: '[time (minutes)]',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (authorizedAdmin === true) {
      if (message.mentions.users.first()) {
        try {
          functions.muteUser(client, defaultEmbedColor, defaultEmbedErrorColor, message, args[1])
        } catch (err) {
          // no errors pls
        }
      } else {
        functions.deletingEmbed(client, 'No user tagged', 'Tag a user to mute', defaultEmbedErrorColor, message.channel.id)
      }
    } else {
      functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
    }
  }
}
