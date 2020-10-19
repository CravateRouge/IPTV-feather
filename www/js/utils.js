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

 
var DB = null;
var ROOT_STORES = ["Channels", "Movies", "TVshows"];

var INIT_VIEW = "initView";

var viewManager = {
        currentView: INIT_VIEW,
    
        /**
         * Hides the current view and shows the new one.
         *
         * Hides the current view and all parent tag and shows the new one put in parameter with all parent tags.
         *
         * @function
         *
         * @param {string}   viewToShow     The ID string of the tag to show.
         */
        switchView: function (viewToShow){
            var node = document.getElementById(this.currentView);
            do{
                node.classList.add("hide");
                node = node.parentNode;
            }while(node != document.body);

            node = document.getElementById(viewToShow);
            do{
                node.classList.remove("hide");
                node = node.parentNode;
            // Stops when body is hit
            }while(node != document.body);

            this.currentView = viewToShow;
        },

        deletePlaylist: function(index_Pl){
            // Prints loading when doing the operation
            this.switchView("menuLoader");

            // Removes pl from local storage
            var playlists = JSON.parse(localStorage.getItem("playlists"));
            delete playlists[index_Pl];
            localStorage.setItem("playlists", JSON.stringify(playlists));

            // Removes pl from indexedDB
            for(var i = 0; i < ROOT_STORES.length; i++){
                var objStr = DB.transaction(ROOT_STORES[i],"readwrite").objectStore(ROOT_STORES[i]);
                var index = objStr.index("playlist");
                
                // Anonymous function closure to keep a different objStr for each asynchronous call
                index.openKeyCursor(index_Pl).onsuccess = (function(){
                        var innerObjStr = objStr;
                        return function(e){
                            var cursor = e.target.result;
                            if(cursor){
                                var request = innerObjStr.delete(cursor.primaryKey);
                                request.onerror = function(evt){
                                    // TODO replace this error message with temporary non blocking popup dialog box
                                    console.log("IndexedDB deletion error when trying to delete a playlist:\n"+ evt.target.error.message);
                                };
                                cursor.continue();
                            }
                            // End of the deletion operation
                            else
                                viewManager.printPlaylists();
                    };
                })();
            }
        },

        printPlaylists: function(){
            // Cleans previous menu entries
            var prevEntries = document.getElementsByClassName("entryPl");

            while(prevEntries.length > 0)
                prevEntries[0].parentNode.removeChild(prevEntries[0]);

            var playlists = JSON.parse(localStorage.getItem("playlists")) || [];
            var playlistEntry = document.getElementById("playlistTpl").cloneNode(true);
            playlistEntry.classList = ["entryPl"];
            playlistEntry.removeAttribute("id");

            for(var i = 0; i < playlists.length; i++){
                if(playlists[i] == null)
                    continue;

                var item = playlistEntry.cloneNode(true);

                var namePl = item.querySelector(".namePl");

                namePl.addEventListener("click", (function(){
                    var idPl = i;
                    return function(){ 
                        var media = null;
                        for(var j = ROOT_STORES.length - 1 ; j > -1; j--){
                            media = new MediaContainer(idPl,{id:"", activateView: function(){viewManager.switchView("mediaMenu");}}, null, ROOT_STORES[j], idPl);

                            // TODO Check if preventDefault() stop other eventListeners put previously
                            document.querySelector("."+ROOT_STORES[j]).addEventListener("click",  (function(){ 
                                var innerMedia = media; 
                                return function(e){
                                    e.preventDefault();
                                    innerMedia.activateView();
                                };
                            })());
                        }
                        media.activateView(); 
                    };
                })());

                // Adds the hostname of the URL as the name for the playlist entry
                var tmpUrl = document.createElement('a');
                tmpUrl.href = playlists[i];
                namePl.textContent = tmpUrl.hostname;

                item.querySelector(".delPl").addEventListener("click", (function(m){
                    var idPl = i;
                    return function(){viewManager.deletePlaylist(idPl);};
                })());

                document.getElementById("menuPlaylist").append(item);
            }

            this.switchView("mediaMenu");
        }
};

