var express     = require("express");
var bodyParser  = require("body-parser");
var app         = express();
var router      = express.Router();
var swaggerJSDoc = require('swagger-jsdoc');

var mongo     = require("./server/models/dbSchema.js");
var routes    = require("./server/routes/routes.js")(router, mongo);
var jwt       = require("jsonwebtoken");
var config    = require("./config/config.js");

//secret variable JWT
app.set('superSecret', config.secret);

// route middleware to verify a token
router.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

var swaggerDefinition = {
    info: {
        title: 'API Vignemale',
        version: '1.0.0',
        description: 'POI management'
    },
    host: 'localhost:3000',
    basePath: '/'
};

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs --> add paths where stay the files with swagger docs
    apis: ['*.js','server/*/*.js'] //???
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
    console.log("Server listening in port %s...", server.address().port);
});
