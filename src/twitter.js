const common = require("./common.js");

const TwitterApi = require("twitter-api-v2").TwitterApi;

var account;
var client, rwClient;

async function post() {
	const quote = common.randomQuote();
	
	try {
		const mediaIds = await Promise.all([
			rwClient.v1.uploadMedia(quote.imagePool[Math.floor(Math.random() * quote.imagePool.length)]) // Upload random image
		]);
		await rwClient.v2.tweetThread([{
			text: quote.quote.shift(),
			media: {
				media_ids: mediaIds
			}
		}].concat(quote.quote));
	} catch (e) {
		console.error(e);
	}
}

function init() {
	account = common.getJSON("account.json");

	client = new TwitterApi(account);
	rwClient = client.readWrite;

	common.start(post);
}
init();