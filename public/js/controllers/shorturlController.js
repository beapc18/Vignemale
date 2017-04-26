angular.module('vignemale')

    .controller('shorturlCtrl', ['$scope', '$state', '$stateParams', 'pois', function ($scope, $state, $stateParams, pois) {

        //user id from url
        $scope.id = $stateParams.id;


        // FEEDBACK MESSAGES

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

        $scope.showPoi = false;
        $scope.poi;

        // show the error mensage
        var showError = function (error) {
            $scope.errorMsg = error.message;
            $scope.error = true;
        };

        // show the success mensage
        var showPoi = function (data) {
            $scope.poi = data;
            $scope.showPoi = true;
        };


        pois.short($scope.id, showPoi, showError);

    }]);