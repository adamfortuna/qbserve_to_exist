# Qbserve to Exist.io Sync

This is a local JavaScript script to upload your daily Qbserve data. This script will synchronize all Qbserve data straight to Exist.

## Tools Required

* [Qbserve](https://qotoqot.com/qbserve/)
* [Exist.io](https://exist.io/?referred_by=adamfortuna)

## Setup

Clone/download this repository and install dependencies.

```
npm install
```

Next, create a `.env` file with these lines:

```
EXIST_ACCESS_TOKEN=YOUR_TOKEN_HERE
QBSERVE_DATABASE_URL=/Users/USERNAME/Library/Application Support/Qbserve/UserDatabase.sqlite
EXIST_START_DATE=2020-10-01
```

### EXIST_ACCESS_TOKEN

Getting your `EXIST_ACCESS_TOKEN` is a little tricky. You'll need to [create a new app on Exist](https://exist.io/account/apps/). This is an app that only you will use. Allow this app to write "Productive time", "Distracting time" and "Neutral time".

From there you'll need to [create an access token](http://developer.exist.io/#authorisation-flow). This is a tricky process that requires a server since you'll need an oAuth handshake to make it work. I'm aiming to make this more simple but this works for now.

The `EXIST_START_DATE` is the date to begin synchronizing data from.

### Qbserve Setup

Change the `QBSERVE_DATABASE_URL` to point to your Qbserve database. You can find the default path in your Qbserve settings. You can change this to use your backup if you want, or go straight to the source and query the live database. This script will connect to this database in read only mode, so it won't be altered.

```
node index.js
```

### Exist Setup

Once that's all done, you'll want to head to your [Exist Attributes](https://exist.io/account/attributes/) and set "Productive time", "Distracting time" and "Neutral time" to use your newly created app for those attributes.

After that, you should start seeing your Qbserve data in Exist!

## Schedule

You can either run this script manually, or create a cron job to run on a schedule. Here's what mine looks like:

```
15 * * * * /Users/adam/.nvm/versions/node/v11.10.1/bin/node /Users/adam/code/personal/exist/qbserve/index.js
```

That will update Exist every 15 minutes with your Qbserve stats.

## Constributions

This is still a work in progress. Use at your own risk!
