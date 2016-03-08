var jeremyLocations = [
	'test', 'poop'
];

var savedLocations = [
	//put this inside the ViewModel???
];

var results = [
	'hi', 'ho'
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

	this.mapLocations = ko.observableArray(['test', 'two', 'three', 'four']);

	self.displayResults = function() {
		this.mapLocations.removeAll();
		results.forEach(function(item) {
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
		savedLocations.forEach(function(item){
			self.mapLocations.push(item)
		});
	};
};

ko.applyBindings(new ViewModel());