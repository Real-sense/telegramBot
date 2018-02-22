const TelegramBot = require('node-telegram-bot-api');
const CONFIG = require('./config.js');

const bot = new TelegramBot(CONFIG.token, CONFIG.options);

bot.onText(/\/start/, msg => {
	const text = `Hello, ${msg.from.first_name}\nWhat do you want?`;
	bot.sendMessage(msg.chat.id, text);

});