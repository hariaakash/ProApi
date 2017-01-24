var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var apiSchema = new Schema({
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
		type: String
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