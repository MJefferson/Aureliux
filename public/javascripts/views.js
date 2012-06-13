
meta = {};
lens = document.location.href.substr(document.location.href.lastIndexOf('/'));

$(document).ready(function(){
	meta.phrase = $('h1.phrase').html();
	meta.uid = $('#instance').html();
	refreshSaves();
	window.setInterval(refreshSaves, 1000);
	function nextEntry(){
		$.ajax({
			url: lens + '.json',
			success: function(data){
				$('h1.phrase').html(data.phrase);
				meta = data;
			}
		});
	}
	function refreshSaves(){
		$.ajax({
			url: 'instances.json',
			success: function(data){
				$("#instanceList").html("");
				data.Results.forEach(function(inst){
					$("#instanceList").append("<li>" + inst.phrase + "</li>");
				});
				$('h1.phrase').html(data.phrase);
			}
		});
	}		
	$(document).bind('keydown', function(event){
		if(event.which == 39){
			nextEntry();
		}
		if(event.which == 38){
			refreshSaves();
		}
	});
	$('#next').bind('click', function(){
		nextEntry();
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
