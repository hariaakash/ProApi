var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var hat = require('hat');


var apiSchema = new Schema({
	_id: {
		type: String,
		default: hat()
	},
	apiId: {
		type: String,
		unique: true
	},
	apiUrl: {
		type: String,
		unique: true
	},
	apiType: String,
	apiName: {
		type: String,
		unique: true
	},
	apiKey: {
		type: String,
		default: hat()
	},
	apiStats: {
		hits: {
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
		success: Boolean,
		date: {
			type: Date,
			default: Date.now
		}
	}]
});


module.exports = apiSchema;
