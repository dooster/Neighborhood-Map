//Initialize the instance of Google Maps for the application with certain bounds
//After the map initializes, use the function to load the ViewModel
var initMap = function () {
	var mapOptions = {
		disableDefaultUI: true,
		center: {lat: 40.7614547802915, lng: -73.9200578197085},
	};

	map = new google.maps.Map(document.getElementById('map'), mapOptions);

	var sw = new google.maps.LatLng(40.753547, -73.942808);
	var ne = new google.maps.LatLng(40.782769, -73.897018);

	var bounds = new google.maps.LatLngBounds();
	bounds.extend(sw);
	bounds.extend(ne);
	map.fitBounds(bounds);

	ko.applyBindings(new ViewModel());
};

//Create a master Place constuctor function to allow creation of all venue data necessary.
//This will create KO objects for each property of the item
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
	this.website = ko.observable(object.website);
	this.ref = ko.observable(object.ref);
};

var ViewModel = function () {
	var self=this;

	//The list of my favorite locations in Astoria, which is based on my preferences
	//And not those of FourSquare
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

	//The various data handling arrays that will hold all of the information for the application
	var formattedJeremy =[];
	var fourSquareLocations = [];
	var savedLocations = [];
	var formattedSaved =[];
	this.mapLocations = ko.observableArray();

	//The following display functions clear the mapLocations array and markers,
	//and then repopulate the map with data from either FourSquare, my recommendations, or localStorage
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
		self.createMarker(formattedJeremy);
	};

	this.displaySaved = function() {
		self.mapLocations([]);
		self.clearMarkers();
		formattedSaved.length = 0;
		var localItems = JSON.parse(localStorage.getItem('savedLocations'));
		self.createSavedLocations(localItems);
	};

	//The function takes in an object that the user saves through a button in the infoWindow
	//the function is then stripped of its marker property, to allow it to be saved into a JSON format
	//THe function also creates a localStorage.savedLocations property if it does not exist
	//And adds in the saved location to localStorage if the location does not already exist
	this.pushSave = function(locations) {
		delete locations.marker;
		if (!localStorage.savedLocations) {
			localStorage.savedLocations = JSON.stringify([]);
		}
		var localData = JSON.parse(localStorage.savedLocations);
		if (JSON.stringify(localData).indexOf(locations.venue()) === -1) {
			localData.push(locations);
			localStorage.savedLocations = ko.toJSON(localData);
		} else {
			return;
		}
	};

	//The AJAX request to FourSquare to pull in the most popular restaurants in Astoria
	//within a select radius of the map
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

	//This takes in FourSquare or JeremyLocation data and pushes the data into the Knockout
	//Place constructor to create Knockout objects. The data is then pushed into the
	//createMarker function in order to create map markers for each object.
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
		if (loc.length >= 29) {
			self.createMarker(fourSquareLocations);
		}
	};

	//Create Knockout objects from localStorage
	this.createSavedLocations = function(loc) {
		for (var i =0; i < loc.length; i++) {
			var venue = loc[i];
			var name = venue.venue;
			var address = venue.address;
			var city = venue.city;
			var category = venue.category;
			var rating = venue.rating;
			var lat = venue.lat;
			var lng = venue.lng;
			var id = venue.id;
			var ref = venue.ref;
			var website = venue.website;
			var object = {name: name,
				address: address,
				lat: lat,
				lng: lng,
				category: category,
				rating: rating,
				website: website,
				id: id,
				ref: ref,
				city: city};
			formattedSaved.push(new Place(object));
			}
		self.createMarker(formattedSaved);
	};

	//A marker array which holds the following markers when created in the createMarker function.
	//based off of code from https://github.com/lacyjpr/neighborhood/blob/master/src/js/app.js
	this.markerArray = ko.observableArray([]);

	var infowindow, location, button;

	//This function loops through the objects pushed into it from the previous functions.
	//It creates markers based on whether the object is originally from FourSquare or my recommendations,
	//assigning unique markers and a slightly different infowindow in each case.
	//closure model based off of answer at StackOverflow http://stackoverflow.com/questions/14661377/info-bubble-always-shows-up-on-the-last-marker
	this.createMarker = function(locations) {
		self.clearMarkers();
		for (var i = 0; i < locations.length; i++) {
			(function (locations) {
				var myLatLng = new google.maps.LatLng(locations.lat(), locations.lng());

				var attributionURL = 'https://foursquare.com/v/';

				var contentString = document.createElement('div');

				if (locations.ref() === undefined) {
					var marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						clickable: true,
						animation: google.maps.Animation.DROP
					});
					contentString.innerHTML = "<div id='info-content'>" +
						"<a href ='" + attributionURL + locations.id() + "'>" + locations.venue() + "</a>" +
						"<br>" + locations.category() + "<br>" +
						locations.address() + ", " + locations.city() + "<br>" +
						"FourSquare Rating: " + locations.rating() + " out of 10" +
						"</div>";
				} else {
					marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						clickable: true,
						animation: google.maps.Animation.DROP,
						//free icon from https://www.iconfinder.com/icons/751865/food_location_map_navigation_pin_poi_restaurant_icon#size=16
						icon: 'dist/images/img/1458190296_location_3-03.svg'
					});
					contentString.innerHTML = "<div id='info-content'>" +
						"<a href ='" + locations.website() + "'>" + locations.venue() + "</a>" +
						"<br>" + locations.category() + "<br>" +
						locations.address() +
						"<br>FourSquare Rating: " + locations.rating() + " out of 10" +
						"</div>";
				}

				//creating function calls within an infowindow thanks to http://stackoverflow.com/questions/21327691/function-calls-within-infowindows
				button = contentString.appendChild(document.createElement('input'));
				button.type = 'button';
				button.value = 'Save location!';
				google.maps.event.addDomListener(button, 'click', function(){
					if (savedLocations.indexOf(locations) === -1) {
						savedLocations.push(locations);
						self.pushSave(locations);
					}
				});

				//Push the locations into mapLocations, for display in the search box
				//And into the marker array to create markers.
				self.mapLocations.push(locations);
				self.markerArray.push(marker);

				//Create listeners on the markers, setting animation if clicked ...
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

				// ... And opening and closing the infowindows should something else
				//on the map be clicked
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

	//Loop through the marker array and set the markers on the map
	this.setMarkerMap = function(map) {
		for (var i = 0; i < self.markerArray.length; i++) {
			self.markerArray[i].setMap(map);
		}
	};

	//When called, remove the markers from the map and clear the markerArray. This allows
	//users to toggle between the various location tabs without having a number of markers
	//from FourSquare, localStorage, and my recommendations all competing for screen time.
	this.clearMarkers = function(map) {
		self.setMarkerMap(null);
		self.markerArray = [];
	};

	//The following code hides the search results based upon clicks on the hamburger menu.
	//This code only comes into effect on smaller screens based upon media queries.
	var hamburger = document.getElementById('hamburger');
	var nav = document.getElementById('nav-bar');

	hamburger.addEventListener('click', function(e) {
		if (nav.className == "open") {
			nav.className = "";
		} else {
			nav.className = "open";
		}
		e.preventDefault();
	}, false);

	//big help for the search functionality from http://codepen.io/JohnMav/pen/OVEzWM/?editors=1010
	this.query = ko.observable('');

	//Create a filter function, which hides items from the map and search box depending upon
	//the input query
	//help with filtering map markers https://discussions.udacity.com/t/google-map-marker-filter-issues/15244/5
	this.search = ko.computed(function (value) {
		return ko.utils.arrayFilter(self.mapLocations(), function(mapLocations) {
			if (mapLocations.category().toLowerCase().indexOf(self.query().toLowerCase()) >=0) {
				if (mapLocations.marker) {
					mapLocations.marker.setVisible(true);
				}
				return true;
			} else {
				mapLocations.marker.setVisible(false);
			}
		});
	});
};

function googleError () {
	$('#map').html("<h2>Sorry! Google Maps failed to load. Please check your internet connection and try refreshing the page.</h2>");
}

/*Non-critical TODO:
-add extra features to search such as autocomplete
-show user's location
-implement and link another API - delivery?
-create a README
-change the way the cursor looks over the nav-item

-settimeout drop google markers

-add Jeremy vs Jen locations
*/