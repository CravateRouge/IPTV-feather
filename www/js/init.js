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

 
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {

        // Initialization of the DB

        // In the following line, you should include the prefixes of implementations you want to test.
        window.indexedDB = window.indexedDB || window.webkitIndexedDB;
        // DON'T use "var indexedDB = ..." if you're not in a function.
        // Moreover, you may need references to some window.IDB* objects:
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

        if (!window.indexedDB) {
            window.alert("Your device does not support IndexedDB. The app can't run without it.");
            return;
        }

        var request = window.indexedDB.open("IptvDB");
        
        request.onerror = function(evt){
            alert("IndexedDB error:\n" + evt.target.error.message);
        };
        
        request.onupgradeneeded = function(){
            var objectStore;
            for(var i = 0; i < ROOT_STORES.length; i++){
                objectStore = request.result.createObjectStore(ROOT_STORES[i], {keyPath: "id"});
                objectStore.createIndex("category", "category", { unique: false });
            }
        };
        
        request.onsuccess = function(){
            DB = request.result;

            // Instantiates category views
            var media = null;
            var menuTab;
            for(var i = 0; i<ROOT_STORES.length; i++){
                media = new MediaContainer(ROOT_STORES[i],{id:"", activateView: function(){}}, null, ROOT_STORES[i]);
                menuTab = document.getElementsByClassName(ROOT_STORES[i]);
                for(var j=0; j < menuTab.length; j++)
                    menuTab[j].addEventListener("click",media.activateView);
            }

            // Instantiates playlist adder
            var playlistForm = document.getElementById("addPlaylist");
            playlistForm.addEventListener("submit", function(e){
                Parser(e.target[0].value);
                e.preventDefault();
            });

            if(localStorage.getItem("isBdInstantiated"))
                viewManager.switchView("mediaMenuChoice");
            else
                viewManager.switchView("addPlaylist");
        };
    },
};

app.initialize();