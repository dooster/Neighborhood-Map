var jeremyLocations = [
	{
		name: 'SingleCut Beersmiths',
		location: {lat : 40.7783129, lng : -73.9017037},
		categories: {name: 'Brewery Bar'}
	}, {
		name: 'The Local',
		location: {lat : 40.7608402, lng : -73.91609219999999},
		categories: {name: 'Bar and Grill'}
	}, {
		name: 'Yaar Indian Restaurant',
		location: {lat : 40.774797, lng : -73.911866
            },
		categories: {name: 'Indian Restaurant'}
	}, {
		name: 'Bai Sushi',
		location: {lat : 40.7597557, lng : -73.92021869999999},
		categories: {name: 'Sushi Restaurant'}
	}, {
		name: 'New York City Bagel & Coffee House',
		location: {lat : 40.7589623, lng : -73.9185095},
		categories: {name: 'Coffee and Bagel Shop'}
	}, {
		name: 'Pye Boat Noodle',
		location: {lat : 40.7604336, lng : -73.92156799999999},
		categories: {name: 'Thai Restaurant'}
	}, {
		name: 'Cafe Boulis',
		location: {lat : 40.7646088, lng : -73.92354440000001},
		categories: {name: 'Greek Bakery'}
	}, {
		name: 'Bear',
		location: {lat : 40.768372, lng : -73.93303},
		categories: {name: 'Russian Restaurant'}
	}, {
		name: 'Villa Brazil',
		location: {lat : 40.7551288, lng : -73.9180253},
		categories: {name: 'Brazilian Buffet'}
	}
];


var map, marker, i, infoWindow;

var initMap = function () {
	var mapOptions = {
		disableDefaultUI: true,
		center: {lat: 40.7614547802915, lng: -73.9200578197085},
		zoom: 14
	};

	map = new google.maps.Map(document.getElementById('map'), mapOptions);
	createMarker(map);

	ko.applyBindings(new ViewModel());
};

var googleLocations = [];

var createMarker = function(map) {

	for (i = 0; i < googleLocations.length; i++) {
		marker = new google.maps.Marker({
			position: googleLocations[i].location,
			map: map
		});
	}
	console.log(googleLocations);
};

var ViewModel = function () {
	var self=this;

	this.savedLocations = ko.observableArray([]);

	this.fourSquareLocations = [];

	this.mapLocations = ko.observableArray();

	self.displayResults = function() {
		this.mapLocations.removeAll();
		self.fourSquareLocations.forEach(function(item) {
			self.mapLocations.push(item);
		});
	};

	self.displayJerLoc = function() {
		this.mapLocations.removeAll();
		jeremyLocations.forEach(function(item) {
			self.mapLocations.push(item);
			googleLocations.push(item);
			createMarker();
		});
	};

	self.displayMyLoc = function() {
		this.mapLocations.removeAll();
		self.savedLocations().forEach(function(item){
			self.mapLocations.push(item);
		});
	};

	self.getFourSquare = (function() {
		var config = {
			clientId: 'Y2I0LGBKFU2FCQLC3XOQEH4CIV1R4IKT4X10CT1FPAZS2VYC',
			clientSecret: 'HVHDQBVKYMWSV5Q45AH44VAFMRF1D5TTE41J41YRYGAZ253R',
			apiUrl: 'https://api.foursquare.com/'
		};

		$.ajax({
			url: config.apiUrl + 'v2/venues/explore',
			dataType: 'json',
			data: 'll=40.7614547802915,-73.9200578197085&radius=2000&client_id=' +
				config.clientId +
				'&client_secret=' +
				config.clientSecret +
				'&v=20140806&m=foursquare',
			async: true,
			success: function(data) {
				venue = data.response.groups[0].items;
				for (var i = 0; i < venue.length; i++){
					var venues = venue[i].venue;
					self.fourSquareLocations.push(venues);
					console.log(venues);
				}
				self.fourSquareLocations.forEach(function(item){
					self.mapLocations.push(item);
					googleLocations.push(item);
					createMarker();
				});
			},
			error: function(e) {
				$('#location-list').html("<h4><p>Sorry! The FourSquare data failed to load.</p> <p>Please check your internet connection and try refreshing the page, or look at Jeremy's Recommendations.</p></h4>");
			}
		});
	})();
};

function googleError () {
	$('#map').html("<h2>Sorry! Google Maps failed to load. Please check your internet connection and try refreshing the page.</h2>");
};

/*Todo
-add local storage
-create search functionality
-add extra features to search such as autocomplete
-link ajax search results to map
-create click event on search results that directs to pin
-create animation for pin when clicked
-change pin icon when selected
-have different pins for different locations
-create infoWindows
-implement and link another API
-make website responsive across all devices
-create a Gulp workflow
-app features thorough comments
-create a README
*/