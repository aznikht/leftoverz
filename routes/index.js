var pg = require('pg').native;
var host = 'db-edlab.cs.umass.edu';
var port = 7391;
var connection;
var program = require('commander');
var fs = require('fs');
var path = require('path');


program.prompt('Enter Postgres Edlab Account Username: ', function (user) {
        run(user);
});

function run (user) 
{
    connection = 'postgresql://' + user+':abc@' + host + ':' + port + '/' + user;
    pg.connect(connection, function (err, client) {
		if (err)
		{
			console.log("Incorrect login!")
			process.exit(0);	
		}
		client.query("SELECT * FROM users", function(err, result){
			if (err)
			{
				console.log("No user table was found!");
				console.log("Please create table by executing this line:");
				console.log("$ ./psql.sh <your username> data/dbinit.sql");
				process.exit(0);
			}
		});
            			
    });
}

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.createform = function(req, res)
{
	res.render('create', { title: 'Create an Account', err: '' });
}

exports.create = function(req, res) {
    // TODO: user/account creation
    var username = req.body.username;
	var password = req.body.passwordOne;	
    if(( username === undefined)||( username =='')||(password === undefined)||( password == ''))
    {
    	res.render('create', { title: 'Create Account', err: ''} );
    }else
    {
    	console.log("Creating users if not found");
    	pg.connect(connection, function (err, client) {
    		if (err)
                throw err;
    		var query = client.query('SELECT * FROM users WHERE username = $1', [username], function(err, result){
    			if(err)
    				throw err;
    			else if(result.rows.length != 0)
    			{
    				console.log("Username already exist");
    				found = true;
    				res.render('create', { title: 'Create Account', err: 'Username already exist!'} );
    			}else
    			{
    				console.log("Username created");
    				client.query('INSERT INTO users(username, password) values($1, $2);', [username, password]);
    				res.render('login', { title: 'Login to Leftoverz Project', confirm: 'User Account Created Successfully',err: ''});
    			}
    		});
    	});
    }
};

exports.loginform = function(req, res)
{
	res.render('login', { title: 'Login to Leftoverz Project', confirm: '',err: '' });
}

exports.login = function(req, res) {
    // TODO: user login
	var username = req.body.username;
	var password = req.body.password;
	if(req.session.auth === undefined )
	{
		if(( typeof username === "undefined")||(typeof password === "undefined"))
		{
			res.render('login', { title: 'Login to Leftoverz Project', confirm:'', err: ''});
		}
		else
		{
	    	console.log("Authenticating Login and Password...");
	    	pg.connect(connection, function (err, client) {
	    		if (err)
	                throw err;
	            console.log("Accessing DB");
	    		var query = client.query("SELECT * FROM users WHERE username = $1", [username], function(err, result){
	    			if(err)
	    				throw err;
	    			else if(result.rows.length != 0)
	    			{
	    				console.log(result);
	    				if(result.rows[0].password == password)
	    				{
			    			console.log("found account match");
			    			req.session.username = username;
			    			req.session.auth = true;
			    			res.redirect('/home');
	    				}else
	    				{
	    					console.log("password is wrong");
				    		res.render('login', { title: 'Login to Leftoverz Project', confirm:'', err: 'Incorrect Login or Password!'} );
	    				}
	    			}else
	    			{
			    		console.log("Username does not exist");
			    		res.render('login', { title: 'Login to Leftoverz Project', confirm:'', err: 'Incorrect Login or Password!'} );
	    			}
	    		});
	    	});
	    }
	}
	else
	{
		res.redirect('/home');
	}
    	
};

exports.logout = function(req, res) {
    // TODO: user logout
	console.log("Logging Out...");
    req.session.destroy();
    res.redirect('/');
};


function getChatrooms(cb){
pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('SELECT * FROM chatrooms', function(err, result){
        	cb(result.rows);
       }); 
    });
}

exports.homepage = function(req, res)
{
	if(req.session.auth == true )
	{

	getChatrooms(function(list){
	res.render('home', { title: 'Home of Leftoverz Project', 
	user: req.session.username,
	chatrooms: list});
	});
	}
	else
		res.redirect('/');
}

exports.createRoom = function(req, res)
{
	getLibrarySongs(function(list){
		res.render('createroom', {title: 'Create a Music Room!', list: list});
		});
	
}

function getLibrarySongs(cb){
	var files = fs.readdirSync(__dirname + '/../public/music');
	for(var i in files) {
	  console.log('Song name: ' + files[i]);
	}
	cb(files);
}

exports.publishRoom = function(req, res)
{
	//need to pass playlist
	var username = req.session.username;
	var roomname = req.body.roomname;
	var host = true;
	
	createRoom(username, roomname);
	
	res.render('chatroom', {title: roomname,
							roomname: roomname,
							host: host}
	);						
}

exports.joinRoom = function(req, res)
{
	var username = req.session.username;
	var roomname = req.query.roomname;
	var host = false;
	joinRoom(username);
	
	res.render('chatroom', {title: roomname,
							roomname: roomname,
							host: host}
	);	
}

exports.leaveRoom = function(req, res)
{
	var username = req.session.username;
	leaveRoom(username);
	res.redirect('/home');
}

function createRoom(username, roomname){
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('INSERT INTO chatrooms VALUES ($1, $2)', [roomname, 'nothing']); 
        client.query('INSERT INTO activeusers VALUES ($1, $2)', [username, roomname]); 
    });
}

function joinRoom(username, roomname){
pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('INSERT INTO activeusers VALUES ($1, $2)', [username, roomname]); 
    });
}

function leaveRoom(username){
pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
		client.query('DELETE FROM activeusers WHERE username=$1', [username]);   
});
}

