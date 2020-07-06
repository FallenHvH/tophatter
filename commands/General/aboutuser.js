const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')

const { RichEmbed } = require('discord.js')

function userMessage(message, defaultEmbedColor, user) {
  let userURL;

  console.log(user);

  if (user.avatarURL.length > 0) {
    userURL = user.avatarURL
  } else {
    userURL = 'Not Available'
  } 

  let embed = new RichEmbed()
    .setTitle(`About ${user.username}`)
    .addField('Username', user.username, true)
    .addField('Discrimator', user.discriminator, true)
    .addField('Date created', user.createdAt, false)
    .addField('UserID', user.id, true)
    .addField('Avatar URL', `[Click here](${userURL})`, true)
    .setThumbnail(userURL)
    .setColor(defaultEmbedColor)

  message.channel.send(embed)
}

module.exports = {
  name: 'aboutuser',
  aliases: ['getuser', 'user', 'who', 'whois'],
  catagory: 'general',
  description: 'Get the information about a user',
  usage: '<@user>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    if (message.mentions.users.first()) {
      userMessage(message, defaultEmbedColor, message.mentions.users.first())      
    } else {
      userMessage(message, defaultEmbedColor, message.author)
    }
  }
}
