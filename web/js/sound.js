/**
 * This file is part of CATLOAF 2600.
 * Copyright (C) 2007-2020 Joe King - All Rights Reserved
 * https://games.joeking.us/
 */
"use strict";

/**
 * @param string src
 */
function Sound(src)
{
    this.sound = new Audio();
    this.sound.src = src;
    this.sound.preload = "auto";
    this.sound.controls = "none";
    
    this.loaded = false;
    
    var self = this;
    this.sound.addEventListener("canplaythrough", function(event){
        self.loaded = true;
    });
    
    this.play = function()
    {
        this.sound.currentTime = 0;
        this.sound.play();
    }
    this.stop = function()
    {
        this.sound.pause();
    }
}
