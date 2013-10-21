var FoodMashup = (function() {
    var getUserLocation = $.getJSON('http://ip-api.com/json');

    var loadTemplate = function() {
        $('body').append('<div id="resultsTpl"></div>');
        $('#resultsTpl').load('results.html');
    };
    var setUserLocation = function() {
        getUserLocation.then(function (data) {
            var city = data.city;
            var state = data.region;
            $('#searchLocation').val(city + ', ' + state);
        });
    };
    var submitSearchForm = function() {
        $('#searchForm').submit(function(e) {
            e.preventDefault();
            var searchTerm = $('#searchTerm').val();
            var searchLocation = $('#searchLocation').val();
            searchLocation = searchLocation.substr(0, searchLocation.indexOf(','));
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
        parameters.push(['category_filter', 'food,restaurants']);
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
                var template = _.template($('#resultsTemplate').html(), {'resultSet': data});
                $('#searchResult').html(template);
                console.log (data);
                $('#searchResultsMap').show();
                $.getScript('http://maps.googleapis.com/maps/api/js?key=AIzaSyBwu1ysynoW9TdftIqqo8gtcmFcEAuqtCY&sensor=false&callback=getGoogleMap');
            }
        });
    };
    getGoogleMap = function() {
        getUserLocation.then(function (data) {
            var lat = data.lat;
            var lon = data.lon;
            
            var mapOptions = {
                center: new google.maps.LatLng(lat, lon),
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("mapCanvas"), mapOptions);
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