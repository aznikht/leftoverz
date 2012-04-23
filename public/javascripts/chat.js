var last_mid = 0; //we could initialize this to the last message sent right before joining?
var roomname;
var getusrs;
var getlast;

var get_usrs= function () {
	var req = $.ajax({
		type: 'GET',
		url : getusrs
	});
	
	req.done(function (data) {
		var users = data.users;
        $('#users').empty();
		for(var i=0; i< users.length; i++){
$('#users').append(users[i].username+ '<br>');}
	});
}

var get_msg = function () {
	getlast = '/get-msg?lastmid=' + last_mid + '&roomname=' + roomname;
	var req = $.ajax({
		type: 'GET',
		url : getlast
	});
	
	req.done(function (data) {
		var rows = data.msgs;
		for(var i=0; i< rows.length; i++){
			$('#chat').prepend('<b>' + rows[i].username + ' :</b> '+ rows[i].message + '<br>');
			last_mid = rows[i].mid;
			}
	});
};

var set_msg = function () {
	var msg = $('#msg').attr('value');
	$('#msg').attr('value', '');
	var req = $.ajax({
		type: 'POST',
		url : '/set-msg',
		data: { 'msg' : msg, 'roomname' : roomname }
	});
};

var msg_interval_id;

var start_polling_msg = function () {
	msg_interval_id = setInterval(get_msg, 3000);
};

var stop_polling_msg = function () {
	if (interval_id) {
		clearInterval(interval_id);
	}
};

$(function () {
	roomname = $('#roomH1').html();
	getusrs = '/get-usrs?roomname=' + roomname;
	getlast = '/get-msg?lastmid=' + last_mid + '&roomname=' + roomname;
	get_usrs();
	get_msg();
	start_polling_msg();

	$('#send').click(function(){
		var msg = $('#msg').attr('value');
		if(msg=='' || msg==null){alert('Please type a message.');}
		if(msg.length>0){set_msg();}
	});

$('#leave').click(function(){
var req = $.ajax({
			type: 'GET',
			url : '/leaveRoom' });

	});
});