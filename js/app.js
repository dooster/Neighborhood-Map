var infoWindow;

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
	this.categories = ko.observable(object.categories);
};

var ViewModel = function () {
	var self=this;

	this.savedLocations = ko.observableArray([]); //I think this needs its own array to store user's saved selections
	var fourSquareLocations = [];
	this.mapLocations = ko.observableArray();

	this.displayResults = function() {
		self.mapLocations.removeAll();
		self.clearJeremyMarkers();
		this.createMarker();
	};

	this.displayJerLoc = function() {
		self.mapLocations.removeAll();
		var jeremyLocations = [
			{ venue: {
					name: 'SingleCut Beersmiths',
					location: {address: '19-33 37th St, New York, NY 11105', lat : 40.7783129, lng : -73.9017037},
					categories: [{name: 'Brewery Bar'}]
				}
			}, { venue: {
					name: "Doyle's Corner",
					location: {address: '4202 Broadway, Astoria, NY 11103', lat : 40.7580005, lng : -73.91735629999999},
					categories: [{name: 'Bar and Grill'}]
				}
			}, { venue: {
					name: 'Yaar Indian Restaurant',
					location: {address: '22-55 31st St, New York, 11105', lat : 40.774797, lng : -73.911866},
					categories: [{name: 'Indian Restaurant'}]
				}
			}, { venue: {
					name: 'Bai Sushi',
					location: {address: '37-03 Broadway, Astoria, NY 11103', lat : 40.7597557, lng : -73.92021869999999},
					categories: [{name: 'Sushi Restaurant'}]
				}
			}, { venue: {
					name: 'New York City Bagel & Coffee House',
					location: {address: '40-05 Broadway, Queens, NY 11103', lat : 40.7589623, lng : -73.9185095},
					categories: [{name: 'Coffee and Bagel Shop'}]
				}
			}, { venue: {
					name: 'Pye Boat Noodle',
					location: {address: '35-13 Broadway, New York, NY 11106', lat : 40.7604336, lng : -73.92156799999999},
					categories: [{name: 'Thai Restaurant'}]
				}
			}, { venue: {
					name: 'Cafe Boulis',
					location: {address: '31-15 31st Ave, Astoria, NY 11102', lat : 40.7646088, lng : -73.92354440000001},
					categories: [{name: 'Greek Bakery'}]
				}
			}, { venue: {
					name: 'Bear',
					location: {address: '12-14 31st Ave, Astoria, NY 11106', lat : 40.768372, lng : -73.93303},
					categories: [{name: 'Russian Restaurant'}]
				}
			}, { venue: {
					name: 'Villa Brazil',
					location: {address: '43-16 34th Ave, Long Island City, NY 11101', lat : 40.7551288, lng : -73.9180253},
					categories: [{name: 'Brazilian Buffet'}]
				}
			}
		];
		self.clearFourSquareMarkers();
		self.createJeremyLocations(jeremyLocations);
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
			data: 'll=40.7614547802915,-73.9200578197085&radius=2000&section=food&client_id=' +
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
			var name = venue.name;
			var location = venue.location;
			var category = venue.categories[0].name;
			var object = {name: name, lat: location.lat, lng: location.lng, category: category};
			self.mapLocations.push(new Place(object));
			fourSquareLocations.push(new Place(object));
			console.log(fourSquareLocations);
		}
		self.createMarker(map, fourSquareLocations);
	};
	//based off of code from https://github.com/lacyjpr/neighborhood/blob/master/src/js/app.js
	var fourSquareMarker = [];
	this.createMarker = function(map, fourSquareLocations) {
		for (var i = 0; i < fourSquareLocations.length; i++) {
			(function (fourSquareLocations) {
				var myLatLng = new google.maps.LatLng(fourSquareLocations[i][2], fourSquareLocations[i][3]);
				var marker = new google.maps.Marker({position: myLatLng, map: map, clickable: true})
				google.maps.event.addListener(marker, 'click', self.toggleBounce(marker));
			}(fourSquareLocations[i]));
		}
		/*self.fourSquareLocations.forEach(function (fourSquareLocations) {
			self.mapLocations.push(fourSquareLocations);
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(fourSquareLocations.lat(), fourSquareLocations.lng()),
				map: map,
				animation: google.maps.Animation.DROP
			});
			fourSquareMarker.push(marker);
			marker.addListener('click', self.toggleBounce);
		})*/
	};

	this.createJeremyLocations = function (loc) {
		for (var i = 0; i < loc.length; i++){
			var venue = loc[i].venue;
			var name = venue.name;
			var location = venue.location;
			var category = venue.categories[0].name;
			var object = {name: name, lat: location.lat, lng: location.lng, category: category};
			self.mapLocations.push(new Place(object));
		}
		self.createJeremyMarker();
	};

	var jeremyMarker = [];
	this.createJeremyMarker = function() {
		self.mapLocations().forEach(function (mapLocations) {
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(mapLocations.lat(), mapLocations.lng()),
				map: map,
				animation: google.maps.Animation.DROP,
				icon: 'img/1458190296_location_3-03.svg'
				//https://www.iconfinder.com/icons/751865/food_location_map_navigation_pin_poi_restaurant_icon#size=16
			});
			jeremyMarker.push(marker);
			marker.addListener('click', self.toggleBounce);
		})
	};

	this.toggleBounce = function(marker) {
		if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
		setTimeout(function() {
			marker.setAnimation(null);
		}, 1500);
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
-settimeout drop google markers
-add local storage
-create search functionality
-add extra features to search such as autocomplete
-create click event on search results that directs to pin
-change pin icon when selected
-create infoWindows
-implement and link another API
-make website responsive across all devices
-create a Gulp workflow
-app features thorough comments
-create a README

-add 4square attribution https://developer.foursquare.com/overview/attribution
-add map bounds https://developers.google.com/maps/documentation/javascript/events#EventClosures
*/