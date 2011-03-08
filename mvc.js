/**
 * Module dependencies.
 */
var fs = require('fs'),express = require('express'),
	mongoose = require('mongoose');

/**
 * Initial bootstrapping
 */
exports.boot = function(app){
  
  // Import configuration
  require('./conf/configuration.js')(app,express);
  
  // Bootstrap application
  bootApplication(app);
  bootModels(app);
  bootControllers(app);
  
};

/**
 *  App settings and middleware
 *  Any of these can be added into the by environment configuration files to 
 *  enable modification by env.
 */

function bootApplication(app) {
	
   // launch
  app.use(express.logger({ format: ':method :url :status' }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'helloworld' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  // Example 500 page
  app.error(function(err, req, res){
    res.render('500',{error:err});
  });

  // Example 404 page via simple Connect middleware
  app.use(function(req, res){
    res.render('404');
  });

  // Setup ejs views as default, with .html as the extension
  app.set('views', __dirname + '/views');
  app.register('.html', require('ejs'));
  app.set('view engine', 'html');

  // Some dynamic view helpers
  app.dynamicHelpers({
  
	request: function(req){
	   return req;
	},
	    
	hasMessages: function(req){
      return Object.keys(req.session.flash || {}).length;
    },

    messages: function(req){
      return function(){
        var msgs = req.flash();
        console.log(msgs);
        return Object.keys(msgs).reduce(function(arr, type){
          return arr.concat(msgs[type]);
        }, []);        
      }
    }
  });
}

//Bootstrap models 
function bootModels(app) {
	
  fs.readdir(__dirname + '/models', function(err, files){
    if (err) throw err;
    files.forEach(function(file){
      bootModel(app, file);
    });
  });
  
  // Connect to mongoose
  mongoose.connect(app.set('db-uri'));
  
}

// Bootstrap controllers
function bootControllers(app) {
  fs.readdir(__dirname + '/controllers', function(err, files){
    if (err) throw err;
    files.forEach(function(file){
    	bootController(app, file);    		
    });
  });
  
}

// simplistic model support
function bootModel(app, file) {

    var name = file.replace('.js', ''),
    	schema = require('./models/'+ name);				// Include the mongoose file        
    
}

// Load the controller, link to its view file from here
function bootController(app, file) {
	
	var name = file.replace('.js', ''),
    	controller = __dirname + '/controllers/' + name,   // full controller to include
    	template = name.replace('Controller','').toLowerCase();									// template folder for html - remove the ...Controller part.
	
	// Include the controller
	require(controller)(app,template);			// Include
	
}