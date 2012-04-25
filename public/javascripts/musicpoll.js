var currentSong = 'nothing!';
var roomname;

var getSong;

var get_song = function() {
	var req= $.ajax({
		type: 'GET',
		url: getSong
	});
	
	req.done(function (data) {
		var song = data.song;
		if(song!=currentSong){
			var path = '/music/' + song;
			$('#music').attr('src', path);
			playSong();
			$('#currentSong').html('<ul>Current Song</ul> <br>'+song);
			currentSong = song;
			}
	});
};

var check_host = function(){
		var req = $.ajax({
		type: 'POST',
		url : '/hasHost',
		data: {'roomname' : roomname }
	});
	req.done(function (data) {
		if(data.hosted == false)
		{
			alert("Host has left and Room has closed!");
			window.location = "http://elnux7.cs.umass.edu:8888/home";
		}
	});
}

var pollEverything = function(){
	check_host();
	get_song();
};
 
function playSong(){
	var music = document.getElementById("music");
	music.play();
}

var interval_id;

var start_polling = function () {
	interval_id = setInterval(pollEverything, 3000);
};

var stop_polling = function () {
	if (interval_id) {
		clearInterval(interval_id);
	}
};

$(function () {
	roomname = $('#roomH1').html();
	getSong =  '/get-song?roomname=' + roomname;
	get_song();
	start_polling();
});