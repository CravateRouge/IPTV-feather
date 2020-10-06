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

 
/**
 * Handles tile displaying.
 *
 * TileGrid is a class which handles the operations to display the tiles.
 *
 * @class
 *
 * @global
 *
 * @param {string}   id           Type of tile to handle, used to open the correct objectStore.
 */
function TileGrid(id, caller) {

    this.id = id;
    this.caller = caller;

    this.view = document.createElement("div");
    this.view.id = this.id+"TileGridView";
    this.view.classList.add("subGridView");

    var returnHtml = document.createElement("div");
    returnHtml.classList.add("return","zoom");
    returnHtml.innerHTML = "&#x21A9;";
    returnHtml.addEventListener("click", this.caller.container.activateView);
    this.view.appendChild(returnHtml);
    
    // TODO clean when view change and activate when this view is activated
    //window.addEventListener("Return", this.caller.container.activateView);

    document.getElementById("tileGridView").appendChild(this.view);

    /**
     * Prints a tile according to the given object.
     *
     * Prints the tiles according to the object get in the db, printTiles is callback by a db transaction.
     *
     * @function
     *
     * @param {string}   obj           Type of tile to handle, used to open the correct objectStore.
     */
    this.printTiles = function(id, source, thumbnail){
        var obj = null;

        if(!source)
            obj = new MediaContainer(id, this.caller, thumbnail, this.caller.type);
        else
            obj = new MediaContent(id, this.caller, source, thumbnail);
            
        var tileEltClone = document.getElementById("thumbTpl").cloneNode(true);
        tileEltClone.id = obj.id;
        var img = tileEltClone.querySelector(".thumbnail");
        img.src = obj.thumbnail;
        tileEltClone.querySelector(".title").textContent = obj.name;
        tileEltClone.addEventListener("click", obj.activateView)
        this.view.appendChild(tileEltClone);
    }


    // Displays all the content of a container as tiles through a call to a db method to retrieve the content.
    var index = DB.transaction(this.caller.type).objectStore(this.caller.type).index("category");

    index.openCursor(this.caller.id).onsuccess = (function(e){
        var cursor = e.target.result;
        if(cursor) {
            var data = cursor.value;
            this.printTiles(data.id, data.source, data.thumbnail);
            cursor.continue();
        }
    }).bind(this);
}