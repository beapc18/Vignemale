angular.module('vignemale')

    .controller('userStatisticsCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users','auth',
        function ($scope, $state, $stateParams,$httpParamSerializer, users, auth) {

        $scope.id = $stateParams.id;

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

        var ctx = document.getElementById("myChart").getContext("2d");

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
            //window.alert(message);
            //$scope.successMsg = message.message;
            $scope.successMsg = message;
            $scope.success = true;
        };

        // hide the success mensage
        $scope.hideSuccess = function () {
            $scope.success = false;
            $scope.successMsg = "";
        };

        if($scope.id == 1){



        }else if($scope.id == 2){




        }else if($scope.id == 3){




        }else if($scope.id == 4) {


        }

        else if($scope.id == 5) {


        }

        else if($scope.id == 6) {


        }

        else if($scope.id == 7) {


        }

        else if($scope.id == 8) {


        }

        else if($scope.id == 9) {


        }

        else if($scope.id == 10) {


        }

    }]);

