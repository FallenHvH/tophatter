const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const { MessageAttachment } = require('discord.js')

var logs = [];

module.exports = {
  name: 'clearlogs',
  aliases: [],
  catagory: 'server owner',
  description: 'Clear all logs for the server',
  usage: '',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    try {
      if (message.author.id == message.guild.ownerID || message.author.id == settings.botOwnerID) {
        conn.query(`DELETE FROM logs WHERE serverid = ${message.guild.id}`, err => {
          if (err) {
            console.error(`Failed to delete logs from SQL: ${err}`)
            return functions.embed(client, "Failed to delete logs from database", "", defaultEmbedErrorColor, message.channel.id)
          }
          functions.embed(client, "Cleared logs from database", "All relevant server logs were discarded.", defaultEmbedColor, message.channel.id)
        })
      } else {
        functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
      }
    } catch (err) {
      console.log(err.stack);
    }
  }
}
