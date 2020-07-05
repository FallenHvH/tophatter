const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'warn',
  aliases: ['w'],
  catagory: 'admin',
  description: 'Warn a user',
  usage: '<@user> <reason>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (authorizedAdmin === true) {
      if (message.mentions.users.first()) {
        try {
          dateNow = new Date();
          dateH = dateNow.getHours();
          dateM = dateNow.getMinutes();

          if (dateM < 10) {
            dateM = '0' + dateM
          }

          dateNowComplete = dateH + ':' + dateM

          if (args.length > 1) {
            args.shift()
            var reason = args.join(" ")
          } else {
            functions.deletingEmbed(client, 'No reason', 'Please include a reason for the warning.', defaultEmbedErrorColor, message.channel.id)
            return;
          }


          functions.warnUser(conn, client, defaultEmbedErrorColor, defaultEmbedColor, false, message, reason);
        }
        catch (err) {
          console.log('Error for server ' + message.guild.id + ':' + message.guild.name + ' | ' + err.stack)
          functions.deletingEmbed(client, 'Error', 'Failed to run warn function', defaultEmbedErrorColor, message.channel.id)
        }
      } else {
        functions.deletingEmbed(client, 'Error', 'You need to tag a user to warn!', defaultEmbedErrorColor, message.channel.id)
      }
    }
    else {
      functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
    }
  }
}
