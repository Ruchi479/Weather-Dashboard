
//Global Variables
var city ="";
var searchInput = $("#search-input");
var searchBtn = $("#search-btn");
var clearButton = $('#clear-history');
var foreCast = $(".foreCast");
var currentDate = moment().format("MMMM Do YYYY");
var apiKey="87e739972e000c7762ddc089beba4fe9";
var cityArray=[];


//fetch function to call the  weatherInfo function and fetch method used
function getApi(inputValue){
    var queryUrl ='https://api.openweathermap.org/data/2.5/weather?q='+inputValue+'&appid=' +apiKey;

    fetch(queryUrl)
        .then(function (response){
            return response.json();
            
        })
        .then(function (data) {
            console.log(data)

            weatherInfo(data, inputValue);
           
            var city = inputValue.toUpperCase();
            cityArray = JSON.parse(localStorage.getItem("cityname")) || [];
            //console.log(cityArray);
            if(data && !cityArray.includes(city)){
                cityArray.push(city);
                localStorage.setItem("cityname", JSON.stringify(cityArray));
                listItems();
            }
    
        })
        // .catch(function(err){
        //     alert("No weather data for " + inputValue);
        // });
}

//search button event listener
searchBtn.on("click", function (event){
    event.preventDefault();
    inputValue = searchInput.val().trim();
    if (inputValue) {
        //calling current getApi function
        getApi(inputValue);
        //calling 5day forecast function
        displayForecast(inputValue);
        searchInput.val("");
    }
    else {
        alert("Please enter a City Name");
    }
});


//function to list the searched cities and append them to the web page
function listItems(){
    var cityStored = $('<li>').addClass('list-group-item').text(inputValue);
    $(".list").append(cityStored);
}

//display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    var liEl =event.target;
    if(event.target.matches("li")){
        inputValue = liEl.textContent.trim();
        getApi(inputValue);
        displayForecast(inputValue);
    }
}

//clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();
}

//click handlers
$(document).on("click",invokePastSearch);
$("#clear-history").on("click",clearHistory);

//function to display current weather information
function weatherInfo(data, inputValue) {
    //empties the search bar
    $('.temp').empty();
    $('.wind').empty();
    $('.humidity').empty();
    $('.date').empty();
    $('.uvcolor').empty();


    $('.date').append('(' + currentDate + ')'  +' ');
    $('.date').append(data.name);
    var icon ="http://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
    
    var temp =  data.main.temp;
    var tempC = Math.floor(temp- 273.15);
    var weather = data.weather[0].main;
    var windSpeed = "Wind:" + data.wind.speed;
    var humidity = "Humidity:" + data.main.humidity;

    //appending the data to current wearther information
    $('.icon').attr("src", icon);
    $('.icon').append(' ' + weather);
    $('.temp').append( "Temperature: "  + tempC +"&deg;C");
    $('.wind').append(' ' + windSpeed + ' ' +'MPH');
    $('.humidity').append(' ' +humidity + ' ' + '%');
    uvIndex(data.coord.lon, data.coord.lat);
   
}

//function UVIndex
function uvIndex(lon, lat){
    console.log(lon, lat);
    var requestUrlUV ="https://api.openweathermap.org/data/2.5/uvi?lat=" + lat+ "&lon=" +lon + "&appid=" + apiKey;
    fetch(requestUrlUV)
        .then(function (response){
            return response.json();
        })
        .then(function (data){
            var uV = data.value;
            console.log(uV);
            if(uV >= 0 && uV <= 2){
                $('#uv-container').css("background-color", "green").css("color", "white");
            }else if(uV >= 3 && uV <= 5){
                $('#uv-container').css("background-color", "yellow").css("color", "black");
            } else if(uV >= 6 && uV <= 7){
                $('#uv-container').css("background-color", "orange").css("color", "black");
            } else if(uV >= 8 && uV <= 10){
                $('#uv-container').css("background-color", "red").css("color", "white");
            }
            $("#uv-title").text("UV Index: ");
            $("#uv-container").append(uV);
        });
};

//function to  get the 5day forecast
function displayForecast(inputValue){
    $('#forecast').empty();
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" +inputValue+ "&appid=" +apiKey;

    fetch(queryforcastURL)
        .then(function (response){
            return response.json();
        })
        .then(function(fivedayResponse){
            console.log(fivedayResponse);
            //loop
            for(var i=0; i!=fivedayResponse.list.length; i+=8){

                //var date1 = moment().format("MMMM Do YYYY");
                var date1 = fivedayResponse.list[i].dt_txt;
                var date2 = date1.substring(0, 10);
                var icon1 ="http://openweathermap.org/img/wn/" + fivedayResponse.list[i].weather[0].icon + ".png";    
                var temp1 = fivedayResponse.list[i].main.temp;
                var tempC1 = Math.floor(temp1- 273.15);
                var windSpeed1 = fivedayResponse.list[i].wind.speed;
                var humidity1 = fivedayResponse.list[i].main.humidity;

                //calling forecastCard
                forecastCard( date2, icon1, tempC1, windSpeed1, humidity1);

                //border border-primary
                $("#currentCity").addClass("border border-primary");
            }
        });
}

//function that passes the data in the object variable and adds class for the cards and information lines
function forecastCard(date2, icon1, tempC1, windSpeed1, humidity1){
    var card = $("<div>").addClass("card col-md-2 ml-4 bg-primary text-white");
    var cardBody = $("<div>").addClass("card-body p-3 forecastBody ml-3");
    var cityDate = $("<h4>").addClass("card-title");
    var temperature = $("<p>").addClass("card-text forecastTemp");
    var wind = $("<p>").addClass("card-text forecastWind");
    var humidityField = $("<span>").addClass("card-text forecastHumidity");
    var image =$("<img>").addClass('weather-icon');

    //appending the forecast data to the page
    $("#forecast").append(card);
    card.append(cardBody);
    cityDate.text(date2);
    //cityDate.text(date1);
    image.attr('src', icon1);
    temperature.text('Temp: ' +tempC1 +  '°C' );
    wind.text('Wind: ' + windSpeed1 +  ' MPH' );
    humidityField.text('Humidity: ' +humidity1+ '%');
    cardBody.append(cityDate, image, temperature, wind, humidityField)

    //forecast title
    $("#forecastTitle").text("5-Day Forecast: ");
}

function loadlastCity(){
    var previouscities = JSON.parse(localStorage.getItem("cityname")) || [];

    for(i=0; i<previouscities.length; i++){
        var city = $("<li>").addClass("list-group-item").text(previouscities[i]);
        $(".list").append(city);
    }
}

$(window).on("load",loadlastCity());
