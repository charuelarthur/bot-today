require('dotenv').config();
const { Client, Intents } = require('discord.js');
const fs = require("fs");
const csv = require('csv-parser');
const cron = require('node-cron');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    cron.schedule('1 0 * * *', () => {
        readDay();
    });
});

client.login(process.env.TOKEN);

function readDay() {
    const internatialDay = [];
    const date = new Date();
    const day = date.toLocaleString('fr-FR', { day: 'numeric', month: 'long' });

    fs.createReadStream('journee-mondiale.csv')
        .pipe(csv())
        .on('data', (row) => {
            if(row.date === day) {
                internatialDay.push(row);
            }
        })
        .on('end', () => {
            console.log('CSV file successfully processed at '+ new Date());
            sendMessage(internatialDay);
        });
}

function sendMessage(internationalDay) {
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);

    if (internationalDay.length > 0) {
        channel.send("<@&"+process.env.ROLE_ID+"> Voici les journées internationales d'aujourd'hui : ").catch(e => console.log(e));
        internationalDay.forEach(element => {
            channel.send(element.type+ " "+ element.url).catch(e => console.log(e));
        });
    } else {
        channel.send("Aucun événement international n'est prévu aujourd'hui.").catch(e => console.log(e));
    }
}







