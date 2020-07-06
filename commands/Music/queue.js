const music = require('./music-functions.js')

module.exports = {
  name: 'queue',
  aliases: ['q'],
  catagory: 'music',
  description: 'Show the current queue of music',
  usage: '',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    music.queue(conn, message, defaultEmbedColor, defaultEmbedErrorColor)
  }
}
