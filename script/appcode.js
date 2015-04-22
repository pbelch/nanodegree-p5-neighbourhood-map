"use strict";

var location_list;
var map;

function Location(name, lat, lng) {
    var self = this;
    //Load selected location
    self.name = name;
    //Change CSS class to active for selected
    self.isActive = ko.observable(false);
    //Set map marker
    self.marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        title: name
    });
    google.maps.event.addListener(self.marker, 'click', function () {
        // Deactivate all list items
        for (var i = 0; i < location_list.length; i++) {
            location_list[i].isActive(false);
        }

        // get info from Foursquare API
        FoursquareAPI(self.marker.getPosition().lat(),
            self.marker.getPosition().lng(), this);
        self.isActive(true);
    });


    function FoursquareAPI(lat, lng) {
        var FoursquareURL = "https://api.foursquare.com/v2/venues/search?";
        //Paramaters to pass
        var param = {
            v: "20150415",
            limit: 1,
            client_id: "AYBBHYWPWGS2UYPQTRUTBEPUGS5HYH2EFRENPGQ25HB1V4Q3",
            client_secret: "BBPZ2MITTB15KML0BPQVV11OLCTCNZUGGIIFUXAP2MLTROEI",
            ll: lat + ',' + lng
        };

        $.getJSON(FoursquareURL, param, function (json) {
                //Populate response variables for display
                var venue = json.response.venues[0];
                var placename = name;
                var currently_here = venue.hereNow.count;
                var address = venue.location.address;

                // string to load text into popup boxes
                var loadstring = '<h4>' + placename + '</h4>';

                //Add check if is not null to get around displaying of 'undefined' if null
                if (address) {
                    loadstring += address;
                }
                loadstring += '<br/>(' + currently_here + ' Currently Here)';


                infowindow.setContent(loadstring);
                infowindow.open(map, self.marker);
            })
            // Display error message should something odd happen
            .error(function (jqXHR, textStatus, errorThrown) {
                infowindow.setContent('Doh! We cant seem to find this place, Are you sure your not dreaming right now?');
                infowindow.open(map, self.marker);
            });
    }
}

//Setting if initial screen and setting of viewmodel
function SetViewModel() {
    var self = this;
    self.filterText = ko.observable('');
    //Location objects
    location_list = [
        new Location("Candy Cafe", 51.511950003591615, -0.13120831728771742),
        new Location("Chaboba Bubble Tea", 51.541424143038505, -0.14574050903320312),
        new Location("Boba Jam", 51.512396281082346, -0.1312334354499239),
        new Location("Bubbleology", 51.511943, -0.133619),
        new Location("Milk Tea & Pearl", 51.517001, -0.142089),
        new Location("Aobaba", 51.491311, -0.097767),
        new Location("Chatime", 51.513566, -0.129922),
        new Location("Lakwatsa", 51.515711, -0.205514),
        new Location("BoBoQ", 51.512234, -0.128738),
        new Location("Cuppacha", 51.511878, -0.129037),
    ];
    //Knockout sets
    self.key_favorites = ko.observableArray(location_list);
    self.search_fav = ko.computed(function () {
        var filter = self.filterText().toLowerCase();
        // close infowindow, deactivate all list
        infowindow.close();
        ko.utils.arrayForEach(self.key_favorites(), function (item) {
            item.isActive(false);
        });

        if (!filter) {
            // Default show all when loading page
            ko.utils.arrayForEach(self.key_favorites(), function (item) {
                item.marker.setVisible(true);
            });
            return self.key_favorites();
        } else {
            // When there is text in the search field perform search filter
            return ko.utils.arrayFilter(self.key_favorites(), function (item) {
                if (item.name.toLowerCase().indexOf(filter) !== -1) {
                    item.marker.setVisible(true);
                    return true;
                } else {
                    item.marker.setVisible(false);
                    return false;
                }
            });
        }
    }, self);


    self.locationSelected = function () {
        //Trigger map point driven select
        google.maps.event.trigger(this.marker, 'click');
        for (var i = 0; i < self.key_favorites().length; i++) {
            var loc = self.key_favorites()[i];
            loc.isActive(false);
        }
        this.isActive(!this.isActive());
    };
}

function LoadPage() {
    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(51.511846, -0.131357),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: false,
        mapTypeControl: false,
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    ko.applyBindings(new SetViewModel());
}

var infowindow = new google.maps.InfoWindow();
google.maps.event.addListener(infowindow, 'closeclick', function () {
    // deactivate all list item
    for (var i = 0; i < location_list.length; i++) {
        location_list[i].isActive(false);
    }
});

google.maps.event.addDomListener(window, 'load', LoadPage);