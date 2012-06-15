
meta = {};
timeline = new Array();
lens = "alpha";

$(document).ready(function(){
	//meta.phrase = $('h1.phrase').html();
	//meta.uid = $('#instance').html();
	var socket = io.connect(socketaddr);
	
	//window.setInterval(refreshSaves, 1000);
	function addToHistory(obj){
		if(timeline.length <= 50 && timeline.indexOf(obj) == -1){
			timeline.push(obj);
		} else {
			timeline.shift();
			timeline.push(obj);
		}
	}
	function previousEntry(){
		
		if(timeline.length < 1){
			return false;
		}
		
		var position = timeline.indexOf(meta);
		
		if(timeline.length > 0 && position > 0 ){
			var previous = timeline[position-1];
			meta = previous;
			$('h1.phrase').html(previous.phrase);
		} else if (position == -1 ){
			var previous = timeline[timeline.length-1];
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
		var position = timeline.indexOf(meta);
		
		if (position > -1 && timeline.length > (position + 1)) {
			//load next timeline
			var next = timeline[position+1];
			$('h1.phrase').html(next.phrase);
			meta = next;
			
		} else {
			$.ajax({
				url: '/' + lens + '.json',
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
					var time = getTimestamp(inst);
					$("#instanceList").append("<li><div class=phrase>" + inst.phrase + "</div> <span class='time'>" + moment(time).fromNow() + "</span></li>");
				});
				$('h1.phrase').html(data.phrase);
			}
		});
	}
	function savePhrase(){
		$.ajax({
			type: "POST",
			url: '/save',
			data: {uid: meta.uid, phrase: meta.phrase},
			success: function(data){
				console.log("Saved!");
				refreshSaves();
			}
		});
		socket.emit('save');
	}
	function switchLens(newlens){
		var oldlens = lens;
		lens = newlens;
		nextEntry();
		$('ul.lenses #' + newlens).addClass('active');
		$('ul.lenses #' + oldlens).removeClass('active');
	}
	function getTimestamp(instance){
   	 return new Date(parseInt(instance._id.toString().slice(0,8), 16)*1000);
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
		if(event.which == 83){
			savePhrase();
		}
	});
	$('#next').bind('click', function(){
		nextEntry();
	});
	$('#save').bind('click', function(){
		savePhrase();
	});
	$('#alpha').bind('click', function(){
		if(lens !== "alpha") switchLens("alpha");
		nextEntry();
	});
	$('#beta').bind('click', function(){
		if(lens !== "beta") switchLens("beta");
		nextEntry();
	});
	$('#gamma').bind('click', function(){
		if(lens !== "gamma") switchLens("gamma");
		nextEntry();
	});
	
	socket.on('newsave', function (data) {
		refreshSaves();
	});
	
	nextEntry();
	refreshSaves();
});
