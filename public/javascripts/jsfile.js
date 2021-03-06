function validateLogin()
{
	var name =document.forms["loginform"]["username"].value;
	var password =document.forms["loginform"]["password"].value;
	if (name==null || name==""||password==null || password=="")
	{
		document.getElementById("jsError").innerHTML="Username/Password cannot be BLANK!"
		return false;
	} 
}

function validateCreate()
{
	var name =document.forms["createform"]["username"].value;
	var passwordOne =document.forms["createform"]["passwordOne"].value;
	var passwordTwo =document.forms["createform"]["passwordTwo"].value;

	var alphanum = /^[\w ]+$/;
	if (name==""||passwordOne=="")
	{
		document.getElementById("jsError").innerHTML="Fill in ALL fields!"
		return false;
	}
	else if(passwordOne != passwordTwo)
	{
		document.getElementById("jsError").innerHTML="Password does not match";
		return false;
	}
	else if((!alphanum.test(name))||(!alphanum.test(passwordTwo)))
	{
		document.getElementById("jsError").innerHTML="Username and Password must contain only letters and numbers";
		return false;
	}
	return true;
	
}

function validateRoom()
{
	var alphanum = /^[\w ]+$/;
	var name =document.forms["createRoom"]["roomname"].value;
	var found = create_room();
	if(!alphanum.test(name))
	{
		document.getElementById("jsError").innerHTML="Room Name must contain only letters and numbers";
		return false;
	}else
	{
		return found;
	}
	return true;
}

var create_room = function()
{
	var room = document.forms["createRoom"]["roomname"].value;
	var req= $.ajax({
		type: 'POST',
		url: '/isRoomExist',
		data:{'roomname': room}
	});
	req.done(function (data) {
		if(data.found)
		{
			$('#jsError').text('Roomname already exists!');
			return false;
		}else
		{
			return true;
		}
	});
}



