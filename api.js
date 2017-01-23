var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var requestIp = require('request-ip');
var mongoose = require('mongoose');
var User = require('./models/users');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.post('/:uname/:boxId/:apiId', function (req, res) {
	User.findOne({
			uname: req.params.uname
		})
		.then(function (user) {
			if (user) {
				var box = user.boxes.filter(function (box) {
					return box.boxId == req.params.boxId;
				});
				if (box[0]) {
					var api = box[0].apis.filter(function (api) {
						return api.apiId == req.params.apiId
					});
					api = api[0];
					if (api && api.apiKey == req.headers.apikey) {
						if (api.apiType == 'POST') {
							request({
								url: api.apiUrl,
								method: api.apiType,
								json: true,
								body: req.body
							}, function (error, response, body) {
								if (response.statusCode == 200) {
									res.json(body);
									setStatus(1);
								} else {
									setStatus(2);
								}
							});
						} else {
							request({
								url: api.apiUrl,
								method: api.apiType,
								qs: req.body
							}, function (error, response, body) {
								if (response.statusCode == 200) {
									res.json(response.body);
									setStatus(1);
								} else {
									setStatus(2);
								}
							});
						}
					} else
						setStatus(0);
				} else
					setStatus(0);
			} else
				setStatus(0);

			function setStatus(status) {
				if (status == 0) {
					res.json({
						status: false,
						msg: 'Invalid request'
					});
				} else if (status == 1) {
					user.globalStats.hits++;
					user.globalStats.success++;
					for (i = 0; i < user.boxes.length; i++)
						if (user.boxes[i].boxId == req.params.boxId)
							break;
					for (j = 0; j < user.boxes[i].apis.length; j++)
						if (user.boxes[i].apis[j].apiId == req.params.apiId)
							break;
					user.boxes[i].boxStats.hits++;
					user.boxes[i].boxStats.success++;
					user.boxes[i].apis[j].apiStats.hits++;
					user.boxes[i].apis[j].apiStats.success++;
					user.boxes[i].apis[j].logs.push({
						log: 'Request made from',
						ip: requestIp.getClientIp(req),
						success: true
					});
					user.save();
				} else if (status == 2) {
					user.globalStats.hits++;
					user.globalStats.fails++;
					for (i = 0; i < user.boxes.length; i++)
						if (user.boxes[i].boxId == req.params.boxId)
							break;
					for (j = 0; j < user.boxes[i].apis.length; j++)
						if (user.boxes[i].apis[j].apiId == req.params.apiId)
							break;
					user.boxes[i].boxStats.hits++;
					user.boxes[i].boxStats.fails++;
					user.boxes[i].apis[j].apiStats.hits++;
					user.boxes[i].apis[j].apiStats.fails++;
					user.boxes[i].apis[j].logs.push({
						log: 'Request made from',
						ip: requestIp.getClientIp(req),
						success: false
					});
					user.save();
					res.json({
						status: false,
						msg: 'Bad Response Encountered'
					});
				}
			}
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: 'Some error occurred !!'
			});
		});
});

app.post('/data/:uname/:boxId', function (req, res) {
	User.findOne({
			uname: req.params.uname
		})
		.then(function (user) {
			if (user) {
				user.dataBase.push({
					'req.params.boxId': req.body
				});
				user.save();
				res.json({
					status: true,
					msg: 'Inserted successfully!'
				});
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

app.put('/data/:uname/:boxId', function (req, res) {
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

app.get('/data/:uname/:boxId', function (req, res) {
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
