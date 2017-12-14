const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-2';

// include model for the application
var mongoModel = require('../models/mongoModel.js')

// define controller routes
exports.init = function(app) {
	app.get('/', index); // home page
	app.get('/upload', upload); //upload page

	app.get('/sign-s3', generateSignature) //generates temporary S3 signature to sign image upload

	app.put('/real_face', createFace); //put user in db
	app.get('/real_face', retrieveFace); //get user from db
	app.post('/real_face', updateFace); //update a specific user in db
	app.delete('/real_face', deleteFace); //delete a user from the db
}

index = function(req, res) {
	if(req.session.user) {
		res.render('home', {title: 'Faces', authenticated: true, user: req.session.user});
	}
	else {
		res.render('home', {title: 'Faces', authenticated: false});
	}
}

upload = function(req, res) {
	if(req.session.user) {
		res.render('upload', {title: 'Faces', authenticated: true, user: req.session.user});
	}
	else {
		res.render('upload', {title: 'Faces', authenticated: false});
	}
}

generateSignature = function(req,res){
	let s3 = new aws.S3();
	let fileName = req.query.fileName;
	let fileType = req.query.fileType;
	const s3Params = {
		Bucket: S3_BUCKET,
		Key: fileName,
		Expires: 60,
		ContentType: fileType,
		ACL: 'public-read'
	};
	//gets a secure URL that can be PUT to in order to securely upload the pictures
	s3.getSignedUrl('putObject', s3Params, (err, data) => {
		if(err){
			console.log(err);
			return res.end();
		}
		let returnData = {
			signedRequest: data,
			url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
		}
		//returns secure URL and future location of file to the client
		res.status(200).json(returnData);
	});
}

createFace = function(req, res) {
	//check if req.body has data in it
	if(Object.keys(req.body).length == 0){
		res.render('message', {title: 'HW15', obj: "No create message body found"});
	}
	mongoModel.create( 'real_face', req.body, function(result){
		var success = (result ? "Create successful" : "Create unsuccessful");
		res.json({obj: success});
	});
}

retrieveFace = function(req, res){
		req.query.user_set = req.session.user;
		mongoModel.retrieve('real_face', req.query,
			function(modelData){
				if(modelData.length) {
					// console.log(modelData)
					modelData = shuffle(modelData);
					if(req.session.user){
						res.render('real_face', {title: 'Faces', obj: modelData, authenticated: true, user: req.session.user});
					} else {
						res.render('real_face', {title: 'Faces', obj: modelData, authenticated: false})
					}
				} else {
					var message = "No documents with " + JSON.stringify(req.query) + " in collection " + req.params.collection + " found."
					if(req.session.user){
						res.redirect('/upload')//, {title: 'Faces', obj:message, authenticated: true, user: req.session.user})
					} else {
						res.redirect('/upload')//, {title: 'Faces', authenticated: false})
					}
				}
			});
}

updateFace = function(req, res){
	//if no filter, then select all docs
	var filter = req.body.find ? JSON.parse(req.body.find) : {};
	//if no update, then return an error page
	if(!req.body.update) {
		res.render('message', {title: 'HW15', obj: "No update operation defined"})
		return;
	}
	var update = JSON.parse(req.body.update);
	mongoModel.update( 'real_face', filter, update, 
		function(status) {
			//called once the update is successful
			res.render('message', {title: 'HW15', obj: status})
		})
}

deleteFace = function(req, res){
	let reqbody = {};
	reqbody.user_set = req.session.user;
	console.log(reqbody);
	//Delete image from s3
	mongoModel.retrieve('real_face', reqbody,
		function(modelData){
			console.log(modelData);
			if(modelData.length && modelData[0].image_url) {
				for(let i = 0; i < modelData.length; i++)
				{
					//Gets file name of image from url
					let fileName = modelData[i].image_url.split("/").slice(-1)[0];
					let s3 = new aws.S3();
					let params = {
						Bucket: S3_BUCKET,
						Delete:{
							Objects: [
								{
									Key: fileName
								}
							]
						}
					}
					s3.deleteObjects(params, function(err, data){
						if(err){
							console.error(err);
							throw new Error(e);
						}
						else{
							console.log(data);
						}
					})
				}
			} else {
				console.log("Already deleted!");
			}
		});
	//delete from database
	mongoModel.delete('real_face', reqbody, function(status){
		res.json({obj: status});
	})
}


function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
	}

	return array;
}

/*
 * How to test:
 *  - Create a test web page
 *  - Use REST Console for Chrome
 *    (If you use this option, be sure to set the Body Content Headers Content-Type to:
 *    application/x-www-form-urlencoded . Else body-parser won't work correctly.)
 *  - Use CURL (see tests below)
 *    curl comes standard on linux and MacOS.  For windows, download it from:
 *    http://curl.haxx.se/download.html
 *
 * Tests via CURL for Create and Update (Retrieve can be done from browser)

* test CREATE success by adding 3 fruits
curl -i -X PUT -d "first_name=pavan&last_name=gollapalli" http://localhost:50000/user
curl -i -X PUT -d "first_name=pavan&last_name=gollapalli" https://hw15-cdofcuiows.now.sh/user

* test CREATE missing what to put
curl -i -X PUT  http://localhost:50000/fruit
* test UPDATE success - modify
curl -i -X POST -d 'find={"first_name":"pavan"}&update={"$set":{"last_name":"test"}}' http://localhost:50000/user
curl -i -X POST -d 'find={"first_name":"pavan"}&update={"$set":{"last_name":"test"}}' https://hw15-cdofcuiows.now.sh/user
* test UPDATE success - insert
curl -i -X POST -d 'find={"name":"plum"}&amp;update={"$set":{"color":"purple"}}' http://localhost:50000/fruit
* test UPDATE missing filter, so apply to all
curl -i -X POST -d 'update={"$set":{"edible":"true"}}' http://localhost:50000/fruit
* test UPDATE missing update operation
curl -i -X POST -d 'find={"name":"pear"}' http://localhost:50000/fruit



curl -i -X DELETE -d 'selector={"first_name":"Pavan"}' http://localhost:50000/real_face
curl -i -X DELETE -d 'selector={"first_name":"Pavan"}' https://hw15-cdofcuiows.now.sh/user
 */