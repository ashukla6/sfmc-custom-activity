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
var local       		= false;

// access Heroku variables
if ( !local ) {
	var marketingCloud = {
	  authUrl: process.env.authUrl,
	  clientId: process.env.clientId,
	  clientSecret: process.env.clientSecret,
	  restUrl: process.env.restUrl,
	  promotionsListDataExtension: process.env.promotionsListDataExtension,
	  controlGroupsDataExtension: process.env.controlGroupsDataExtension,
	  voucherPotsDataExtension: process.env.voucherPotsDataExtension,
	  insertDataExtension: process.env.insertDataExtension
	};
	console.dir(marketingCloud);
}

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

//Fetch rows from control group data extension
app.get("/dataextension/lookup/controlgroups", (req, res, next) => {
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
	    const controlGroupsUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.controlGroupsDataExtension + "/rowset";
	    console.dir(controlGroupsUrl);
	    axios.get(controlGroupsUrl, { headers: { Authorization: authToken } }).then(response => {
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

//Fetch rows from voucher data extension
app.get("/dataextension/lookup/voucherpots", (req, res, next) => {
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
	    const voucherPotsUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + marketingCloud.voucherPotsExtension + "/rowset";
	    console.dir(voucherPotsUrl);
	    axios.get(voucherPotsUrl, { headers: { Authorization: authToken } }).then(response => {
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

//Fetch email templates
app.get("/dataextension/lookup/templates", (req, res, next) => {

	var templatePayload = {
		    "page":
		    {
		        "page":1,
		        "pageSize":1000
		    },

		    "query":
		    {
		        "leftOperand":
		        {
		            "property":"name",
		            "simpleOperator":"contains",
		            "value":"BAU"
		        },
		        "logicalOperator":"AND",
		        "rightOperand":
		        {
		            "property":"assetType.name",
		            "simpleOperator":"equal",
		            "value":"templatebasedemail"
		        }
		    },

		    "sort":
		    [
		        { "property":"id", "direction":"ASC" }
		    ],

		    "fields":
		    [
		        "name"
		    ]
		};

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
	    const postTemplateUrl = marketingCloud.restUrl + "asset/v1/content/assets/query";
	    console.dir(postTemplateUrl);

	   	axios({
			method: 'post',
			url: postTemplateUrl,
			headers: {'Authorization': authToken},
			data: templatePayload
		})
		.then(function (response) {
			console.dir(response.data);
			res.json(response.data);
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


//lookup voucher pot DE
app.post("/dataextension/lookup/voucherpots", urlencodedparser, function (req, res){ 
	
	console.dir(req.body);

	var externalKey = req.body.voucher_pot;

	console.dir(row);
   	console.dir('req received');
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
	    const voucherUrl = marketingCloud.restUrl + "data/v1/customobjectdata/key/" + externalKey + "/rowset?$filter=IsClaimer%20eq%20'False'";
	    console.dir(voucherUrl);
	    axios.get(voucherUrl, { headers: { Authorization: authToken } }).then(response => {
	        // If request is good...
	        console.dir(response.data);
	        console.dir(response.data.length);
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
	
	console.dir(req.body);

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
	            "campaign_code": req.body.campaign_code,
	            "voucher_pot": req.body.voucher_pot,
	            "code": req.body.code,
	            "print_at_till": req.body.print_at_till,
	            "instant_win": req.body.instant_win,
	            "offer_channel": req.body.offer_channel,
	            "offer_medium": req.body.offer_medium,
	            "promotion_id": req.body.promotion_id,
	            "promotion_group_id": req.body.promotion_group_id,
	            "promotion_type": req.body.promotion_type
	        }
	    }
	];
	console.dir(row);
   	console.dir('req received');
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
app.post('/journeybuilder/stop/', activity.stop );
app.post('/journeybuilder/unpublish/', activity.unpublish );

// listening port
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
