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

    // Mostrem que esta en marxa
    console.log('Undertale en marxa!');
});

// Escultem els missatges de discord i els enviem a telegram

client.on('messageCreate', (msg) => {
    try {
        missatge = msg.content;

        if (missatge.startsWith(prefix + "help")) {
            msg.reply
                ('- guardar (Introducir la ID del grup) ...//web.telegram.org/z/#[grupID] \n - enviar (Enviar un mensaje al canal designat con /guardar)');
        }
    } catch (error) {
        console.error(error);
    }
});

client.on('messageCreate', (msg) => {
    try {
        missatge = msg.content;

        if (missatge.startsWith(prefix + "guardar")) {
            // La commanda !guardar activa la variable esperantCanal.

            esperantCanal = true;
            msg.reply('Introdueix la ID del canal de Discord on vols enviar els missatges:');

        } else if (esperantCanal === true && missatge.match(/^(-)?\d+$/)) {
            /** 
             * Només escoltara els missatges que siguin:
             * - Números enters.
             * - I si avans ha introduit el !guardar. Aquest el qual activa la variable esperantCanal.
             */

            chatIdTel = missatge;
            // Guarda la ID del canal de Telegram que Introdueixi
            msg.reply('ID del canal guardada correctament.');

        } else if (chatIdTel && missatge.startsWith(prefix + "enviar")) {
            // Si ja s'ha guardat un canal de Telegram i escriu !enviar, activa la variable enviarMissatge.

            enviarMissatge = true;

        } else if (enviarMissatge === true) {
            // Si avans ha introduit el !enviar, activa la variable enviarMissatge.

            bot.telegram.sendMessage(chatIdTel, missatge);
            // Enviaem el missatge a Telegram

        } else {
            msg.reply("Thas deixat alguna passa per fer, no?");
        }

    } catch (error) {
        console.error(error);
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
    try {
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
    } catch (error) {
        console.error(error);
    }
});

bot.command('enviar', (msg) => {
    try {
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
    } catch (error) {
        console.error(error);
    }
});