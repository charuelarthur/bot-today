require('dotenv').config();
const { Client, Intents } = require('discord.js');
const fs = require("fs");
const csv = require('csv-parser');
const cron = require('node-cron');
const axios = require('axios');
const express = require('express');
const app = express();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const worldleURL = 'https://worldle.teuteuf.fr/';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    cron.schedule('35 16 * * *', () => {
        readDay();
        readSaintsOfTheDay();
    });
});

client.login(process.env.TOKEN);

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});

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
            sendMessageDay(internatialDay);
        });
}

function readSaintsOfTheDay() {
    const date = new Date();

    axios.get('https://nominis.cef.fr/json/nominis.php?jour=15&mois=11&annee=2022', {
        params: {
            jour: date.getDate(),
            mois: date.getMonth()+1,
            annee: date.getFullYear()
        }
    })
        .then(response => {
            const saintsOfTheDay = [];
            const majeur = response.data.response.prenoms.majeur;
            for (const key in majeur) {
                saintsOfTheDay.push(key);
            }
            sendMessageSaints(saintsOfTheDay);
        })
        .catch(error => {
            console.log(error);
        });
}

function sendMessageDay(internationalDay) {
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);

    if (internationalDay.length > 0) {
        channel.send("<@&"+process.env.ROLE_ID+"> Voici les journées internationales d'aujourd'hui : ").catch(e => console.log(e));
        internationalDay.forEach(element => {
            channel.send(element.type+ " "+ element.url).catch(e => console.log(e));
        });
    } else {
        channel.send("Aucun événement international n'est prévu aujourd'hui.").catch(e => console.log(e));
    }

    channel.send("Devine le pays du jour " + worldleURL).catch(e => console.log(e));
}

function sendMessageSaints(saintsOfTheDay) {
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);
    let message = "";
    if (saintsOfTheDay.length > 0) {
        message = "Bonne fête à ";
        saintsOfTheDay.forEach(element => {
            if(element === saintsOfTheDay[saintsOfTheDay.length-1]) {
                message += element + " !";
            } else if (element === saintsOfTheDay[saintsOfTheDay.length-2]) {
                message += element + " et ";
            } else {
                message += element + ", ";
            }
        });
        channel.send(message).catch(e => console.log(e));
    }
}








