const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'kick',
  aliases: ['kickuser'],
  catagory: 'admin',
  description: 'Kick someone from the server with a reason',
  usage: '<@user> <reason>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (authorizedAdmin) {
      if (message.mentions.users.first()) {
        functions.kickUser(conn, client, defaultEmbedColor, defaultEmbedErrorColor, message, false)
      } else {
        functions.deletingEmbed(client, 'No user tagged', 'You need to tag a user to kick!', defaultEmbedErrorColor, message.channel.id, false)
      }
    } else {
      functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
    }
  }
}
