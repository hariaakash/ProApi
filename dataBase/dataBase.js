var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var extend = require('extend');
var mongoose = require('mongoose');
var User = require('../models/users');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.post('/:uname/:boxId', function (req, res) {
	User.findOne({
			uname: req.params.uname
		})
		.then(function (user) {
			if (user) {
				var flag = 0;
				for (i = 0; i < user.dataBase.length; i++) {
					if (user.dataBase[i].boxId == req.params.boxId)
						break;
					else
						flag++;
				}
				if (flag != user.dataBase.length) {
					extend(req.body, user.dataBase[i].data);
					user.dataBase[i].data = req.body;
					user.save();
					res.json({
						status: true,
						msg: 'Inserted successfully!'
					});
				} else {
					res.json({
						status: false,
						msg: 'Database not Found'
					});
				}
			} else {
				res.json({
					status: false,
					msg: 'Bad request !!'
				});
			}
		})
		.catch(function (err) {
			console.log(err);
			res.json({
				status: false,
				msg: 'Some error occurred !!'
			});
		});
});

app.get('/:uname/:boxId', function (req, res) {
	User.findOne({
			uname: req.params.uname
		})
		.then(function (user) {
			var db = user.dataBase.filter(function (db) {
				return db.boxId == req.params.boxId;
			});
			res.json(db);
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: 'Some error occurred !!'
			});
		});
	var x = {
		fname: 'Hari',
		lname: 'Nar'
	};
	x.fullname = function () {
		console.log(x.fname + ' ' + x.lname);
	};
	x.fullname();
});

app.put('/:uname/:boxId', function (req, res) {
	User.findOne({
			uname: req.params.uname
		})
		.then(function (user) {
			res.json(user.data);
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: 'Some error occurred !!'
			});
		});
});


module.exports = app;
