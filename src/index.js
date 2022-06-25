const TwitterApi = require("twitter-api-v2").TwitterApi;
const CronJob = require('cron').CronJob;
const recursive = require("fs-readdir-recursive");

const path = require("path");
const fs = require("fs");

var config, account;
var client, rwClient;

function getJSON(file) {
	try {
		return JSON.parse(fs.readFileSync(file));
	} catch(e) {
		console.error(`Unable to load JSON file at ${file}`);
		console.error(e);
	}
}
/**
 * Get all the images in imagePool or any JSON arrays it contains
 * @param imagePool a path to an image (relative to config.imageDir), a path to a JSON array of paths to images (relative to config.imagePoolDir), or an array of either of these
 * @returns a list of all the images in imagePool or any JSON arrays it contains
 */
function parseImagePool(imagePool) {
	if(typeof imagePool === "string") {
		if(path.extname(imagePool) === ".json") { // Load image pool from JSON
			return parseImagePool(getJSON(path.join(config.imagePoolDir, imagePool)));
		} else { // Load image
			if(fs.existsSync(path.join(config.imageDir, imagePool))) {
				return [path.join(config.imageDir, imagePool)];
			} else {
				console.warn(`Image ${imagePool} not found`);
				return [];
			}
		}
	} else if(Array.isArray(imagePool)) {
		let ret = [];

		for(let i in imagePool) {
			ret = ret.concat(parseImagePool(imagePool[i]));
		}
		return ret;
	} else {
		console.warn(`Image pools should only contain paths to images and other image pools, not ${typeof imagePool} lol`);
		return [];
	}
}
/**
 * Get a quote object from JSON
 * @param file path to a quote
 * @returns the quote object
 */
function getQuote(file) {
	var quote = getJSON(file);
	quote.imagePool = parseImagePool(quote.imagePool);
	return quote;
}
/**
 * @returns random quote inside config.quoteDir
 */
function randomQuote() {
	var files = recursive("", (name, index, dir) => { // list of all filepaths inside the quote dir
		return fs.lstatSync(path.join(dir, name)).isDirectory() || path.extname(name) === ".json";
	}, [], config.quoteDir);
	return getQuote(files[Math.floor(Math.random()*files.length)]); // random quote object
}
/**
 * Post a quote from the bot
 */
async function tweetQuote(quote) {
	try {
		const mediaIds = await Promise.all([
			rwClient.v1.uploadMedia(quote.imagePool[Math.floor(Math.random() * quote.imagePool.length)]) // Upload random image
		]);
		await rwClient.v2.tweet({
			text: quote.quote,
			media: {
				media_ids: mediaIds
			}
		});
	} catch(e) {
		console.error(e);
	}
}

function init() {
	config = getJSON("config.json");
	account = getJSON("account.json");
	
	client = new TwitterApi(account);
	rwClient = client.readWrite;
}
init();

const postJob = new CronJob(config.schedule, () => {
	tweetQuote(randomQuote());
});
postJob.start();