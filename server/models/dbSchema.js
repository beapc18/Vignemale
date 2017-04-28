var mongoose    =   require("mongoose");
mongoose.connect('mongodb://localhost:27017/vignemaleDB');
mongoose.Promise = global.Promise;

// create instance of Schema
var mongoSchema = mongoose.Schema;
var objectId = mongoose.Schema.Types.ObjectId;


///Schema in db about users
var usersSchema = mongoose.Schema({
    name: String,
    lastName: String,
    email: String,
    password: String,
    birthDate: Date,      //fecha de nacimiento
    creationDate: Date,   //fecha de creacion
    leavingDate: Date,    //fecha de baja
    lastAccess: Date,
    removed: Boolean,
    place: String,        //localidad
    isAdmin: Boolean,
    isVerified: Boolean,
    firstLogin: Boolean,
    google: Boolean,
    token: String
    //pois
    //rutas
    //favoritos
});



var POIsSchema = mongoose.Schema({
    name: String,
    description: String,
    keywords: Array,
    lat: Number,
    lng: Number,
    shortURL: String,
    image: String,
    value: Number,
    city: String,
    country: String,
    creator: objectId,
    valoration: Number
    //Para ofrecer una imagen desde un controlador
    /*
     var img = document.createElement('img');
     img.src = 'data:image/png;base64,' + btoa(data);
     document.body.appendChild(img);
     */

    //
    /*
     var f = document.getElementById('image').files[0],
     r = new FileReader();

     r.onloadend = function(e){
     var data = e.target.result;
     console.log(data);
     //send your binary data via $http or $resource or do anything else with it
     }

     r.readAsBinaryString(f);
     */
});


var routesSchema = mongoose.Schema({
    name: String,
    pois: [{poi: objectId, lat: Number, lng:Number}],
    numRecommendations: Number,
    creator: objectId
});

var shorturlsSchema = mongoose.Schema({
    poi: objectId
});


//Export all collections
var users = mongoose.model('users',usersSchema);
var pois = mongoose.model('pois',POIsSchema);
var routes = mongoose.model('routes',routesSchema);
var shorturls = mongoose.model('shorturls',shorturlsSchema);

module.exports = {
    users: users,
    pois: pois,
    routes: routes,
    shorturls: shorturls
};