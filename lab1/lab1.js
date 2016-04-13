function styleBtn(text){
    var controlUI = document.createElement('div');
    controlUI.style.display = 'inline-block';
    controlUI.style.backgroundColor = '#eee';
    controlUI.style.border = '2px solid #eee';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.margin = '0 5px 22px 0';
    controlUI.style.textAlign = 'center';
    controlUI.style.width = "6em";

    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '72px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = text;
    controlUI.appendChild(controlText);

    return controlUI;
}

function PanControl(map, x, y, direction) {
    var controlUI = document.createElement('div');
    var img = document.createElement('img');
    img.src ="img/chevron_" + direction + ".png";
    controlUI.appendChild(img);

    controlUI.addEventListener("click", function(){
        map.panBy(x,y);
    });
    return controlUI;
}

function ZoomControl(map, scale, ctrlText) {
    controlUI = styleBtn(ctrlText);
    google.maps.event.addDomListener(controlUI, 'click', function() {
        map.setZoom(map.zoom + scale);
    });
    return controlUI;
}

function CenterMe(map){
    var centerUI = document.createElement('select');
    centerUI.id = "goto";

    var centerMe = document.createElement('option');
    centerMe.value = -1;

    var textNode = document.createTextNode('My Location');
    centerMe.appendChild(textNode);
    centerUI.appendChild(centerMe);

    google.maps.event.addDomListener(centerUI, 'change', function(event){
        console.log(event);

        if(event.srcElement.value == -1 || event.target.value == -1){
            navigator.geolocation.getCurrentPosition(function(location){
                console.log(location);
                map.setCenter({lat:location.coords.latitude,lng:location.coords.longitude});
            }, 
            function(location){
                console.log(location);
                console.log("failed");
            });
        }
        else{
            var lat = markerlist[event.srcElement.value].position.lat();
            var lng = markerlist[event.srcElement.value].position.lng();
            map.setCenter({lat: lat, lng: lng});
        }
    });
    centerUI.style.width = "14.5em";
    centerUI.style.marginTop = "57px";
    centerUI.firstChild.style.fontSize = "24px";
    return centerUI;
}

function addLocationOption(markerObj,text){
    markerlist.push(markerObj);
    var select = document.getElementById("goto");
    var option = document.createElement('option');
    option.value = markerlist.length - 1;
    var textNode = document.createTextNode(text);
    option.appendChild(textNode);
    select.appendChild(option);
}

function initialize() {
    var mapOptions = {
        center: { lat: 59.347480, lng: 18.073529},
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        tilt: 45,
        disableDefaultUI: true,
        disableDoubleClickZoom: true
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var panLeftControl = new PanControl(map, -100, 0, 'left');
    var panRightControl = new PanControl(map, 100, 0,'right');
    var panUpControl = new PanControl(map, 0,-100, 'up');
    var panDownControl = new PanControl(map, 0,100, 'down');
    var zoomOutControl = new ZoomControl(map, -1, '-');
    var zoomInControl = new ZoomControl(map, 1, '+');
    var centerControl = new CenterMe(map);

    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(panLeftControl);
    map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(panRightControl);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(panUpControl);

    zoomOutControl.style.float = "left";
    panDownControl.style.position = "absolute";
    panDownControl.style.left = "45%";
    zoomInControl.style.float = "right";
    
    var bottomControl = document.createElement('div');
    bottomControl.style.width = "100%";
    bottomControl.appendChild(zoomOutControl);
    bottomControl.appendChild(panDownControl);
    bottomControl.appendChild(centerControl);
    bottomControl.appendChild(zoomInControl);
    // bottomControl.style.clear = "both";

    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(bottomControl);

    var Dhuset = new google.maps.Marker({
        draggable: true,
        animation: google.maps.Animation.BOUNCE,
        position: { lat: 59.347480, lng: 18.074929},
        map: map
    });

    var Ehuset = new google.maps.Marker({
        draggable: false,
        animation: google.maps.Animation.DROP,
        position: { lat: 59.347480, lng: 18.072929},
        map: map
    });

    var contentString = '<div id="content">'+
    '<h1 id="firstHeading" class="firstHeading">E-huset</h1>'+
    '<div id="bodyContent">'+
    '<p><b>Huset</b>, also referred to as <b>E</b>, is a large ' +
    'tegel rock formation in the southern part of the '+
    'Campus, central KTH.</p>'+
    '</div>'+
    '</div>';

    var infoE = new google.maps.InfoWindow({
        content: contentString
    });

    google.maps.event.addListener(Ehuset, 'click', function() {
        infoE.open(map,Ehuset);
        console.log(Ehuset);
    });

    activeMarker = true;
    markerlist = [];

    google.maps.event.addListener(map, 'dblclick', function(event) {
        if (activeMarker === true){
            activeMarker = false;

            var marker = new google.maps.Marker({
                draggable: true,
                animation: google.maps.Animation.DROP,
                position: {lat : event.latLng.lat(), lng: event.latLng.lng()},
                map: map
            });

            var activeInfo = new google.maps.InfoWindow({
                content : '<div><input id="mHead" type="textfield" class="firstHeading" placeholder="Location name"></input><textarea id="mBody" placeholder="Location information"></textarea><button id="btnCancelMarker">Cancel</button><button id="btnAppendMarker">Confirm</button></div>'
            });

            activeInfo.open(map,marker);
            var submit = document.getElementById("btnAppendMarker");

            google.maps.event.addDomListener(submit, 'click', function(){
                appendMarker(map, marker, activeInfo);
            });

            var cancel = document.getElementById("btnCancelMarker");

            google.maps.event.addDomListener(cancel, 'click', function(){
                marker.setTimeoutMap(null);
                activeInfo.close();
                activeMarker = true;
            });
        }
    });
}

function appendMarker(map,marker,activeInfo){
    marker.draggable = false;

    var mHead = document.getElementById("mHead").value;
    var mBody = document.getElementById("mBody").value;

    activeInfo.close();

    var content = '<div id="content">'+
    '<h1 id="firstHeading" class="firstHeading">' + mHead + '</h1>'+
    '<div id="bodyContent">'+
    '<p>' + mBody + '</p>'+
    '</div></div>';

    var markerInfo = new google.maps.InfoWindow({
        content: content
    });

    google.maps.event.addListener(marker, 'click', function() {
        markerInfo.open(map,marker);
    });

    markerInfo.open(map,marker);
    addLocationOption(marker, mHead);
    activeMarker = true;
}

function startup(){
    if (!window.navigator.standalone) { // fullscreen mode
        // document.getElementById("install").style.display = "block";
        // document.getElementById("map-canvas").style.display = "none";
        initialize();
    }
    else{
        initialize();
    }
}

google.maps.event.addDomListener(window, 'load', startup);
