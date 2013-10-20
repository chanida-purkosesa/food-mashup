var FoodMashup = (function() {
    var loadTemplate = function() {
        $('body').append('<div id="resultsTpl"></div>');
        $('#resultsTpl').load('results.html');
    };
    var getUserLocation = function() {
        $.getJSON('http://ip-api.com/json', function(data) {
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
            getYelpHighestRated(searchTerm, searchLocation);
        });
    };
    var getYelpHighestRated = function(searchTerm, searchLocation) {
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
        parameters.push(['offset', 5]);
        parameters.push(['limit', 5]);
        parameters.push(['sort', 2]);
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
        //console.log(parameterMap);

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
            }
        });
    };
    var init = function() {
        getUserLocation();
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