const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'ban',
  aliases: ['banuser'],
  catagory: 'admin',
  description: 'Ban a user',
  usage: '<@user>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (authorizedAdmin) {
      if (message.mentions.users.first()) {
        if (args.length < 1) {
          functions.banUser(conn, client, defaultEmbedColor, defaultEmbedErrorColor, message, 0, false)
        } else if (args.length >= 2) {
          if (!isNaN(args[1])) {
            functions.banUser(conn, client, defaultEmbedColor, defaultEmbedErrorColor, message, args[1], false)
          } else {
            functions.banUser(conn, client, defaultEmbedColor, defaultEmbedErrorColor, message, 0, false)
          }
        }
      } else {
        functions.deletingEmbed(client, 'No user tagged', 'You need to tag a user to ban!', defaultEmbedErrorColor, message.channel.id, false)
      }
    } else {
      functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
    }
  }
}
