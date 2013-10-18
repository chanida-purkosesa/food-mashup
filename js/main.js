var FoodMashup = (function() {
    var getLocation = function() {
        $.getJSON('http://ip-api.com/json', function(data) {
            console.log ('City: ' + data.city + ', State: ' + data.regionName);
        });
    }
    var init = function() {
        getLocation();
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