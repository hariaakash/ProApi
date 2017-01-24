var mongoose = require('mongoose');
var boxSchema = require('./boxes');
var Schema = mongoose.Schema;


var userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		required: true
	},
	uname: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	boxes: [boxSchema],
	globalStats: {
		boxes: {
			type: Number,
			default: 0
		},
		hits: {
			type: Number,
			default: 0
		},
		apis: {
			type: Number,
			default: 0
		},
		success: {
			type: Number,
			default: 0
		},
		fails: {
			type: Number,
			default: 0
		}
	},
	passwordReset: String,
	authKey: String,
	verified: {
		type: String,
		default: false
	},
	country: String,
	timezone: String,
	logs: [{
		log: String,
		ip: String,
		date: {
			type: Date,
			default: Date.now
		}
	}],
	userPrivilege: {
		type: String,
		default: 'user'
	},
	adminInfo: {
		authKey: String,
		logs: [{
			log: String,
			ip: String,
			date: {
				type: Date,
				default: Date.now
			}
		}]
	},
	dataBase: [{
		boxId: String,
		data: Schema.Types.Mixed
	}]
});


module.exports = mongoose.model('User', userSchema);
