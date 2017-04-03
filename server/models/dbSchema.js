var mongoose    =   require("mongoose");
mongoose.connect('mongodb://localhost:27017/vignemaleDB');
mongoose.Promise = global.Promise;

// create instance of Schema
var mongoSchema = mongoose.Schema;

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
    isAdmin: Boolean
    //pois
    //rutas
    //favoritos
});

 var poisSchema = mongoose.Schema({
 });


//Export all collections
var users = mongoose.model('users',usersSchema);
var pois = mongoose.model('pois',poisSchema);
module.exports = {
    users: users,
    pois: pois
};