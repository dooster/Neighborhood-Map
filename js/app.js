var map;
function initMap() {
	var mapOptions = {
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: -73.9322143, lng: 40.7666886},
		zoom: 11
	});

	var infoWindow;
};

var ViewModel = function () {

};

ko.applyBindings(new ViewModel());