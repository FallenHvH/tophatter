const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

var channels = [];

module.exports = {
  name: 'rm-imgchan',
  aliases: ['remove-image'],
  catagory: 'server owner',
  description: 'Remove channel from image whitelist',
  usage: '<#channel>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.author.id == message.guild.ownerID || message.author.id == settings.botOwnerID) {
      conn.query(`SELECT autoModWhitelistedImageChannels FROM bot_servers WHERE serverid = '${message.guild.id}'`, (err, res) => {
        if (err) return functions.errorLog(err, 'Whitelisted image channels (SQL)');

        channels = res[0].autoModWhitelistedImageChannels.split(",");

        if (!channels.includes(message.mentions.channels.first().id)) return functions.embed(client, 'Error', 'This channel is not on the ignore list.', defaultEmbedErrorColor, message.channel.id);

        for( var i = 0; i < channels.length; i++){ 
          if (channels[i] == message.mentions.channels.first().id) {
            channels.splice(i, 1); 
          }
        }

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
