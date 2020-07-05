const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const f2 = require('../Shared/Server pinger functions.js')

module.exports = {
  name: 'clearlist',
  aliases: ['clearservers'],
  catagory: 'pinger',
  description: 'Clear the list of servers to ping',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.author.id != message.guild.ownerID && message.author.id != settings.botOwnerID) return functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
  
    f2.resetServerData(conn, message, client, defaultEmbedColor)
  }
}
