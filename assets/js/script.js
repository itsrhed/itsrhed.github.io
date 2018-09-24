       /**
        * @constructor
       */
      function AutocompleteDirectionsHandler(map) {
        this.map = map;
        this.originPlaceId = null;
        this.destinationPlaceId = null;
        this.travelMode = 'WALKING';
        var originInput = document.getElementById('origin-input');
        var destinationInput = document.getElementById('destination-input');
        var modeSelector = document.getElementById('mode-selector');
        this.directionsService = new google.maps.DirectionsService;
        this.directionsDisplay = new google.maps.DirectionsRenderer;
        this.directionsDisplay.setMap(map);

         var options = {
          types: [],
          componentRestrictions: {country: "ph"},
          placeIdOnly: true
         };

        var originAutocomplete = new google.maps.places.Autocomplete(
            originInput, options);
        var destinationAutocomplete = new google.maps.places.Autocomplete(
            destinationInput, options);

        this.setupClickListener('changemode-walking', 'WALKING');
        this.setupClickListener('changemode-transit', 'TRANSIT');
        this.setupClickListener('changemode-driving', 'DRIVING');

        this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
        this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

        // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
        // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
        // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
      }

      // Sets a listener on a radio button to change the filter type on Places
      // Autocomplete.
      AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
        var radioButton = document.getElementById(id);
        var me = this;
        radioButton.addEventListener('click', function() {
          me.travelMode = mode;
          me.route();
        });
      };

      AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
        var me = this;
        autocomplete.bindTo('bounds', this.map);
        autocomplete.addListener('place_changed', function() {
          var place = autocomplete.getPlace();
          if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
          }
          if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
          } else {
            me.destinationPlaceId = place.place_id;
          }
          me.route();
        });

      };

      AutocompleteDirectionsHandler.prototype.route = function() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
          return;
        }
        var me = this;

        this.directionsService.route({
          origin: {'placeId': this.originPlaceId},
          destination: {'placeId': this.destinationPlaceId},
          travelMode: this.travelMode
        }, function(response, status) {
          if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      };

       $('.ui.sidebar').sidebar({
         dimPage: false,
          closable: false,
         context: $('.bottom.segment')
       })
           .sidebar('attach events', '.menu .item');

           var placesList = $('div.placeList');

          function searchVenue(LatLang, name, limit, placeId){
            $.ajax({
              type: "GET",
              dataType: "jsonp",
              cache: false,
              url: 'https://api.foursquare.com/v2/venues/search?ll='+LatLang+'&name='+name+'&intent=%27match%27&limit='+limit+'&oauth_token=SEDEULG4BHJCIHRMH55HK0WIEDD2ZENRJG0MYYEHOBL3PVNQ&v=20180823',
              success: function(data){
                var venues = data.response.venues;
                $.each(venues, function(i,venue){

                  var service = new google.maps.places.PlacesService(map);
                  var address;
                  var name = venue.name;
                  var phone;
                  var rating;
                  var opening_hours;
                  var visits = venue.stats.checkinsCount;
                  var rec_visits = venue.stats.usersCount;
                  var tips = venue.stats.tipCount;

                  var color;
                  service.getDetails({
                    placeId: placeId
                  }, function(place, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        address = place.formatted_address;
                        phone = place.formatted_phone_number;
                        rating = place.rating;

                        if(rating < 4 && rating >= 2){
                          color = 'yellow';
                        }else if(rating >= 4){
                          color = 'teal';
                        }else if(rating < 2){
                          color = 'red';
                        }

                        var li = '<div class="ui item styled fluid accordion"><div class="title"><i class="dropdown icon"></i>' + name + ' <div class="ui label '+color+'"><i class="star icon"></i>'+rating+'</div></div>'+
                        '<div class="content">'+
                        '<p><i class="building icon"></i> '+address+'</p>'+
                        '<p><i class="phone icon"></i> '+phone+'</p>'+
                        '<p><div class="ui label"><i class="users icon"></i> '+visits+'</div></p>'+
                        '<button data-name="'+name+'" data-visits="'+rec_visits+'" data-tips="'+tips+'" data-checkins="'+visits+'" onclick="return showStatsModal(this);" class="ui button yellow stats_btn" type="button">View Statistics</button></div></div>';
                          placesList.append(li);
                          $('.ui.accordion').accordion();
                    }
                  });

                });
              }
            });
          }

          showStatsModal = function(element) {
            google.charts.load("current", {packages:["corechart"]});
             google.charts.setOnLoadCallback(drawChart);
             function drawChart() {
               var data = google.visualization.arrayToDataTable([
                 ['Statistics', 'Counts',],
                 ['Check-ins', $(element).data('checkins')],
                 ['Recent Visitors', $(element).data('visits')],
                 ['Tip Counts',  $(element).data('tips')],
               ]);

               var options = {
                 title: 'Tips, Check-ins and Recent Visits',
                 chartArea: {width: '50%'},
                 hAxis: {
                   title: 'Total Counts',
                   minValue: 0
                 },
                 vAxis: {
                   title: 'Statistics'
                 }
               };

               var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
               chart.draw(data, options);
             }

              $('.stats').modal('show');
              $('.stats').find('.header').html($(element).data('name'));
              $(".stats").modal({
                closable: true
              });
          }
