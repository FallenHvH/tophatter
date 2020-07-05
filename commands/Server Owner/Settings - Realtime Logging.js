const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const s = require('./settings-functions.js');

module.exports = {
  name: 'settings.logging',
  aliases: [],
  catagory: 'server owner',
  description: 'Update realtime logging settings',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.author.id == message.guild.ownerID || message.author.id == settings.botOwnerID) {
      s.realTimeLoggingSettings(conn, client, message, defaultEmbedColor, defaultEmbedErrorColor);
    } else {
      functions.deletingEmbed(client, 'Owner needed', 'Sorry, but only the owner of the server can configure these settings.', defaultEmbedErrorColor, message.channel.id)
    }
  }
}






