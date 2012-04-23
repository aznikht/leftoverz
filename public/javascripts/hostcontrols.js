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
	var table = document.getElementById('songList');
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
	var table = document.getElementById('songList');
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
}

function validateLaunch()
{
	var table = document.getElementById('songList');
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


 