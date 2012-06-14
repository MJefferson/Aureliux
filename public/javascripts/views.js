
meta = {};
history = new Array();
lens = document.location.href.substr(document.location.href.lastIndexOf('/'));

$(document).ready(function(){
	meta.phrase = $('h1.phrase').html();
	meta.uid = $('#instance').html();
	refreshSaves();
	window.setInterval(refreshSaves, 1000);
	function addToHistory(obj){
		if(history.length <= 50 && history.indexOf(obj) == -1){
			history.push(obj);
		} else {
			history.shift();
			history.push(obj);
		}
	}
	function previousEntry(){
		
		if(history.length < 1){
			return false;
		}
		
		var position = history.indexOf(meta);
		
		if(history.length > 0 && position > 0 ){
			var previous = history[position-1];
			meta = previous;
			$('h1.phrase').html(previous.phrase);
		} else if (position == -1 ){
			var previous = history[history.length-1];
			addToHistory(meta);
			meta = previous;
			$('h1.phrase').html(previous.phrase);
		} else if (position == 0) {
			return false;
		} else {
			return false;
		}
		
	}
	function nextEntry(){
		var position = history.indexOf(meta);
		
		if (position > -1 && history.length > (position + 1)) {
			//load next history
			var next = history[position+1];
			$('h1.phrase').html(next.phrase);
			meta = next;
			
		} else {
			$.ajax({
				url: lens + '.json',
				success: function(data){
					addToHistory(data);
					$('h1.phrase').html(data.phrase);
					meta = data;
				}
			});
		}
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
		if(event.which == 37){
			previousEntry();
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
