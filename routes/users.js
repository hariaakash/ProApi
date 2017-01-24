var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var uuidV4 = require('uuid/v4');
var hat = require('hat');
var requestIp = require('request-ip');
var helper = require('sendgrid').mail;
var sg = require('sendgrid')('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');
var User = require('../models/users');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


// Create User
app.post('/create', function (req, res) {
	bcrypt.hash(req.body.password, 10, function (err, hash) {
		var user = new User();
		user.email = req.body.email;
		user.password = hash;
		user.uname = req.body.uname;
		user.country = req.body.country;
		user.timezone = req.body.timezone;
		user.verified = hat();
		user.save()
			.then(function (user) {
				res.json({
					status: true,
					msg: 'Successfully Registered, Verify Email by checking your inbox to continue....'
				});
				var from = new helper.Email('support@proapi.co');
				var to = new helper.Email(user.email);
				var subject = 'Welcome To ProApi ! Confirm Your Email';
				var body = new helper.Content('text/html', user.verified);
				var mail = new helper.Mail(from, subject, to, body);
				mail.personalizations[0].addSubstitution(new helper.Substitution('-name-', req.body.uname));
				mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', req.body.email));
				mail.setTemplateId('2e52ac61-aa62-4b0e-a37f-6e1de2625fe0');
				var request = sg.emptyRequest({
					method: 'POST',
					path: '/v3/mail/send',
					body: mail.toJSON(),
				});
				sg.API(request);
			})
			.catch(function (err) {
				console.log(err);
				res.json({
					status: false,
					msg: 'Chosen username / email is already registered !!'
				});
			});
	});
});

