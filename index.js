const dotenv = require('dotenv').config() 
const express = require ('express'); 
const fetch = require('node-fetch'); // library for making requests 
const cors = require('cors'); // Cross Origin Resource Sharing 
const bodyParser = require('body-parser')

const app = express(); // enable express 
app.use( cors() ); // make express attach CORS headers to responses 
app.use( express.json() ); // add json capabilities to our express app 

app.use('/vegaby', express.static('public')) 

app.post('/vegaby/restaurants', bodyParser.json(), (req, res) => { 
  let yelp = 'https://api.yelp.com/v3/businesses/search?term=vegan'
  let lat = req.body.lat;
  let lng = req.body.lng;
  let url = yelp+'&latitude='+lat+'&longitude='+lng;
  let options = {
	"headers": {
	   "Authorization": "Bearer "+process.env.YELP_KEY
	}
  }

  fetch(url, options)
    .then(response => response.json()) 
    .then(result => res.send( result ) )
    .catch(error => console.log('error', error));

});

//Go live
app.listen(4321, "localhost", () => {
  console.log("We are live " );
});
