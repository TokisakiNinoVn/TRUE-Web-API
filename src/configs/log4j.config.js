const log4js = require("log4js");
const moment = require('moment');
const date = moment().format('DDMMYYYY');

log4js.configure({
  appenders: { app: { type: "file", filename: "logs/"+date+".log" } },
  categories: { default: { appenders: ["app"], level: "info" } },
});

module.exports = log4js;