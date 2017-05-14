angular.module('vignemale')

    .controller('routesCtrl', ['$scope', '$state', '$stateParams', 'routes','maps', function ($scope, $state, $stateParams, routes, maps) {

        //user id from url
        $scope.id = $stateParams.id;


        // FEEDBACK MESSAGES

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

        $scope.route;

        // show the error mensage
        var showError = function (error) {
            $scope.errorMsg = error.message;
            $scope.error = true;
        };

        // show the success mensage
        var showRoute = function (data) {
            $scope.show = "routeSelected";
            $scope.route = data;
            maps.initMap();
            var pois = data.pois;
            var waypts = [];
            for(i = 0; i < pois.length; i++) {
                waypts.push({
                    location: pois[i].location,
                    stopover: true
                });
            }
            maps.createRoute(waypts);
        };

        routes.getRoute($scope.id, showRoute, showError);

    }]);