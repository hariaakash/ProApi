var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var morgan = require('morgan');
var request = require('request');
var bodyParser = require('body-parser');
var cors = require('cors');
var firebase = require('firebase');
var hat = require('hat');
var config = {
	apiKey: "AIzaSyCXhnpDzfvjWux6sfYdgJGvApX1haAk_XY",
	authDomain: "pro-api.firebaseapp.com",
	databaseURL: "https://pro-api.firebaseio.com",
	storageBucket: "pro-api.appspot.com",
	messagingSenderId: "277435859920"
};


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
firebase.initializeApp(config);


// Create User
app.post('/root/user/create', function (req, res) {
	var email = req.body.email;
	var pass = req.body.pass;
	var uname = req.body.uname;
	firebase.database().ref('data/users').once("value", function (snapshot) {
		if (!snapshot.hasChild(uname)) {
			firebase.auth().createUserWithEmailAndPassword(email, pass)
				.then(function (result) {
					firebase.database().ref('data/' + result.uid).child('stats').set({
						boxes: 0,
						apis: 0,
						success: 0,
						fail: 0
					});
					var user = firebase.auth().currentUser;
					console.log(user);
					user.sendEmailVerification();
					firebase.database().ref('data/' + result.uid).child('info').set({
						uname: uname,
						email: email
					});
					firebase.database().ref('users').child(uname).set(result.uid);
					res.json({
						status: true
					});
				})
				.catch(function (error) {
					var errorCode = error.code;
					if (errorCode === 'auth/email-already-in-use') {
						res.json({
							status: false,
							msg: 'Your account already exists, Sign in to continue !!'
						});
					}
				});
		} else {
			res.json({
				status: false,
				msg: 'Chosen username is taken, try any other !!'
			})
		}
	});
});

// Confirm Email
app.get('/root/user/create', function (req, res) {
	var code = req.query.code;
	firebase.auth().applyActionCode(code).then(function (result) {
		res.json({
			status: true
		})
	}).catch(function (err) {
		res.json({
			status: false,
			msg: 'Verification Code is Invalid or Expired'
		})
	});
})

// Authenticate User
app.post('/root/user/auth', function (req, res) {
	var email = req.body.email;
	var pass = req.body.pass;
	firebase.auth().signInWithEmailAndPassword(email, pass)
		.then(function () {
			var user = firebase.auth().currentUser;
			if (user.emailVerified)
				res.json({
					status: true,
					uid: user.uid
				});
			else
				res.json({
					status: false,
					msg: 'Email not verified, check your mail for more instructions !!'
				});
		})
		.catch(function (error) {
			var errorCode = error.code;
			var msg = '';
			if (errorCode === 'auth/user-not-found')
				msg = 'User not found !!';
			else if (errorCode === 'auth/wrong-password')
				msg = 'Wrong Password !!';
			res.json({
				status: false,
				msg: msg
			});
		});
});

// Request Password Reset
app.get('/root/user/pass', function (req, res) {
	var email = req.query.email;
	firebase.auth().sendPasswordResetEmail(email)
		.then(function () {
			res.json({
				status: true
			})
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: 'There is no user corresponding to the email address.'
			})
		});
});

// Reset Password
app.post('/root/user/reset', function (req, res) {
	var code = req.body.code;
	var pass = req.body.pass;
	console.log(code + '' + pass);
	firebase.auth().confirmPasswordReset(code, pass)
		.then(function () {
			res.json({
				status: true
			});
		})
		.catch(function (err) {
			res.json({
				status: false,
				msg: 'Activation Code Expired. Request reset again.'
			})
		});
});

// Get User Data
app.get('/root/user/data', function (req, res) {
	var uid = req.query.uid;
	if (uid)
		firebase.database().ref('data').child(uid).once("value", function (snapshot) {
			res.json(snapshot.val());
		});
	else
		res.json({
			status: false,
			msg: 'uid not found'
		})
});

