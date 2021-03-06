var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var cors        = require('cors');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var path        = require('path');
var session     = require('express-session');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port 	    = process.env.PORT || 8080;
// var port 	    = process.env.PORT || 80;
var jwt 		= require('jwt-simple');

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors
app.use(cors());

// log to console
app.use(morgan('dev'));
// app.use(express.static(path.join(__dirname, '../src'))); //For local server
app.use(express.static(path.join(__dirname, '../dist'))); //For Production 

//Required For Passport
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
 }));
 // Use the passport package in our application
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(config.database);

function saveToken(req, res, next) {
    var token = getToken(req.headers);
    // console.log("this is the token updated ", token);
       if (token) {
         var decoded = jwt.decode(token, config.secret);
         app.set("jwt", decoded);
         var jwtDecoded = app.get("jwt");
        //  console.log("this is the decoded jwt ", jwtDecoded);
       }
       next();
}

var apiRoutes = express.Router();

apiRoutes.get('/memberinfo', saveToken, passport.authenticate('jwt', {session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        return res.json({success: true, user });
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

getToken = function(headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};


require('./config/passport')(app, passport);
require('./app/routes/routes.js')(app, passport, saveToken);
require('./controllers/ProductsController.js')(app, saveToken);
require('./controllers/ProfileController.js')(app, saveToken);
 

apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({succes: false, msg: 'Please pass name and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
    newUser.save(function(err) {
      if (err) {
        res.json({succes: false, msg: 'Username already exists.'});
      } else {
        res.json({succes: true, msg: 'Successful created user!'});
      }
    });
  }
});

apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.encode(user, config.secret);
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

//Routes ===============================================================

app.use('/api', apiRoutes);

// app.all('/*', function (req, res, next) {
//    res.sendFile('index.html', { root: __dirname + '../src' });
// });

// Start the server
app.listen(port);
console.log('Shopagram Port: http://localhost:' + port);
