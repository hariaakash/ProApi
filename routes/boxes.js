var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var hat = require('hat');
var requestIp = require('request-ip');
var User = require('../models/users');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


// Create a Box
app.post('/create', function (req, res) {
	User.findOne({
			authKey: req.body.authKey
		})
		.then(function (user) {
			if (user) {
				var j = 0;
				for (i = 0; i < user.boxes.length; i++)
					if (user.boxes[i].boxId == req.body.boxId)
						j++;
				if (j > 0) {
					res.json({
						status: false,
						msg: 'Entered boxid already exists'
					});
				} else {
					user.boxes.push({
						boxId: req.body.boxId,
						boxName: req.body.boxName,
						logs: [{
							log: 'Box created',
							ip: requestIp.getClientIp(req)
							}]
					});
					user.dataBase.push({
						boxId: req.body.boxId,
						data: {}
					});
					user.globalStats.boxes++;
					user.logs.push({
						log: 'Box created with boxId: ' + req.body.boxId,
						ip: requestIp.getClientIp(req)
					});
					user.save();
					res.json({
						status: true,
						msg: 'Box created Successfully'
					});
				}
			} else {
				res.json({
					status: false,
					msg: 'User not found'
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

// Delete a Box
app.post('/delete', function (req, res) {
	User.findOne({
			authKey: req.body.authKey
		})
		.then(function (user) {
			if (user) {
				var box = user.boxes.filter(function (box) {
					return box.boxId == req.body.boxId
				});
				user.boxes = user.boxes.filter(function (box) {
					return box.boxId !== req.body.boxId
				});
				user.logs.push({
					log: 'Removed box with boxId: ' + req.body.boxId,
					ip: requestIp.getClientIp(req)
				});
				user.globalStats.apis = user.globalStats.apis - box[0].boxStats.apis;
				user.globalStats.boxes--;
				user.save();
				res.json({
					status: true,
					msg: 'Box deleted Successfully!!'
				});
			} else {
				res.json({
					status: false,
					msg: 'User not found'
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

// Box Details
app.get('/', function (req, res) {
	User.findOne({
			authKey: req.query.authKey
		})
		.then(function (user) {
			if (user) {
				var box = user.boxes.filter(function (box) {
					return box.boxId == req.query.boxId;
				});
				if (box) {
					box = box[0];
					res.json({
						status: true,
						uname: user.uname,
						boxName: box.boxName,
						boxId: box.boxId,
						boxStats: box.boxStats,
						apis: box.apis,
						logs: box.logs.slice(box.logs.length - 10, box.logs.length).reverse()
					});
				} else
					res.json({
						status: false,
						msg: 'No such box found!'
					});
			} else {
				res.json({
					status: false,
					msg: 'User not found'
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


module.exports = app;
