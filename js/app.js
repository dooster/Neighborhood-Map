var map;
function initMap() {
	var mapOptions = {
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7666886, lng: -73.9322143},
		zoom: 14
	});

	var infoWindow;
};

var ViewModel = function () {

};

ko.applyBindings(new ViewModel());