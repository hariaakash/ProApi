var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var requestIp = require('request-ip');
var hat = require('hat');
var User = require('../models/users');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


// Authenticate User
app.post('/auth', function (req, res) {
	User.findOne({
			email: req.body.email
		})
		.then(function (user) {
			if (user && user.userPrivilege == 'admin') {
				bcrypt.compare(req.body.password, user.password, function (err, response) {
					if (response == true) {
						user.adminInfo.authKey = hat();
						user.adminInfo.logs.push({
							log: 'Logged IN to admin dashboard.',
							ip: requestIp.getClientIp(req)
						});
						user.save();
						res.json({
							status: true,
							authKey: user.adminInfo.authKey,
							msg: 'Successfully signed in !!'
						});
					} else {
						res.json({
							status: false,
							msg: 'Password Wrong'
						});
					}
				});
			} else {
				res.json({
					status: false,
					msg: 'LADADADADAH, you are not allowed'
				});
			}
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: 'Some error occurred !!'
			});
		});
});

// Sign out
app.post('/signout', function (req, res) {
	User.findOne({
			'adminInfo.authKey': req.body.authKey
		})
		.then(function (user) {
			console.log(user);
			if (user) {
				user.adminInfo.authKey = false;
				user.adminInfo.logs.push({
					log: 'Logged OFF from dashboard.',
					ip: requestIp.getClientIp(req)
				});
				user.save();
				res.json({
					status: true,
					msg: 'Successfully logged off'
				});
			} else {
				res.json({
					status: false,
					msg: 'Invalid user authKey'
				});
			}
		})
		.catch(function (err) {
			res.json({
				status: true,
				msg: 'Some error occurred !!'
			});
		});
});

// Get all details
app.get('/data', function (req, res) {
	User.findOne({
			'adminInfo.authKey': req.query.authKey
		})
		.then(function (user) {
			if (user) {
				User.find({})
					.then(function (users) {
						var data = {};
						data.users = [];
						data.admins = [];
						data.globalStats = {};
						data.globalStats.boxes = 0;
						data.globalStats.apis = 0;
						data.globalStats.hits = 0;
						data.globalStats.success = 0;
						for (i = 0; i < users.length; i++) {
							if (users[i].userPrivilege == 'admin')
								data.admins.push({
									uname: users[i].uname,
									email: users[i].email,
									globalStats: users[i].globalStats
								});
							else
								data.users.push({
									uname: users[i].uname,
									email: users[i].email,
									globalStats: users[i].globalStats,
									verified: users[i].verified
								});
							data.globalStats.boxes += users[i].globalStats.boxes;
							data.globalStats.apis += users[i].globalStats.apis;
							data.globalStats.hits += users[i].globalStats.hits;
							data.globalStats.success += users[i].globalStats.success;
						}
						res.json({
							status: true,
							uname: user.uname,
							data: data
						});
					});
			} else {
				res.json({
					status: false,
					msg: 'Session Expired!'
				});
			}
		})
		.catch(function (err) {
			res.json({
				status: true,
				msg: 'Some error occurred !!'
			});
		});
});


module.exports = app;
