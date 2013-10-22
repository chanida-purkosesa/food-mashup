var FoodMashup = (function() {
    var locations = [];

    var loadTemplate = function() {
        $('body').append('<div id="resultsTpl"></div>');
        $('#resultsTpl').load('results.html');
    };
    var setUserLocation = function() {
        $.getJSON('http://ip-api.com/json').then(function (data) {
            var city = data.city;
            var state = data.region;
            $('#searchLocation').val(city + ', ' + state);
        });
    };
    var submitSearchForm = function() {
        $('#searchForm').submit(function(e) {
            e.preventDefault();
            var searchTermElem = $('#searchTerm');
            var searchTerm = (searchTermElem.val() === '') ? 'restaurants' : searchTermElem.val();
            var searchLocation = $('#searchLocation').val();
            searchTerm = searchTerm.replace(/ /g, '+');
            searchLocation = searchLocation.replace(/ /g, '+');
            getYelpResults(searchTerm, searchLocation);
        });
    };
    var getYelpResults = function(searchTerm, searchLocation) {
        var auth = {
            consumerKey: 'wW_Yasb2TdMc4ba-yfO5mA',
            consumerSecret: 'AJ6P7iZGalWwyDD_w5-FfdtgXzg',
            accessToken: 'sJDg7mpYXYKdJLRINpmikCdy_g9_c8-w',
            accessTokenSecret: '8qDoGKh6waGNwROocM3ZenB-Ng8',
            serviceProvider: { 
                signatureMethod: "HMAC-SHA1"
            }
        };
        var accessor = {
            consumerSecret: auth.consumerSecret,
            tokenSecret: auth.accessTokenSecret
        };

        parameters = [];
        parameters.push(['term', searchTerm]);
        parameters.push(['location', searchLocation]);
        parameters.push(['offset', 10]);
        parameters.push(['limit', 6]);
        parameters.push(['category_filter', 'restaurants']);
        parameters.push(['callback', 'yelpCallback']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

        var message = { 
          action: 'http://api.yelp.com/v2/search',
          method: 'GET',
          parameters: parameters 
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)

        $.ajax({
            url: message.action,
            data: parameterMap,
            cache: true,
            dataType: 'jsonp',
            jsonpCallback : 'yelpCallback',
            success: function(data) {
                if (data.businesses.length !== 0) {
                    locations = [];
                    getGeocode(data);
                    $('#searchResultsMap').show();                    
                    if (typeof window.google === 'undefined' || typeof google.maps === 'undefined') {
                        $.getScript('http://maps.googleapis.com/maps/api/js?key=AIzaSyBwu1ysynoW9TdftIqqo8gtcmFcEAuqtCY&sensor=false&callback=initGoogleMap');
                    }                

                    var template = _.template($('#resultsTemplate').html(), {'resultSet': data});
                    $('#searchResult').html(template);
                    initInstagram();
                } else {
                    $('#searchResultsMap').hide();
                    var noResults = '<div class="business-noresults">Sorry, no results were found...</div>';
                    $('#searchResult').empty().append(noResults);
                }
            }
        });
    };
    getGeocode = function(data) {
        var place;

        $.each (data.businesses, function(index, value) {
            var name = data.businesses[index].name;
            var street = data.businesses[index].location.address;
            var city = data.businesses[index].location.city;
            var state = data.businesses[index].location.state_code;
            var address = street + ',' + city + ',' + state;
            address = address.replace(/ /g, '+');

            $.ajax({
                url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false',
                dataType: 'json',
                success: function(dataCoords) {
                    var lat = dataCoords.results[0].geometry.location.lat;
                    var lng = dataCoords.results[0].geometry.location.lng;
                    place = [name, lat, lng];
                    locations.push(place);

                    if (window.google && google.maps && locations.length === 6) {
                        initGoogleMap();
                    }
                }
            });
        });
    };
    initGoogleMap = function() {
        var mapOptions = {
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);
        setGoogleMarkers(map, locations);
    };
    setGoogleMarkers = function(map, locations) {
        var bounds = new google.maps.LatLngBounds();

        $.each(locations, function(index, value) {
            var place = locations[index];
            var placeCoords = new google.maps.LatLng(place[1], place[2]);
            var image = 'images/marker_white.png';

            var marker = new google.maps.Marker({
                position: placeCoords,
                map: map,
                title: place[0],
                icon: image
            });

            var markerContent = place[0];
            var infoWindow = new google.maps.InfoWindow({
                content: markerContent
            });

            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.open(map, marker);
            });

            bounds.extend(marker.position);
        });
        map.fitBounds(bounds);
    };
    initInstagram = function() {
        $('.business-photolink').click(function (e) {
            e.preventDefault();
            var businessElem = $(this).parents('.business').attr('id');
            var businessIndex = businessElem.replace(/business/, '');
            var locationsIndex = locations[businessIndex];

            $.ajax({
                url: 'https://api.instagram.com/v1/locations/514276/media/recent?&client_id=7452ffb5de05413685274176d55263d6',
                dataType: 'jsonp',
                success: function(jsonData) {
                    console.log (jsonData);
                    $.each (jsonData.data, function(index, value) {
                        var picture = '<img src=' + jsonData.data[index].images.standard_resolution.url + ' />';
                        console.log (picture);
                        $('#searchPhotos').append(picture);
                    });
                }
            });
        });
    };
    var init = function() {
        setUserLocation();
        submitSearchForm();
        loadTemplate();
    };
    return {
        init : function() {
            init();
        }
    }
})();

$(document).ready(function() {
    FoodMashup.init();
});