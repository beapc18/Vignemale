angular.module('vignemale')

    .controller('userStatisticsCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users','auth',
        function ($scope, $state, $stateParams,$httpParamSerializer, users, auth) {

        $scope.id = $stateParams.id;
        $scope.idUser = $stateParams.idUser;



        $scope.description="";


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

            users.getStatistics($scope.idUser, 1, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            label: "Number of registrations per month (You and the ones you follow)",
                            data: data.creations
                        }
                    ]
                };

                new Chart(ctx, {
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
                            label: "Last acceses in the last week (You and the ones you follow)",
                            data: data.lastAccessArray
                        }
                    ]
                };

                new Chart(ctx, {
                    type: 'bar',
                    data: info,
                    options: {
                        scales: {
                            yAxes: [{
                                stacked: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'probability'
                                },
                                ticks: {
                                    stepSize: 1
                                }
                            }]
                        }
                    }
                });

            });

        }else if($scope.id == 3){

            users.getStatistics($scope.idUser, 3, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            label: "Number of recommendation for every poi you have recommended",
                            data: data.count
                        }
                    ]
                };

                new Chart(ctx, {
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

        }else if($scope.id == 4) {
            users.getStatistics($scope.idUser, 4, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            label: "Number of recommendation each poi you have duplicated",
                            data: data.count
                        }
                    ]
                };

                new Chart(ctx, {
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
            //user's pois by country
        }else if($scope.id == 5) {

            users.getStatistics($scope.idUser, 5, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            label: "Number of duplications for every user you follow",
                            data: data.count
                        }
                    ]
                };

                new Chart(ctx, {
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

            //user's pois by country
        }



        //user's pois by country
        else if ($scope.id == 6){
            users.getStatistics($scope.idUser, 6, function (data) {
                var info = {
                    labels: data.countries,
                    datasets: [
                        {
                            data: data.numPois,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404",
                                "#000000"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404",
                                "#000000"
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

        //following's pois by country
        else if ($scope.id == 7){
            users.getStatistics($scope.idUser, 7, function (data) {

                var info = {
                    labels: data.countries,
                    datasets: [
                        {
                            data: data.numPois,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404",
                                "#000000"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404",
                                "#000000"
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

        else if($scope.id == 8){

            users.getStatistics($scope.idUser, 8, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            data: data.ages,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404",
                                "#000000"

                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404",
                                "#000000"
                            ]
                        }]
                };
                new Chart(ctx,{
                    type:"pie",
                    data: info,
                    options: {
                        animation:{
                            animateScale:true
                        }
                    }
                });


            })

        }

        //following users' activity depending on pois and age
        else if ($scope.id == 9){
            users.getStatistics($scope.idUser, 9, function (data) {
                var info = {
                    labels: data.users,
                    datasets: [
                        {
                            data: data.info,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404",
                                "#000000"
                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404",
                                "#000000"
                            ]
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

