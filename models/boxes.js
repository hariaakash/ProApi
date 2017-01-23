var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var apiSchema = require('./apis');
var hat = require('hat');


var boxSchema = new Schema({
	_id: {
		type: String,
		default: hat()
	},
	boxId: {
		type: String,
		unique: true
	},
	boxName: {
		type: String
	},
	boxStats: {
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
	logs: [{
		log: String,
		ip: String,
		date: {
			type: Date,
			default: Date.now
		}
	}],
	apis: [apiSchema]
});


module.exports = boxSchema;