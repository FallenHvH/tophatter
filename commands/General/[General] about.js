const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json');
const { RichEmbed } = require("discord.js")

var modCount, date2, data;

module.exports = {
  name: 'about',
  aliases: ['abt'],
  catagory: 'general',
  description: 'Show an about page for the bot',
  usage: '',
  async execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    
    // set uptime stats
    let total = Math.floor(client.uptime / 1000);
    let hours = Math.floor(total / 3600);
    let mins = Math.floor(total / 60)

    if (hours > 0) mins = mins / 60

    data = fs.readFileSync('./bot-files/update.txt')
    let version = fs.readFileSync('./version.json')

    let v = JSON.parse(version)

    // get module count
    // await fs.readdirSync('./modules', async (err, files) => {
    //   if (!err) {
    //     modCount = await files.filter(f => f.split(".").pop() === "js");    
    //   }
    // })

    modCount = 'N / A'


    // get update time (from fs file stat)
    let date = await fs.statSync('./bot-files/update.txt')

    date2 = await date.mtime.toString().substring(0, 15)
   
    let embed = new RichEmbed()
      .setTitle( "About" )
      .setColor( defaultEmbedColor )
      .addField( "Uptime", hours + ' hours and ' + Math.floor(mins) + ' minutes', true )
      .addField( "Version", v.version, true )
      .addField( `Update notes as of **${date2}**`, data )
      .setFooter( functions.randomFooter(), client.user.avatarURL )
      .setTimestamp() 

    message.channel.send(embed)
  }
}
