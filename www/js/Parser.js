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

 
function Parser(url){

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url)
    xhr.onload = function(e){
        var playlist = e.target.responseText;

        var reParam = /(group-title|tvg-(\w+))="([^"]+)|(http:\S+)/g;
        

        var obj = {};
        var objs = [];
        var match = reParam.exec(playlist);

        // TODO protect it against xss injections or other kind of injections
        // If no match was found the value is null so we hit the bottom of the playlist
        // Index 0 is entire match, 1 is first match from the right. Match order depending on open parenthesis

        while(match){
            if(match[2]){// Match id, name or logo
                var param = match[2];
                switch(param){
                    case "logo":
                        param = "thumbnail";
                        break;
                    case "id":
                        param = "name";
                        break;
                    case "name":
                        param = "id";
                }
                obj[param] = match[3] == "NULL" ? "" : match[3]; // In case value is set to NULL string...
            } 

            else if(match[3]) // Match category
                obj.category = match[3];

            else if(match[4] && obj.id){ // Match source end of entry
                var source = match[4];
                obj.source = source;

                var subMatch = /movie|serie/.exec(source);
                var type = "Channels";

                // Push the root category as an entry
                objs.push({id: obj.category, category:"ROOT"});

                if(subMatch){
                    if(subMatch[0] == "movie")
                        type = "Movies";
                    else{
                        type = "TVshows";

                        var tvMatch = /(.+) (S\d{2}) E\d{2}/i.exec(obj.id);
                        objs.push({id: tvMatch[1], thumbnail: obj.thumbnail, category: obj.category });
                        var seasonName = tvMatch[1] + " " +tvMatch[2];
                        objs.push({id: seasonName, category: tvMatch[1]});
                        obj.thumbnail = null;
                        obj.category = seasonName;
                    }
                }

                objs.push(obj);

                for(var i = 0; i< objs.length; i++){
                     // TODO Have a global DB variable
                    var request = DB.transaction(type, "readwrite").objectStore(type).put(objs[i]);
                    request.onerror = function(evt){
                        // TODO replace this error message with temporary non blocking popup dialog box
                        console.log("IndexedDB put error when trying to parse the playlist:\n"+ evt.target.error.message);
                    };
                }

                obj = {};
                objs = [];
            }

            match = reParam.exec(playlist);
        }
    }
    xhr.send();
    
}