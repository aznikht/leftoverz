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
	cb(files);
}

exports.publishRoom = function(req, res)
{
	var username = req.session.username;
	var roomname = req.body.roomname;
	isRoomExist(roomname, function(found){
		if(found == false)
			createRoom(username, roomname);	
		else
			console.log("room exists!");
	});
					
}

exports.joinRoom = function(req, res)
{
	var username = req.session.username;
	var roomname = req.params.roomname;
	joinRoom(username, roomname);
	
	getHost(roomname, function(result){
		res.render('musicroom', {title: roomname,
		roomname: roomname,
		hostname: result.rows[0].host_name,
		host: false});
	});

		
}

exports.leaveRoom = function(req, res)
{
	var username = req.session.username;
	var roomname = req.body.roomName;
	isRoomExist(roomname, function(sol){
	if(sol == true)
	{
		getHost(roomname, function(result){
			if(result.rows[0].host_name == username)
				destroyRoom(roomname);
		leaveRoom(username);
		});
	}
			res.redirect('/home');
	});

}

function getHost(roomname, cb){
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        var sql = 'SELECT host_name FROM musicrooms WHERE chatroom_name=$1'
        	client.query(sql, [roomname], function(err, result){  cb(result); }); 
    });
}

function isRoomExist(roomname, cb)
{
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        client.query('SELECT chatroom_name FROM musicrooms WHERE chatroom_name = $1', [roomname], function(err, result){
        	if(err)
        		throw err;
			else if(result == undefined)
			{
				cb(false);
			}else if(result.rows.length == 0)
        	{
        		cb(false);
        	}else
        	{
        		cb(true);
        	}
        }); 
        
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
		client.query('UPDATE users SET chatroom = $1 WHERE username = $2', ['', username]);
});
}

function destroyRoom(roomname)
{
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
		client.query('DELETE FROM musicrooms WHERE chatroom_name = $1', [roomname]);
		client.query('DELETE FROM chat_messages WHERE chatroom_name = $1', [roomname]);
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
        client.query('UPDATE musicrooms SET current_song = $1 WHERE chatroom_name = $2;', [song, roomname]);
    });
}


exports.get_song = function(req, res)
{
	var roomname = req.query.roomname;
	res.contentType('application/json');
	isRoomExist(roomname, function(sol){
	if(sol == true)
	{
		getSong(roomname, function(song){
			res.send({ 'song' : song.rows[0].current_song });
		});
	}else
	{
		res.send({ 'song' : '' });
	}
	});
};

function getSong(rm, cb){
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        var sql = 'SELECT current_song FROM musicrooms WHERE chatroom_name=$1;'
        client.query(sql, [rm], function(err, result){ cb(result); }); 
    });
}

exports.get_msg = function(req, res){
	console.log(req.session.username+" getting messages");
	var roomname = req.query.roomname;
	var last_mid = req.query.lastmid;
getMessages(roomname, last_mid, function(rows){
		res.contentType('application/json');
		res.send({ 'msgs' : rows });
		});
};

function getMessages(roomname, last, cb){
pg.connect(connection, function (err, client) {
       		 if (err) {
            		throw err;
        		 }
        		var sql = 'SELECT * FROM chat_messages WHERE mid>$1 AND chatroom_name = $2';
     		client.query(sql, [last, roomname], function(err, result){ cb(result.rows); }); 
    	});
}

exports.set_msg = function(req, res){
var data = req.body;
if (data) {
	var username = req.session.username;
	var msg = data.msg;
	var roomname = data.roomname;
	storeMessage(username, msg, roomname);
}
 
};

function storeMessage(username, message, roomname){
	pg.connect(connection, function (err, client) {
        	if (err) {
            	throw err;
      	  }
        	var sql = 'INSERT INTO chat_messages VALUES(default, $1, $2, $3, $4)';
       	var query = client.query(sql, [roomname, username, message, new Date()]);
   	 });
}

function has_Host(roomname, cb){
	pg.connect(connection, function (err, client) {
        if (err) {
            throw err;
        }
        var sql = 'SELECT * FROM musicrooms WHERE chatroom_name=$1'
        	client.query(sql, [roomname], function(err, result){  cb(result); }); 
    });
}

exports.hasHost = function(req, res){
	res.contentType('application/json');
	has_Host(req.body.roomname, function(result){
		if(result == undefined)
		{
			res.send({ 'hosted' : false });
		}else if(result.rows.length == 0)
		{
			
			res.send({ 'hosted' : false });
		}else
		{
			res.send({ 'hosted' : true });
		}
	});
};



exports.get_usrs = function(req, res){
var roomname = req.query.roomname;
getUsers(roomname, function(users){
		res.contentType('application/json');
		res.send({ 'users' : users });
		});
};

function getUsers(roomname, cb){
pg.connect(connection, function (err, client) {
        		if (err) {
            		throw err;
        		}
        		var sql = 'SELECT username FROM users WHERE chatroom=$1';  
        		client.query(sql, [roomname], function(err, result){cb(result.rows);}); 
    	});
}

exports.song_upload = function (req, res, next) {
    // This will print the structure to the console:
    console.log(req.body);
    console.log(req.files);
    // We need to rename the file to the name of the file from the
    // client system:
    var song = req.files.song;
    var fname = song.name;
    fs.rename(song.path, './public/music/' + fname, function () { res.redirect('/home'); });
};

exports.image_upload = function (req, res, next) {
    var username = req.session.username;
    // This will print the structure to the console:
    console.log(req.body);
    console.log(req.files);
    // We need to rename the file to the name of the file from the
    // client system:
    var image = req.files.image;
    image.name = username + '.jpg';
    fs.rename(image.path, './public/profile_images/' + image.name, function () { res.redirect('/home');});
};