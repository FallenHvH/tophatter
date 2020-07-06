const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const music = require('./music-functions.js')

var adminMusic;

module.exports = {
  name: 'skip',
  aliases: ['s'],
  catagory: 'music',
  description: 'Skip the current song',
  usage: '',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    conn.query(`SELECT adminMusic FROM bot_servers WHERE serverid = ` + message.guild.id, async (err, result) => {
      if (err) {
        console.error(`Failed to call adminMusic from SQL: ${err}`)
      } else {
        adminMusic = result[0].adminMusic;

        if (adminMusic !== 1) {
          music.skip(conn, client, message, defaultEmbedColor, defaultEmbedErrorColor)
        } else if (adminMusic == 1 && authorizedAdmin) {
          music.skip(conn, client, message, defaultEmbedColor, defaultEmbedErrorColor)
        } else {
          functions.deletingEmbed(client, 'Restricted', 'Sorry but you cannot use this command as it has been set to admin only.', defaultEmbedErrorColor, message.channel.id)
        }
      }
    })
  }
}
