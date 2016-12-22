var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http');
var morgan = require('morgan');
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
firebase.initializeApp(config);


app.get('/', function (req, res) {
	res.json('Hola');
	console.log(hat());
});

// Create User
app.post('/api/user/create', function (req, res) {
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

// Authenticate User
app.post('/api/user/auth', function (req, res) {
	var email = req.body.email;
	var pass = req.body.pass;
	firebase.auth().signInWithEmailAndPassword(email, pass)
		.then(function () {
			var user = firebase.auth().currentUser;
			res.json({
				status: true,
				uid: user.uid
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
app.get('/api/user/pass', function (req, res) {
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
app.post('/api/user/reset', function (req, res) {
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
app.get('/api/user/data', function (req, res) {
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
app.post('/api/user/box', function (req, res) {
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

// Get Box Data
app.get('/api/user/box', function (req, res) {
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
app.post('/api/user/box/api', function (req, res) {
	var uid = req.body.uid;
	var bid = req.body.bid;
	var type = req.body.type;
	var aid = req.body.aid;
	var name = req.body.name;
	var apiKey = hat();
	console.log(apiKey);
	var success = 0;
	var fail = 0;
	firebase.database().ref('data/' + uid + '/boxes/' + bid).child('apis').once("value", function (snapshot) {
		if (!snapshot.hasChild(aid)) {
			var data = {
				name: name,
				type: type,
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


app.listen(port);
console.log('Server running on port: ' + port);
