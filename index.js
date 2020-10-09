require('dotenv').config()
const fs = require('fs'),
      axios = require('axios'),
      moment = require('moment'),
      EXIST_ACCESS_TOKEN = process.env.EXIST_ACCESS_TOKEN
var reportsPath = "./reports"
var dates = {}, date, data = []

fs.readdir(reportsPath, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  files.forEach(function (fileName, index) {
    let report = require(`./${reportsPath}/${fileName}`)
    date = moment(fileName, 'YYYY-MM-DD').format('YYYY-MM-DD')

    // Default the data
    dates[date] = data[date] || {
      distracting_min: 0,
      neutral_min: 0,
      productive_min: 0
    }

    // Increase the counts
    dates[date].productive_min += parseInt(report.totals.productive_duration / 60)
    dates[date].distracting_min += parseInt(report.totals.distracting_duration / 60)
    dates[date].neutral_min += parseInt(report.totals.neutral_duration / 60)
  });

  for(var day in dates) {
    data.push({
      date: day,
      name: "productive_min",
      value: dates[day].productive_min
    })
    data.push({
      date: day,
      name: "distracting_min",
      value: dates[day].distracting_min
    })
    data.push({
      date: day,
      name: "neutral_min",
      value: dates[day].neutral_min
    })
  }

  // Acquire attributes
  var attributes = [
    { name: "distracting_min", active: true },
    { name: "neutral_min", active: true },
    { name: "productive_min", active: true }
  ]

  axios.defaults.headers.common['Authorization'] = `Bearer ${EXIST_ACCESS_TOKEN}`;
  axios.post('https://exist.io/api/1/attributes/acquire/', attributes).then((res) => {
    console.log('Acquired')

    var currentData = [], currentRequest;
    for(var i=0; i<data.length; i+=35) {
      currentData = data.slice(i, 35)

      console.log('Updating', i, i+35)
      currentRequest = data.slice(i, i+35)
      console.log('currentRequest', currentRequest)
      axios.post('https://exist.io/api/1/attributes/update/', currentRequest).then((response) => {
        console.log('Updated')
      }).catch(function (error) {
        // handle error
        console.log('updated error', error);
      })
    }
  }).catch(function (error) {
    // handle error
    console.log('acquire error', error);
  })
});
