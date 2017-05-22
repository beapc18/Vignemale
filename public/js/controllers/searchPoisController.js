angular.module('vignemale')

    .controller('searchPoisCtrl', ['$scope', '$state', 'auth', 'pois', 'users','recommendations','maps', function ($scope, $state, auth, pois, users,recommendations, maps) {

        // variables
        $scope.search = false;
        $scope.poiSearch = "";
        $scope.foundPois = "";
        $scope.idPoi = "";
        $scope.isfav = false;
        $scope.itslogged = false;

        $scope.userName = "";

        $scope.newPoi = {
            name: "",
            description: "",
            keywords: "",
            lat: "",
            lng: "",
            shortURL: "",
            images: "",
            rating: "",
            creator: ""
        };
        var markers = [];

        // FEEDBACK MESSAGES

        // feedback handling variables
        $scope.error = false;
        $scope.success = false;
        $scope.successMsg = "";
        $scope.errorMsg = "";

        $scope.found = false;
        $scope.onePoiSelected = false;
        $scope.sharePoi = false;

        // hide the error mensage
        $scope.hideError = function () {
            $scope.errorMsg = "";
            $scope.error = false;
        };
        // show the error mensage
        var showError = function (error) {
            console.log(error);
            $scope.errorMsg = error.message;
            $scope.error = true;
        };

        // show the success mensage
        var showSuccess = function (message) {
            $scope.successMsg = message.message;
            $scope.success = true;
        };

        // hide the success mensage
        $scope.hideSuccess = function () {
            $scope.success = false;
            $scope.successMsg = "";
        };

        $scope.hidePois = function () {
            $scope.pois = false;
            maps.deleteMarkers();
        };

        $scope.logged = function () {
            $scope.itslogged = auth.isAuthenticated();
        };

        $scope.searchPois = function () {
            pois.search($scope.poiSearch, function (data) {
                $scope.found = true;
                $scope.onePoiSelected = false;
                maps.deleteMarkers();
                $scope.foundPois = data;
                $scope.logged();

                //create markers from pois list
                for (i = 0; i < $scope.foundPois.length; i++) {
                    maps.addMarker({lat:data[i].lat,lng:data[i].lng},data.name);
                }
            }, showError)
        };

        $scope.showPoi = function (lat, lng, name, id) {
            $scope.found = false;
            $scope.hidePois();
            maps.addMarker({lat:lat, lng:lng}, name);
            $scope.onePoiSelected = true;
            $scope.idPoi = id;
            pois.getPoi(id, function (data) {
                $scope.newPoi = data;
                //search if this poi is in favs list
                if ($scope.itslogged){
                    pois.isFav(id, function (fav) {
                        $scope.isfav = fav;
                    }, showError);
                }
                users.getUser($scope.newPoi.creator, function (data) {
                    $scope.userName = data.message[0].name+" "+data.message[0].lastName;
                }, showError);
            }, showError);
        };

        //add poi selected to fav to this user
        $scope.addFav = function () {
            auth.getIdFromToken(auth.getToken(), function (idUser) {
                var idPoi = {
                    "idPoi": $scope.idPoi
                };
                users.addFav(idUser.message, idPoi, function (data) {
                    $scope.isfav = true;
                    showSuccess(data);
                },showError);
            })
        };

        //remove fav poi selected to this user
        $scope.removeFav = function () {
            auth.getIdFromToken(auth.getToken(), function (idUser) {
                var idPoi = {
                    "idPoi": $scope.idPoi
                };
                users.deleteFav(idUser.message, idPoi, function (data) {
                    $scope.isfav = false;
                    showSuccess(data);
                }, showError);
            })
        };


        $scope.duplicatePoi = function () {
            var duplicate = $scope.newPoi;

            duplicate.idDuplicate = $scope.idPoi;
            duplicate.originCreator = $scope.newPoi.creator;


            var keywords = "";

            for(i = 0;i<duplicate.keywords.length;i++){
                if(i != 0){
                    keywords +="," +duplicate.keywords[i];
                }else{
                    keywords += duplicate.keywords[i];
                }
            }

            duplicate.keywords = keywords;

            auth.getIdFromToken(auth.getToken(), function (idUser) {
                $scope.newPoi.creator = idUser.message;
                pois.createPoi($scope.newPoi, showSuccess, showError);
            })
        };


        $scope.showShare = function () {
            $scope.sharePoi=true;
            $scope.found = false;
            $scope.onePoiSelected = false;
        };

        $scope.share = function () {
            $scope.recommendation.isPoi = true;
            $scope.recommendation.idPoiRoute = $scope.idPoi;

            var id;

            auth.getIdFromToken(auth.getToken(), function (idUser) {
                users.getUser(idUser.message,function(data){
                    $scope.recommendation.idOrigin = idUser.message;
                    $scope.recommendation.userNameOrigin = data.message[0].name;
                    $scope.recommendation.userLastNameOrigin = data.message[0].lastName;
                    recommendations.share($scope.recommendation,function(data){
                        $scope.onePoiSelected = true;
                        $scope.sharePoi = false;
                        showSuccess(data);
                    },showError);
                },showError);
            })
        };


        maps.initMap();


    }]);