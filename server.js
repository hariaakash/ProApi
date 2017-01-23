var port = 3000 | process.env.PORT;
var express = require('express');
var app = express();
var morgan = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var users = require('./routes/users');
var boxes = require('./routes/boxes');
var apis = require('./routes/apis');
var admin = require('./admin/user');
var api = require('./api');
var dataBase = require('./dataBase/dataBase');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));
app.use('/user', users);
app.use('/box', boxes);
app.use('/apis', apis);
app.use('/api', api);
app.use('/data', dataBase);
app.use('/admin', admin);
app.use(function (req, res, next) {
	res.status(404).redirect('https://proapi.co/dashboard/#!/error');
});


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/proapi')
	.then(function () {
		console.log('Connected to MONGOD !!');
	}).catch(function (err) {
		console.log('Failed to establish connection with MONGOD !!');
		console.log(err.message);
	});


app.get('/get', function (req, res) {
	res.json(req.query);
});

app.post('/post', function (req, res) {
	res.json(req.body);
});


app.listen(port);
console.log('Server running on port: ' + port);
