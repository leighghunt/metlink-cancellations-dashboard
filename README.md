Calls the [Metlink API](https://opendata.metlink.org.nz) to get updates to services.
Then displays cancellations in the last 24 hours on this [dashboard](https://how-many-metlink-cancellations-today.glitch.me)

You can see the alerts also being displayed at [www.metlink.org.nz/alerts/bus](https://www.metlink.org.nz/alerts/bus)

To tinker with this project, remix it, and set the `metlink_api_key` environment variable to your own API [key](https://opendata.metlink.org.nz/dashboard) (free registration necessary).

FOUND A BUG?

- Please log it [here](https://github.com/leighghunt/metlink-cancellations-dashboard/issues/new)

TO DO:

- Determine what percentage of route's services cancelled
- Highlight new cancellations for a few seconds
- Sound notification of cancellations?

DONE:

- Allow filtering by service, ~~or type of service (train/bus)~~
- STORE data in DB, and return in addition to data being returned by API
- UPSERT data into database to record reversed cancellations
- EMIT cancellations using sockets to update clients without needing to refresh
- Display graph of hourly cancellations over last 24 hours - or perhaps current day?
- Correct ever increasing counter from emits that doesn't reflect data dropping off the 24 hour window
- Do filtering of what constitutes a cancellation on client side
  - This should help handle cancellations being reversed
- Prevent emitting of updates causing duplicates in graph
- Add sequence to allow clients to detect missed emit and reload
- Display dashboard of number of cancellations today, and last 5 or 7 days.


## Backup to another instance:

```sqlite3 .data/database.sqlite .dump > database.dump; git commit -am'Latest db backup'; git push```


## Backup from another instance:

```git pull; rm .data/database.sqlite; sqlite3 .data/database.sqlite  < database.dump; refresh```

# Welcome to Glitch

Click `Show` in the header to see your app live. Updates to your code will instantly deploy and update live.

**Glitch** is the friendly community where you'll build the app of your dreams. Glitch lets you instantly create, remix, edit, and host an app, bot or site, and you can invite collaborators or helpers to simultaneously edit code with you.

Find out more [about Glitch](https://glitch.com/about).

## Your Project

On the front-end,

- edit `public/client.js`, `public/style.css` and `views/index.html`
- drag in `assets`, like images or music, to add them to your project

On the back-end,

- your app starts at `server.js`
- add frameworks and packages in `package.json`
- safely store app secrets in `.env` (nobody can see this but you and people you invite)

## Made by [Glitch](https://glitch.com/)

\ ゜ o ゜)ノ
