var FoodMashup = (function() {
    var getUserLocation = function() {
        $.getJSON('http://ip-api.com/json', function(data) {
            $('#searchLocation').val(data.city + ', ' + data.regionName);
        });
    }
    var init = function() {
        getUserLocation();
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