# Qbserve to Exist.io Sync

This is a local JavaScript script to upload your daily Qbserve data

## Tools Required

* [Qbserve](https://qotoqot.com/qbserve/)
* [Exist.io](https://exist.io/?referred_by=adamfortuna)

## Setup

Clone/download this repository and install dependencies.

```
npm install
```

Next, create a `.env` file with one line:

```
EXIST_ACCESS_TOKEN=YOUR_TOKEN_HERE
```

Getting your `EXIST_ACCESS_TOKEN` is a little tricky. You'll need to [create a new app on Exist](https://exist.io/account/apps/). This is an app that only you will use.

Allow this app to write "Productive time", "Distracting time" and "Neutral time".

From there you'll need to [create an access token](http://developer.exist.io/#authorisation-flow). This is a tricky process that requires a server since you'll need an oAuth handshake to make it work. I'm aiming to make this more simple but this works for now.

### Qbserve Setup

In Qbserve, go to Advanced, and create a bunch of JSON exports for past days with the following settings:

* JSON
* Totals by Activity
* Today, yesterday, etc
* Save them in the `./reports` directory of this project

Run the index.js file once that's all done. It should send all data to exist!

```
node index.js
```

### Exist Setup

Once that's all done, you'll want to head to your [Exist Attributes](https://exist.io/account/attributes/) and set "Productive time", "Distracting time" and "Neutral time" to use your newly created app for those attributes.

After that, you should start seeing your Qbserve data in Exist!

## Todo

This requires manually exports of your data to work. The next steps are to automate this. This could be done by using Qbserve to automatically export reports, then have either a watcher or a cron job to pickup those new files and upload them to Exist.
