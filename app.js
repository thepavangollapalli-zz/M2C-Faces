var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var sessions = require("client-sessions");
var app = express();


app.use(sessions({
  cookieName: 'session', // cookie name dictates the key name added to the request object 
  secret: 'm2c_client_session', // Change to environment variable/ Now secret
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms 
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds 
}));

//Set the views directory
app.set('views', __dirname + '/views');

//define the view (templating) engine
app.set('view engine', 'ejs');

//Define how to log events
app.use(morgan('tiny'));

// parse application/x-www-form-urlencoded, with extended qs library
app.use(bodyParser.urlencoded({extended: true}));

//Load all routes in the routes directory
fs.readdirSync('./routes').forEach(function (file) {
	//There might be non-js files in the directory that should not be loaded
	if(path.extname(file) == '.js') {
		console.log("Adding routes in " + file);
		require('./routes/' + file).init(app);
	}
});

//handle static files
app.use(express.static(__dirname + '/public'));

//Catch any routes not already handled with an error message
app.use(function(req, res) {
	var message = 'Error, did not understand path ' + req.path;
	//set the status to 404 and render to the user
	res.status(404).render('error', {'message': message});
})

var httpServer = require('http').createServer(app);

httpServer.listen(50000, function(){
	console.log('Listening on port: ' + this.address().port );
})