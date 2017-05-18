angular.module('vignemale')

    .controller('adminStatisticsCtrl', ['$scope', '$state', '$stateParams','$httpParamSerializer', 'users','auth',
        function ($scope, $state, $stateParams,$httpParamSerializer, users, auth) {

        $scope.id = $stateParams.id;
        $scope.nameStatistic = "";



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
            users.getAdminStatistics(1, function (data) {
                $scope.nameStatistic = "Users by age";
                console.log(data);
                var info = {
                    labels: data.names,
                    datasets: [ {
                        data: data.ages,
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#5EFF1C"
                        ],
                        hoverBackgroundColor: [
                            "#ff2021",
                            "#5255eb",
                            "#2fff19"
                        ]
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
            users.getAdminStatistics(2, function (data) {
                var info = {
                    labels: data.places,
                    datasets: [ {
                        label: "Percentage of users by age",
                        data: data.counts,
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#5EFF1C"
                        ],
                        hoverBackgroundColor: [
                            "#ff2021",
                            "#5255eb",
                            "#EB8943"
                        ]
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
            console.log("hola");

            users.getAdminStatistics(7, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            data: data.count,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404"

                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404"
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

        else if($scope.id == 8) {

            users.getAdminStatistics(8, function (data) {
                var info = {
                    labels: data.names,
                    datasets: [
                        {
                            data: data.count,
                            backgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404"

                            ],
                            hoverBackgroundColor: [
                                "#FF6384",
                                "#36A2EB",
                                "#FFCE56",
                                "#31B404"
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

        else if($scope.id == 9) {


        }

        else if($scope.id == 10) {


        }

    }]);

