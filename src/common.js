const CronJob = require("cron").CronJob;
const recursive = require("fs-readdir-recursive");

const path = require("path");
const fs = require("fs");

var config;

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
	if(typeof quote.quote === "string") {
		quote.quote = [quote.quote];
	}
	quote.imagePool = parseImagePool(quote.imagePool);
	return quote;
}
/**
 * @returns random quote inside config.quoteDir
 */
function randomQuote() {
	var files = recursive("", (name, index, dir) => { // list of all filepaths inside the quote dir
		return name[0] !== '.' && (fs.lstatSync(path.join(dir, name)).isDirectory() || path.extname(name) === ".json");
	}, [], config.quoteDir);
	return getQuote(files[Math.floor(Math.random()*files.length)]); // random quote object
}

/**
 * Start CronJob for posting
 */
function start(post) {
	config = getJSON("config.json");

	const postJob = new CronJob(config.schedule, () => {
		post();
	});
	postJob.start();
}

module.exports.config = config;

module.exports.getJSON = getJSON;
// not exactly necessary
// module.exports.parseImagePool = parseImagePool;
module.exports.getQuote = getQuote;
module.exports.randomQuote = randomQuote;
module.exports.start = start;