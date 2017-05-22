angular.module('vignemale')

    .controller('adminStatisticsCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'adminList','auth',
        function ($scope, $state, $stateParams,$httpParamSerializer, adminList, auth) {

        $scope.id = $stateParams.id;
        $scope.nameStatistic = "";



        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

        var ctx = document.getElementById("myChart").getContext("2d");
        var colours = ["#3fced2", "#e35ed0", "#eeb447", "#cc759a", "#4faaa1", "#e35ed0", "#961784", "#85263c"];
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
            adminList.getAdminStatistics(1, function (data) {
                $scope.nameStatistic = "Users by age";
                console.log(data);
                var info = {
                    labels: data.names,
                    datasets: [ {
                        data: data.ages,
                        backgroundColor: colours,
                        hoverBackgroundColor: coloursBG
                    }]
                };
                // And for a doughnut chart
                new Chart(ctx, {
                    type: 'doughnut',
                    data: info,
                    options: {
                        animation: {
                            animateRotate: true,
                            animateScale: true
                        },
                        tooltips: {
                            mode: 'label',
                            callbacks: {
                                label: function(tooltipItem, data) {
                                    return data['datasets'][0]['data'][tooltipItem['index']] + '%';
                                }
                            }
                        }
                    }
                });
            })

        }else if($scope.id == 2){
            $scope.nameStatistic = "Users by place";
            adminList.getAdminStatistics(2, function (data) {
                var info = {
                    labels: data.places,
                    datasets: [ {
                        label: "Percentage of users by place",
                        data: data.counts,
                        backgroundColor: colours,
                        hoverBackgroundColor: coloursBG
                    }]
                };
                // And for a doughnut chart
                new Chart(ctx, {
                    type: 'bar',
                    data: info,
                    options: {
                        animation: {
                            animateRotate: true,
                            animateScale: true
                        },
                        scale: {
                            ticks: {
                                beginAtZero: true
                            }
                        },
                        scales: {
                            yAxes: [{
                                stacked: true
                            }]
                        },
                        legend: {
                            display: false
                        },
                        tooltips: {
                            mode: 'label',
                            callbacks: {
                                label: function(tooltipItem, data) {
                                    return data['datasets'][0]['data'][tooltipItem['index']] + '%';
                                }
                            }
                        }
                    }
                });
            });

        }else if($scope.id == 3) {
            $scope.nameStatistic = "Active users VS inactive users";
            adminList.getAdminStatistics(3, function (data) {
                var info = {
                    labels: data.labels,
                    datasets: [{
                        label: "Active users VS inactive users",
                        data: data.counts,
                        backgroundColor: colours,
                        hoverBackgroundColor: coloursBG,
                        borderWidth: 1
                    }]
                };
                // And for a doughnut chart
                new Chart(ctx, {
                    type: 'horizontalBar',
                    data: info,
                    options: {
                        animation: {
                            animateRotate: true,
                            animateScale: true
                        },
                        legend: {
                            display: false
                        },
                        scales: {
                            xAxes: [{
                                stacked: true
                            }]
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
            })
        }

        //users logged with googles/not
        else if($scope.id == 5) {
            $scope.nameStatistic = "Register with Google vs Normal register";

            adminList.getAdminStatistics(5, function (data) {
                var info = {
                    labels: data.label,
                    datasets: [
                        {
                            data: data.percentage,
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
                        },

                        tooltips: {
                            mode: 'label',
                            callbacks: {
                                label: function(tooltipItem, data) {
                                    return data['datasets'][0]['data'][tooltipItem['index']] + '%';
                                }
                            }
                        }
                    }
                });
            });
        }

        else if($scope.id == 6) {
            $scope.nameStatistic = "Places not found in Google Maps";

            adminList.getAdminStatistics(6, function (data) {
                var info = {
                    labels: data.label,
                    datasets: [
                        {
                            data: data.percent,
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

        else if($scope.id == 7) {
            $scope.nameStatistic = "Recommedations per user";

            adminList.getAdminStatistics(7, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            data: data.percentages,
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
                        },
                    }
                });
            })
        }

        else if($scope.id == 8) {
            $scope.nameStatistic = "Duplications per user";

            adminList.getAdminStatistics(8, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            data: data.percentages,
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
                        },
                    }
                });
            })
        }
    }]);

