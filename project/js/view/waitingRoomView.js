var WaitingRoomView = function(container,model,shakeCtrl){
	var wMapDiv = this.wMapDiv = $("#myMapPosition")[0];
	this.randomButton = $("#randomButton");
	this.btnDeny = $("#btnDeny");
	this.btnAccept = $("#btnAccept");
	this.header = $("#header");

	var mateLocation = null;
	var wMap;

	var initialize = function() {
		// initiates google map and sets center to My position.
		wMapDiv.style.height = window.innerHeight.toFixed(0)-44 + 'px';
	    var mapOptions = {
	      zoom:12,
	      center: model.my.pos,
	      disableDefaultUI: true
	    };

	    wMap = new google.maps.Map(wMapDiv, mapOptions);
	    model.getLocation(function(pos){wMap.setCenter(pos)});
	    // creates a marker that's beeing used for my position on the map.
	    var myLocation = new google.maps.Marker({
		    clickable: false,
		    icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                new google.maps.Size(22,22),
                new google.maps.Point(0,18),
                new google.maps.Point(11,11)),
		    shadow: null,
		    zIndex: 998,
		    map: wMap
		});
	    	// Sets my position as a marker on the map.
	   	var updateMyLocation = function(pos){
	    	myLocation.setPosition(pos);
	    }
	    // updates my position on the map every 0.2 seconds.
	    setInterval(function(){
	    	model.getLocation(updateMyLocation);
	    }, 200);
		// when the jQuery page is shown, we trigger a resize for the google map object so it renders correctly on screen.
		$(document).bind('pageshow',function(event, data){
			google.maps.event.trigger(wMap,'resize');
			wMap.setCenter(model.my.pos);
		});
	}

	var setMatePos = function(){
		// if we have no pending chat mate, the marker is deleted from the map.
		if(mateLocation != null || (mateLocation != null && model.mate.pos == null)){
			mateLocation.setMap(null);
			$("#waitingRoomFooter").hide("fast");
		}
		// if a chat mate is found, we add a red marker on that persons location on the map.
		if(model.mate.pos != null){
		    mateLocation = new google.maps.Marker({
			    clickable: false,
			    icon: {url: "http://simile.mit.edu/timeline/api/images/dark-red-circle.png",
			      // This marker is 20 pixels wide by 32 pixels tall.
			      size: new google.maps.Size(16, 16),
			      // The origin for this image is 0,0.
			      origin: new google.maps.Point(0,0),
			      // The anchor for this image is the base of the flagpole at 0,32.
			      anchor: new google.maps.Point(8, 8)
			    },
			    shadow: null,
			    zIndex: 999,
			    map: wMap
			});

			mateLocation.setPosition(model.mate.pos);
		}
	}
	// shows the request box on screen when a chat request is recieved.
	var requestPrompt = function(){
		var promptBox = new google.maps.InfoWindow({content:'<div><img src="'+model.mate.pic+'" class="profileThumb"/><p>' + model.mate.name + ' wants to chat with you!</p></div>'})
		promptBox.open(wMap,mateLocation);
		$("#waitingRoomFooter").show("fast");
		$("#mateName").hide("fast");
		window.navigator.vibrate(1000);
	}


	var updateMap = function(){
		initialize();
	}
	// functions that are called from 'Notify Observers' when this view needs to be updated.
	this.update = function(code){
		for (var msg in code){
			if("updateMatePos" === code[msg]){
				setMatePos();
			}else if("requestPrompt" === code[msg]){
				requestPrompt();
			}else if("renderMap" === code[msg]){
				updateMap();
			}else if("hideRequest" === code[msg]){
				$("#mateName").hide("fast");
			}else if("showRequest" === code[msg]){
				$("#mateName").show("fast");
			}
		}
	}

	model.addObserver(this);
	initialize();

	var waitingRoomViewCtrl = new WaitingRoomViewCtrl(this, model,shakeCtrl);
}
