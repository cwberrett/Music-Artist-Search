var tablist = [];
var off = 0;

//gets tabs and buttons and assigns onclick events to change the tabs and make api calls
function getContents() {
    tablist = $("#tabs").children();
    $("#tabs > li").on('click', 'a', changeTab);
    $(".tabContent").first().show();

}

function clearContent(id) {
	$(id+ " .results ul").empty();
    $(".rowData").hide();
    $(".results").hide();
    $(id).find(".list1").empty();
    $(id).find(".list2").empty();
}

function changeTab() {
    $(".tabContent").hide();
    var sel = $(this).attr('href');
    $(sel).show();
    $("#tabs > li a").removeClass('selected');
    $(this).addClass("selected");
}

function callArt() {
    $.getJSON('https://api.spotify.com/v1/search', {
        "q": $("#artQuery").val(),
        "type": "artist",
        "limit": 10,
        "offset": off
    }, function(data) {
        displayArtistResults(data.artists.items, "#artist");
        console.log(data.artists.items);
    });
}

function displayArtistResults(artists, id) {
    $("#album, #song").hide();
    $("#artist .results").show();
    var i = 0;
    $.each(artists, function(index, artist) {
        var entry = "<li id='" + artist.id + "''>" + artist.name + "</li>";
        $(id + " .results ul").append(entry);
    });
    $("#artist ul").off('click').on('click', 'li', getArtist);
}

function getArtist() {
    var artist = new Object();
    var id = $(this).attr('id');
    $.when(
        $.getJSON('https://api.spotify.com/v1/artists/' + id, function(data) {
            artist.person = data;
        }),
        $.getJSON('https://api.spotify.com/v1/artists/' + id + '/top-tracks?country=US', function(trackList) {
            artist.topTracks = trackList.tracks;
        }),
        $.getJSON('https://api.spotify.com/v1/artists/' + id + '/albums?limit=10', function(albums) {
            artist.albums = albums.items;
        })
    ).then(function() {

        displayArtist(artist);

    });
}

function displayArtist(artist) {
    $("#artist .results").hide();
    $("#artist .rowData").show();
    $("#artist .rowData .column img").attr('src', artist.person.images[0].url);
    $("#artName").text(artist.person.name);
    var entry;
    for (var track in artist.topTracks) {
        entry = "<li>" + artist.topTracks[track].name + "</li>";
        $("#artist").find(".list2").append(entry);
    }
    for (var album in artist.albums) {
        entry = "<li>" + artist.albums[album].name + "</li>";
        $("#artist").find(".list1").append(entry);
    // }
    // $("#list1").parent().append("<button id='nextAlbs'>Next")
}
//get the contents and
$(document).ready(function() {
    $(".tabContent").hide();
    $(".rowData").hide();
    $(".results").hide();

    getContents();

    $("#searchArt").click(function() {
        clearContent('#artist');
        callArt();
    });

});