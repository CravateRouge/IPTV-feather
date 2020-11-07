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

 var playlistManager = {
	deletePlaylist: function(e){
		var index_Pl = e.target.getAttribute("playlistIndex");
		// Prints loading when doing the operation
		viewManager.switchView("menuLoader");

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
					var indexStore = i;
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
						else if (indexStore == ROOT_STORES.length -1)
							playlistManager.printPlaylists();
				};
			})();
		}
	},
	printPlaylists: function(){
		// Cleans previous menu entries
		var rows = document.getElementById("menuView").tBodies[0].rows;
		var playlistRow = rows[0];
		var optionRow = rows[1];
		for(var i=0; i < rows.length; i++){
			while(rows[i].firstChild)
				rows[i].removeChild(rows[i].firstChild);
		}

		var playlists = JSON.parse(localStorage.getItem("playlists")) || [];

		for(var i = 0; i < playlists.length; i++){
			if(playlists[i] == null)
				continue;


			var nameCell = document.createElement("td");
			var nameButton = document.createElement("button");
			// Adds the hostname of the URL as the name for the playlist entry
			var tmpUrl = document.createElement('a');
			tmpUrl.href = playlists[i];
			nameButton.textContent = tmpUrl.hostname;
			nameButton.setAttribute("playlistIndex",i);
			nameButton.addEventListener("click", function(e){ 
					var idPl = e.target.getAttribute("playlistIndex");
					viewManager.switchView("tileGridView");
					tileGridManager.initGrid({id: idPl, playlist:idPl, type:ROOT_STORES[0]});
			});     
			nameButton.className = "namePl";

			nameCell.appendChild(nameButton);
			playlistRow.appendChild(nameCell);

			var optionCell = document.createElement("td");
			var optionButton = document.createElement("button");
			optionButton.className = "delPl";
			optionButton.textContent = "D";
			optionButton.setAttribute("playlistIndex",i);
			optionCell.appendChild(optionButton);
			optionRow.appendChild(optionCell);
			optionButton.addEventListener("click",this.deletePlaylist);
		}

		this.addButtonInit();
		viewManager.switchView("menuView");
		document.querySelector("td button").focus();
	},
	addButtonInit: function (){
		var addCell = document.createElement("td");
		var addButton = document.createElement("button");
		addButton.id = "addPlButton";
		addButton.textContent = "+";
		addButton.addEventListener("click", function(e){
			var urlExample = "http://localhost:8000/example.m3u";
			var urlPl = prompt("Just add your playlist and enjoy!\nYou can use a url shortener like bit.ly to make the typing easier.", urlExample);
			if(urlPl ==null || urlPl==urlExample)
				return;

			viewManager.switchView("menuLoader");

			var playlists = JSON.parse(localStorage.getItem("playlists")) || [];

			Parser({id: playlists.length, url: urlPl});

			playlists.push(urlPl);
			localStorage.setItem("playlists", JSON.stringify(playlists));

		});
		addCell.appendChild(addButton);
		document.getElementById("menuView").tBodies[0].rows[0].appendChild(addCell);
	}
 };
 
