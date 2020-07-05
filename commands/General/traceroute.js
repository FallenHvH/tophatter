const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const request = require("request");
const { RichEmbed } = require("discord.js");
const { notDeepEqual } = require('assert');

module.exports = {
  name: 'traceroute',
  aliases: ["trace", "routepath", "tracepath"],
  catagory: 'general',
  description: 'Trace a route that packets go through',
  usage: '<IP>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    try {
      let embed = new RichEmbed()
        .setTitle("Please wait...")
        .setColor( defaultEmbedColor )
        .setDescription( "The API we currently use is kind of slow.\n\nSorry!" )
        .setFooter( functions.randomFooter(), client.user.avatarURL )
        .setTimestamp()

      let now = new Date().getTime()
      const queryStart = now / 1000

      message.channel.send( embed )
      .then( msg => {
        request( `https://api.viewdns.info/traceroute/?domain=${args[0]}&apikey=${settings.tracerouteApiKey}&output=json`, ( err, response, body ) => {
          if (err) { return functions.errorLog( err, "Calling API for traceroute") }
          functions.appendFile( "./logs/traceroute.log", `${message.author.tag} traced ${args[0]}.` )

          let embed = new RichEmbed()
            .setTitle( `Traceroute on ${args[0]}` )
            .setColor( defaultEmbedColor )
            .setTimestamp()

          body = JSON.parse( body )
          body.response.hops.forEach( hop => {
            if ( hop.hostname != "*" && hop.ip != "0.0.0.0" ) { embed.addField( hop.hostname, hop.ip ) }
          })

          if ( embed.fields = [] ) 
          { 
            msg.delete()
            return functions.embed( client, "Error", "No hops were returned\n\nThis most likely means that the domain couldn't be resolved.", defaultEmbedErrorColor, message.channel.id )
          }
              
          let now = new Date().getTime()
          const queryEnd = now / 1000

          const queryTime = queryEnd - queryStart
          embed.setFooter( `Requested by ${message.author.tag} | Request took ${Math.floor( queryTime * 100 ) / 100} seconds`, message.author.avatarURL )

          msg.edit( embed )
        })
      })
    } catch (err)
    {
      functions.errorLog(err, "Traceroute API")
    }
  }
}