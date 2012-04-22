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
        client.query('SELECT * FROM musicrooms', function(err, result){
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

exports.hostRoom = function(req, res)
{
	var roomname = req.body.roomname;
	var username = req.session.username;
	getLibrarySongs(function(list){
		res.render('musicroom', {title: roomname,
		roomname: roomname, hostname: username,
		host: true, playlist: list});
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
	var username = req.session.username;
	var roomname = req.body.roomname;	
	createRoom(username, roomname);					
}

exports.joinRoom = function(req, res)
{
	var username = req.session.username;
	var roomname = req.params.roomname;
	joinRoom(username, roomname);
	
	getHost(roomname, function(result){
		res.render('musicroom', {title: roomname,
		roomname: roomname,
		hostname: result,
		host: false});
	});

		
}

exports.leaveRoom = function(req, res)
{
	var username = req.session.username;
	leaveRoom(username);
	res.redirect('/home');
}

function getHost(roomname){
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        var sql = 'SELECT host_name FROM musicrooms WHERE chatroom_name=$1'
        	client.query(sql, [roomname], function(err, result){ cb(result) }); 
    });
}

function createRoom(username, roomname){
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('INSERT INTO musicrooms VALUES ($1, $2)', [roomname, username]); 
        client.query('UPDATE users SET chatroom = $1 WHERE username = $2', [roomname, username]); 
    });
}

function joinRoom(username, roomname){
pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('UPDATE users SET chatroom = $1 WHERE username = $2', [roomname, username]);
    });
}

function leaveRoom(username){
pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
		client.query('UPDATE users SET chatroom = $1 WHERE username = $2', [null, username]);
});
}

exports.set_song = function(req, res)
{
	var data = req.body;
	if(data)
	{
		var song = data.songname;
		var roomname = data.roomname;
		setSong(song, roomname);
	}
};

function setSong(song, roomname){
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('UPDATE musicrooms SET current_song = $1 WHERE chatroom_name = $2', [song, roomname]);
    });
}


exports.get_song = function(req, res)
{
	var roomname = req.query.roomname;
	getSong(roomname, function(song){
		res.send({ 'song' : song });
	});
};

function getSong(roomname, cb){
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        var sql = 'SELECT current_song FROM musicrooms WHERE chatroom_name=$1'
        client.query(sql, [roomname], function(err, result){ cb(result) }); 
    });
}

