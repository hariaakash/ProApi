var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var hat = require('hat');
var rack = hat.rack();


var apiSchema = new Schema({
	_id: {
		type: String,
		default: rack()
	},
	apiId: {
		type: String,
		unique: true,
		sparse: true
	},
	apiUrl: {
		type: String,
		unique: true,
		sparse: true
	},
	apiType: String,
	apiName: {
		type: String,
		unique: true,
		sparse: true
	},
	apiKey: {
		type: String,
		default: rack()
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
