var express = require('express');
var app = express();

app.use(express.static('public/docs'));

module.exports = app;