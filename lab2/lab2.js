google.load("feeds", "1");

function initialize() {
    var feed = new google.feeds.Feed('http://www.rendip.com/rss');
    feed.setResultFormat(google.feeds.Feed.MIXED_FORMAT);
    feed.setNumEntries(100);
    feed.load(function(result) {
	    if (!result.error) {
	    	for (var i = 0; i < result.feed.entries.length; i++) {
		        var entry = result.feed.entries[i];
		        entry.title = entry.title.replace(/&quot;/g,"\"").replace(/&rsquo;/g,"\'").replace(/&amp;/g,"\&");
		        var mediaEntries = entry.xmlNode.getElementsByTagNameNS('*','thumbnail');
		        for (var j = 0; j < mediaEntries.length; j++) {
		            var mediaEntry = mediaEntries[j];
		            var mediaThumbnailUrl = mediaEntry.attributes.getNamedItem('url').value;
		            //console.log(mediaThumbnailUrl);
		            result.feed.entries[i].img = mediaThumbnailUrl;
		        }
	    	}
    	}
    	feedObject = result.feed.entries;
    	filterArray = [];
    	buildFilter();
    	buildFeed();
  	});
}

function buildFeed(){
	var feed = feedObject;
	var feedContainer = $('#feedContainer');
	feedContainer[0].innerHTML = '';
	for (var entry in feed){
		if(filterArray.length === 0){
			buildEntry(feed, feedContainer, entry);
		}
		else{
			for(var category in feed[entry].categories){
				if(filterArray.indexOf(feed[entry].categories[category]) > -1){
					buildEntry(feed, feedContainer, entry);
				}
			}
		}
	}
	initializeOnClick();
}

function buildEntry(feed,feedContainer, entry){
	div = document.createElement('div');
	title = document.createElement('h3');
	title.appendChild(document.createTextNode(feed[entry].title));
	div.appendChild(title);
	div.style.borderBottom = 'solid';
	div.className = 'entryHeader';
	div.id = entry;
	feedContainer[0].appendChild(div);
}

function buildFilter(){
	var categories = [];
	var frame = $('#filterOptions');
	// skapar fieldset taggen
	frame.html('<fieldset data-role="controlgroup" class="ui-corner-all ui-controlgroup ui-controlgroup-vertical"></fieldset>');
	for (var entry in feedObject){
		for (var category in feedObject[entry].categories){
			if (!(categories.indexOf(feedObject[entry].categories[category]) > -1)){
				categories.push(feedObject[entry].categories[category]);
			}
		}
	}
	categories.sort(function(a, b){
	    if(a < b) return -1;
	    if(a > b) return 1;
	    return 0;
	});				
	for (var x in categories){
		// lägget till en input och en label för varje kategori i fieldset
		$("fieldset").append('<input type="checkbox" name="' + categories[x] + '" id="' + categories[x] +'"><label for="' + categories[x] + '">' + categories[x] + '</label>');

	}
	// trigga igång det vi gjorde i for-loopen
	frame.enhanceWithin();
	// bygger om feed med bara de filter som är aktiverade
	$(function() {
			$('#filterOptions input[type="checkbox"]').checkboxradio().click(function() {
				if(!(filterArray.indexOf($(this).attr('id')) > -1 )){
				filterArray.push($(this).attr('id'));
				console.log('Filtrera fram: ' + filterArray);
			}
			else{
				index = filterArray.indexOf($(this).attr('id'));
				filterArray.splice(index, 1);
				console.log('Tog bort - ' + $(this).attr('id') + ' - från filtreringen');
			}
			buildFeed();
			});
	});
}

function initializeOnClick(){
	$('.entryHeader').click(function(){
		setPage2(this.id);
		window.location ="#entryPage";
	});
}

function setPage2(id){
	var entry = feedObject[id];
	var entryContainer = $('#entryContainer');
	entryContainer[0].innerHTML = '';
	div = document.createElement('div');
	title = document.createElement('h4');
	img = document.createElement('img');
	img.style.maxWidth = '95%';
	title.appendChild(document.createTextNode(entry.title));
	img.src = entry.img;
	div.appendChild(title);
	div.appendChild(img);
	entryContainer[0].appendChild(div);
	var pageHeader = $('#entryPage').children().find('h1');
	console.log($('#entryPage').children().find('h1'));
	pageHeader[0].innerHTML = entry.categories[0];
}

google.setOnLoadCallback(initialize);