//Defines an object that will store all the data for the artist tab
//and has the methods to call for and display the data
var artObj = {
    albOffset: 0,
    id: "",
    getArtist: function() {
        var id = this.id;
        var call = $.getJSON('https://api.spotify.com/v1/artists/' + id);
        call.done(function(data) {
            artObj.person = data;
            var albCall = $.getJSON('https://api.spotify.com/v1/artists/' + id + '/albums?limit=10&offset=' + artObj.albOffset);
            albCall.done(function(data) {
                artObj.albums = data;
                var songCall = $.getJSON('https://api.spotify.com/v1/artists/' + id + '/top-tracks?country=US');
                songCall.done(function(data) {
                    artObj.topSongs = data;
                    artObj.displayArtist();
                });
            });
        });
    },
    moreAlbums: function(change) {
        if (change) {
            this.albOffset += 10;
            if (this.albOffset >= this.albums.total) {
                this.albOffset = this.albums.total - 10;
            }
            this.getArtist();
        } else {
            this.albOffset -= 10;
            if (this.albOffset < 10) {
                this.albOffset = 0;
            }
            this.getArtist();
        }
    },
    displayArtist: function() {
        $("#artist .results").hide();
        $("#artist .rowData").show();
        $("#artist .list1 li").remove();
        $("#artist .list2 li").remove();
        $("#artist").find("img").attr('src', this.person.images[0].url);
        $("#artName").text(this.person.name);
        var albums = this.albums.items;
        var albComp;
        $.each(albums, function(key, value) {
            if (value.name == albComp) {
            } else {
                var entry = "<li id='" + value.id + "'>" + value.name + "</li>";
                $("#artist").find(".list1").append(entry);
            }
            albComp = value.name;
        });
        var songs = this.topSongs.tracks;
        $.each(songs, function(key, value) {
            var entry = "<li id='" + value.id + "''>" + value.name + "</li>";
            $("#artist").find(".list2").append(entry);

        });
    }
};

//Defines an object to call for, store and display the data for the album tab
var albObj = {
    id: "",
    getAlbum: function() {
        var call = $.getJSON('https://api.spotify.com/v1/albums/' + this.id);
        call.done(function(data) {
            albObj.album = data;
            var artCall = $.getJSON('https://api.spotify.com/v1/artists/' + albObj.album.artists[0].id + '/albums?limit=10');
            artCall.done(function(data) {
                albObj.otherAlbs = data;
                albObj.displayAlbum();
            });
        });

    },
    displayAlbum: function() {
        $("#album .results").hide();
        $("#album .rowData").show();
        $("#album .list1 li").remove();
        $("#album .list2 li").remove();
        $("#album").find("img").attr('src', this.album.images[0].url);
        $("#albName").text(this.album.name);
        $("#albArtist").text("By:" + this.album.artists[0].name);
        var tracks = this.album.tracks.items;
        $.each(tracks, function(key, value) {
            var entry = "<li id='" + value.id + "'>" + value.name + "</li>";
            $("#album").find(".list1").append(entry);
        });
        var others = this.otherAlbs.items;
        var albComp;
        $.each(others, function(key, value) {
            if (value.name == albComp) {  } else {
                var entry = "<li id='" + value.id + "'>" + value.name + "</li>";
                $("#album").find(".list2").append(entry);
            }
            albComp = value.name;
        });
    }
};

//Defines an object to call for, store and display the data for the song tab
var songObj = {
    id: "",
    offset: 0,
    getSong: function() {
        var call = $.getJSON("https://api.spotify.com/v1/tracks/" + this.id);
        call.done(function(data) {
            songObj.track = data;
            var albCall = $.getJSON(songObj.track.album.href);
            albCall.done(function(info) {
                songObj.album = info;
                var artCall = $.getJSON('https://api.spotify.com/v1/artists/' + songObj.track.artists[0].id + '/albums?limit=10&offset=' + songObj.offset);
                artCall.done(function(art) {
                    songObj.otherAlbs = art;
                    songObj.displaySong();
                });

            });
        });
    },
    displaySong: function() {
        $("#track .results").hide();
        $("#track .rowData").show();
        $("#track .list1 li").remove();
        $("#track .list2 li").remove();
        $("#track").find("img").attr('src', this.track.album.images[0].url);
        $("#trackName").text(this.track.name);
        $("#trackArt").text("By: " + this.track.artists[0].name);
        $("#trackAlb").text("Album: " + this.track.album.name);
        $.each(this.album.tracks.items, function(key, value) {
            if (value.name != songObj.track.name) {
                var entry = "<li id='" + value.id + "'>" + value.name + "</li>";
                $("#track").find(".list1").append(entry);
            }
        });
        var albComp;
        $.each(this.otherAlbs.items, function(key, value) {
            if (value.name != albComp) {
                var entry2 = "<li id='" + value.id + "'>" + value.name + "</li>";
                $("#track").find(".list2").append(entry2);
            }
            albComp = value.name;
        });
    }
};