// Create Box
app.post('/root/user/box', function (req, res) {
	var uid = req.body.uid;
	var name = req.body.name;
	var id = req.body.id;
	var count = 0;
	var success = 0;
	var fail = 0;
	firebase.database().ref('data/' + uid).child('boxes').once("value", function (snapshot) {
		if (!snapshot.hasChild(id)) {
			var data = {
				name: name,
				stats: {
					count: count,
					success: success,
					fail: fail,
					apis: 0
				}
			};
			firebase.database().ref('data/' + uid + '/stats/boxes/').once("value", function (snapshot) {
				var boxes = snapshot.val() + 1;
				firebase.database().ref('data/' + uid + '/stats/boxes/').set(boxes);
			});
			firebase.database().ref('data/' + uid + '/boxes').child(id).set(data);
			res.json({
				status: true
			});
		} else {
			res.json({
				status: false,
				msg: 'Box id entered already exists'
			});
		}
	});
});

// Delete Box
app.post('/root/user/box/delete', function (req, res) {
	var uid = req.body.uid;
	var bid = req.body.bid;
	firebase.database().ref('data/' + uid + '/stats/boxes/').once("value", function (snapshot) {
		var boxes = snapshot.val() - 1;
		firebase.database().ref('data/' + uid + '/stats/boxes/').set(boxes);
	});
	firebase.database().ref('data/' + uid + '/boxes/').child(bid).remove();
	res.json({
		status: true
	});
});

// Get Box Data
app.get('/root/user/box', function (req, res) {
	var uid = req.query.uid;
	var bid = req.query.bid;
	if (uid && bid)
		firebase.database().ref('data/' + uid + '/boxes/').child(bid).once("value", function (snapshot) {
			res.json(snapshot.val());
		});
	else
		res.json({
			status: false,
			msg: 'uid not found'
		})
});

// Create API
app.post('/root/user/box/api', function (req, res) {
	var uid = req.body.uid;
	var bid = req.body.bid;
	var type = req.body.type;
	var aid = req.body.aid;
	var name = req.body.name;
	var url = req.body.url;
	var apiKey = hat();
	var success = 0;
	var fail = 0;
	firebase.database().ref('data/' + uid + '/boxes/' + bid).child('apis').once("value", function (snapshot) {
		if (!snapshot.hasChild(aid)) {
			var data = {
				name: name,
				type: type,
				url: url,
				apiKey: apiKey,
				stats: {
					success: success,
					fail: fail
				}
			};
			firebase.database().ref('data/' + uid + '/stats/apis/').once("value", function (snapshot) {
				var apis = snapshot.val() + 1;
				firebase.database().ref('data/' + uid + '/stats/apis/').set(apis);
			});
			firebase.database().ref('data/' + uid + '/boxes/' + bid + '/stats/apis/').once("value", function (snapshot) {
				var apis = snapshot.val() + 1;
				firebase.database().ref('data/' + uid + '/boxes/' + bid + '/stats/apis/').set(apis);
			});
			firebase.database().ref('data/' + uid + '/boxes/' + bid + '/apis').child(aid).set(data);
			var log = 'API with id: ' + aid + ' Created';
			firebase.database().ref('data/' + uid + '/boxes/' + bid).child('logs').push(log);
			res.json({
				status: true
			});
		} else {
			res.json({
				status: false,
				msg: 'API id entered already exists'
			});
		}
	});
});

// Delete API
app.post('/root/user/box/api/delete', function (req, res) {
	var uid = req.body.uid;
	var bid = req.body.bid;
	var aid = req.body.aid;
	firebase.database().ref('data/' + uid + '/boxes/' + bid + '/stats/apis/').once("value", function (snapshot) {
		var apis = snapshot.val() - 1;
		firebase.database().ref('data/' + uid + '/boxes/' + bid + '/stats/apis/').set(apis);
	});
	firebase.database().ref('data/' + uid + '/boxes/' + bid + '/apis/').child(aid).remove();
	var log = 'API with id: ' + aid + ' Deleted';
	firebase.database().ref('data/' + uid + '/boxes/' + bid).child('logs').push(log);
	res.json({
		status: true
	});
});

