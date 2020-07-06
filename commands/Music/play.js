const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const music = require('./music-functions.js')

module.exports = {
  // good song: ;play https://www.youtube.com/watch?v=bnsUkE8i0tU
  name: 'play',
  aliases: ['p'],
  catagory: 'music',
  description: 'Play a song to a vc',
  usage: '<url>',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    music.execute(conn, client, message, args, defaultEmbedColor, defaultEmbedErrorColor)
  }
}