// Authenticate User
app.post('/auth', function (req, res) {
	User.findOne({
			email: req.body.email
		})
		.then(function (user) {
			if (user) {
				bcrypt.compare(req.body.password, user.password, function (err, response) {
					if (response == true) {
						if (user.verified == 'true') {
							user.authKey = hat();
							user.logs.push({
								log: 'Logged IN to dashboard.',
								ip: requestIp.getClientIp(req)
							});
							user.save();
							res.json({
								status: true,
								authKey: user.authKey,
								msg: 'Successfully signed in !!'
							});
						} else {
							res.json({
								status: false,
								msg: 'Verify your email address !!'
							});
						}
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
					msg: 'User not found'
				})
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
			authKey: req.body.authKey
		})
		.then(function (user) {
			if (user) {
				user.authKey = false;
				user.logs.push({
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

// Resend Activation Request
app.get('/resendActivation', function (req, res) {
	User.findOne({
			email: req.query.email
		})
		.then(function (user) {
			if (user) {
				if (user.verified != 'true') {
					user.verified = hat();
					user.logs.push({
						log: 'Email Activation Request send.',
						ip: requestIp.getClientIp(req)
					});
					user.save()
						.then(function (user) {
							res.json({
								status: true,
								msg: 'Email activation link send to email !!'
							});
							var from = new helper.Email('support@proapi.co');
							var to = new helper.Email(req.query.email);
							var subject = 'Welcome To ProApi ! Confirm Your Email';
							var body = new helper.Content('text/html', user.verified);
							var mail = new helper.Mail(from, subject, to, body);
							mail.personalizations[0].addSubstitution(new helper.Substitution('-name-', user.uname));
							mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', req.query.email));
							mail.setTemplateId('2e52ac61-aa62-4b0e-a37f-6e1de2625fe0');
							var request = sg.emptyRequest({
								method: 'POST',
								path: '/v3/mail/send',
								body: mail.toJSON(),
							});
							sg.API(request);
						});
				} else {
					res.json({
						status: true,
						msg: 'Account is already activated, Sign in to continue !!'
					});
				}
			} else {
				res.json({
					status: true,
					msg: 'Email activation link send to email, if user exists !!'
				});
			}
		})
		.catch(function (user) {
			res.json({
				status: false,
				msg: 'Some error occurred !!'
			});
		});
});

// Activate Email
app.post('/verifyEmail', function (req, res) {
	User.findOne({
			email: req.body.email
		})
		.then(function (user) {
			if (user) {
				if (user.verified == req.body.code) {
					user.verified = true;
					user.logs.push({
						log: 'Account activated by Email.',
						ip: requestIp.getClientIp(req)
					});
					user.save();
					var from = new helper.Email('support@proapi.co');
					var to = new helper.Email(user.email);
					var subject = 'Your ProApi account has been provisioned!';
					var body = new helper.Content('text/html', 'You can now start using ProApi.');
					var mail = new helper.Mail(from, subject, to, body);
					mail.setTemplateId('088edec6-18c1-4ae0-91ff-0b0ff5467948');
					var request = sg.emptyRequest({
						method: 'POST',
						path: '/v3/mail/send',
						body: mail.toJSON(),
					});
					sg.API(request);
					res.json({
						status: true,
						msg: 'Email Successfully Verified !!'
					})
				} else {
					res.json({
						status: false,
						msg: 'Invalid verification code or code expired !!'
					});
				}
			} else {
				res.json({
					status: true,
					msg: 'Invalid Request'
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

// Reset Password Request
app.get('/password/request', function (req, res) {
	User.findOne({
			email: req.query.email
		})
		.then(function (user) {
			if (user) {
				user.passwordReset = hat();
				user.logs.push({
					log: 'Password reset link send.',
					ip: requestIp.getClientIp(req)
				});
				user.save()
					.then(function (user) {
						res.json({
							status: true,
							msg: 'Password reset link send to email !!'
						});
						var from = new helper.Email('support@proapi.co');
						var to = new helper.Email(req.query.email);
						var subject = 'Reset your Password for ProApi Account';
						var body = new helper.Content('text/html', user.passwordReset);
						var mail = new helper.Mail(from, subject, to, body);
						mail.personalizations[0].addSubstitution(new helper.Substitution('-uname-', user.uname));
						mail.personalizations[0].addSubstitution(new helper.Substitution('-email-', req.query.email));
						mail.setTemplateId('15e8b347-d4a5-47f4-baf6-ca3f1ba49730');
						var request = sg.emptyRequest({
							method: 'POST',
							path: '/v3/mail/send',
							body: mail.toJSON(),
						});
						sg.API(request);
					});
			} else {
				res.json({
					status: true,
					msg: 'Password reset link send to email, if user exists !!'
				});
			}
		})
		.catch(function (user) {
			res.json({
				status: false,
				msg: 'Some error occurred !!'
			});
		});
});

// Verify Password Reset
app.post('/password/verify', function (req, res) {
	User.findOne({
			passwordReset: req.body.code
		})
		.then(function (user) {
			if (user) {
				bcrypt.hash(req.body.password, 10, function (err, hash) {
					user.passwordReset = false;
					user.password = hash;
					user.logs.push({
						log: 'Password Reset Successfull.',
						ip: requestIp.getClientIp(req)
					});
					user.save()
						.then(function (user) {
							res.json({
								status: true,
								msg: 'Password reset successfull !!'
							});
							var from = new helper.Email('support@proapi.co');
							var to = new helper.Email(user.email);
							var subject = 'Your ProApi account has a change!';
							var body = new helper.Content('text/html', 'Your password has been reset successfully.');
							var mail = new helper.Mail(from, subject, to, body);
							mail.setTemplateId('088edec6-18c1-4ae0-91ff-0b0ff5467948');
							var request = sg.emptyRequest({
								method: 'POST',
								path: '/v3/mail/send',
								body: mail.toJSON(),
							});
							sg.API(request);
						});
				});
			} else {
				res.json({
					status: false,
					msg: 'Reset code expired / invalid code !!'
				})
			}
		})
		.catch(function (err) {
			res.json({
				status: true,
				msg: 'Some error occurred !!'
			});
		});
});

// Get User Details
app.get('/data', function (req, res) {
	User.findOne({
			authKey: req.query.authKey
		})
		.then(function (user) {
			if (user) {
				var boxes = [];
				for (i = 0; i < user.boxes.length; i++)
					boxes.push({
						boxId: user.boxes[i].boxId,
						boxName: user.boxes[i].boxName
					});
				res.json({
					status: true,
					info: {
						uname: user.uname,
						email: user.email,
						country: user.country,
						timezone: user.timezone,
						logs: user.logs.slice(user.logs.length - 10, user.logs.length).reverse()
					},
					globalStats: user.globalStats,
					boxes: boxes
				});
			} else {
				res.json({
					status: false,
					msg: 'Session Expired!'
				});
			}
		})
		.catch(function (err) {
			console.log(err);
			res.json({
				status: true,
				msg: 'Some error occurred !!'
			});
		});
});

// Get logs
app.get('/logs', function (req, res) {
	User.findOne({
			authKey: req.query.authKey
		})
		.then(function (user) {
			if (user) {
				var logs = [];
				for (i = user.logs.length - 1; i >= 0; i--) {
					logs.push({
						no: i,
						log: user.logs[i].log,
						ip: user.logs[i].ip,
						date: user.logs[i].date
					});
				}
				res.json({
					status: true,
					logs: logs
				});
			} else {
				res.json({
					status: false,
					msg: 'Session Expired!'
				})
			}
		})
		.catch(function (err) {
			console.log(err);
			res.json({
				status: true,
				msg: 'Some error occurred !!'
			});
		});
});


module.exports = app;
