
$(document).ready(function(){

	var meta = {};
	var timeline = new Array();
	var lens = "alpha";
	var page = 1;
	var tagging = false;
	var filterApplied = false;
	var filterTags = [];
	
	var socket = io.connect(socketaddr);
	
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
	function refreshSaves(callback){
		var tags = (filterApplied) ? filterTags.join(',') : "";
		$.ajax({
			url: 'instances.json',
			data: {page: page, tags: tags},
			success: function(data){
				$("#instanceList").html("");
				data.Results.forEach(function(inst){
					var time = getTimestamp(inst);
					$("#instanceList").append("<li id='"+ inst.uid +"'><ul class='entry'><li class='addtag'>+</li><li class=phrase>" + inst.phrase + "</li> <li class='tags'></li></ul><div class='time'>" + moment(time).fromNow() + "</div></li>");
					updateTagList(inst, $("#" + inst.uid + " .tags"))
				});
				bindAddTags();
				$('#instanceList').animate({opacity: 1}, 200);
			}
		});
	}
	function savePhrase(){
            console.log(meta);
		$.ajax({
			type: "POST",
			url: '/instances',
			data: {uid: meta.uid, phrase: meta.phrase, lens: lens},
			success: function(data){
				console.log("Saved!");
				refreshSaves();
			}
		});
		socket.emit('save');
	}
        function postToFB(){
            console.log(meta);
            FB.api(
              'https://graph.facebook.com/me/aurelbot:forge',
              'post',
              { thought: "http://philolobot.com:3005/instance/" + meta.uid,
                privacy: {'value': 'SELF'}
              },
              function(response) {
                         if (!response) {
                                      alert('Error occurred.');
                                               } else if (response.error) {
                                                            document.getElementById('result').innerHTML = 'Error: ' + response.error.message;
                                                                     } else {
                                                                                  document.getElementById('result').innerHTML =
                           '<a href=\"https://www.facebook.com/me/activity/' + response.id + '\">' +
                           'Story created.  ID is ' + response.id + '</a>';
                     }
              }
            );
        }
	function switchLens(newlens){
		var oldlens = lens;
		lens = newlens;
		$('ul.lenses #' + newlens).addClass('active');
		$('ul.lenses #' + oldlens).removeClass('active');
	}
	function getTimestamp(instance){
   	 return new Date(parseInt(instance._id.toString().slice(0,8), 16)*1000);
	}		
	$(document).bind('keydown', function(event){
		console.log(event.which);
		if(event.which == 39 && !tagging){
			nextEntry();
		}
		if(event.which == 38 && !tagging){
			refreshSaves();
		}
		if(event.which == 37 && !tagging){
			previousEntry();
		}
		if(event.which == 83 && !tagging){
			savePhrase();
		}
		if(event.which == 65 && !tagging){
			prevPage();
		}
		if(event.which == 68 && !tagging){
			nextPage();
		}
	});
	$('#next').bind('click', function(){
		nextEntry();
	});
	$('#save').bind('click', function(){
		savePhrase();
	});
        $('#share').bind('click', function(){
            savePhrase();
            postToFB();
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
	$('#delta').bind('click', function(){
		if(lens !== "delta") switchLens("delta");
		nextEntry();
	});

	function setPage(pageNum){
		page = pageNum;
		$('#paging .current').html(pageNum);
	}
	
	$('#paging .prev').bind('click', prevPage);
	$('#paging .next').bind('click', nextPage);
	
	function prevPage(){
		if(page > 1){
			setPage(page-1);
			$('#instanceList').css({
			    opacity: 0
	  		});
			refreshSaves();
		}
	}
	
	function nextPage(){
		setPage(page+1);
		$('#instanceList').css({
			    opacity: 0
  		});
		refreshSaves();
	}
	
	//There needs to be a function that takes an instance object, and target elem and renders a tag list
	function updateTagList(instance, targetEl){
		if(instance.tags && instance.tags.length > 0){
			var list = "<ul>";
			
			instance.tags.forEach(function(val, i, arr){
				list += "<li class='tag'>" + val + "</li>";	
			});
			list += "</ul>"
			$(targetEl).html(list);
			makeTagsFilters();
		}
	}
	
	function bindApplyButton(){
		$('ul.filters .apply').bind('click', function(e){
			if(filterTags.length > 0){
				filterApplied = true;
				setPage(1);
				refreshSaves();
			}
		});
	};
	function bindClearButton(){
		$('ul.filters .clear').bind('click', function(e){
			$('ul.filters').html('<li class="clear">CLEAR</li><li class="apply">APPLY</li><li class="add">ADD</li>');
			bindAddButton();
			bindClearButton();
			bindApplyButton();
			filterApplied = false;
			filterTags = [];
			setPage(1);
			refreshSaves();
		});
	};
	function bindAddButton(){
		$('ul.filters .add').bind('click', function(){
			console.log("damn hting is clicked.");
			$('#addFilterForm').modal({
				overlayClose: true,
				opacity:90,
				overlayCss: {backgroundColor:"#000"},
				onOpen: function (dialog) {
						tagging = true;
						dialog.overlay.fadeIn('slow', function () {
							dialog.data.show();
							dialog.container.slideDown('slow', function () {
								//dialog.data.fadeIn('slow');
								//$('input.tags').focus();
							});
						});
				},
				onClose: function (dialog) {
					tagging = false;
					dialog.data.hide();
					dialog.overlay.fadeOut('slow', function () {
						$.modal.close();
						//refreshSaves();
					});
				}
			});
		})
	}
	function makeTagsFilters(){
		$('li.tag').bind('click', function(e){
			e.preventDefault();
			var text = $(this).html();
			var filters = $('ul.filters').html();
			if(filters.indexOf(text) === -1){
				$('ul.filters').html(filters + "<li>" + text + "</li>");
				filterTags.push(text);
				bindApplyButton();
				bindClearButton();
				bindAddButton();
			}
		})
	}
	
	$('#tagger input[type="submit"]').bind('click', function(e){
		e.preventDefault();
		var uid = $('#tagger .uid').attr('value');
		var tags = $('#tagger .tags').attr('value');
		$.ajax({
			type: "PUT",
			url: '/instance/' + uid,
			data: {tags: tags},
			success: function(data){
				$.modal.close();
			}
		});
	});
	
	$('#addFilterForm input[type="submit"]').bind('click', function(e){
		e.preventDefault();
		var tags = $($('input[name=addFilter]')[0]).val();
		var tagArray = tags.split(',');
		tagArray.forEach(function(value, i, arr){
			var filters = $('ul.filters').html();
			if(filters.indexOf(value) === -1){
				$('ul.filters').html(filters + "<li>" + value + "</li>");
				filterTags.push(value);
				bindApplyButton();
				bindClearButton();
				bindAddButton();
			}
		});
		$.modal.close();
	});
	function bindAddTags(){
		$('.addtag').bind('click', function(){
			var instanceId = $(this).parents('li').attr('id');
			$('#tagger .uid').attr('value', instanceId);
			$('#tagger .instanceText').html($(this).siblings('.phrase').html());
			openTagModal();
			listCurrentTags(instanceId, $('ul.currentTags'));
		});
	}
	function openTagModal(){
		$('#tagger').modal({
			overlayClose: true,
			opacity:90,
			overlayCss: {backgroundColor:"#000"},
			onOpen: function (dialog) {
					tagging = true;
					dialog.overlay.fadeIn('slow', function () {
						dialog.data.show();
						dialog.container.slideDown('slow', function () {
							//dialog.data.fadeIn('slow');
							$('input.tags').focus();
						});
					});
			},
			onClose: function (dialog) {
				tagging = false;
				dialog.data.hide();
				dialog.overlay.fadeOut('slow', function () {
					$.modal.close();
					refreshSaves();
				});
			}
		});
	}
	
	function bindRemoveTags(){
		$('.currentTags .remove').bind('click', function(e){
			e.preventDefault();
			var uid = $('#tagger .uid').attr('value');
			var tagElem = $(this).siblings('span')[0];
			var tag = $(tagElem).html();
			$.ajax({
				type: "PUT",
				url: '/instance/' + uid,
				data: {tags: tag, remove: true},
				success: function(data){
					listCurrentTags(uid, $('ul.currentTags'));
				}
			});
		});
	}
	
	function listCurrentTags(id, elem){
		$.ajax({
			url: '/instance/' + id + '.json',
			success: function(data){
				var tags = "";
				if(data && typeof data == "object" && data.tags){
					data.tags.forEach(function(val, i, arr){
						tags += "<li><span>" + val + "</span><span class='remove'> x </span></li>";
					});
				}
				$(elem).html(tags);
				bindRemoveTags();
			}
		});
	}
	
	socket.on('newsave', function (data) {
		refreshSaves();
	});
	
	$( window ).swipe({
	    left: function() {
	        previousEntry();
	    },
	    right: function() {
	        nextEntry();
	    },
	    threshold: {
	        x: 200,
	        y: 50
	    }
	});
	
	if($('h1.phrase').html().length == 0) nextEntry();
	bindAddButton();
	refreshSaves();
});
