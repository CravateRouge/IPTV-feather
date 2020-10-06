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

        printPlaylists: function(){
            var playlists = JSON.parse(localStorage.getItem("playlists")) || [];
            var playlistEntry = document.getElementById("playlistTpl").cloneNode(true);
            playlistEntry.classList.remove("hide");
            playlistEntry.removeAttribute("id");

            for(var i = 0; i < playlists.length; i++){
                var item = playlistEntry.cloneNode(true);
                var media = null;
                for(var j = ROOT_STORES.length - 1 ; j > -1; j--){
                    media = new MediaContainer("playlist_"+i,{id:"", activateView: function(){viewManager.switchView("menuPlaylist")}}, null, ROOT_STORES[j]);

                    // FIXME remove previous listeners?
                    document.querySelector("."+ROOT_STORES[j]).addEventListener("click",  media.activateView);

                }
                item.addEventListener("click", media.activateView);
                var tmpUrl = document.createElement('a');
                tmpUrl.href = playlists[i];
                item.textContent = tmpUrl.hostname;
                document.getElementById("menuPlaylist").append(item);
            }

            this.switchView("mediaMenu");
        }
};

