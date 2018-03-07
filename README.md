# Earfish
#### a Slack bot created by Eric Mueller

A simple translator: invite it to a Slack channel, and it will change any messages NOT in English to English.

(Lots more feature ideas planned!)


Requires you to set up a Yandex Translation API key ahead of time, and do some work on Beep Boop.


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

