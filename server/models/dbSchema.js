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
    token: String,
    following: Array,
    favs: Array,
    nRates: Number      //number of votes (para saber si es activo o no??)
    //pois
    //rutas
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
    rating: Number
});


var routesSchema = mongoose.Schema({
    name: String,
    pois: [{poi: objectId, location: {lat: Number, lng:Number}}],
    numRecommendations: Number,
    creator: objectId
});

var shorturlsSchema = mongoose.Schema({
    url: String
});

//Schema which contains info about ratings of users
var ratingSchema = mongoose.Schema({
    idUser: String,
    idPoi: String,
    rating: Number
});


var shareSchema = mongoose.Schema({
    idUser: String,
    namePoiRoute: String,
    idPoiRoute: objectId
});


//create index for searching pois by keywords or name
POIsSchema.index({keywords: "text", name: "text"});

//create index for searching pois by keywords or name
usersSchema.index({name: "text", lastName: "text", email: "text"});

//Export all collections
var users = mongoose.model('users',usersSchema);
var pois = mongoose.model('pois',POIsSchema);
var routes = mongoose.model('routes',routesSchema);
var shorturls = mongoose.model('shorturls',shorturlsSchema);
var ratings = mongoose.model('ratings',ratingSchema);
var shares = mongoose.model('shares',shareSchema);


module.exports = {
    users: users,
    pois: pois,
    routes: routes,
    shorturls: shorturls,
    ratings: ratings,
    shares:shares
};