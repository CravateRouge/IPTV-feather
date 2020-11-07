var keyManager = {
    playerControl: function(keyName){console.log("Not implemented yet");},
    // TODO verify that submit event is triggered with click
    triggerFocusElt: function(){
        document.activeElement.click();
    },
    previousScreen: function(){
            var elt = document.querySelector("#" + viewManager.currentView + " .return");
            if(elt)
                elt.click();
            else
                console.log("Return is not implemented for this view " + viewManager.currentView);
    },
    showChannel: function(digit){console.log("Not implemented yet");},
    moveFocus: function(direction){
        switch(direction){
            case "Left":
                switchCell("nextSibling","firstChild")
                break;
            case "Right":
                switchCell("previousSibling", "lastChild");
                break;
            case "Up":
                switchRow("previousSibling", "lastChild");
                break;
            case "Down":
                switchRow("nextSibling", "firstChild");
                break;
            default:
                console.log("This is an unknown arrow direction: "+direction);
        }

        function switchCell (dirCell, dirChild){
            var elt = document.activeElement;
            while((elt = elt.parentNode) && !(elt.tagName == "TD"));
            if(!elt){
                document.querySelector("#"+viewManager.currentView+" td button").focus();
                return;
            }
            while(elt){
                elt = elt[dirCell] ? elt[dirCell]:elt.parentNode[dirChild];
                var focusElt = elt.querySelector("button");
                if(focusElt){
                    focusElt.focus();
                    return;
                } // TODO Add a special case for tileGridView where you can change the tileGrid when it's the last tile
            }
        }
        
        function switchRow(dirRow, dirChild) {
            var elt = document.activeElement;
            while((elt = elt.parentNode) && !(elt.tagName == "td"));
            if(!elt){
                console.log("The active element is not in a cell.");
                return;
            }
            var cnt = elt.cellIndex;
            while((elt = elt.parentNode) && !(elt.tagName == "tr"));
            if(!elt){
                console.log("The active element is not in a row.");
                return;
            }
            var focusElt = null;
            while(elt){
                var elt = elt.previousSibling ? elt.previousSibling : elt.parentNode.lastChild;
                while(cnt > 0){
                    if(closestElt.childNodes.length < cnt || (focusElt = closestElt.childNodes[cnt].querySelector("button:not(.hide), input:not(.hide)")) == null)
                        cnt--;
                    else{
                        focusElt.focus();
                        return;
                    }
                }
            }
        }
    },
    changeChannel: function(sign){console.log("Not implemented yet");},
    changeTileGrid: function(sign){console.log("Not implemented yet");},
    changeType: function(color){console.log("Not implemented yet");}
};

function initKeyTable() {
    console.log("registerKeys");
    var usedKeys = [
        'ChannelUp',
        'ChannelDown',
        'ColorF0Red',
        'ColorF1Green',
        'ColorF2Yellow'
    ];
    // Adds number commands
    for(i=0; i < 10; i++)
        usedKeys.push(i.toString());  
    for (var i = 0; i < usedKeys.length; i++) {
        try{
            toast.inputdevice.registerKey(usedKeys[i], function() {}, function(err) {
                console.log('Error: ' + err.message);
            });
        } catch(e){
            console.log("failed to register " + usedKeys[i] + ": " + e);
        }
    }

    console.log('setKeyTable');
    var tvKeyCode = [];
    toast.inputdevice.getSupportedKeys(function(keys) {
        for(var i = 0, len = keys.length; i < len; i++) {
            tvKeyCode[keys[i].code] = keys[i].name;
        }
    });
    // return tvKeyCode;

    window.addEventListener("keydown", function(e){
        var keyName = tvKeyCode[e.keyCode];

        if(!keyName)
            return;
        
        if (keyName == "Enter"){
            switch(viewManager.currentView){
                case "player":
                    keyManager.playerControl(keyName);
                    break;
                default:
                    keyManager.triggerFocusElt();
            }
        }
        else if(keyName == "Return")
            keyManager.previousScreen();
        else if(!isNaN(keyName))
            keyManager.showChannel(keyName);          
        else{
            var wordToFn = {
                Arrow: function(direction){
                    switch(viewManager.currentView){
                        case "player":
                            keyManager.playerControl(direction);
                            break;
                        default: 
                            keyManager.moveFocus(direction);
                     } 
                },
                Channel: function(sign){
                    switch(viewManager.currentView){
                        case "player":
                            keyManager.changeChannel(sign);
                            break;
                        case "tileGrid":
                            keyManager.changeTileGrid(sign);
                            break;
                        default:
                            console.log("Channel keys do nothing on this screen");
                    }
                },
                Color: function(color){
                    switch(viewManager.currentView){
                        case "player":
                            keyManager.playerMenu(color);
                            break;
                        case "tileGrid":
                            keyManager.changeType(color);
                            break;
                        default:
                            console.log("Color key do nothing on this screen");
                      }
                }
            };

            var wordToFnKeys = Object.keys(wordToFn);
            for(var i = 0; i < wordToFnKeys.length; i++){
                var word = wordToFnKeys[i];
                var wordIndex = keyName.indexOf(word);
                if(wordIndex > -1)
                    wordToFn[word](keyName.substring(wordIndex + word.length));
            }
        }        
    });
}
