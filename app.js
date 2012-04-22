
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')

var app = module.exports = express.createServer();

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'cs391wp' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/', routes.loginform);
app.post('/', routes.loginform);
app.get('/logging', routes.login);
app.post('/logging', routes.login);
app.get('/logout', routes.logout);
app.get('/create', routes.createform);
app.post('/create', routes.createform);
app.get('/creating', routes.create);
app.post('/creating', routes.create);
app.get('/home', routes.homepage);
app.post('/home', routes.homepage);
app.get('/createRoom', routes.createRoom);
app.get('/publish', routes.publishRoom);
app.get('/chatroom/:roomname', routes.joinRoom);
app.get('/leaveRoom', routes.leaveRoom);

app.listen(8888);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
