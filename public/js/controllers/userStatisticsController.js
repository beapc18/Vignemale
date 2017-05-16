angular.module('vignemale')

    .controller('userStatisticsCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users',
        function ($scope, $state, $stateParams,$httpParamSerializer, users) {

        $scope.id = $stateParams.id;


        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

        $scope.image = "";


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
            //$scope.successMsg = message.message; --Siempre pasar ya el mensaje,no objeto
            $scope.successMsg = message;
            $scope.success = true;
        };

        // hide the success mensage
        $scope.hideSuccess = function () {
            $scope.success = false;
            $scope.successMsg = "";
        };

        if($scope.id == 1){
            $scope.image = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Scatter Dataset',
                        data: [{
                            x: -10,
                            y: 0
                        }, {
                            x: 0,
                            y: 10
                        }, {
                            x: 10,
                            y: 5
                        }]
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            type: 'linear',
                            position: 'bottom'
                        }]
                    }
                }
            });
        }else if($scope.id == 2){
            console.log("grafico 2")
        }


    }]);

