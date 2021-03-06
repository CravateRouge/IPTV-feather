/*
 * This file is part of IPTV-feather, a platform for IPTV content.
 * Copyright (C) 2020 Baptiste Crépin <baptiste.crepin@ntymail.com>
 *
 * IPTV-feather is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 *  IPTV-feather is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with IPTV feather.  If not, see <https://www.gnu.org/licenses/>.
 */

 
function Parser(newPl){

    var xhr = new XMLHttpRequest();
    xhr.open("GET", newPl.url); // TODO handle errors and go back to menuView if error and correct missing protcol http or https
    xhr.onload = function(e){
        var playlist = e.target.responseText;

        var reParam = /(group-title|tvg-(\w+))="([^"]+)|(http:\S+)/g;

        var obj = {};
        var objs = [];
        var match = reParam.exec(playlist);
        var nextMatch;
        var currID = 0;

        // If no match was found the value is null so we hit the bottom of the playlist
        // Index 0 is entire match, 1 is first match from the right. Match order depending on open parenthesis

        while(match){
            nextMatch = reParam.exec(playlist);
            if(match[2]){// Match id or logo
                var param = match[2];
                switch(param){
                    case "logo":
                        param = "thumbnail";
                        break;
                    /* case "id":
                        param = "name";
                        break; */
                    case "name":
                        match[3] = newPl.id + "_" + match[3];
                        param = "id";
                        break;
                    default:
                        param = null;
                }
                if(param)
                    obj[param] = match[3] == "NULL" ? "" : match[3]; // In case value is set to NULL string...
            } 

            else if(match[3]) // Match category
                obj.category = newPl.id+"_"+match[3];

            else if(match[4] && obj.id){ // Match source end of entry
                var source = match[4];
                obj.source = source;
                obj.playlist = newPl.id;

                var subMatch = /movie|serie/.exec(source);
                var type = "Channels";

                // Push the root category as an entry
                objs.push({id: obj.category, category:"plaYlIst_"+newPl.id, playlist:newPl.id});

                if(subMatch){
                    if(subMatch[0] == "movie")
                        type = "Movies";
                    else{
                        type = "TVshows";

                        var tvMatch = /(.+) (S\d{2}) E\d{2}/i.exec(obj.id);
                        var tvShowName = tvMatch[1];
                        objs.push({id: tvShowName, thumbnail: obj.thumbnail, category: obj.category, playlist: newPl.id }); //TODO one image per episode, one per season (first episode), one per tv show (first episode first season)
                        var seasonName = tvMatch[1] + " " +tvMatch[2];
                        objs.push({id: seasonName, category: tvMatch[1], playlist: newPl.id});
                        obj.thumbnail = null;
                        obj.category = seasonName;
                    }
                } else{ // If the parsed line is a FINAL channel (not a container) a channelID is linked to it
                    obj.channelID = currID;
                    currID ++;
                }

                objs.push(obj);

                for(var i = 0; i < objs.length; i++){
                    var request = DB.transaction(type, "readwrite").objectStore(type).put(objs[i]);
                    request.onerror = function(evt){
                        // TODO replace this error message with temporary non blocking popup dialog box
                        console.log("IndexedDB put error when trying to parse the playlist:\n"+ evt.target.error.message);
                    };

                    if(nextMatch == null && i == objs.length - 1)
                        request.onsuccess = function(){
                            playlistManager.printPlaylists();
                        };
                }

                obj = {};
                objs = [];
            }
            match = nextMatch;
        }
    }
    xhr.send();
    
}