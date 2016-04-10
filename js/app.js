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
	this.id = ko.observable(object.id);
	this.website = ko.observable(object.wesbite);
	this.ref = ko.observable(object.ref);
};

var ViewModel = function () {
	var self=this;

	var jeremyLocations = [
		{
			name: 'SingleCut Beersmiths',
			website: 'http://www.singlecutbeer.com/',
			lat : 40.7783129,
			lng : -73.9017037,
			category:'Brewery Bar',
			address: '19-33 37th St, Astoria',
			rating: 9.4,
			ref: 'jeremyLocations'
		}, {
			name: "Doyle's Corner",
			website: "https://foursquare.com/v/doyles-corner/4b42d0b4f964a52022da25e3",
			lat : 40.7580005,
			lng : -73.91735629999999,
			category: 'Bar and Grill',
			address: '4202 Broadway, Astoria',
			rating: 8.1,
			ref: 'jeremyLocations'
		}, {
			name: 'Yaar Indian Restaurant',
			website: "http://www.yaarindianrestaurant.net/",
			lat : 40.774797,
			lng : -73.911866,
			category: 'Indian Restaurant',
			address: '22-55 31st St, Astoria',
			rating: 8.4,
			ref: 'jeremyLocations'
		}, {
			name: 'Bai Sushi',
			website: 'https://foursquare.com/v/bai-sushi/4b2062f2f964a520a53124e3',
			lat : 40.7597557,
			lng : -73.92021869999999,
			category: 'Sushi Restaurant',
			address: '37-03 Broadway, Astoria',
			rating: 7.9,
			ref: 'jeremyLocations'
		}, {
			name: 'New York City Bagel & Coffee House',
			website: "http://nycbch.com/",
			lat : 40.7589623,
			lng : -73.9185095,
			category:'Coffee and Bagel Shop',
			address: '40-05 Broadway, Astoria',
			rating: 8.7,
			ref: 'jeremyLocations'
		}, {
			name: 'Pye Boat Noodle',
			website: 'http://www.pyeboatnoodle.com/',
			lat : 40.7604336,
			lng : -73.92156799999999,
			category: 'Thai Restaurant',
			address: '35-13 Broadway, Astoria',
			rating: 9.0,
			ref: 'jeremyLocations'
		}, {
			name: 'Cafe Boulis',
			website: 'http://www.cafeboulis.com/',
			lat : 40.7646088,
			lng : -73.92354440000001,
			category: 'Greek Bakery',
			address: '31-15 31st Ave, Astoria',
			rating: 8.4,
			ref: 'jeremyLocations'
		}, {
			name: 'Bear',
			website: 'https://foursquare.com/v/bear/4eb00b6ef9f463d3c3c7880c',
			lat : 40.768372,
			lng : -73.93303,
			category: 'Russian Restaurant',
			address: '12-14 31st Ave, Long Island City',
			rating: 8.5,
			ref: 'jeremyLocations'
		}, {
			name: 'Villa Brazil',
			website: 'http://villabrasilcafe.com/',
			lat : 40.7551288,
			lng : -73.9180253,
			category:'Brazilian Buffet',
			address: '43-16 34th Ave, Long Island City',
			rating: 9.0,
			ref: 'jeremyLocations'
		}];
	var formattedJeremy =[];
	var fourSquareLocations = [];

	this.savedLocations = ko.observableArray([]); //I think this needs its own array to store user's saved selections
	this.mapLocations = ko.observableArray();

	this.displayResults = function() {
		self.mapLocations.removeAll();
		self.clearMarkers();
		self.createMarker(fourSquareLocations);
	};

	this.displayJerLoc = function() {
		self.mapLocations.removeAll();
		self.clearMarkers();
		formattedJeremy.length = 0;
		self.createLocations(jeremyLocations);
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
				self.clearMarkers();
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
		for (var i =0; i < loc.length; i++) {
			if ('ref' in loc[i]) {
				var venue = loc[i];
				var name = venue.name;
				var address = venue.address;
				var category = venue.category;
				var rating = venue.rating;
				var lat = venue.lat;
				var lng = venue.lng;
				var website = venue.website;
				var ref = venue.ref;
				var object = {name: name,
					address: address,
					lat: lat,
					lng: lng,
					category: category,
					rating: rating,
					website: website,
					ref: ref};
				formattedJeremy.push(new Place(object));
			} else {
				var venue = loc[i].venue;
				console.log(venue);
				var name = venue.name;
				var location = venue.location;
				var category = venue.categories[0].name;
				var rating = venue.rating;
				var id = venue.id;
				var object = {name: name,
					address: location.address,
					city: location.city,
					lat: location.lat,
					lng: location.lng,
					category: category,
					rating: rating,
					id: id};
				fourSquareLocations.push(new Place(object));
			}
		}
		if (loc.length < 29) {
			self.createMarker(formattedJeremy);
		} else {
			self.createMarker(fourSquareLocations);
		}
		console.log(formattedJeremy);
		console.log(fourSquareLocations);
	};

	/*this.createJeremyLocations = function (loc) {
		for (var i = 0; i < loc.length; i++){
			var venue = loc[i].venue;
			var name = venue.name;
			var address = venue.address;
			var category = venue.category;
			var rating = venue.rating;
			var object = {name: name,
				address: address,
				lat: lat,
				lng: lng,
				category: category,
				rating: rating,
				website: website};
			formattedJeremy.push(new Place(object));
			console.log(formattedJeremy);
		self.createJeremyMarker(formattedJeremy);
	};*/
	//based off of code from https://github.com/lacyjpr/neighborhood/blob/master/src/js/app.js
	this.markerArray = ko.observableArray([]);

	var infowindow, location;

	//closure model based off of answer at StackOverflow http://stackoverflow.com/questions/14661377/info-bubble-always-shows-up-on-the-last-marker
	this.createMarker = function(locations) {
		self.clearMarkers();
		for (var i = 0; i < locations.length; i++) {
			(function (locations) {
				var myLatLng = new google.maps.LatLng(locations.lat(), locations.lng());

				var attributionURL = 'https://foursquare.com/v/';

				if (locations.ref() === undefined) {
					var marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						clickable: true,
						animation: google.maps.Animation.DROP
					});
					var contentString = "<div id='info-content'>" +
						"<strong> <a href ='" + attributionURL + locations.id() + "'>" + locations.venue() + "</a></strong>" +
						"<br>" + locations.category() + "<br>" +
						locations.address() + ", " + locations.city() + "<br>" +
						"<b>FourSquare Rating: </b>" + locations.rating() + " out of 10" +
						"</div>";
				} else {
					marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						clickable: true,
						animation: google.maps.Animation.DROP,
						icon: 'img/1458190296_location_3-03.svg'
					});
					contentString = "<div id='info-content'>" +
						"<strong> <a href ='" + locations.website() + "'>" + locations.venue() + "</a></strong>" +
						"<br>" + locations.category() + "<br>" +
						locations.address() +
						"<br> <b>FourSquare Rating: </b>" + locations.rating() + " out of 10" +
						"</div>";
				}

				self.mapLocations.push(locations);
				self.markerArray.push(marker);

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

				locations.marker = marker;
			}(locations[i]));
		}
	};

	//infinite gratitude to https://github.com/kacymckibben/project-5-app/blob/master/js/app.js for this
	this.openInfoWindow = function (loc) {
		google.maps.event.trigger(loc.marker, 'click');
	};

	/*this.createJeremyMarker = function(object) {
		self.clearMarkers();
		for (var i = 0; i < object.length; i++) {
			(function (object) {
				var myLatLng = new google.maps.LatLng(object.lat(), object.lng());
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					clickable: true,
					animation: google.maps.Animation.DROP,
					icon: 'img/1458190296_location_3-03.svg'
					//https://www.iconfinder.com/icons/751865/food_location_map_navigation_pin_poi_restaurant_icon#size=16
				});

				var contentString = "<div id='info-content'>" +
					"<strong> <a href ='" + object.website + "'>" + object.venue + "</a></strong>" +
					"<br>" + object.category + "<br>" +
					object.address +
					"<br> <b>FourSquare Rating: </b>" + object.rating + " out of 10" +
					"</div>";

				self.markerArray.push(marker);
				self.mapLocations.push(object);
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

				object.marker = marker;

			}(object[i]));
		}
	};*/

	this.setMarkerMap = function(map) {
		for (var i = 0; i < self.markerArray.length; i++) {
			self.markerArray[i].setMap(map);
		}
	};

	this.clearMarkers = function(map) {
		self.setMarkerMap(null);
		self.markerArray = [];
	};

	//big help for the search functionality from http://codepen.io/JohnMav/pen/OVEzWM/?editors=1010
	this.query = ko.observable('');

	this.search = ko.computed(function (value) {
		return ko.utils.arrayFilter(self.mapLocations(), function(mapLocations) {
			return mapLocations.category().toLowerCase().indexOf(self.query().toLowerCase()) >=0
		});
	});
};

function googleError () {
	$('#map').html("<h2>Sorry! Google Maps failed to load. Please check your internet connection and try refreshing the page.</h2>");
};

/*Todo
-create search functionality
-add extra features to search such as autocomplete
-add local storage
-show user's location
-change pin icon when selected
-implement and link another API - delivery?
-make website responsive across all devices
-create a Gulp workflow
-app features thorough comments
-create a README
-change the way the cursor looks over the nav-item

-add map bounds https://developers.google.com/maps/documentation/javascript/events#EventClosures
-settimeout drop google markers

-add Jeremy vs Jen locations
*/