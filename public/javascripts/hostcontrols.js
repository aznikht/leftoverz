var currentSong;

function selectSong(elem, tableNum)
{

	var id = $(elem).attr('id');
	$(elem).css('display', 'none');
	if(tableNum == 0)
	{
		$('#my'+id).css('display', '');
	}else
	{
		$('#'+id.substring(2)).css('display', '');
	}
}

var set_song = function() {
	var req= $.ajax({
		type: 'POST',
		url: '/publish',
		data:{'songname': currentSong, 'roomname': roomname}
	});
};


 