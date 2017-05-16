angular.module('vignemale')

    .controller('userStatisticsCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users','auth',
        function ($scope, $state, $stateParams,$httpParamSerializer, users, auth) {

        $scope.id = $stateParams.id;
        $scope.idUser = $stateParams.idUser;


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
            console.log($scope.idUser);

            users.getStatistics($scope.idUser, 1, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            data: data.creations
                        }
                    ]
                };

                $scope.image = new Chart(ctx, {
                    type: 'bar',
                    data: info,
                    options: {
                        scales: {
                            yAxes: [{
                                stacked: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }]
                        }
                    }
                });

            });


        }else if($scope.id == 2){


            users.getStatistics($scope.idUser, 2, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            data: data.lastAccessArray
                        }
                    ]
                };

                $scope.image = new Chart(ctx, {
                    type: 'bar',
                    data: info,
                    options: {
                        scales: {
                            yAxes: [{
                                stacked: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }]
                        }
                    }
                });

            });

        }


    }]);

