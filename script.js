$(function(){
  var map, info_window; 
  var TwitterSearch = function(query){
    var page = 1
      , rpp = 100;
    this.initial_fetch = function(callback){
      next(function(res){
        callback(res);
      });
    }
    function next(callback){
      $.getJSON("http://search.twitter.com/search.json?callback=?", {
        q: query,
        rpp: rpp,
        geocode: "37.0625,-95.677068,5000mi",
        page: page
      }, function(res){
        console.log(res);
        if("error" in res){
          $(".progress").remove();
          location.hash = "map";
          return;
        }
        since_id = res.max_id_str;  
        if(res.results.length !== 0){
          page++;
          $(".bar").css("width", ""+(Math.min(page, 20-1)*5 + Math.min(Math.sqrt(page), 5))+"%");
          setTimeout(function(){
            next(callback);
          }, 2000);
        }
        callback(res);
      });
    }
  }

  $("#map").height($(window).height());
  map = new google.maps.Map(document.getElementById("map"), {
    center: new google.maps.LatLng(39.828175, -98.5795),
    zoom: 4,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  })
  google.maps.event.addListener(map, "click", function(){
    info_window.close();
  });
  info_window = new google.maps.InfoWindow();
  info_window.setMap(map);

  var ts = new TwitterSearch("#spellingbee");
  ts.initial_fetch(function(res){
    $.each(res.results, function(index, tweet){
      if(!tweet.geo) return;

      var icon = new google.maps.MarkerImage(tweet.profile_image_url, null, null, null, new google.maps.Size(25, 25))
        , position = new google.maps.LatLng(tweet.geo.coordinates[0], tweet.geo.coordinates[1])
        , marker = new google.maps.Marker({ position: position, icon: icon, map: map });

      google.maps.event.addListener(marker, "click", function() {
        console.log(tweet);
        info_window.setContent(tofu("<p class='tweet'><span class='user'>@{ from_user }</span>: <a href='http://twitter.com/{ from_user }/status/{ id_str }'>{ text }</a></p>", tweet));
        info_window.setPosition(position);
        info_window.open(map);
      });
    });
  });

  function tofu(a,c){return a.replace(/{ *([^} ]+) *}/g,function(b,a){b=c;a.replace(/[^.]+/g,function(a){b=b[a]});return b})}
});
