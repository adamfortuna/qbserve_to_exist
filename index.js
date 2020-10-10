require('dotenv').config()
const sqlite3 = require('sqlite3').verbose(),
      axios = require('axios'),
      moment = require('moment')
const DATABASE_URL = process.env.QBSERVE_DATABASE_URL,
      EXIST_ACCESS_TOKEN = process.env.EXIST_ACCESS_TOKEN,
      START_DATE = moment(process.env.EXIST_START_DATE).startOf('day').format('X')

axios.defaults.headers.common['Authorization'] = `Bearer ${EXIST_ACCESS_TOKEN}`;

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: DATABASE_URL
  }
});


let HISTORY_TABLES = `SELECT table_name FROM HistoryTablesIndex ORDER BY start_date`

let categories = {
  '-1': 'distracting_min',
  '0': 'neutral_min',
  '1': 'productive_min',
}

function parseTableNames(historyRow) {
  console.log('parseTableNames')
  return historyRow.map((row) => row.table_name)
}

function lookupActitiesByHistoryTable(historyTables) {
  console.log('lookupActitiesByHistoryTable')
  return Promise.all(historyTables.map(tableName => {
    let sql = `
      SELECT
        start_time,
        date(start_time,'unixepoch', 'localtime') as date,
        sum(duration) as duration,
        c.productivity as productivity
      FROM ${tableName} log
      INNER JOIN Activities a ON log.activity_id = a._id
      INNER JOIN Categories c ON a.category_id = c._id
      GROUP BY date(start_time,'unixepoch', 'localtime'), c.productivity
      ORDER BY date(start_time,'unixepoch', 'localtime')
    `
    return knex.raw(sql)
  }))
}

function flattenActivities(activities) {
  console.log('flattenActivities')
  return activities.flat()
}

function filterActivitiesByDate(activities) {
  console.log('filterActivitiesByDate')

  return activities.filter((activity) => {
    return activity.start_time >= START_DATE
  })
}

function convertActivitiesToExist(activities) {
  console.log('convertActivitiesToExist')
  return activities.map((activity) => {
    return {
      date: activity.date,
      name: categories[activity.productivity],
      value: parseInt(activity.duration / 60)
    }
  })
}

function acquireExistFields(activities) {
  console.log('acquireExistFields')

  return new Promise((resolve, reject) => {
    var attributes = [
      { name: "distracting_min", active: true },
      { name: "neutral_min", active: true },
      { name: "productive_min", active: true }
    ]
    axios.post('https://exist.io/api/1/attributes/acquire/', attributes)
         .then(() => resolve(activities))
         .catch((error) => reject(error))
  })
}

function sendActivitiesToExist(activities) {
  console.log('sendActivitiesToExist', activities)
  var currentRequest, promises = [], promise
  for(var i=0; i<activities.length; i+=35) {
    currentRequest = activities.slice(i, i+35)
    promise = new Promise((resolve, reject) => {
      axios.post('https://exist.io/api/1/attributes/update/', currentRequest)
           .then(() => resolve())
           .catch((error) => reject(error))
    })

    promises.push(promise)
  }

  return Promise.all(promises)
}

var data = [], sql
knex.raw(HISTORY_TABLES)
  .then(parseTableNames)
  // .then((tables) => { console.log('tables', tables); return tables; })
  .then(lookupActitiesByHistoryTable)
  .then(flattenActivities)
  .then(filterActivitiesByDate)
  .then(convertActivitiesToExist)
  .then(acquireExistFields)
  .then(sendActivitiesToExist)
  .catch((e) => console.log("Error:", e))
  .finally(() => knex.destroy())
