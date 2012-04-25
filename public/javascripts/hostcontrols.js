var currentSong;
var arraySongs = [];

var remove = function deleteSong(elem)
{
	$(elem).remove();
	updatePlaylist();
}

function selectSong(elem)
{

	var id = $(elem).attr('id');
	var song = $(elem).attr('value');
	var table = document.getElementById('playlisttable');
	var rowCount = table.rows.length;
	var row = table.insertRow(rowCount);
	var content = row.insertCell(0);
	content.innerHTML = ' - '+song;
	content.value = song;
	row.setAttribute('onclick', 'remove(this);');
	updatePlaylist();
}

function updatePlaylist()
{
	var table = document.getElementById('playlisttable');
	var rowNum = table.rows.length;
	arraySongs.length = 0;
	for(var i = 0; i < rowNum; i++)
	{
		arraySongs.push(table.rows[i].cells[0].value);
	}
}

function setCurrentSong()
{
	if(arraySongs.length != 0)
		currentSong = arraySongs[0];
	else
		currentSong = '';
			
}

function validateLaunch()
{
	var table = document.getElementById('playlisttable');
	var rowNum = table.rows.length;
	if(rowNum == 0)
	{
		alert("Playlist cannot be empty.");
		return false;
	}else
	{
		$('#launch').hide();
		setCurrentSong();
		table.deleteRow(0);
		arraySongs.splice(0, 1);
		create_room();
		set_song();
		playSong();
	}
}

var create_room = function()
{
	var room = $('#room').attr('value');
	var req= $.ajax({
		type: 'POST',
		url: '/publish',
		data:{'roomname': room}
	});
}

var set_song = function() {
	var room = $('#room').attr('value');
	var req= $.ajax({
		type: 'POST',
		url: '/set-song',
		data:{'songname': currentSong, 'roomname': room}
	});
};

var get_next = function(){
	setCurrentSong();
	var table = document.getElementById('playlisttable');
	if(currentSong != '')
	{
		table.deleteRow(0);
		arraySongs.splice(0, 1);
	}
	updatePlaylist();
	return currentSong;
};

function playSong(){
	var path = '/music/' + currentSong;
	var music = document.getElementById("music");
	$('#music').attr('src', path);
	music.play();
	$('#currentSong').html('Current Song: '+currentSong);

}

$(function () {
	$('#music').bind('ended', function() {
		get_next();
		set_song();
		playSong();
	});
});
 