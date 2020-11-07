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
        currentView: INIT_VIEW, // TODO use currentView for views and a new function and new variable for tileGrids
        currentTileGrid: null,
        tileGridTab: [],
        indexGrid: 0,
        maxTile: 12, // TODO adapt this number to number of rows and columns in a table
    
        /**
         * Hides the current view and shows the new one.
         *
         * Hides the current view and shows the new one put in parameter.
         *
         * @function
         *
         * @param {string}   viewToShow     The ID string of the tag to show.
         */
        switchView: function (viewToShow){
            var node = document.getElementById(this.currentView);
            node.classList.add("hide"); // TODO check if classList is supported by samsung
            node = document.getElementById(viewToShow);
            node.classList.remove("hide");
            this.currentView = viewToShow;
        },
        cleanTileGrid: function (){ 
            var tileTable = document.createElement("table");
            var tileGrid = document.createElement("tbody");
            for (var i = 0; i < 3; i++) { // TODO rearrange numbers of rows (i) and columns (i) with the screen size
                var row = document.createElement("tr");
                for (var j = 0; j < 4; j++) {
                    var cell = document.createElement("td");
                    row.appendChild(cell);
                }
                tileGrid.appendChild(row);    
            }
            if(this.currentTileGrid)
                this.currentTileGrid.parentNode.parentNode.removeChild(this.currentTileGrid.parentNode); // TODO erase too old tileGrids and reuse old tileGrids
            tileTable.appendChild(tileGrid);
            document.getElementById("tileGridView").appendChild(tileTable);
            this.currentTileGrid = tileGrid;
        }, 
        addTileToGridTab: function(tileContent){
            var grid = [];
            if(this.tileGridTab.length < this.indexGrid+1)
                this.tileGridTab.push(grid);
            else
                grid = this.tileGridTab[this.indexGrid];

            if(grid.length < this.maxTile)
                grid.push(tileContent);
            else
                this.indexGrid ++;
        },
        printTileGrid: function(direction){
            var tile = document.getElementById("thumbTpl").cloneNode(true);
            tile.className = "tile";
            tile.id="";

            if(direction == "next")
                if(this.indexGrid == this.tileGridTab.length-1)
                    this.indexGrid = 0;
                else
                    this.indexGrid++;
            else if(direction == "prev")
                if(this.indexGrid == 0)
                    this.indexGrid = this.tileGridTab.length - 1;
                else
                    this.indexGrid--;

            this.cleanTileGrid();
            var cells = this.currentTileGrid.querySelectorAll("td");
            var tab = this.tileGridTab[this.indexGrid];
            for (var i = 0; i < tab.length; i++) {
                var tileContent = tab[i];

                var newTile = tile.cloneNode(true);
                newTile.id = tileContent.id;
                var img = newTile.querySelector(".thumbnail");
                img.src = tileContent.thumbnail;
                newTile.querySelector(".title").textContent = tileContent.id;
                newTile.addEventListener("click", tileContent.showContent);
                cells[i].appendChild(newTile);
            }            
        }, 
        flushGridTab: function(){
            this.tileGridTab = [];
            this.indexGrid = 0;
        }
};
