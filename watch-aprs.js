#!/usr/bin/env node

/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

/*
  This is a command-line utility to monitor and print out APRS packets from a
  TCP KISS device, like an instance of the DireWolf sound card modem, or a port
  that's been shared out by 'share-tnc'
*/
var path=require('path');
var util=require('util');
var ax25utils=require('utils-for-aprs').ax25utils;
var SocketKISSFrameEndpoint=require('utils-for-aprs').SocketKISSFrameEndpoint;
var APRSProcessor=require('utils-for-aprs').APRSProcessor;
const fs = require('fs')

const { token } = require('./config.json')
const Discord = require('discord.js')
const client = new Discord.Client()


console.log("process.argv=" + process.argv);

if (process.argv.length != 3) {
  console.log("Usage: watch-aprs <host>:<port>");
  return;
}

var res=/([^\:]+):([0-9]+)/.exec(process.argv[2]);
if(!res) {
  console.log("Usage: watch-aprs <host>:<port>", path.basename(process.argv[1]));
}
var host=res[1];
var port=res[2];

/*
  The pipeline is sort of like this:
    Endpoint -> APRSProcessor -> Console
*/

//Create the endpoint
var endpoint=new SocketKISSFrameEndpoint();
endpoint.host=host;
endpoint.port=port;
var aprsProcessor=new APRSProcessor();

// When we get data on the aprsProcessor, show it on the console.
aprsProcessor.on('aprsData', function(frame) {
  frame.receivedAt=new Date();

  // console.log( "[" + frame.receivedAt + "]" + ax25utils.addressToString(frame.source) +
  //   '->' + ax25utils.addressToString(frame.destination) +
  //   ' (' + ax25utils.repeaterPathToString(frame.repeaterPath) + ')' +
  //   ((frame.forwardingSource!=undefined)?(
  //     " via " + ax25utils.addressToString(frame.forwardingSource) +
  //     '->' + ax25utils.addressToString(frame.forwardingDestination) +
  //     ' (' + ax25utils.repeaterPathToString(frame.forwardingRepeaterPath) + ')')
  //     : '') +
  //   frame.info);



    console.log(frame)
    // console.log("\\\\\\\\\\\\\\")
    // console.log(frame.comment)
    // if(frame.position){console.log(frame.position.coords)}
    // console.log(frame.weather)
    console.log("///////////////////////")
    

    if(frame.position){

          const kmlout = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://earth.google.com/kml/2.0">
    <Placemark>
    <name>
      ${frame.comment}
      ${frame.statusText}
    </name>
    <description>${frame.message}</description>
    <LookAt>
    <longitude>${frame.position.coords.longitude}</longitude>
    <latitude>${frame.position.coords.latitude}</latitude>
    <range>9000</range>
    <tilt>45</tilt>
    <heading>0</heading>
    </LookAt>
        <Point>
            <coordinates>${frame.position.coords.longitude},${frame.position.coords.latitude},0</coordinates>
        </Point>
    </Placemark>
  </kml>
  `


    // console.log(kmlout)
    fs.writeFile('out.kml', kmlout, {encoding:'utf8',flag:'w'}, err => {
      if(err){console.log(err)}
    
    })








    }




    // if(frame.weather) {
    //   console.log(frame.weather)
    // }

//////////////////////////////////////////////////////discord stuff here////////////
const embed = new Discord.MessageEmbed()
    .setTitle(frame.comment)
    .addFields(
      { name: 'DataType', value: frame.dataType },
      { name: 'Destination', value: frame.destination.callsign },
      { name: 'Source', value: frame.source.callsign },
      { name: 'Message(?)', value: `${frame.message} ${frame.micEmessage}` }
    )
    .setFooter(frame.info)
    // .setAuthor(frame.forwardingSource.callsign)

    // console.log(embed)
    client.channels.cache.get("998335245977931826").send(embed)
    

    if(frame.weather){
    const weatherembed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`WEATHER REPORT, ${frame.comment}`)
      .addFields(
        { name: "Wind Direction", value: frame.weather.windDirection },
        { name: "Wind Speed", value: frame.weather.windSpeed },
        { name: "Gust", value: frame.weather.gust },
        { name: "Tempurature", value: frame.weather.tempurature },
        { name: "Rain in last hour", value: frame.weather.rainLastHour },
        { name: "Rain in last 24 hours", value: frame.weather.rainLast24Hour },
        { name: "Rain since midnight", value: frame.weather.rainSinceMidnight },
        { name: "Humidity", value: frame.weather.humidity }
      )

      client.channels.cache.get("998335245977931826").send(weatherembed)
      client.channels.cache.get("998335245977931826").send("<@383320447514574848>")
    }




///////////////////////////////////////////discord stuff ends///////////////////////////////////
});
aprsProcessor.on('error', function(err, frame) {
  console.log("Got error event:" + err);
  console.log("Frame is:" + JSON.stringify(frame));
});

// The endpoint provides de-escaped KISS frames.  Pass them on to the aprsProcessor


// Log interesting events...
endpoint.on('connect', function(connection) {
  console.log("Connected to port " + endpoint.port);
  connection.on('data', function(frame) {
    aprsProcessor.data(frame);
  });
  connection.on('disconnect', function() {
    console.log('Lost connection');
  });
});

process.on('uncaughtException', (err, origin) => {
  console.log(err);
});


// Turn on the endpoint.  It will attempt to connect in a persistent fashion.
endpoint.enable();

client.login(token)