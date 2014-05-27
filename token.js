var express = require ('express');
var request = require ('request');
var qs = require ('querystring');
var open = require ('open');

var CONSUMER_KEY = 'ZztGjsGXYwwxNRNBUw';
var CONSUMER_SECRET = 'mKGJMPgQzZ75eVUmVxsA2vqmw4Xr5hCr';
var REQUEST_TOKEN_URL = 'https://bitbucket.org/api/1.0/oauth/request_token';
var AUTHENTICATE_URL = 'https://bitbucket.org/api/1.0/oauth/authenticate';
var ACCESS_TOKEN_URL = 'https://bitbucket.org/api/1.0/oauth/access_token';

module.exports = function(){

	var app = express();

	app.get('/callback', function(req, res){
		oauth.token = req.query.oauth_token;
		oauth.verifier = req.query.oauth_verifier;
		request.post({ url : ACCESS_TOKEN_URL, oauth : oauth}, function(e, r, body){
			if (e || r.statusCode != 200) {
				res.send({ error : 'something is wrong'});
				return cleanup();
			}
			res.send(qs.parse(body));
			
			// todo: close and write to ~/.huk
			console.log(qs.parse(body));
			cleanup();
		});
	});

	var server = app.listen(0);

	var oauth = {
		callback : 'http://' + server.address().address + ':' + server.address().port + '/callback',
		consumer_key : CONSUMER_KEY,
		consumer_secret : CONSUMER_SECRET 
	}

	function cleanup(){
		server.close();
		process.exit();
	}

	request.post({url : REQUEST_TOKEN_URL, oauth : oauth}, function (e, r, body) {
		var args = qs.parse(body);
		oauth.token_secret = args.oauth_token_secret;
		open(AUTHENTICATE_URL + "?oauth_token=" + args.oauth_token + "&oauth_token_secret=" + args.oauth_token_secret);
	});
}

