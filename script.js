$(document).ready(function(){
  
  var fromStation = "";
  var toStation = "";
  var reqUrl = "";
  
  
  $('#journey').submit(function(){
    var f = $('#from').val();
    var t = $('#to').val();
    
    fromStation = f.substr(1,3);
    toStation = t.substr(1,3);
    reqUrl = 'https://transportapi.com/v3/uk/train/station/'+ fromStation +'/live.json?app_id=a1acf67a&app_key=db87522fa24bd4826bc9de1a652fa739&darwin=false&destination='+toStation+'&to_offset=PT23:00:00&train_status=passenger';
    console.log(fromStation + " " + toStation +" "+ reqUrl);
    
     $.ajax({
    url: reqUrl,
    type: 'GET',
    dataType: 'json',
    success: function(data){
      var item = data.departures.all;
      var count = 0;
      
      $('#title').html("<h2>Showing trains from " + data.station_name);
      $.each(item, function() {
        var startTime = item[count].aimed_departure_time;
        var endTime = item[count].expected_departure_time;
        var d = new Date();
        var date = d.getFullYear() + '-' + ( d.getMonth() + 1 ) + '-' + d.getDate();
        var st = new Date(date + " " + startTime);                
        var et = new Date(date + " " + endTime);
        var db = et - st;
        
        var cstr = "";
        var delayedBy = timeToMins(db);
        
        
        var op1 = "";
        var op2 = "";
        var minDelay = 0;
  
        var operatorName = "";
        var website = "";
        
        function timeToMins(millis) {
          var minutes = Math.floor(millis / 60000);

           return minutes;
        };
        
        var status = item[count].status;
        op1 = item[count].operator;
         
          
        
          if(item[count].status == 'LATE'){
            
            $.ajax({
         url: "delayrepayapi.json",
         type: 'GET',
         success: function(data){
           var x = 0;
           var it = data.operators.all;
           
          
           
           $.each(it, function(){
             //console.log(it[x].atoc_code + " op1:" + op1);
             if(op1 == it[x].atoc_code){
               op2 = it[x].atoc_code;
             minDelay = it[x].min_delay;
               operatorName = it[x].operator_name;
               website = it[x].delay_repay_link;
             };
             console.log("op1: " + op1 + " op2:" + op2 + " delay:" + minDelay + " name: " + operatorName);
             x++;
             
           })
         }
       })
            
            $('#trains').append("<h1> This train was due at "+ startTime + " and is delayed until "+ endTime + " and is "+delayedBy+" minutes late.<br> " + cstr +"</h1><br><p>This train is a " + operatorName + " service. You can claim compensation after being delayed " + minDelay + " minutes. The website to make a claim is " + website);
        };
        count++;  
        
  }); 
    }
  });
    
     
    
    return false;
  });
  
  
  
  var stations = [];
  var c = 0;
  $.ajax({
    url: 'https://huxley.apphb.com/crs',
    type: 'GET',
    success: function(data){
      $.each(data, function(){
        stations.push("[" + data[c].crsCode + "] "+data[c].stationName );
        c++;
      })
      
    }
  })
  
  $('#from').autocomplete({
    source: stations
  });
  
   $('#to').autocomplete({
    source: stations
  });
})