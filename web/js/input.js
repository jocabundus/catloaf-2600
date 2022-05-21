/**
 * This file is part of CATLOAF 2600.
 * Copyright (C) 2007-2020 Joe King - All Rights Reserved
 * https://games.joeking.us/
 */
"use strict";

var KeyCodes = {
    tab   :  9,
    enter : 13,
    escape: 27,
    space : 32,
    left  : 37,
    up    : 38,
    right : 39,
    down  : 40,
    A     : 65,
    D     : 68,
    H     : 72,
    I     : 73,
    J     : 74,
    K     : 75,
    L     : 76,
    N     : 78,
    Q     : 81,
    S     : 83,
    V     : 86,
    W     : 87,
    Y     : 89,
    F1    : 173,
    F2    : 174
}
var Input = {
    keyCode: 0,
    lastKeyCode: 0,
    keyIsRepeat: false,
    observeInput: false,
    clickedGameWindow: false,
    init: function(windowId)
    {
        var self = this;
        document.addEventListener('click', function(event){
            event.preventDefault();
            if(!self.clickedGameWindow) {
                self.observeInput = false;
            }
            self.clickedGameWindow = false;
        });
        document.getElementById(windowId).addEventListener('click', function(event){
            event.preventDefault();
            self.observeInput = true;
            self.clickedGameWindow = true;
        });
        document.addEventListener('keydown', function(event){
            if(self.observeInput) {
                event.preventDefault();
                self.registerKeyDown(event.keyCode);
            }
        });
        document.addEventListener('keyup', function(event){
            event.preventDefault();
            self.lastKeyCode = 0;
        });
    },
    addButtonKey: function(elementId, keyCode)
    {
        var button = document.getElementById(elementId);
        if(typeof(button) !== "undefined")
        {
            var self = this;
            var kcode = keyCode;
            button.addEventListener("touchstart", function(event){
                event.preventDefault();
                event.target.classList.add("down");
                self.registerKeyDown(kcode);
            });
            button.addEventListener("touchend", function(event){
                event.preventDefault();
                event.target.classList.remove("down");
                self.lastKeyCode = 0;
            });
        }
    },
    registerKeyDown: function(keyCode)
    {
        this.keyCode = keyCode;
        this.keyIsRepeat = (this.keyCode == this.lastKeyCode) ? true : false;
        this.lastKeyCode = this.keyCode;
    },
    keyPressed: function(keyCode)
    {
        return (this.getKeyPressed() === keyCode);
    },
    getKeyPressed: function()
    {
        var code = this.keyCode;
        this.keyCode = 0;
        return code;
    },
    keyRepeated: function()
    {
        return this.keyIsRepeat;
    },
    pause: function()
    {
        this.observeInput = false;
    },
    unpause: function()
    {
        this.observeInput = true;
    }
}