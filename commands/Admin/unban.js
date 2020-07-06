const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

module.exports = {
  name: 'unban',
  aliases: [],
  catagory: 'admin',
  description: 'Unbans a userid',
  usage: '<userid>',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (authorizedAdmin) {
      functions.unbanUser(client, message, defaultEmbedColor, conn)
    } else {
      functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
    }
  }
}