//Defines an object to search for artists, albums or songs and then store
//and display the results
var searchObj = {
    offset: 0,
    getList: function(query, type) {
        this.query = query;
        var call = $.getJSON("https://api.spotify.com/v1/search?limit=10&type=" + type + "&q=" + this.query + "&offset=" + this.offset);
        call.done(function(data) {
            searchObj.list = data;
            var term = type + 's';
            if (searchObj.list[term].items.length !== 0) {
                searchObj.displayList(type);
            } else {
                $("#" + type + " .rowData").hide();
                $("#" + type + " .results").show();
                $(".results ul").empty();
                var entry = "<li>Sorry, your search returned no results.</li>";
                $("#" + type + " .results ul").append(entry);
            }

        });
    },
    more: function(change, type) {
        if (change) {
            this.offset += 10;
            if (this.offset >= this.list.total) {
                this.offset = this.list.total - 10;
            }
        } else {
            this.offset -= 10;
            if (this.offset < 10) {
                this.offset = 0;
            }
        }
        this.getList(this.query, type);
    },
    displayList: function(type) {
        $("#" + type + " .rowData").hide();
        $("#" + type + " .results").show();
        $(".results ul").empty();
        var listName = type + 's';
        var list = this.list[listName].items;
        $.each(list, function(key, value) {
            var entry;
            if (type == 'album') {
                var artName;
                var albTemp = $.getJSON(value.href);
                albTemp.done(function(info) {
                    artName = info.artists[0].name;
                    entry = "<li id='" + value.id + "''>" + value.name + " by " + artName + "</li>";
                    $("#" + type + " .results ul").append(entry);
                });
            } else if (type == 'track') {
                entry = "<li id='" + value.id + "''>" + value.name + " by " + value.artists[0].name + "</li>";
                $("#" + type + " .results ul").append(entry);
            } else {
                entry = "<li id='" + value.id + "''>" + value.name + "</li>";
                $("#" + type + " .results ul").append(entry);
            }

        });

        $("#" + type + " .results ul").off('click').on('click', 'li', function() {
            if (type == "artist") {
                artObj.id = $(this).attr('id');
                artObj.getArtist();
            } else if (type == 'album') {
                albObj.id = $(this).attr('id');
                albObj.getAlbum();
            } else {
                songObj.id = $(this).attr('id');
                songObj.getSong();
            }

        });
    }
};

//function to change tabs when clicked
function changeTab() {
    $(".tabContent").hide();
    var sel = $(this).attr('href');
    $(sel).show();
    $("#tabs > li a").removeClass('selected');
    $(this).addClass("selected");
}

$(document).ready(function() {
    //set visibility to show only one tab and to show search content
    $(".tabContent").hide();
    $(".rowData").hide();
    $(".results").hide();
    $(".tabContent").first().show();

    //adds click functionality to change tabs
    $("#tabs > li").on('click', 'a', changeTab);


    $("#searchArt").click(function() {
        searchObj.getList($("#artQuery").val(), "artist");
    });
    $("#artQuery").keyup(function(e) {
        if (e.keyCode == 13) {
            searchObj.getList($("#artQuery").val(), "artist");
        }
    });

    $("#prevArtSearch").click(function() {
        searchObj.more(false, 'artist');
    });
    $("#nextArtSearch").click(function() {
        searchObj.more(true, 'artist');
    });

    $("#prevAlbs").click(function() {
        artObj.moreAlbums(false);
    });
    $("#nextAlbs").click(function() {
        artObj.moreAlbums(true);
    });

    $("#searchAlb").click(function() {
        searchObj.getList($("#albQuery").val(), "album");
    });
    $("#albQuery").keyup(function(e) {
        if (e.keyCode == 13) {
            searchObj.getList($("#albQuery").val(), "album");
        }
    });

    $("#prevAlbSearch").click(function() {
        searchObj.more(false, 'album');
    });
    $("#nextAlbSearch").click(function() {
        searchObj.more(true, 'album');
    });


    $("#searchTrack").click(function() {
        searchObj.getList($("#trackQuery").val(), "track");
    });
    $("#trackQuery").keyup(function(e) {
        if (e.keyCode == 13) {
            searchObj.getList($("#trackQuery").val(), "track");
        }
    });

    $("#prevTrackSearch").click(function() {
        searchObj.more(false, 'track');
    });
    $("#nextTrackSearch").click(function() {
        searchObj.more(true, 'track');
    });


});