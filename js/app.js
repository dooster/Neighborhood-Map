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
};

ko.applyBindings(new ViewModel());