# NOTAM-alerter

A simple tool for sending alerts about new opening hours and runway closures based on NOTAMs for given airports.

Built with Wrangler and TypeScript, running on Cloudflare Workers and using Mailchannels.

Supports both email and Slack, configured via JSON stored under `recipients` in the bound KV.

## Configuration guide

To set up your own copy simply clone this repository, change the variables, create a KV with a valid `recipients` entry, add your sender email and DKIM private key as secrets, and deploy.

You can read about how to configure the correct SPF and DKIM for Mailchannel in the [Cloudflare Docs](https://developers.cloudflare.com/pages/platform/functions/plugins/mailchannels/).

Everything can run perfectly fine on the free tier.

### Example recipients

```
[{
  "key": "some-slack",
  "name": "Some Slack",
  "url": "https://hooks.slack.com/services/ID/ID/key",
  "type": "Slack"
},
{
  "key": "pilot@example.com",
  "name": "Pilot User",
  "email": "pilot@example.com",
  "type": "Mail"
}]
```
