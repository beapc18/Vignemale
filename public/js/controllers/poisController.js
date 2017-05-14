angular.module('vignemale')

    .controller('poisCtrl', ['$scope', '$state', '$stateParams', 'pois','maps', function ($scope, $state, $stateParams, pois, maps) {

        //user id from url
        $scope.id = $stateParams.id;


        // FEEDBACK MESSAGES

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

        $scope.poi;

        // show the error mensage
        var showError = function (error) {
            $scope.errorMsg = error.message;
            $scope.error = true;
        };

        // show the success mensage
        var showPoi = function (data) {
            $scope.poi = data;
            maps.initMap();
            maps.addMarker({lat:$scope.poi.lat, lng:$scope.poi.lng}, $scope.poi.name);
        };

        pois.getPoi($scope.id, showPoi, showError);




    }]);