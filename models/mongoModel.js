var mongoClient = require('mongodb').MongoClient;

// When running locally, use the local database
var connection_string = 'mongodb://localhost:27017/HW15';

// If MLAB_PASSWD env variable exists, then use it in an mLab connection
if(process.env.MLAB_PASSWD){
	connection_string = "mongodb://pavan:" 
						+ process.env.MLAB_PASSWD 
						+ "@ds257495.mlab.com:57495/mlab_demo";
}

//global variable of db
var mongoDB;

//Use connect method to connect to the server
mongoClient.connect(connection_string, function(err, db){
	if(err) doError(err);
	console.log("Connected to MongoDB server at: "+connection_string);
	mongoDB = db; //make db reference global
})

// In the methods below, notice the callback
// Only function of these methods is pure CRUD operations
// Returned data/result is dealt with by callback

//Create -> mongo insert
// @param {string} collection - The collection within the database
// @param {object} data - The object to insert as a MongoDB document
// @param {function} callback - Function to call when insert completes 
exports.create = function(collection, data, callback) {
	// do async insert into collection
	mongoDB.collection(collection).insertOne(
		data, 
		function(err, status){
			if(err) doError(err);
			//use callback to pass back result of returned docs
			var success = (status.result.n == 1 ? true : false);
			callback(success);
		});
}

//Retrieve -> mongo find
// @param {object} query - the query to use to find the document
exports.retrieve = function(collection, query, callback) {
	mongoDB.collection(collection).find(query).toArray(function(err, docs){
		if(err) doError(err);
		//pass back returned documents (or empty array) to callback
		callback(docs);
	});
}

//Update -> mongo updateMany
// @param {object} filter - the MongoDB filter
// @param {object} update - The update operation to perform
exports.update = function(collection, filter, update, callback) {
	mongoDB.collection(collection)
	.updateMany(
		filter,
		update,
		{upsert: true},
		function(err, status) {
			if(err) doError(err);
			callback('Modified ' + status.modifiedCount 
				+' and added ' + status.upsertedCount+" documents");
		});
}

//Delete -> mongo remove
// @param {object} selector
exports.delete = function(collection, selector, callback) {
	mongoDB.collection(collection).remove(
		selector,
		function(err, status){
			if(err) doError(err);
			callback("Removed " + status.result.n + " documents");
		})
}

var doError = function(e) {
	console.error("ERROR: "  + e);
	throw new Error(e);
}