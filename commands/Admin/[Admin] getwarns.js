const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json');
const { RichEmbed } = require('discord.js');

var warnReasons = [];

module.exports = {
  name: 'getwarns',
  aliases: ["warns"],
  catagory: 'admin',
  description: 'Get warnings for a user',
  usage: '<@user>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.mentions.users.first()) {
      console.log('Checking warns for user ' + message.mentions.users.first().id)
      conn.query("SELECT * FROM user_warns WHERE serverID = " + message.guild.id + " AND userID = " + message.mentions.users.first().id, (err, result) => {
        if (err) {
          console.log('Failed to get warns, commit die. ' + err)
          functions.embed(client, 'Failure', 'Failed to retrieve warns for user <@' + message.mentions.users.first().id + '>', defaultEmbedErrorColor, message.channel.id)
        } else {
          if (result.length === 0) {
            functions.embed(client, 'No warnings', `No warnings were found for user ${message.mentions.users.first()}`, defaultEmbedErrorColor, message.channel.id)
            console.log(`No warnings for user ${message.mentions.users.first().toString()}`)
          } else {
            for (var i = 0;i < result.length;i++) {
              let warnedBy;
              if (result[i].warnedBy.toString().toLowerCase() == "system") warnedBy = "System"
              if (result[i].warnedBy.toString().toLowerCase() != "system") warnedBy = `<@${result[i].warnedBy}>`
              console.log(warnedBy)
              warnReasons.push('Warned by ' + warnedBy + ' on ' + result[i].time + ' : ' + result[i].reason + '\n')
            }
            // warn list
            let embed = new RichEmbed()
              .setTitle(`Warns for ${message.mentions.users.first().tag}`)
              .setColor(defaultEmbedColor)
              .addField("Warn count", result.length)
              .addField("Warn reasons", warnReasons.join('').substring(0,1024))
              .setFooter(functions.randomFooter(),client.user.avatarURL)
              .setTimestamp()
            message.channel.send(embed)
          }
        }
      })
    } else {
      functions.deletingEmbed(client, 'No user tagged', 'You need to tag a user to check warns on!', defaultEmbedErrorColor, message.channel.id)
    }
  }
}
