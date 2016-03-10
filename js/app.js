var jeremyLocations = [
	'test', 'poop'
];

function initMap() {
	var map;
	var mapOptions = {
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7652299, lng: -73.9187454},
		zoom: 14
	});

	var infoWindow;
};

var ViewModel = function () {
	var self=this;

	this.savedLocations = ko.observableArray(['poop']);

	this.fourSquareLocations = [];

	this.mapLocations = ko.observableArray();

	self.displayResults = function() {
		this.mapLocations.removeAll();
		self.fourSquareLocations.forEach(function(item) {
			self.mapLocations.push(item)
		});
	};

	self.displayJerLoc = function() {
		this.mapLocations.removeAll();
		jeremyLocations.forEach(function(item) {
			self.mapLocations.push(item)
		});
	};

	self.displayMyLoc = function() {
		this.mapLocations.removeAll();
		self.savedLocations().forEach(function(item){
			self.mapLocations.push(item)
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
			data: 'll=40.7652299,-73.9187454&client_id=' +
				config.clientId +
				'&client_secret=' +
				config.clientSecret +
				'&v=20140806&m=foursquare',
			async: true
			}).done(function(data) {
				venue = data.response.groups[0].items;
				for (var i = 0; i < venue.length; i++){
					var venues = venue[i].venue.name;
					self.fourSquareLocations.push(venues);
				}
				self.fourSquareLocations.forEach(function(item){
					self.mapLocations.push(item)
				});
			});
	})();
};

ko.applyBindings(new ViewModel());