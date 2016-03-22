var initMap = function () {
	var mapOptions = {
		disableDefaultUI: true,
		center: {lat: 40.7614547802915, lng: -73.9200578197085},
	};

	map = new google.maps.Map(document.getElementById('map'), mapOptions);

	var bounds = {
		north: 40.782769,
		south: 40.753547,
		east: -73.897018,
		west: -73.942808
	};

	map.fitBounds(bounds);

	ko.applyBindings(new ViewModel());
};

//Create a master Place constuctor function to allow creation of all venue data necessary.
//Created with help from https://discussions.udacity.com/t/having-trouble-accessing-data-outside-an-ajax-request/39072/11
var Place = function(object) {
	this.venue = ko.observable(object.name);
	this.lat = ko.observable(object.lat);
	this.lng = ko.observable(object.lng);
	this.address = ko.observable(object.address);
	this.city = ko.observable(object.city);
	this.category = ko.observable(object.category);
	this.rating = ko.observable(object.rating);
};

var ViewModel = function () {
	var self=this;

	var jeremyLocations = [
		{
			venue: 'SingleCut Beersmiths',
			lat : 40.7783129,
			lng : -73.9017037,
			categories:'Brewery Bar',
			address: '19-33 37th St, Astoria'
		}, {
			venue: "Doyle's Corner",
			lat : 40.7580005,
			lng : -73.91735629999999,
			categories: 'Bar and Grill',
			address: '4202 Broadway, Astoria'
		}, {
			venue: 'Yaar Indian Restaurant',
			lat : 40.774797,
			lng : -73.911866,
			categories: 'Indian Restaurant',
			address: '22-55 31st St, Astoria'
		}, {
			venue: 'Bai Sushi',
			lat : 40.7597557,
			lng : -73.92021869999999,
			categories: 'Sushi Restaurant',
			address: '37-03 Broadway, Astoria'
		}, {
			venue: 'New York City Bagel & Coffee House',
			lat : 40.7589623,
			lng : -73.9185095,
			categories:'Coffee and Bagel Shop',
			address: '40-05 Broadway, Astoria'
		}, {
			venue: 'Pye Boat Noodle',
			lat : 40.7604336,
			lng : -73.92156799999999,
			categories: 'Thai Restaurant',
			address: '35-13 Broadway, Astoria'
		}, {
			venue: 'Cafe Boulis',
			lat : 40.7646088,
			lng : -73.92354440000001,
			categories: 'Greek Bakery',
			address: '31-15 31st Ave, Astoria'
		}, {
			venue: 'Bear',
			lat : 40.768372,
			lng : -73.93303,
			categories: 'Russian Restaurant',
			address: '12-14 31st Ave, Long Island City'
		}, {
			venue: 'Villa Brazil',
			lat : 40.7551288,
			lng : -73.9180253,
			categories:'Brazilian Buffet',
			address: '43-16 34th Ave, Long Island City'
		}];
	var fourSquareLocations = [];

	this.savedLocations = ko.observableArray([]); //I think this needs its own array to store user's saved selections
	this.mapLocations = ko.observableArray();

	this.displayResults = function() {
		self.mapLocations.removeAll();
		self.clearJeremyMarkers();
		this.createMarker(fourSquareLocations);
	};

	this.displayJerLoc = function() {
		self.mapLocations.removeAll();
		self.clearFourSquareMarkers();
		self.createJeremyMarker(jeremyLocations);
	};

	this.displayMyLoc = function() {
		this.mapLocations.removeAll();
		self.savedLocations().forEach(function(item){
			self.mapLocations.push(item);
		});
	};

	this.getFourSquare = function() {
		var config = {
			clientId: 'Y2I0LGBKFU2FCQLC3XOQEH4CIV1R4IKT4X10CT1FPAZS2VYC',
			clientSecret: 'HVHDQBVKYMWSV5Q45AH44VAFMRF1D5TTE41J41YRYGAZ253R',
			apiUrl: 'https://api.foursquare.com/'
		};

		$.ajax({
			url: config.apiUrl + 'v2/venues/explore',
			dataType: 'json',
			data: 'll=40.7614547802915,-73.9200578197085&radius=5000&section=food&client_id=' +
				config.clientId +
				'&client_secret=' +
				config.clientSecret +
				'&v=20140806&m=foursquare',
			async: true,
			success: function(data) {
				venue = data.response.groups[0].items;
				self.clearJeremyMarkers();
				self.createLocations(venue);
			},
			error: function(e) {
				$('#location-list').html("<h4><p>Sorry! The FourSquare data failed to load.</p> <p>Please check your internet connection and try refreshing the page, or look at Jeremy's Recommendations.</p></h4>");
			}
		});
	};
	this.getFourSquare();
	//partially based off of the discussion at https://discussions.udacity.com/t/p5-status-check-in/29104
	this.createLocations = function (loc) {
		for (var i = 0; i < loc.length; i++){
			var venue = loc[i].venue;
			console.log(venue);
			var name = venue.name;
			var location = venue.location;
			var category = venue.categories[0].name;
			var rating = venue.rating;
			var object = {name: name,
				address: location.address,
				city: location.city,
				lat: location.lat,
				lng: location.lng,
				category: category,
				rating: rating};
			fourSquareLocations.push(new Place(object));
			console.log(fourSquareLocations);
		}
		self.createMarker(fourSquareLocations);
	};
	//based off of code from https://github.com/lacyjpr/neighborhood/blob/master/src/js/app.js
	//closure model based off of answer at StackOverflow http://stackoverflow.com/questions/14661377/info-bubble-always-shows-up-on-the-last-marker
	var fourSquareMarker = [];
	var infowindow, location;
	this.createMarker = function(fourSquareLocations) {
		for (var i = 0; i < fourSquareLocations.length; i++) {
			(function (fourSquareLocations) {
				var myLatLng = new google.maps.LatLng(fourSquareLocations.lat(), fourSquareLocations.lng());
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					clickable: true,
					animation: google.maps.Animation.DROP
				});

				var contentString = "<div id='info-content'>" +
					"<h2>" + fourSquareLocations.venue() + "</h2>" +
					"<p>" + fourSquareLocations.category() + "</p>" +
					"<p>" + fourSquareLocations.address() + ", " + fourSquareLocations.city() + "</p>" +
					"<p>" + "<b>FourSquare Rating: </b>" + fourSquareLocations.rating() + " out of 10" + "</p>" +
					"</div>";

				self.mapLocations.push(fourSquareLocations);
				fourSquareMarker.push(marker);

				google.maps.event.addListener(marker, 'click', function() {
					if (marker.getAnimation() !== null) {
						marker.setAnimation(null);
					} else {
						marker.setAnimation(google.maps.Animation.BOUNCE);
					}
					setTimeout(function() {
						marker.setAnimation(null);
					}, 1200);
				}, false);

				google.maps.event.addListener(marker, 'click', function() {
					if (infowindow) infowindow.close();
					infowindow = new google.maps.InfoWindow({
						content: contentString
					});
					infowindow.open(map, marker);
				});

				google.maps.event.addListener(map, 'click', function() {
					if (infowindow) infowindow.close();
				});

				fourSquareLocations.marker = marker;

				//self.openInfoWindow(fourSquareLocations);

			}(fourSquareLocations[i]));
		}
	};

	//infinite gratitude to https://github.com/kacymckibben/project-5-app/blob/master/js/app.js for this
	this.openInfoWindow = function (loc) {
		google.maps.event.trigger(loc.marker, 'click');
	};

	var jeremyMarker = [];
	this.createJeremyMarker = function(jeremyLocations) {
		for (var i = 0; i < jeremyLocations.length; i++) {
			var loc = jeremyLocations[i];
			self.mapLocations.push(loc);
			(function (loc) {
				var myLatLng = new google.maps.LatLng(loc.lat, loc.lng);
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					clickable: true,
					animation: google.maps.Animation.DROP,
					icon: 'img/1458190296_location_3-03.svg'
					//https://www.iconfinder.com/icons/751865/food_location_map_navigation_pin_poi_restaurant_icon#size=16
				});

				var contentString = "<div id='info-content'>" +
					"<h2>" + jeremyLocations[i].venue + "</h2>" +
					"<p>" + jeremyLocations[i].categories + "</p>" +
					"<p>" + jeremyLocations[i].address + "</p>" +
					"</div>";

				jeremyMarker.push(marker);
				google.maps.event.addListener(marker, 'click', function() {
					if (marker.getAnimation() !== null) {
						marker.setAnimation(null);
					} else {
						marker.setAnimation(google.maps.Animation.BOUNCE);
					}
					setTimeout(function() {
						marker.setAnimation(null);
					}, 1500);
				}, false);

				google.maps.event.addListener(marker, 'click', function() {
					if (infowindow) infowindow.close();
					infowindow = new google.maps.InfoWindow({
						content: contentString
					});
					infowindow.open(map, marker);
				});

				google.maps.event.addListener(map, 'click', function() {
					if (infowindow) infowindow.close();
				});

				loc.marker = marker;
				//self.openInfoWindow(loc);

			}(jeremyLocations[i]));
		}
	};

	this.setFourSquareMap = function(map) {
		for (var i = 0; i < fourSquareMarker.length; i++) {
			fourSquareMarker[i].setMap(map);
		}
	};

	this.clearFourSquareMarkers = function () {
		self.setFourSquareMap(null);
	};

	this.setJeremyMap = function(map) {
		for (var i = 0; i < jeremyMarker.length; i++) {
			jeremyMarker[i].setMap(map);
		}
	};

	this.clearJeremyMarkers = function () {
		self.setJeremyMap(null);
	};
};

function googleError () {
	$('#map').html("<h2>Sorry! Google Maps failed to load. Please check your internet connection and try refreshing the page.</h2>");
};

/*Todo
-add local storage
-create search functionality
-add extra features to search such as autocomplete
-create click event on search results that directs to pin
-change pin icon when selected
-implement and link another API
-make website responsive across all devices
-create a Gulp workflow
-app features thorough comments
-create a README

-add 4square attribution https://developer.foursquare.com/overview/attribution
-add map bounds https://developers.google.com/maps/documentation/javascript/events#EventClosures
-settimeout drop google markers

-add Jeremy vs Jen locations
*/