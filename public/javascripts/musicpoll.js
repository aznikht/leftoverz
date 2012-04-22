var currentSong = 'nothing!';
var roomname = $('#roomname').text;

var getSong =  '/get-song?roomname=' + roomname;

var get_song = function() {
	var req= $.ajax({
		type: 'GET',
		url: getSong
	});
	
	req.done(function (data) {
		var song = data.song;
		if(song!=currentSong){
			var path = '/music/' + song + '.mp3';
			$('#music').attr('src', path);
			playSong();
			$('#currentSong').text(song);
			currentSong = song;
			}
	});
};
 
function playSong(){
	var music = document.getElementById("music");
	music.play();
}

var interval_id;

var start_polling = function () {
	interval_id = setInterval(get_song, 3000);
};

var stop_polling = function () {
	if (interval_id) {
		clearInterval(interval_id);
	}
};

$(function () {
	get_song();
	start_polling();
});