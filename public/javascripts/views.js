
meta = {};
  
$(document).ready(function(){
	meta.phrase = $('h1.phrase').html();
	meta.uid = $('#instance').html();
	$('#next').bind('click', function(){
		$.ajax({
			url: '/alpha.json',
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
});
