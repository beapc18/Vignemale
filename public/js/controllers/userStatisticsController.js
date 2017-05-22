angular.module('vignemale')

    .controller('userStatisticsCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users','auth',
        function ($scope, $state, $stateParams,$httpParamSerializer, users, auth) {

        $scope.id = $stateParams.id;
        $scope.idUser = $stateParams.idUser;
        $scope.nameStatistic = "";

        $scope.description="";

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

        var ctx = document.getElementById("myChart").getContext("2d");
        var colours = ["#3fced2", "#e35ed0", "#eeb447", "#961784", "#4faaa1", "#e35ed0", "#cc759a", "#85263c"];
        var coloursBG = ["#28bcd2", "#e335b4", "#eea72f", "#cc5c8b", "#3c95aa", "#e349c2", "#960679", "#850d2a"];

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
                $scope.nameStatistic = "Creation dates";
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            label: "Number of registrations per month (You and the ones you follow)",
                            data: data.creations,
                            backgroundColor: colours,
                            hoverBackgroundColor: coloursBG
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
                        },
                        legend: {
                            display: false
                        }
                    }
                });

            });


        }else if($scope.id == 2){
            $scope.nameStatistic = "Last accesses";
            users.getStatistics($scope.idUser, 2, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            label: "Last acceses in the last week (You and the ones you follow)",
                            data: data.lastAccessArray,
                            backgroundColor: colours,
                            hoverBackgroundColor: coloursBG
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

        }else if($scope.id == 3){
            $scope.nameStatistic = "Shared pois";

            users.getStatistics($scope.idUser, 3, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            label: "Number of recommendation for every poi you have recommended",
                            data: data.count,
                            backgroundColor: colours,
                            hoverBackgroundColor: coloursBG
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
                        },
                        legend: {
                            display: false
                        }
                    }
                });

            });

        }else if($scope.id == 4) {
            $scope.nameStatistic = "Duplicated pois popularity";

            users.getStatistics($scope.idUser, 4, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            label: "Number of recommendation each poi you have duplicated",
                            data: data.count,
                            backgroundColor: colours,
                            hoverBackgroundColor: coloursBG
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
                        },
                        legend: {
                            display: false
                        }
                    }
                });

            });
            //user's pois by country
        }else if($scope.id == 5) {
            $scope.nameStatistic = "Followings' duplications";

            users.getStatistics($scope.idUser, 5, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            label: "Number of duplications for every user you follow",
                            data: data.count,
                            backgroundColor: colours,
                            hoverBackgroundColor: coloursBG
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
                        },
                        legend: {
                            display: false
                        }
                    }
                });

            });

            //user's pois by country
        }

        //user's pois by country
        else if ($scope.id == 6){
            $scope.nameStatistic = "Pois by country";

            users.getStatistics($scope.idUser, 6, function (data) {
                var info = {
                    labels: data.countries,
                    datasets: [
                        {
                            data: data.numPois,
                            backgroundColor: colours,
                            hoverBackgroundColor: coloursBG
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
            $scope.nameStatistic = "Followings' pois by country";

            users.getStatistics($scope.idUser, 7, function (data) {

                var info = {
                    labels: data.countries,
                    datasets: [
                        {
                            data: data.numPois,
                            backgroundColor: colours,
                            hoverBackgroundColor: coloursBG
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
            $scope.nameStatistic = "Ages";

            users.getStatistics($scope.idUser, 8, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            data: data.ages,
                            backgroundColor: colours,
                            hoverBackgroundColor: coloursBG
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
            $scope.nameStatistic = "Activity of people you follow";

            users.getStatistics($scope.idUser, 9, function (data) {
                var info = {
                    labels: data.users,
                    datasets: [
                        {
                            label: 'Number of POIS for each people you follow',
                            data: data.info,
                            backgroundColor: colours,
                            hoverBackgroundColor: coloursBG
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
                        },
                        legend: {
                            display: false
                        }
                    }
                });
            });
        }
            else if($scope.id == 10) {
            $scope.nameStatistic = "Rating of pois";

            users.getStatistics($scope.idUser, 10, function (data) {
                    var info = {
                        labels: data.labels,
                        datasets: [
                            {
                                label: "Ratings",
                                data: data.ratings,
                                backgroundColor:"rgba(62,25,253,0.4)",
                                hoverBackgroundColor: "#FF6384"
                            }]
                    };

                    new Chart(ctx, {
                        type: "radar",
                        data: info,
                        options: {
                            responsive: true,
                            title: "Correlation between rating on POIs",
                            hAxis: {title: "POIs"},
                            yAxis: {title: "Name user"},
                            animation: {
                                animateScale: true
                            },
                            scale: {
                                ticks: {
                                    beginAtZero: true,
                                    //max: 20
                                }
                            },
                            legend: {
                                display: false
                            },
                            tooltips: {
                                mode: 'label',
                                callbacks: {
                                    label: function (tooltipItem, data) {
                                        return data['datasets'][0]['data'][tooltipItem['index']] + '%';
                                    }
                                }
                            }
                        }
                    });
                });
            }
        }]);

