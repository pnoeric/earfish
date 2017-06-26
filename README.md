# Earfish

A simple translator: invite it to a channel, and it will change any messages NOT in English to English.

(Lots more feature ideas planned!)


Requires you to set up a Yandex Translation API key ahead of time, and do some work on Beep Boop.

This repository is meant as an example and starting point for building a Slack app on [Beep Boop][bb].  It's written in [node.js](), uses the [Slapp][slapp] library, and takes advantage of the [Slack Events API][slack-events-api].


## conf.json

The `conf.json` file should look like:

```
{
  "slack_token": "xxxxxxxx",
  "yandex_api_key": "xxxxxxx"
}
```

## Translation

You can translate one of two ways:

1. Type `/tron x` to translate the last _x_ messages

2. Or, just invite the bot to a channel and any messages NOT in English will be translated!

