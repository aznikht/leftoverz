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
	alert(arraySongs.length);
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
		$('#launch').css('display', 'hidden');
		setCurrentSong();
		table.deleteRow(0);
		arraySongs.splice(0, 1);
		set_song();
	}
}

var set_song = function() {
	var req= $.ajax({
		type: 'POST',
		url: '/set-song',
		data:{'songname': currentSong, 'roomname': roomname}
	});
};


 