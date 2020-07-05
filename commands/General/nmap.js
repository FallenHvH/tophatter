const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const request = require("request");
const { RichEmbed } = require("discord.js");

module.exports = {
  name: 'nmap',
  aliases: ["portscan", "scan"],
  catagory: 'general',
  description: 'Nmap a server lol',
  usage: '<IP>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    request( `https://api.hackertarget.com/nmap/?q=${args[0]}`, ( err, response, body ) => {
      if (err) { return functions.errorLog( err, "Calling API for nmap scan") }
      functions.appendFile( "./logs/nmap_scans.log", `${message.author.tag} nmapped ${args[0]}.` )

      if ( body.startsWith( "error" ) ) 
      {
        let embed = new RichEmbed()
          .setTitle( "General Error" )
          .setColor( defaultEmbedErrorColor )
          .setDescription( "A general error has occured and the query has failed." )
          .setFooter( functions.randomFooter(), client.user.avatarURL )

        return message.channel.send( embed )
      }

      let embed = new RichEmbed()
        .setTitle( `Nmap on ${args[0]}` )
        .setColor( defaultEmbedColor )
        .setDescription( "```" + body + "```" )
        .setFooter( `Requested by ${message.author.tag}`, message.author.avatarURL )
          
      message.channel.send( embed )
    })
  }
}