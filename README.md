# Modifications:
This script will now write point data to a KML file each time there is a new point recieved. This KML file is meant to be put in google earth so that it updates in real time with the latest point from APRS.


I previously have done this same thing in a much worse way, using old, outdated, closed-source software that only ran on windows. This is my new way of doing things. This software is designed to be used with GQRX and Direwolf, for RX of APRS packets using an RTL-SDR V3 dongle. Please let me know if you have any questions, just submit an issue in this repository and I will be happy to help you. 

# watch-aprs

Monitor and decode APRS packets arriving on a KISS-over-TCP device.

This is a command-line utility that decodes APRS packets and prints them
out to the console in more-or-less human-readable form.  It's useful with
ports that have been made available by the share-tnc utility, or with ports
that directly implement KISS-over-TCP, like the Direwolf sound card interface.

# Hardware/Software Environment

watch-aprs uses 'node.js'.  It has been tested most
heavily on a Raspberry Pi running Raspbian Jessie, but has been casually tested on
Windows 10, Linux Mint and MacOS Sierra, and appears to work fine.  Please file a
report if you experience difficulties.

# Installation

Install libasound2-dev if you are on Linux using your package manager, something similar to:

    sudo apt install libasound2-dev

Then, use NPM or a different node package manager to install the program's required modules:

    npm install
    


You must make a copy of config.json.example and rename it to config.json, then put in your discord bot token.



# Usage

## Setting up GQRX and Direwolf

- Install GQRX and Direwolf on your computer.
- Start GQRX and tune in to your local APRS frequency.
- Press the "UDP" button in the Audio section of GQRX
- Start Direwolf with the command:
  
        direwolf -r 48000 udp:7355
- start the script with the command:

        node ./watch-aprs.js localhost:8001


## Command Line - Monitoring the On-Air APRS Traffic

    node watch-aprs.js <host>:<port>

    e.g.

    node watch-aprs.js raspberrypi:8001

'watch-aprs' isn't specific to the 'share-tnc' package.  It will work with any
KISS-over-TCP server (e.g. DireWolf).

# Contributing  

To contribute, please fork https://github.com/trasukg/watch-aprs and then submit
pull requests, or open an issue.

See also https://github.com/trasukg/utils-for-aprs for the underlying components
used in this utility.

# License

This software is licensed under the Apache Software License 2.0

The phrase APRS is a registered trademark of Bob Bruninga WB4APR.

# Release Notes

1.0.1 - December 21, 2017 - First release.  Previously was a part of the
share-tnc package.  Releasing separately allows installation of watch-aprs
without the serialport package.  
1.0.2 - December 8, 2019 - Update to latest utils-for-aprs.  
