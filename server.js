var express     = require("express");
var bodyParser  = require("body-parser");
var app         = express();
var router      = express.Router();
var swaggerJSDoc = require('swagger-jsdoc');

var database  = require("./server/models/users.js");

var config    = require("./config/config.js");
var mongo     = require("./server/models/dbSchema.js");
var routes    = require("./server/routes/routes.js")(router, mongo, app, config, database);

var passport  = require('passport');

app.use(passport.initialize());


var swaggerDefinition = {
    info: {
        title: 'API Vignemale',
        version: '1.0.0',
        description: 'POI management'
    },
    host: 'localhost:8888',
    basePath: '/'
};

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs --> add paths where stay the files with swagger docs
    apis: ['*.js','server/*/*.js', 'public/api-docs/*.js', 'public/api-docs/*/*.js'] //???
};
// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);
app.use(express.static('public'));
// serve swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

//Aceptaremos JSON y valores codificados en la propia URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/',router);

var server = app.listen(8888, function () {

    database.createAdmin(mongo, app);
    console.log("Server listening in port %s...", server.address().port);
});
