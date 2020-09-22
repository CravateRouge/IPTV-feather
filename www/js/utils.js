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

var INIT_VIEW = "tileGridView";

var viewManager = {
        currentView: INIT_VIEW,
    
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
        }
};

