const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json');
const f2 = require('../Shared/Server pinger functions.js')

module.exports = {
  name: 'add',
  aliases: ['addserver', 'as'],
  catagory: 'pinger',
  description: 'Add a server to the ping list',
  usage: '<host>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.author.id != message.guild.ownerID && message.author.id != settings.botOwnerID) return functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)

    f2.setServers(conn, message, client, defaultEmbedColor)
  }
}
