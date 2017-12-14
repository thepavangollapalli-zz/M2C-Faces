var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var CLIENT_ID = '14723435380-0p79hr7la6gk8njof97g0o72p9dca6jk.apps.googleusercontent.com'
var client = new auth.OAuth2(CLIENT_ID, '', '');
var mongoModel = require('../models/mongoModel.js')

exports.init = function(app) {
	app.post('/signin', verifyGoogleToken)
}

function verifyGoogleToken(req, res){
	console.log(req.body);
	client.verifyIdToken(
	    Object.keys(req.body)[0],
	    CLIENT_ID,
	    // Or, if multiple clients access the backend:
	    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
	    function(e, login) {
	      if(e){
	      	console.error(e);
	      }
	      var payload = login.getPayload();
	      var userid = payload['sub'];
	      // If request specified a G Suite domain:
	      mongoModel.retrieve('users', {'userid': userid}, function(modelData){
	      	if(modelData.length){
	      		//User exists, return it to the client to set the session
	      		//use client-session, set req.session.user
	      		//In all subsequent queries, use req.session.user as part of the query
	      		//Otherwise reject - need login
	      		req.session.user = userid;
	      	}
	      	else{
	      		//User does not exist
	      		mongoModel.create('users', {'userid': userid}, function(result){
	      			let success = (result ? "Successful" : "Not successful");
	      			req.session.user = userid;
	      		})
	      	}
	      	console.log("AUTHENTICATED ", req.session.user);
	      	res.json({userid: req.session.user});
	      })
	    });
}