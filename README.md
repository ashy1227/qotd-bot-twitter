Tweets a random quote defined by a JSON API thing along with an image to Twitter on a schedule. 

See [data/](data/) for examples, and see [config.json](config.json) to configure

### Allowing the bot to post to Twitter:

Create a file `account.json` in the project root and fill in the following information so the bot can post to your Twitter account:
```
{
	"appKey": <api key>,
	"appSecret": <api secret>,
	"accessToken": <access token>,
	"accessSecret": <access secret>
}
```
**Don't share this information online**. It's in .gitignore already so you can't publish it to GitHub by accident
