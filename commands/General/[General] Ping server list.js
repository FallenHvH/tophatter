const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const f2 = require('../Shared/Server pinger functions.js')

module.exports = {
  name: 'servers',
  aliases: ['sv', 'getservers', 'pingservers'],
  catagory: 'general',
  description: 'Ping a set server list',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.author.id != message.guild.ownerID && message.author.id != settings.botOwnerID) return functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
  
    f2.getServers(conn, message, client, defaultEmbedColor)
  }
}
