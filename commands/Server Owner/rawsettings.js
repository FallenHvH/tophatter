const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json');
const { RichEmbed } = require('discord.js');
const util = require("util")

var channels = [];

module.exports = {
  name: 'rawsettings',
  aliases: ['rawset', "rawsetting"],
  catagory: 'server owner',
  description: 'Get the raw MySQL output for your server',
  usage: '<#channel>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.author.id == message.guild.ownerID || message.author.id == settings.botOwnerID) {
      conn.query(`SELECT * FROM bot_servers WHERE serverid = '${message.guild.id}'`, (err, res) => {
        if (err) return functions.errorLog(err, 'Rawsettings');
        let embed = new RichEmbed()
          .setTitle("Raw output from MySQL for server")
          .setColor(defaultEmbedColor)
          .setDescription("```"+util.inspect(res[0],false)+"```")
        message.channel.send(embed)
      })
    } else {
      functions.permissionMissing(client, defaultEmbedErrorColor, message.channel.id)
    }
  }
}
