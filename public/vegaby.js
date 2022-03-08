let map, bounds;


var initMap = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      var userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
      };
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

const fetchRestaurants = (userLocation) => {
  fetch("restaurants", {
    body: JSON.stringify(userLocation),
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  })
  .then(response => response.json())
  .then(data => {
    for (business of data.businesses){
      console.log(business)
      mapRestaurant( business )
    }
  })
  .catch(err => { console.error(err)  });
}

const mapRestaurant = (restaurant) => {
  let latLng = new google.maps.LatLng(
    restaurant.coordinates.latitude,
    restaurant.coordinates.longitude
  );
  bounds.extend(latLng);
  map.fitBounds(bounds);
  let infowindow = new google.maps.InfoWindow({
    content: restaurant.name
  });
  let marker = new google.maps.Marker({
    position: latLng,
    map: map,
    icon: "marker.png"
  });
  marker.addListener("click", () => {
    infowindow.open(map, marker);
  });
}

fetch("apikey")
.then(response => response.json())
.then(data => {
  if (data.Status == "OK"){
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key='+data.GOOGLE_KEY+'&callback=initMap';
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
