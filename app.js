'use strict';

// Module Dependencies
const axios 			= require('axios');
var express     		= require('express');
var bodyParser  		= require('body-parser');
var errorhandler 		= require('errorhandler');
var http        		= require('http');
var path        		= require('path');
var request     		= require('request');
var routes      		= require('./routes');
var activity    		= require('./routes/activity');
var urlencodedparser 	= bodyParser.urlencoded({extended:false});
var app 				= express();
var local       		= true;

// access Heroku variables
var marketingCloud = {
  authUrl: process.env.authUrl,
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  restUrl: process.env.restUrl,
  promotionsListDataExtension: process.env.promotionsListDataExtension,
  offerTypesListDataExtension: process.env.offerTypesListDataExtension,
  insertDataExtension: process.env.insertDataExtension
};

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.methodOverride());
//app.use(express.favicon());
app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
	app.use(errorhandler());
}

// fetch rows from promotion metadata data extension
// ensure communication cell code is unique
app.get("/dataextension/lookup/offer_types", (req, res, next) => {
	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    const getUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.offerTypesListDataExtension + "/rowset?$filter=Uses%20eq%20'1'";
	    console.dir(getUrl);
	    axios.get(getUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        //console.dir(response.data);
	        res.json(response.data);
	    }).catch((error) => {
	        console.dir('error is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});
});

//Fetch rows from promotions data extension
app.get("/dataextension/lookup/promotions", (req, res, next) => {
	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
			"grant_type": "client_credentials",
			"client_id": marketingCloud.clientId,
			"client_secret": marketingCloud.clientSecret
		}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    const getUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.promotionsListDataExtension + "/rowset?$filter=globalCampaignID%20eq%20'GC'";
	    console.dir(getUrl);
	    axios.get(getUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        //console.dir(response.data);
	        res.json(response.data);
	    }).catch((error) => {
	        console.dir('error is ' + error);
	    });		

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});
});


// insert data into data extension
app.post('/dataextension/add', urlencodedparser, function (req, res){ 

	console.dir("here");
	
	console.log(req.body);

	var row = [
	    {
	        "keys": {
	            "mc_unique_promotion_id": req.body.mc_unique_promotion_id
	        },
	        "values": {
	        	"communication_cell_code": req.body.communication_cell_code,
	        	"cell_code": req.body.cell_code,
	        	"cell_name": req.body.cell_name,
	            "campaign_name": req.body.campaign_name,
	            "campaign_id": req.body.campaign_id,
	            "offer_type": req.body.offer_type,
	            "print_at_till": req.body.print_at_till,
	            "instant_win": req.body.instant_win,
	            "offer_channel": req.body.offer_channel,
	            "offer_medium": req.body.offer_medium,
	            "promotion_id": req.body.promotion_id,
	            "promotion_group_id": req.body.promotion_group_id
	        }
	    }
	];
	console.log(row);
   	console.log('req received');
   	res.redirect('/');

   	axios({
		method: 'post',
		url: marketingCloud.authUrl,
		data:{
		"grant_type": "client_credentials",
		"client_id": marketingCloud.clientId,
		"client_secret": marketingCloud.clientSecret
	}
	})
	.then(function (response) {
		//console.dir(response.data.access_token);
		const oauth_access_token = response.data.access_token;
		//return response.data.access_token;
		console.dir(oauth_access_token);
		const authToken = 'Bearer '.concat(oauth_access_token);
	    const postUrl = marketingCloud.restUrl + "hub/v1/dataevents/key:" + marketingCloud.insertDataExtension + "/rowset";
	    console.dir(postUrl);
	   	
	   	axios({
			method: 'post',
			url: postUrl,
			headers: {'Authorization': authToken},
			data: row
		})
		.then(function (response) {
			console.dir(response.data);
		})
		.catch(function (error) {
			console.dir(error);
			return error;
		});	

	})
	.catch(function (error) {
		console.dir(error);
		return error;
	});

});

// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );

// listening port
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
