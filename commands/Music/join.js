const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const ytdl = require('ytdl-core');

module.exports = {
  name: 'join',
  aliases: [],
  catagory: 'music',
  description: 'Join the bot to the channel you are in',
  usage: '',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    try {
      message.member.voiceChannel.join()
    } catch (err) {
      console.error(`Failed to join voice channel: ${err}`);
    }
  }
}
