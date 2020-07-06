const functions = require('../Shared/functions.js')

module.exports = {
  name: 'ping',
  aliases: [],
  catagory: 'general',
  description: 'Bots ping',
  usage: '',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    functions.embed(client, `Ping for ${client.user.username}`, `${Math.floor(client.ping)} ms`, defaultEmbedColor, message.channel.id)
  }
}
