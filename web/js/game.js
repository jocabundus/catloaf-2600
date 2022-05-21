/**
 * This file is part of CATLOAF 2600.
 * Copyright (C) 2007-2020 Joe King - All Rights Reserved
 * https://games.joeking.us/
 */
"use strict";

function SpriteRow()
{
    this.data = '     ';
    this.color = 0;
    this.background = 0;
}
function SpriteType()
{
    this.rows = [];
}
function InventoryType()
{
    var self = this;
    this.init = function()
    {
        self.goldKeys     = 0;
        self.silverKeys   = 0;
        self.stoneKeys    = 0;
        self.goldenDove   = 0;
        self.supremeEye   = 0;
        self.crystalSnake = 0;
        self.endToken     = 0;
        self.points       = 0;
    }
    this.init();
}
function PlayerType(startX, startY, startLife, startLives)
{
    this.startX = startX;
    this.startY = startY;
    this.startLife  = startLife;
    this.startLives = startLives;
    
    this.inv = new InventoryType();
    var self = this;
    this.init = function()
    {
        self.x      = self.startX;
        self.y      = self.startY;
        self.oldX   = self.startX;
        self.oldY   = self.startY;
        self.spawnX = self.startX;
        self.spawnY = self.startY;
        self.gridX  = 0;
        self.gridY  = 0;
        self.life   = self.startLife;
        self.lives  = self.startLives;
        self.dark   = 0;
        self.spawnDark = 0;
        self.hasMoved  = false;
        self.inv.init();
    }
    this.init();
}
/**
 * @param int x
 * @param int y
 * @param int spriteId 
 */
function DoorType(x, y, spriteId)
{
    this.x = x;
    this.y = y;
    this.spriteId = spriteId;
}

/**
 * @depends GFX
 * @depends Input 
 */
var Game = {
    /**
     * @var GFX 
     */
    gfxHandle: null,
    /**
     * @var Input 
     */
    inputHandle: null,
    /**
     * @var array 
     */
    sounds: [],
    /**
     * @var string 
     */
    soundPath: '',
    /**
     * @var bool 
     */
    canPlaySound: false,
    /**
     * @var function(int keyCode, bool isRepeat)
     */
    main: null,
    /**
     * @var SpriteType 
     */
    sprites: [],
    /**
     * @var array
     */
    map: [],
    /**
     * @var PlayerType 
     */
    player: null,
    /**
     * @var float 
     */
    seconds: 0,
    /**
     * @var int
     */
    timer: null,
    /**
     * @var DoorType array
     */
    doors: [],
    /**
     * @var array 
     */
    vars: [],
    /**
     * @var int 
     */
    state: null,
    /**
     * @var bool 
     */
    paused: false,
    /**
     * @param GFX gfxHandle
     * @param Input inputHandle 
     */
    init: function(gfxHandle, inputHandle)
    {
        this.gfxHandle = gfxHandle;
        this.inputHandle = inputHandle;
        setInterval(this.doInput, 100, this.inputHandle);
    },
    /**
     * @param string src 
     * @return int
     */
    addSound: function(src)
    {
        var snd = new Sound(this.soundPath+src);
        this.sounds.push(snd);
        return this.sounds.length-1;
    },
    /**
     * @param int id 
     */
    playSound: function(id)
    {
        if(Game.canPlaySound && typeof(this.sounds[id]) !== 'undefined')
        {
            this.sounds[id].play();
        }
    },
    /**
     * @param int id
     */
    stopSound: function(id)
    {
        if(typeof(this.sounds[id]) !== 'undefined')
        {
            this.sounds[id].stop();
        }
    },
    /**
     * @param string path 
     */
    setSoundPath: function(path)
    {
        this.soundPath = path;
    },
    /**
     * @param function(int keyCode, bool isRepeat)
     */
    setMain: function(callback)
    {
        this.main = callback;
    },
    /**
     * @param int startX
     * @param int startY
     * @param int startLife
     * @param int startLives
     */
    initPlayer: function(startX, startY, startLife, startLives)
    {
        this.player = new PlayerType(startX, startY, startLife, startLives);
    },
    /**
     * @param Input inputHandle
     */
    doInput: function(inputHandle)
    {
        var keyCode  = inputHandle.getKeyPressed();
        var isRepeat = inputHandle.keyRepeated();
        
        if(!Game.paused)
        {
            if(Game.main)
            {
                Game.main(keyCode, isRepeat);
            }
        }
    },
    /**
     * @param int x
     * @param int y
     * @param int spriteId
     */
    drawSprite: function(x, y, spriteId)
    {
        this.drawSpriteXY(x*5+1, y*5+1, spriteId);
    },
    /**
     * @param int x
     * @param int y
     * @param int spriteId
     */
    drawSpriteXY: function(x, y, spriteId)
    {
        var sprite = this.sprites[spriteId];
        if(x >= 0 && x < 40 && y >= 0 && y < 25)
        {
            for(var r = 0; r <= 4; r++)
            {
                var row = sprite.rows[r];
                this.gfxHandle.locate(y+r, x);
                this.gfxHandle.color(row.color, row.background);
                this.gfxHandle.print(row.data);
            }
        }
    },
    startTimer: function()
    {
        this.seconds = 0;
        this.timer = setInterval(this.countSecond, 10);
    },
    stopTimer: function()
    {
        clearInterval(this.timer);
    },
    countSecond: function()
    {
        if(!Game.paused)
        {
            Game.seconds += 0.01;
        }
    },
    /**
     * @return string
     */
    getTimeString: function()
    {
        var seconds = parseInt(this.seconds);
        var minutes = parseInt(seconds / 60);
        seconds -= minutes * 60;
        
        return (minutes.toString() + ":" + (seconds < 10 ? "0" : "") + seconds.toString());
    },
    /**
     * @param int x
     * @param int y
     * @param int spriteId
     */
    addDoor: function(x, y, spriteId)
    {
        var door = new DoorType(x, y, spriteId);
        this.doors.push(door);
        this.map[x][y] = spriteId;
    },
    pause: function()
    {
        this.inputHandle.pause();
        this.paused = true;
        this.canPlaySound = false;
    },
    unpause: function()
    {
        this.inputHandle.unpause();
        this.paused = false;
        this.canPlaySound = true;
    },
    /**
     * @param int id
     * @param mixed value
     */
    setVar: function(id, value)
    {
        this.vars[id] = value;
    },
    /**
     * @param int id
     * @return mixed
     */
    getVar: function(id)
    {
        return (typeof(this.vars[id]) !== "undefined") ? this.vars[id] : null;
    }
}