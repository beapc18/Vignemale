var mongoose    =   require("mongoose");
mongoose.connect('mongodb://localhost:27017/vignemaleDB');
mongoose.Promise = global.Promise;

// create instance of Schema
var mongoSchema = mongoose.Schema;

//Schema db
var vignemaleSchema = mongoose.Schema({
    date: String,
    description: String,
    file: String
});

module.exports = mongoose.model('vignemale',vignemaleSchema);
