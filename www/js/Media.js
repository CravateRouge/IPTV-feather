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

 
function Media(parentObj, source, poster, name, description){

	this.parentObj = parentObj;
	this.source = source;
	this.name = name;
	this.poster = poster;
	this.description = description;

	this.player = toast.Media.getInstance();
	this.player.open(this.source);

	var playerContainer = this.player.getContainerElement();

	// Adds the element only if the player isn't already added in the DOM
	if(!playerContainer.parentElement){
		playerContainer.style.position = 'fixed';
		var fullResolution = ['0%', '0%', '100%', '100%'];
		/* playerContainer.style.left = fullResolution[0];
		playerContainer.style.top = fullResolution[1]; */
		playerContainer.style.width = fullResolution[2];
		playerContainer.style.height = fullResolution[3];
		document.getElementById("media").appendChild(playerContainer);
	}

	this.player.syncVideoRect(); //for supporting 2013's sectv-orsay

	
	this.eventHandler = (function(evt) {
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
	}).bind(this);
	
	this.player.setListener({
		onevent: this.eventHandler,
		onerror: function(err){
			// TODO: Handle errors to restart automatically the player and be verbose on the problem (network, IPTV link...)
			console.error('MediaError is occured: ' + JSON.stringify(err));
		}
	});

	this.player.play();
	// You don't have to call setScreenSaver Method. It is configurated by toast.avplay.	

	this.displayTimeout = null;
	this.playerState = true;

	document.getElementById("poster").src = this.poster;
	document.getElementById("mediaTitle").textContent = this.name;
	document.getElementById("mediaDescription").textContent = this.description;

	// Shows the play bar when a key is pressed
	window.addEventListener('keydown', (function(){
		var infoClasses = document.getElementById("infoBar").classList;
		infoClasses.remove("hide");

		// If the bar is already displayed, it resets the timeout before hiding it
		if(this.displayTimeout)
			clearTimeout(this.displayTimeout);
		
		this.displayTimeout = setTimeout(function(){infoClasses.add("hide"); this.displayTimeout = null;}, 5000);	
	}).bind(this));

	// Goes back to the previousView
	// TODO clean when view change and activate when this view is activated
	//window.addEventListener("Return", parentObj.previousView);
	document.querySelector("#media>.return").addEventListener("click", parentObj.previousView);

	// Pauses and plays the player when the playPause button is clicked
	document.getElementById("playPause").addEventListener("click", (function() {
		if(this.playerState)
			this.player.pause();
		else
			this.player.play();
		this.playerState = !this.playerState;
	}).bind(this));
}

// TODO makes name and thumbnail optional
function MediaContent(id, container, source, thumbnail) {
	
	this.id = container.id + id;
	this.name = id;
	this.container = container;
	this.source = source;
	this.media = null;

	this.thumbnail = "";
	if(thumbnail)
		this.thumbnail = thumbnail;

	// TODO replace ID by name only when name is non null
	this.thumbnailAlt = id;

	// TODO extract title from current program for channel but use id or name for movies/tv show
	this.title = id;
/* 	this.getTitle = function(){
		// TODO extract it from indexeddb
		return "La petite sorcière";
	}; */

	this.getDescription = function(){
		// TODO same that above
		return "C'est l'histoire d'une petite sorcière qui courait dans l'herbe";
	}

	this.activateView = (function(){
		// Media is created only when the channel view is activated and not in the channel list view
		if(!this.media)
			this.media = new Media(this, this.source, this.thumbnail, this.title, this.getDescription());
		else{
			this.media.player.open(this.source);
			this.media.player.play();
		}

		viewManager.switchView("mediaView");
	}).bind(this);

	this.previousView = (function(){
		this.media.player.stop();
		this.container.activateView();
	}).bind(this);
}

function MediaContainer(id, container, thumbnail, type){

	this.thumbnailAlt = id;
	this.id = id;
	this.name = id;
	this.type = type;

	this.thumbnail = "";
	if(thumbnail)
		this.thumbnail = thumbnail;

	this.container = container;
	this.tileGrid = null;

	this.activateView = (function(){
		if(!this.tileGrid)
			this.tileGrid = new TileGrid(this.id, this);

		viewManager.switchView(this.tileGrid.view.id);
	}).bind(this);
}