var playerManager = {
	instancePlayer: null,
	getPlayer: function(){return this.instancePlayer?this.instancePlayer:this.initPlayer();},
	eventHandler: function(evt) {
		switch(evt.type){
			// Change the Play/Pause button depending on the state of the this.player
			// Also pause or relaunch the progress bar
			case 'STATE':			
				switch(evt.data.state){
					case "IDLE":
					case "PAUSED":
						document.getElementById("progress").style.webkitAnimationPlayState = "paused";

						document.getElementById("play").classList.remove("hide");
						document.getElementById("pause").classList.add("hide");
						break;

					case "PLAYING":
						document.getElementById("progress").style.webkitAnimationPlayState = "running"	;

						document.getElementById("pause").classList.remove("hide");
						document.getElementById("play").classList.add("hide");
						break;
					
					case "STALLED":
						if(evt.data.oldState != "STALLED"){
							var nodeList = document.getElementsByClassName("loading");
							for (var i = 0; i < nodeList.length; i++)
								nodeList[i].classList.remove("hide");
						}
				}
				
				if(evt.data.oldState == "STALLED" && evt.data.state != "STALLED"){
					var nodeList = document.getElementsByClassName("loading");
					for (var i = 0; i < nodeList.length; i++)
						nodeList[i].classList.add("hide");
				}

				break;

			case 'DURATION':
				console.log('Duration is ' + evt.data.duration + 'ms');
				document.getElementById("progress").style.webkitAnimation = evt.data.duration + "ms paused progressing";
				break;

			case 'POSITION':
				console.log('Position is ' + evt.data.position + 'ms');
				break;

			case 'BUFFERINGPROGRESS':
				console.log('Buffering is ' + evt.data.bufferingPercentage + '%');
				document.getElementById("percentage").textContent = evt.data.bufferingPercentage+'%';
				break;

			case 'ENDED':
				console.log('Media is ended');
		}
	},
	displayTimeout: null,
	playerState: false,
	play: function(playerInfo){
		viewManager.switchView("mediaView");

		this.getPlayer().open(playerInfo.source);
		this.getPlayer().play();

		document.getElementById("poster").src = playerInfo.thumbnail;
		document.getElementById("mediaTitle").textContent = playerInfo.id;
		document.getElementById("mediaDescription").textContent = playerInfo.description;

		this.playerState = true;

		// Shows the play bar and the return icon when a key is pressed
		window.addEventListener('keydown', function(){
			var tagsName = ["infoBar", "mediaReturn"];

			for(var i = 0; i < tagsName.length; i++)
				document.getElementById(tagsName[i]).classList.remove("hide");

			// If the bar is already displayed, it resets the timeout before hiding it
			if(playerManager.displayTimeout)
				clearTimeout(playerManager.displayTimeout);
			
				playerManager.displayTimeout = setTimeout(function(){
					for(var i = 0; i < tagsName.length; i++)
						document.getElementById(tagsName[i]).classList.add("hide");
					playerManager.displayTimeout = null;
				}, 5000);	
		});

		// Pauses and plays the player when the playPause button is clicked
		document.getElementById("playPause").addEventListener("click", (function() {
		if(this.playerState)
			this.getPlayer().pause();
		else
			this.getPlayer().play();
		this.playerState = !this.playerState;
		}).bind(this));
	},
	initPlayer: function(){
		var player = toast.Media.getInstance();
		var playerContainer = player.getContainerElement();

		playerContainer.style.position = 'fixed';
		var fullResolution = ['0%', '0%', '100%', '100%'];
		/* playerContainer.style.left = fullResolution[0];
		playerContainer.style.top = fullResolution[1]; */
		playerContainer.style.width = fullResolution[2];
		playerContainer.style.height = fullResolution[3];
		document.getElementById("media").appendChild(playerContainer);

		player.syncVideoRect();
		
		player.setListener({
			onevent: this.eventHandler,
			onerror: function(err){
				// TODO: Handle errors to restart automatically the player and be verbose on the problem (network, IPTV link...)
				console.error('MediaError is occured: ' + JSON.stringify(err));
			}
		});
		return player;
	},
	goBack: function(){
		this.getPlayer().stop();
		viewManager.switchView("tileGridView");
	}
};

var tileGridManager = {
	currentMediaTheme: null,
    iterateDB : function(){
        var index = DB.transaction(this.currentMediaTheme.type).objectStore(this.currentMediaTheme.type).index("category");
		var keyCat = this.currentMediaTheme.id;
		
		if(this.currentMediaTheme.id == this.currentMediaTheme.playlist)
			keyCat = "plaYlIst_"+this.currentMediaTheme.id;

        index.openCursor(keyCat).onsuccess = (function(e){
            var cursor = e.target.result;
            if(!cursor){
				viewManager.indexGrid = 0;
				return viewManager.printTileGrid();
			}
            var data = cursor.value;              
			viewManager.addTileToGridTab(this.prepareTile(data));
			cursor.continue();
        }).bind(this);
	},
	storeButtons: null,
	changeStore: function(e){
		var newId = tileGridManager.currentMediaTheme.playlist;
		tileGridManager.initGrid({
			id: newId,
			playlist: newId,
			type: e.target.getAttribute("store")
		});
	},
	setStoreButtons: function (){
		var storeElt = document.getElementById("stores");
		for (var i = 0; i < ROOT_STORES.length; i++) {
			var store = document.createElement("button");
			store.setAttribute("store",ROOT_STORES[i]);
			store.addEventListener("click", tileGridManager.changeStore);
			store.textContent = ROOT_STORES[i] == "TvShows"? "TV shows" : ROOT_STORES[i];
			storeElt.appendChild(store);		
		}
		return storeElt;
	},
    initGrid: function(currentMediaTheme){
		if(!this.storeButtons)
			this.storeButtons = this.setStoreButtons();
		this.currentMediaTheme = currentMediaTheme;
		viewManager.flushGridTab();
        this.iterateDB();
    },
    prepareTile: function(data){
		data.type = this.currentMediaTheme.type;
        var showContent;
        if(data.source)
            showContent = function(e){playerManager.play(data);};
        else
            showContent = function(e){tileGridManager.initGrid(data);};
        return {
            id: data.id,
            thumbnail: data.thumbnail,
            showContent: showContent
        };
	},
	goBack: function(){
		var obj = this.currentMediaTheme;
		// We are at the root where the media container is the playlist
		if(obj.id == obj.playlist)
			return viewManager.switchView("menuView");
		
		var indexId = obj.category.indexOf("plaYlIst_");
		if(indexId > -1){
			var slicedCat = obj.category.slice(indexId + 9);
			return tileGridManager.initGrid({id: slicedCat, playlist: slicedCat, type: obj.type });
		}

		var objStr = DB.transaction(obj.type).objectStore(obj.type);
		var result = objStr.get(obj.category)
		result.onsuccess = function(e){
			var newMediaTheme = e.target.result;
			newMediaTheme.type = tileGridManager.currentMediaTheme.type;
			tileGridManager.initGrid(newMediaTheme);
		};
		result.onerror = function(evt){
			// TODO replace this error message with temporary non blocking popup dialog box
			console.log("IndexedDB failed to get container from category:\n"+ evt.target.error.message);
		};
	}
};