// POST API Request Handlers
app.post('/api/:uname/:bid/:aid', function (req, res) {
	var uname = req.params.uname;
	var bid = req.params.bid;
	var aid = req.params.aid;
	var data = req.body.data;
	var req_apiKey = req.body.apiKey;
	var status = 0;
	var uid;
	firebase.database().ref('users/').child(uname).once("value", function (snapshot) {
		uid = snapshot.val();
		firebase.database().ref('data/' + uid + '/boxes/' + bid + '/apis/').child(aid).once("value", function (snap) {
			var snap = snap.val();
			var res_apiKey = snap.apiKey;
			if (uid && data && req_apiKey && res_apiKey && req_apiKey == res_apiKey) {
				if (snap.type == 'POST') {
					request({
						url: snap.url,
						method: snap.type,
						json: true,
						body: data
					}, function (error, response, body) {
						if (response.statusCode == 200) {
							res.json(response.body);
							status = 1;
							setStatus();
						} else {
							status = 0;
							setStatus();
							res.json({
								status: false,
								msg: 'Bad Response Encountered'
							})
						}
					});
				} else {
					var params = Object.keys(data).map(function (k) {
						return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
					}).join('&');
					request({
						url: snap.url,
						qs: data,
						method: snap.type
					}, function (error, response, body) {
						if (response.statusCode == 200) {
							status = 1;
							setStatus();
							res.json(response.body);
						} else {
							status = 0;
							setStatus();
							res.json({
								status: false,
								msg: 'Bad Response Encountered'
							})
						}
					});
				}
			} else {
				res.json({
					status: false,
					msg: 'Data is insufficient or wrong !!'
				});
			}
		});
	});

	function setStatus() {
		if (status == 1) {
			firebase.database().ref('data/' + uid + '/stats/success/').once("value", function (snapshot) {
				var success = snapshot.val() + 1;
				firebase.database().ref('data/' + uid + '/stats/success/').set(success);
			});
			firebase.database().ref('data/' + uid + '/boxes/' + bid + '/stats/success/').once("value", function (snapshot) {
				var success = snapshot.val() + 1;
				firebase.database().ref('data/' + uid + '/boxes/' + bid + '/stats/success/').set(success);
			});
			firebase.database().ref('data/' + uid + '/boxes/' + bid + '/apis/' + aid + '/stats/success/').once("value", function (snapshot) {
				var success = snapshot.val() + 1;
				firebase.database().ref('data/' + uid + '/boxes/' + bid + '/apis/' + aid + '/stats/success/').set(success);
			});
			console.log('Success');
		} else {
			firebase.database().ref('data/' + uid + '/stats/fail/').once("value", function (snapshot) {
				var fail = snapshot.val() + 1;
				firebase.database().ref('data/' + uid + '/stats/fail/').set(fail);
			});
			firebase.database().ref('data/' + uid + '/boxes/' + bid + '/stats/fail/').once("value", function (snapshot) {
				var fail = snapshot.val() + 1;
				firebase.database().ref('data/' + uid + '/boxes/' + bid + '/stats/fail/').set(fail);
			});
			firebase.database().ref('data/' + uid + '/boxes/' + bid + '/apis/' + aid + '/stats/fail/').once("value", function (snapshot) {
				var fail = snapshot.val() + 1;
				firebase.database().ref('data/' + uid + '/boxes/' + bid + '/apis/' + aid + '/stats/fail/').set(fail);
			});
			console.log('Fail');
		}
	}
});

app.post('/root/qq', function (req, res) {
	res.json(req.body);
});

app.get('/root/qq', function (req, res) {
	res.json(req.query);
});

app.listen(port);
console.log('Server running on port: ' + port);
