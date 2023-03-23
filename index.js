const { Client, GatewayIntentBits } = require('discord.js');
const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv/config');
prefix = "!";
chatIdDis = null;
chatIdTel = null;

// Bot Telegram
const bot = new Telegraf(process.env.TEL_TOKEN, { polling: true });

// Client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Activar el bot de discord i telegram
client.login(process.env.DIS_TOKEN);
bot.launch();

/* --------------- DISCORD --------------- */

// Resposta al inicialitzar el bot de discord
client.on('ready', () => {
    console.log('Undertale en marxa!');
});

// Escultem els missatges de discord i els enviem a telegram
/* client.on('messageCreate', message => {

    if (!message.content) {
        return;
    } else {
        bot.telegram.sendMessage(process.env.ChatTelID, message.content);
    }

}); */

client.on('messageCreate', (msg) => {

    missatge = msg.content;
    console.log(missatge, "fjaeohf");

    if (missatge.startsWith(prefix + "guardar")) {
        msg.reply('Introdueix la ID del canal de Discord on vols enviar els missatges:');

        client.on('messageCreate', (msg) => {
            if (missatge.content == (/^\d+$/)) {
                missatge = msg.content;

                // Si encara no s'ha guardat cap ID de canal de 
                if (chatIdTel === null) {

                    // Guarda la ID del canal de Telegram que Introdueixi
                    chatIdTel = msg.content;
                    msg.reply('ID del canal guardada correctament.');
                } else {
                    console.log('Ja tens un canal guardat. Si vols canviar-lo, utilitza "!guardar"');
                }
            }
        });
    }
});

/* --------------- TELEGRAM --------------- */

bot.start((msg) => {
    msg.reply('Benvingut a Undertale!');
});

bot.command('help', (msg) => {
    // Comandes disponibles.
    msg.reply('/guardar (Introducir la ID del canal)');
    msg.reply('/enviar (Enviar un mensaje al canal designat amb /guardar)');
});

bot.command('guardar', (msg) => {
    msg.reply('Introdueix la ID del canal de Discord on vols enviar els missatges:');

    // Només escoltara els missatges que siguin números enters.
    bot.hears(/^\d+$/, (msg) => {

        // Si encara no s'ha guardat cap ID de canal de 
        if (chatIdDis === null) {

            // Guarda la ID del canal de Telegram que Introdueixi
            chatIdDis = msg.message.text;
            msg.reply('ID del canal guardada correctament.');
        } else {
            console.log('Ja tens un canal guardat. Si vols canviar-lo, utilitza /guardar');
        }
    });
});

bot.command('enviar', (msg) => {

    console.log(chatIdDis, "segon");
    if (chatIdDis) {

        msg.reply('Escriu el missatge que vols enviar a Discord');

        bot.on('message', (msg) => {

            // Guardem el missatge de Telegram
            const messageText = msg.message.text;

            if (msg.message.text) {

                msg.reply('Missatge enviat a Discord');

                // Enviem el missatge a Discord
                client.channels.cache.get(chatIdDis).send(messageText)
                    .then((response) => {
                        console.log('Missatge enviat a Discord:', messageText);
                    })
                    .catch((error) => {
                        console.error('Error al enviar el missatge a Discord:', error);
                    });
            } else {
                msg.reply('El missatge de Telegram esta buit');
            };
        });
    } else {
        msg.reply('No has introduit cap ID de canal de Discord. Per fer-ho, utilitza /guardar');
    };
});