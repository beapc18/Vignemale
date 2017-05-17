angular.module('vignemale')

    .controller('adminStatisticsCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users','auth',
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




        }
        // pois by user and rating average
        else if($scope.id == 4) {
            users.getAdminStatistics(4, function (data) {
                console.log(data.bubbles);

                var info = {
                    datasets: [
                        {
                            labels: 'Pois by user and it\'s average rating',
                            data: data.bubbles,
                            backgroundColor:"#FF6384",
                            hoverBackgroundColor: "#FF6384"
                        }
                    ]
                };

                new Chart(ctx, {
                    type: 'bubble',
                    data: info,
                    /*options: {

                    }*/
                });

            });
        }
        //users logged with googles/not
        else if($scope.id == 5) {
            users.getAdminStatistics(5, function (data) {
                var info = {
                    labels: data.label,
                    datasets: [
                        {
                            data: data.percentage,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB"
                            ]
                        }
                    ]
                };
                $scope.image = new Chart(ctx, {
                    type: 'pie',
                    data: info,
                    options: {
                        animation:{
                            animateScale:true
                        }
                    }
                });
            });
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

