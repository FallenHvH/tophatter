const fs = require('fs');
const functions = require('../Shared/functions.js');
const settings = require('../../bot-files/settings.json');
const extras = require('../../bot-files/extras.json')
const request = require("request");
const { RichEmbed } = require("discord.js");
const { ENETDOWN } = require('constants');

module.exports = {
  name: 'geolocate',
  aliases: ["geo", "locate"],
  catagory: 'general',
  description: 'Get an aproximate geo location on an IP',
  usage: '<IP>',
  execute(client, conn, message, args, defaultEmbedColor, defaultEmbedErrorColor, authorizedAdmin) {
    request( `http://ip-api.com/json/${args[0]}`, ( err, response, body ) => {
      if (err) { return functions.errorLog( err, "Calling API for geolocation") }
      functions.appendFile( "./logs/geolocator.log", `${message.author.tag} located ${args[0]}.` )

      body = JSON.parse( body )

      if ( body.status == "fail" ) 
      {
        if ( body.message == "invalid query" )
        {
          let embed = new RichEmbed()
            .setTitle( "Invalid Query" )
            .setColor( defaultEmbedErrorColor )
            .setDescription( "That query was invalid." )
            .setFooter( functions.randomFooter(), client.user.avatarURL )

          return message.channel.send( embed )
        } else
        {
          let embed = new RichEmbed()
            .setTitle( "General Error" )
            .setColor( defaultEmbedErrorColor )
            .setDescription( "A general error has occured and the query has failed." )
            .setFooter( functions.randomFooter(), client.user.avatarURL )

          return message.channel.send( embed )
        }
      }

      let embed = new RichEmbed()
        .setTitle( `Geolocation for ${args[0]}` )
        .setColor( defaultEmbedColor )
        .addField( "Country", body.country )
        .addField( "City", body.city )
        .addField( "Zip Code", body.zip )
        .addField( "Lat and Long", `${body.lat}, ${body.lon}` )
        .addField( "ISP", body.isp )
        .addField( "Organization", body.org )
          
      message.channel.send( embed )
    })
  }
}