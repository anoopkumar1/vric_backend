/**
 * Copyright (C) Zero IT Solutions - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential. Dissemination of this information or reproduction 
 * of this material is strictly forbidden unless prior written permission is obtained
 * from Zero IT Solutions.
 
 * 
 * Written By  : Diksha Jaswal <dikshaj.zeroit@gmail.com>, May 2022
 * Description :
 * Modified By :
 */	
   

const multer               = require("multer");
const express              = require('express'),
        cron               = require("node-cron"),
        http			         = require('http'),
        https			         = require('https'),
        path			         = require('path'),
        fs				         = require('fs'), 
        bodyParser		     = require('body-parser'),
        cookieParser	     = require('cookie-parser'),
        helmet			       = require('helmet'),
        jwt				         = require('jsonwebtoken');
        passport           = require('passport');
        FacebookStrategy   = require('passport-facebook').Strategy;
        config             = require('./common/config/config')
        routes             = require('./admin/application/routes/routes'), 
        cronObj            = require('./api/application/controller/cron'),
        cronObj            = require('./api/application/controller/cron')


    const session          = require('express-session');
    const app		           = express();
    let port               = process.env.PORT || 3000;
        global.app         = app;
        global.jwt         = jwt;
        global.basePath    = __dirname;
    let isUseHTTPs         = false;
 
    var options = {};


    app.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
    });
    app.use(express.static(__dirname +''));
        app.set('views', [ path.join(__dirname, '/admin/application/views'), path.join(__dirname, 'admin/application/views'), path.join(__dirname, 'agent/application/views')
    ]);
    app.set('view engine', 'ejs');
    app.use(session({
       secret: 'ssshhhhh',
       cookie: { maxAge: 200000000 },
       saveUninitialized: true,
       resave: false,
    }));
 
    app.use(bodyParser.json({limit:'50mb'}));
    app.use(bodyParser.urlencoded({ extended: false,limit:'50mb'}));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 
    app.use(cookieParser());
    app.use(helmet.hidePoweredBy());
 
 
       
    require('./admin/')();
    require('./api/')();

    var server;
    if ( isUseHTTPs === false ) {
        server     = http.createServer( app );
    } else {
        server     = https.createServer( options, app );
    }

    server.listen(port, function(){
        console.log(`server started on PORT -> ${port}`);
    });
    app.use(session({
        resave: false,
        saveUninitialized: true,
        secret: 'SECRET'
      }));
      app.use(passport.initialize());
      app.use(passport.session());
      
      passport.serializeUser(function (user, cb) {
        cb(null, user);
      });
      

      passport.deserializeUser(function (obj, cb) {
        cb(null, obj);
      });


      passport.use(new FacebookStrategy({
        clientID: config.facebookAuth.clientID,
        clientSecret: config.facebookAuth.clientSecret,
        callbackURL: config.facebookAuth.callbackURL
      }, function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
      }
    ));
    
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })
  app.use('/', routes);
  // Schedule tasks to be run on the server after 3 hours.
    cron.schedule('* * 3 * * *', function() {
      cronObj.insertHighlightedVideo();
    });
    // Schedule tasks to be run on the server after 1mintue.
    // cron.schedule("*/59 * * * * *", function() {
    //   cronObj.insertHighlightedVideo();
    cron.schedule('* * * 27 * *', function() {
      cronObj.insertPrayersTimming();
      //console.log('running a task every minute');
    });
    // });
