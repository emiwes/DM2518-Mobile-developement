var ChatView = function(container, model){
  // initiate variables
  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();
  var dMap;
  this.shrinkMap = $('#closeMap');
  this.expandMap = $('#map-directions');
  this.txtChat = $('#txtChat');
  this.btnChat = $('#btnChat');
  this.btnLeave = $('#btnLeaveChat');
  this.chatFooter = $('#chatFooter');

  model.addObserver(this);

  var initialize = function () {
    // creates map element and adds it to the DOM. We display the route to the other chat mate aswell.
    console.log("Initializing google maps");
    var mapOptions = {
      zoom:2,
      center: model.my.pos,
      disableDefaultUI: true
    };
    var mapDiv = document.getElementById("map-directions");
    var chatOutput = document.getElementById("chatOutput");
    dMap = new google.maps.Map(mapDiv, mapOptions);
    directionsDisplay = new google.maps.DirectionsRenderer();
    newControl(dMap,'');
    mapDiv.style.height = (window.innerHeight*0.17).toFixed(0) + 'px'; // avrundar till 0 decimaler pga. intern avrunding annars.
    chatOutput.style.height = (window.innerHeight*0.83).toFixed(0) - 44.375 - 106 + 'px'; // 44.375 är höjden på headern i iPhone 5.

    directionsDisplay.setMap(dMap);
    $(document).bind('pageshow',function(event, data){
      google.maps.event.trigger(dMap,'resize');
      calcRoute();
    });
  }

  this.mapExpand = function(){
    //checks current size of map and if it is small it makes it to he bigger size. and hides the chat.  
    // kollar ifall kartan är liten, om så, ändrar storlek till stor. Visar Stäng Karta knapp och gömmer chatten.
    var map = $('#map-directions');
    var smallMapHeight = (window.innerHeight*0.17).toFixed(0) + 'px';
    var bigMapHeight = (window.innerHeight).toFixed(0)-44.375+ 'px'; // 44.375 är höjden på headern i iPhone 5.

    if(map.css('height') == smallMapHeight){
      console.log("Expanding map");
      map.animate({height : bigMapHeight},200,'swing',function(){ // när animationen är klar, gör detta:
        $('#chatDiv').hide();
        $('#closeMap').show();
        calcRoute();
        google.maps.event.trigger(dMap, 'resize'); //uppdaterar rendrering på kartan. Resizar kartan för fönsterstorleken.
      });
    }
  }

  this.mapShrink = function(){
    // changes size on map to small(if big) and hides close map button and shows the chat.
    // Ändrar kartstorlek till liten. Gömmer Stäng Karta knapp och visar chatten.
    console.log("Shrinks map");
    var map = $('#map-directions');
    var smallMapHeight = (window.innerHeight*0.17).toFixed(0) + 'px';

    map.animate({height : smallMapHeight},200,'swing',function(){
      $('#closeMap').hide();
      calcRoute();
      google.maps.event.trigger(dMap, 'resize');
    });
    $('#chatDiv').show();
  }

  var calcRoute = function() {
    //makes a call to get directions and displys it n map.
    if(model.my.pos && model.mate.pos){
      var request = {
          origin:model.my.pos,
          destination:model.mate.pos,
          travelMode: google.maps.TravelMode.WALKING
      };
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
          document.getElementById("durationTime").innerHTML = response.routes[0].legs[0].duration.text;
        }else if(status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT){
          alert("API anrop slut!");
        };
      });
    }
  };

  var newControl = function(map, text) { //Funktion för diverse kontrollknappar.
    //Used to add icon and text with expected walkingtime to the chat partner.

    // Set CSS for the control border
    var controlDiv = document.createElement('div');
    controlDiv.id="durationDiv"

    // Set CSS for the control interior
    var controlText = document.createElement('div');
    controlText.id= "durationTime";

    var img = document.createElement('img');
    img.id="durationImg";
    img.src ="https://cdn0.iconfinder.com/data/icons/education-15/500/Student-512.png";
    img.width = "20px";
    controlDiv.appendChild(img);

    controlText.innerHTML = text;
    controlDiv.appendChild(controlText);

    google.maps.event.addDomListener(controlDiv);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);

  }

  var enterChat = function(){
    //Sets up the chat and subscribes to the right channel with the crrect responses on sent and recived msgs.
    var output = $("#chatOutput");
    model.pubnub.subscribe({
      'channel'   : model.activeChannels[0],
      'callback'  : function(msg) {
          if (msg.sender.id === model.my.id){
            var user = "Me";
            var msgType = "myMsg";
          }else{
            var user = msg.sender.name;
            var msgType = "theirMsg";
            window.navigator.vibrate(1000);
          }
        output.html(output.html() + '<div class="'+msgType+'"><b>' + user +"</b> (" + msg.timestamp + "):<br/>" + msg.content + '</div>');
        output.animate({scrollTop: output[0].scrollHeight - output.height()}, 500);
        //chatViewCtrl.refreshController();
      },
      presence: function(m){
        //join och leave messages
        if(m.action == "leave"){
          output.html(output.html() + '<div class=\'infoMsg\'>' + model.mate.name + ' has left the chat</div>');
          output.animate({scrollTop: output[0].scrollHeight - output.height()}, 500);
          model.mate = {id : null, pos : null, name : null};
          model.notifyObservers("updateMatePos");
        }else if(m.action == "join" && m.uuid != model.my.id){
          output.html(output.html() + '<div class=\'infoMsg\'>' + model.mate.name + ' has joined the chat</div>');
          output.animate({scrollTop: output[0].scrollHeight - output.height()}, 500);
        }
        console.log(m);
        //chatViewCtrl.refreshController();
      }
    });
    initialize();
  }

  this.update = function(code){
    for (var msg in code){
      if("enterChat" === code[msg]){
        console.log('update enterChat')
        enterChat();
      }
    }
  }

  var chatViewCtrl = new ChatViewCtrl(this, model);
}
