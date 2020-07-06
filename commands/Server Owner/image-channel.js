const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

var channels = [];

module.exports = {
  name: 'imgchan',
  aliases: [],
  catagory: 'server owner',
  description: 'Whitelist channel for images',
  usage: '<#channel>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.author.id == message.guild.ownerID || message.author.id == settings.botOwnerID) {
      conn.query(`SELECT autoModWhitelistedImageChannels FROM bot_servers WHERE serverid = '${message.guild.id}'`, (err, res) => {
        if (err) return functions.errorLog(err, 'Whitelisted image channels (SQL)');

        if (res[0].length > 1) {
          channels = res[0].split(",");

          channels.push(message.mentions.channels.first().id.toString());
        } else {
          channels = [];

          channels.push(message.mentions.channels.first().id.toString())
        }

        if (channels.includes(message.mentions.channels.first().id.toString())) return functions.embed(client, 'Error', 'This channel is already being ignored.', defaultEmbedErrorColor, message.channel.id)

        conn.query(`UPDATE bot_servers SET autoModWhitelistedChannels = '${channels.join(",")}' WHERE serverid = '${message.guild.id}'`, (err, res) => {
          if (err) return functions.errorLog(err, 'Inserting into SQL database');

          functions.embed(client, 'Updated', 'Updated the database.', defaultEmbedColor, message.channel.id)
        })
      })
    } else {
      functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
    }
  }
}
