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
 * Global database object.
 * 
 * @typedef {Object} Database
 * @property {IDBDatabase} db IndexedDB object.
 * @property {function} getDB Creates the DB, assigns it to the db property and gives it to the callback function. If DB is already created gives it directly to the callback.
 * @property {function} getTiles Get requested tiles by objStrName and gives them to the fnPrintTile function.
 */
/*
var dbHandler = {
    getDB: function(callback, dbVersion){

        var request = null;

        if(dbVersion){
            request = window.indexedDB.open("IptvDB", dbVersion+1);
            request.onupgradeneeded = callback;
        }
        else{
            request = window.indexedDB.open("IptvDB");
            request.onsuccess = callback;
        }

        request.onerror = function(evt){
            alert("IndexedDB error:\n" + evt.target.error.message);
        };
    },

    // Adds or updates objects in the given store and creates a new store if a container is added
    putObjs: function(objects){
        objects.reverse();

        var createFn = function(evt, newStoreName){
            var db = evt.currentTarget.result;

            if(db.objectStoreNames.contains(newStoreName)){
                putFn(evt);
                return;
            }

            var updateDB = function(e) {
                var db = e.currentTarget.result;

                var result = db.createObjectStore(newStoreName, { keyPath: "id" });
                result.onsuccess = setTimeout(dbHandler.getDB(putFn), 0);
                
                result.onerror = function(e) {
                    alert("IndexedDB createStore error:\n"+ e.target.error.message);
                };
            };

            dbHandler.getDB(updateDB, db.version);
        };

        var putFn = function(evt){
            var db = evt.target.result;
            var objWrapper = objects.pop();

            // When the tab is empty stop the function
            if(!objWrapper){
                
                var media = null;
                for(var i = 0; i<ROOT_STORES.length; i++){
                    media = new MediaContainer(ROOT_STORES[i],{id:"", activateView: function(){}});
                    if(i == 0)
                        media.activateView();
                    document.getElementById(ROOT_STORES[i]).addEventListener("click",media.activateView);
                }

                return;
            }
            
            var request = db.transaction(objWrapper.objStrName,"readwrite").objectStore(objWrapper.objStrName).put(objWrapper.obj);

            if(objWrapper.isContainer)
                request.onsuccess = createFn(evt, objWrapper.objStrName+objWrapper.obj.id);
            else
                request.onsuccess = putFn(evt);

            request.onerror = function(evt){
                // TODO replace this error message with temporary non blocking popup dialog box
                console.log("IndexedDB put error:\n"+ evt.target.error.message);
            };
        };
        
        dbHandler.getDB(putFn, false);
    },

    getTiles: function(fnPrintTile, objStrName){
        dbHandler.getDB(function(e){
            e.currentTarget.result.transaction(objStrName).objectStore(objStrName).openCursor().onsuccess = function(e){
                var cursor = e.target.result;
                if(cursor){
                    fnPrintTile(cursor.value);
                    cursor.continue();
                }
            };
        });
    }
    
};
*/

/*

var request = window.indexedDB.open("IptvDB");

request.onsuccess = function (){
  var db = request.result;
	for(var i = 0; i < db.objectStoreNames.length; i++){
    var str = db.objectStoreNames[i];
    db.transaction(str).objectStore(str).openCursor().onsuccess = function(e){
      var cursor = e.target.result;
      
      if(cursor){
        console.log(str+": {");
        for(var param in cursor.value)
          console.log(param+": "+cursor.value[param]+",");
        console.log("},");
        cursor.continue();
      }
    };
  }
};

*/