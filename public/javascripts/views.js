
meta = {};
lens = document.location.href.substr(document.location.href.lastIndexOf('/'));

$(document).ready(function(){
	meta.phrase = $('h1.phrase').html();
	meta.uid = $('#instance').html();
	$('#next').bind('click', function(){
		$.ajax({
			url: lens + '.json',
			success: function(data){
				$('h1.phrase').html(data.phrase);
				meta = data;
			}
		});
	});
	$('#save').bind('click', function(){
		$.ajax({
			type: "POST",
			url: '/save',
			data: {uid: meta.uid, phrase: meta.phrase},
			success: function(data){
				console.log("Saved!");
			}
		});
	});
	$('#alpha').bind('click', function(){
		document.location.href = "/alpha";
	});
	$('#beta').bind('click', function(){
		document.location.href = "/beta";
	});
});
