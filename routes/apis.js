var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var requestIp = require('request-ip');
var User = require('../models/users');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.post('/create', function (req, res) {
	User.findOne({
			authKey: req.body.authKey
		})
		.then(function (user) {
			if (user) {
				for (i = 0; i < user.boxes.length; i++) {
					if (user.boxes[i].boxId == req.body.boxId)
						break;
				}
				var q = 0;
				for (j = 0; j < user.boxes[i].apis.length; j++) {
					if (user.boxes[i].apis[j].apiId == req.body.apiId)
						res.json({
							status: false,
							msg: 'Entered api ID already exists, choose unique'
						});
					else
						q++;
				}
				if (q == user.boxes[i].apis.length) {
					user.boxes[i].apis.push({
						apiId: req.body.apiId,
						apiName: req.body.apiName,
						apiUrl: req.body.apiUrl,
						apiType: req.body.apiType
					});
					user.logs.push({
						log: 'API created with ID: ' + req.body.apiId + ' for box with Id: ' + req.body.boxId,
						ip: requestIp.getClientIp(req)
					});
					user.boxes[i].logs.push({
						log: 'API created with ID: ' + req.body.apiId,
						ip: requestIp.getClientIp(req)
					});
					user.boxes[i].boxStats.apis++;
					user.globalStats.apis++;
					user.save();
					res.json({
						status: true
					});
				} else {
					res.json({
						status: false,
						msg: 'boxId not found'
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
			console.log(err);
			res.json({
				status: false,
				msg: 'Some error occurred !!'
			});
		});
});

// Delete Api
app.post('/delete', function (req, res) {
	User.findOne({
			authKey: req.body.authKey
		})
		.then(function (user) {
			if (user) {
				for (i = 0; i < user.boxes.length; i++) {
					if (user.boxes[i].boxId == req.body.boxId)
						break;
				}
				user.boxes[i].apis = user.boxes[i].apis.filter(function (api) {
					return api.apiId !== req.body.apiId
				});
				user.boxes[i].logs.push({
					log: 'API removed with ID: ' + req.body.apiId,
					ip: requestIp.getClientIp(req)
				});
				user.logs.push({
					log: 'API removed with ID: ' + req.body.apiId + ' for box with ID: ' + req.body.boxId,
					ip: requestIp.getClientIp(req)
				});
				user.boxes[i].boxStats.apis--;
				user.globalStats.apis--;
				user.save();
				res.json({
					status: true,
					msg: 'Api deleted Successfully!!'
				});
			} else {
				res.json({
					status: false,
					msg: 'User not found'
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


module.exports = app;
