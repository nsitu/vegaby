const dotenv = require('dotenv').config()

const ADDRESS = process.env.ADDRESS || ''  		/* for example, https://vegaby.herokuapp.com */
const GOOGLE_KEY = process.env.GOOGLE_KEY || ''		/* API key for use with Google Maps */
const YELP_KEY = process.env.YELP_KEY || ''		/* API key for use with YELP FUsion API */
const ROOT_URL = process.env.ROOT_URL || ''  		/* Optional e.g. "/vegaby" -- use this to deploy inside a subfolder. */
const PORT = process.env.PORT || 5000			/* Optional PORT number */

const express = require ('express');		// express framework 
const fetch = require('node-fetch'); 		// library for making requests
const cors = require('cors');			// Cross Origin Resource Sharing
const bodyParser = require('body-parser')	// middleware to parse JSON data that is sent from the frontend.

const app = express(); // enable express
app.use( cors() ); // make express attach CORS headers to responses
app.use( express.json() ); // add json capabilities to our express aptestingp

/* Serve up static assets, i.e. the Frontend of the site. */
app.use(ROOT_URL+'/', express.static('public'))  

/* The frontend may request the Google API Key via this endpoint. */
app.get(ROOT_URL+'/apikey', (req,res) => {
  /* We will not share our API Key outside of our own domain. */
  if (req.headers['referer'] == ADDRESS ){
    res.send({ "Status":"OK", "GOOGLE_KEY":GOOGLE_KEY })
  }
  else{
    res.send({ "Status": "Error", 
	      "Message": "Google API Key is Not Authorized. The domain "+ req.headers['referer']+" is not recognized. Expected domain is " + ADDRESS
	      "Headers" : req.headers
	       })
  }
})

/* the frontend sends a POST request.
 This reuquest includes a BODY that contains lat/lng coordinates as JSON.
 here in the bakcend we use bodyParser middleware to parse the JSON   */
app.post(ROOT_URL+'/restaurants', bodyParser.json(), (req, res) => {
  let yelp = 'https://api.yelp.com/v3/businesses/search?term=vegan'
  let lat = req.body.lat; 
  let lng = req.body.lng;
  let url = yelp+'&latitude='+lat+'&longitude='+lng;
  let options = {
	"headers": {
	   "Authorization": "Bearer "+ YELP_KEY
	}
  }
  /* See also, the YELP Fusion API Authentication Guide :
  https://www.yelp.com/developers/documentation/v3/authentication */
  fetch(url, options)
    .then(response => response.json())
    .then(result => res.send( result ) )
    .catch(error => console.log('error', error));

});

//Go live
app.listen(PORT,  () => {
  console.log("We are live " );
});
