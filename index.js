const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const fs = require('fs');
const _ = require('lodash');
const CONFIG = require('./config.js');

const bot = new TelegramBot(CONFIG.token, CONFIG.options);

const KB = {
	currency: 'Курс валюты',
	picture: 'Картинка',
	girl: 'Девушка',
	car: 'Авто',
	back: 'Назад'
};

const PicPath = {
	[KB.girl] : [
		'girl1.jpg',
		'girl2.jpg',
		'girl3.jpg'
	],
	[KB.car] : [
		'car1.jpg',
		'car2.jpg',
		'car3.jpg'
	]
};

bot.onText(/\/start/, msg => {

	sendGreeting(msg);

});

bot.on('message', msg => {

	switch (msg.text) {
		case KB.picture:
			sendPictureScreen(msg.chat.id);
			break;
		case KB.currency:
			sendCurrencyScreen(msg.chat.id);
			break;
		case KB.back:
			sendGreeting(msg, false);
			break;
		case KB.car:
		case KB.girl:
			sendPictureByName(msg.chat.id, msg.text);
			break;
	}

});

bot.on('callback_query', query => {
	const base = query.data;
	const symbol = 'RUB';

	bot.answerCallbackQuery({
		callback_query_id: query.id,
		text: `Вы выбрали валюту ${base}`
	});

	request(`https://api.fixer.io/latest?symbols=${symbol}&base=${base}`, (err, res, body) => {

		if (err) throw new Error (err);

		if (res.statusCode == 200) {
			const currencyData = JSON.parse(body);
			const html = `<strong>1 ${base}</strong> - <em>${currencyData.rates[symbol]} ${symbol}</em>`

			bot.sendMessage(query.message.chat.id, html, {
				parse_mode: 'HTML'
			});
		}
	});

});

function sendCurrencyScreen (chatID) {
	bot.sendMessage(chatID, `Выберите тип валюты: `, {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: 'Доллар',
						callback_data: 'USD'
					}
				],
				[
					{
						text: 'Евро',
						callback_data: 'EUR'
					}
				],
			]
		}
	})
};

function sendPictureByName (chatID, picName) {
	const paths = PicPath[picName];
	const path = paths[_.random(0, paths.length - 1)];

	bot.sendMessage(chatID, `Loading...`);
	fs.readFile(`${__dirname}/images/${path}`, (err, picture) => {
		if (err) throw new Error (err);

		bot.sendPhoto(chatID, picture).then( () => {
			bot.sendMessage(chatID, `Done!`);			
		});
	});

}

function sendPictureScreen (chatID) {
	bot.sendMessage( chatID, `Выберите тип картинки: `, {
		reply_markup: {
			keyboard: [
				[KB.girl, KB.car],
				[KB.back]
			]
		}
	});
}

function sendGreeting (msg, sayHello=true) {

	const text = sayHello 
		? `Hello, ${msg.from.first_name}\nWhat do you want?`
		: `What do you want?`;

	bot.sendMessage(msg.chat.id, text, {
		reply_markup: {
			keyboard: [
				[KB.currency, KB.picture],
			]
		}
	});
}