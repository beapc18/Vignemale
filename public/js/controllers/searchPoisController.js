angular.module('vignemale')

    .controller('searchPoisCtrl', ['$scope', '$state', 'auth', 'pois', function ($scope, $state, auth, pois) {

        // variables
        $scope.search = false;
        $scope.poiSearch = "";
        $scope.foundPois = "";
        $scope.idPoi = "";
        var markers = [];

        // FEEDBACK MESSAGES

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

        $scope.found = false;
        $scope.onePoiSelected = false;

        // hide the error mensage
        $scope.hideError = function () {
            $scope.errorMsg = "";
            $scope.error = false;
        };
        // show the error mensage
        var showError = function (error) {
            $scope.errorMsg = error.message;
            $scope.error = true;
        };

        // show the success mensage
        var showSuccess = function (message) {
            $scope.successMsg = message.message;
            $scope.success = true;
        };

        // hide the success mensage
        $scope.hideSuccess = function () {
            $scope.success = false;
            $scope.successMsg = "";
        };

        $scope.hidePois = function () {
            $scope.pois = false;
            deleteMarkers();
        };

        $scope.searchPois = function () {
            pois.search($scope.poiSearch, function (data) {
                //console.log(data);
                $scope.found = true;
                $scope.onePoiSelected = false;
                deleteMarkers();
                $scope.foundPois = data;

                //create markers from pois list
                for (i = 0; i < $scope.foundPois.length; i++) {
                    addMarker({lat:data[i].lat,lng:data[i].lng},data.name);
                }
            }, showError)
        };

        $scope.showPoi = function (lat, lng, name, id) {
            $scope.found = false;
            $scope.hidePois();
            addMarker({lat:lat, lng:lng}, name);
            $scope.onePoiSelected = true;
            $scope.idPoi = id;
            pois.getPoi(id, function (data) {
                $scope.newPoi = data;
                $scope.newPoi.shortURL = data.shortURL;
            }, showError);
        };

        initMap();


 // google maps functions
        var myLatlng = new google.maps.LatLng(41.64514, -0.8689481);
        var mapOptions = {
            zoom: 13,
            center: myLatlng
        };

        var map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

        function initMap(){
            directionsService = new google.maps.DirectionsService;
            directionsDisplay = new google.maps.DirectionsRenderer({map: map});
        }

        // Adds a marker to the map and push to the array.
        function addMarker(location, name) {
            var marker = new google.maps.Marker({
                position: location,
                map: map,
                tittle: name
            });
            markers.push(marker);
        }

        // Deletes all markers in the array by removing references to them.
        function deleteMarkers() {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
        }

    }]);