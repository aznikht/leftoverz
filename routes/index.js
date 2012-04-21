var pg = require('pg').native;
var host = 'db-edlab.cs.umass.edu';
var port = 7391;
var connection;
var program = require('commander');


program.prompt('Enter Postgres Edlab Account Username: ', function (user) {
        run(user);
});

function run (user) 
{
    connection = 'postgresql://' + user+':Kinghei915@' + host + ':' + port + '/' + user;
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
    		var query = client.query('SELECT * FROM users');
    		var found =false;
    		query.on('row', function(row) {
    			if(row.username == username)
    			{
    				console.log("Username already exist");
    				found = true;
    				res.render('create', { title: 'Create Account', err: 'Username already exist!'} );
    			}
    		});
    		if(found == false)
    		{
				console.log("Username created");
				client.query('INSERT INTO users(username, password) values($1, $2);', [username, password]);
				res.render('login', { title: 'Login to Leftoverz Project', err: ''});
    		}
    	});
    }
};

exports.loginform = function(req, res)
{
	res.render('login', { title: 'Login to Leftoverz Project', err: '' });
}

exports.login = function(req, res) {
    // TODO: user login
	var username = req.body.username;
	var password = req.body.password;
	if(req.session.auth === undefined )
	{
		if(( typeof username === "undefined")||(typeof password === "undefined"))
		{
			res.render('login', { title: 'Login to Bank', err: ''});
		}
		else
		{
	    	console.log("Authenticating Login and Password...");
	    	pg.connect(connection, function (err, client) {
	    		if (err)
	                throw err;
	            console.log("Accessing DB");
	    		var query = client.query("SELECT * FROM users WHERE username = $1", [username], function(err, result){
	    			console.log(result.rowCount);
	    			if(err)
	    				throw err;
	    			else if(result != undefined)
	    			{
	    				if(result.rows[0].password == password)
	    				{
			    			console.log("found account match");
			    			req.session.username = username;
			    			req.session.auth = true;
			    			res.redirect('/home');
	    				}
	    			}else
	    			{
			    		console.log("Username does not exist");
			    		res.render('login', { title: 'Login to Leftoverz Project', err: 'Incorrect Login or Password!'} );
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

exports.homepage = function(req, res)
{
	if(req.session.auth == true )
		res.render('home', { title: 'Home of Leftoverz Project', user: req.session.username });
	else
		res.redirect('/');
}
