var jeremyLocations = [
	{
		name: 'SingleCut Beersmiths',
		location: {address: '19-33 37th St, Queens, NY 11105'},
		categories: [{name: 'Brewery Bar'}]
	}, {
		name: 'The Local',
		location: {address: '41-04 31st Ave, Queens, NY 11103'},
		categories: [{name: 'Bar and Grill'}]
	}, {
		name: 'Yaar Indian Restaurant',
		location: {address: '22-55 31st St, Queens, NY 11105'},
		categories: [{name: 'Indian Restaurant'}]
	}, {
		name: 'Bai Sushi',
		location: {address: '37-03 Broadway, Queens, NY 11103'},
		categories: [{name: 'Sushi Restaurant'}]
	}, {
		name: 'New York City Bagel & Coffee House',
		location: {address: '40-05 Broadway, Queens, NY 11103'},
		categories: [{name: 'Coffee and Bagel Shop'}]
	}, {
		name: 'Pye Boat Noodle',
		location: {address: '35-13 Broadway, Queens, NY 11106'},
		categories: [{name: 'Thai Restaurant'}]
	}, {
		name: 'Cafe Boulis',
		location: {address: '31-15 31st Ave, Queens, NY 11102'},
		categories: [{name: 'Greek Bakery'}]
	}, {
		name: 'Bear',
		location: {address: '12-14 31st Ave, Queens, NY 11106'},
		categories: [{name: 'Russian Restaurant'}]
	}, {
		name: 'Villa Brazil',
		location: {address: '43-16 34th Ave, Queens, NY 11101'},
		categories: [{name: 'Brazilian Buffet'}]
	}
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
					var venues = venue[i].venue;
					self.fourSquareLocations.push(venues);
					console.log(venues);
				}
				self.fourSquareLocations.forEach(function(item){
					self.mapLocations.push(item)
				});
			});
	})();
};

ko.applyBindings(new ViewModel());