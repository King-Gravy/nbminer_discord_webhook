# NBMINER_discord_webhook
A simple script that utilizes the built-in NBMINER api and posts data to a discord webhook.

The webhook might get rate limited if you have quite a few devices.

## For usage install [Node.js](https://nodejs.org/dist/v16.15.0/node-v16.15.0-x64.msi)
## Init the project
>npm init
## Install ms
>npm i -g ms
## Install axios
>npm i -g axios
## Install typescript
>npm i -g typescript
## Update the config.json with a text editor to add your discord ID and webhook url. If you haven't changed the miner API IP then leave the rest alone.
## Init the typescript config
>tsc --init
## Compile from ts to js
>tsc

If you have issues compiling / reading from the config file go into the tsconfig.json and remove the "//" before "resolveJsonModule": true,
## Run
>node .


![Example embeds](https://cdn.discordapp.com/attachments/760299890516426764/979146528377679942/unknown.png)
