/* This is the frontend of the vegaby app. It runs in the browser.
 It fetches our Google API key from the backend (NodeJS)  
 It fetches and initializes Google Maps from Google. 
 It fetches restaurants from Yelp via the backend (NodeJS) 
 It builds Info Windows for restaurants. */

 /* IMPORTANT: Explore the Google Maps documentation for further details and examples.
 https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple */

let map             /* google maps gets initialized here. */ 
let bounds          /* defines an area on the map bit enough to fit all restaurants. */ 
let currentWindow   /* keeps track of which infor window is currently open.*/ 

/* The "initMap" function initializes the Google Map.  
It runs automatically via a callback after the Google Maps script loads. */
const initMap = () => {
  
  /* Here we ask the browser for the user's location. 
  This involves a consent step. See also, MDN Documentation for the Geolocation API: 
  https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API */ 

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      let userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
      };
      
      // the bounds get extended whenever we add a point. 
      // here we are adding the user's location to initialize the bounds
      bounds = new google.maps.LatLngBounds();
      bounds.extend(userLocation); 

      map = new google.maps.Map(
        document.getElementById('map'),
        {
          center: userLocation,
          disableDefaultUI: true
        }
      );
      fetchRestaurants(userLocation);
    });
  }
}

/* Send a POST request to the "restaurants" endpoint. 
send along the  user's location as JSON data in the body of the request. 
NodeJS will use this data to query YELP */ 
const fetchRestaurants = (userLocation) => {
  fetch("restaurants", {
    body: JSON.stringify(userLocation),
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  })
  .then(response => response.json())
  .then(data => {
    for (business of data.businesses){
      /* NodeJS will send us restaurant data from Yelp 
      To explore the data, log it to the console. */ 
      console.log(business)
      /* pass along each restaurant to be mapped.*/ 
      mapRestaurant( business )
    }
  })
  .catch(err => { console.error(err)  });
}

/* Given a JSON object that describes a restaurant, 
we are ready to add it to the map.*/
const mapRestaurant = (restaurant) => {
  /* Each YELP listing includes GPS coordinates.
  Here, we set up these coordinates in a way that Google understands. */ 
  let latLng = new google.maps.LatLng(
    restaurant.coordinates.latitude,
    restaurant.coordinates.longitude
  );
  /* extend the bounds of the map to fit each new point */ 
  bounds.extend(latLng);
  map.fitBounds(bounds);
  /* Make an "infowindow" for each restaurant. 
  This is like a bubble that appears when we click on a marker.
  You could modify this template to show a variety of details. */ 
  let infowindow = new google.maps.InfoWindow({
    maxWidth: 200,
    content: 
      `<img style="width: 100%" src="${restaurant.image_url}">
       <h3>${restaurant.name}</h3>
       <h4> ${restaurant.display_phone} </h4>
       <p><a target="_blank" href="${restaurant.url}">View Listing</a></p>`
  });
  /* Markers are customizable with icons, etc.*/ 
  let marker = new google.maps.Marker({
    position: latLng,
    map: map,
    icon: "marker.png"
  });
  /* here we control what happens when the user clicks on a marker.*/ 
  marker.addListener("click", () => {
    try{  
      /* if another window is already open, close it first*/ 
      currentWindow.close() 
    }
    catch(e){  
      /* no window is open yet  so we don't need to do anything. */ 
    }
    /* open the infowindow attached to this marker. */ 
    infowindow.open(map, marker);
    /* set the infowindow as "currentWindow"
     this will allow us to track it and close it on subsequent clicks. */
    currentWindow = infowindow; 
  });
}

// Note that "apikey" here is actually a URL. 
// it corresponds to an endpoint on which NodeJS is listening.
// After fetching the API Key from Node, the frontend will in turn fetch Google Maps.
fetch("apikey")
.then(response => response.json())
.then(data => {
  if (data.Status == "OK"){
    /* Generate a URL to fetch the Google Maps Javascript.
    Include parameters for the Google API Key and callback function.
    After the script is loadeded, the callback function "initMap" will run. */  
    let url = 'https://maps.googleapis.com/maps/api/js'+
                '?key='+data.GOOGLE_KEY+
                '&callback=initMap';
    /* Add the Google Maps JavaScript to the page. */ 
    let script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.head.appendChild(script);
  }
  else{
    console.log(data);
  }
})
.catch(err => {
  console.error(err);
});
