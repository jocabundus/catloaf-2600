/**
 * This file is part of CATLOAF 2600.
 * Copyright (C) 2007-2020 Joe King - All Rights Reserved
 * https://games.joeking.us/
 */
"use strict";

var Constants = {
    StartLife : 100,
    StartLives: 5
}

var SpriteIds = {
    EMPTYSPACE      : 0,
    CATLOAF         : 1,
    CATLOAFDEAD     : 2,
    CATLOAFDARK     : 3,
    CATLOAFDEADDARK : 4,
    MEATLOAF        : 5,
    BRICKWALL       : 6,
    DOORGOLD        : 7,
    DOORSILVER      : 8,
    DOORSTONE       : 9,
    KEYGOLD         : 10,
    KEYSILVER       : 11,
    KEYSTONE        : 12,
    TRAP            : 13,
    BRICKWALLPSH    : 14,
    FENCE           : 15,
    TREE            : 16,
    LIGHTOFF        : 17,
    LIGHTON         : 18,
    PUSHBOULDER     : 19,
    GRAYWALL        : 20,
    PSHBLOCK        : 21,
    BARRICADE       : 22,
    BARRICADESWITCH : 23,
    ENDLEVEL        : 24,
    GOLDENDOVE      : 25,
    SUPREMEEYE      : 26,
    CRYSTALSNAKE    : 27,
    BRICKDOORA      : 28,
    BRICKDOORB      : 29,
    BRICKDOORC      : 30,
    BRICKDOORD      : 31,
    BRICKDOORSWITCHA: 32,
    BRICKDOORSWITCHB: 33,
    RESETDISABLED   : 34,
    RESETENABLED    : 35
}

var GameStates = {
    NoChange   : 0,
    Next       : 1,
    Previous   : 2,
    Reset      : 3,
    MainMenu   : 4,
    Intro      : 5,
    Init       : 6,
    PlayGame   : 7,
    InInventory: 8,
    InHelp     : 9,
    InAbout    : 10,
    EndGame    : 11,
    Dead       : 12,
    GameOver   : 13,
    QuitYesNo  : 14
}

var GameVars = {
    PUSHBOULDERX       : 0,
    PUSHBOULDERY       : 1,
    PUSHBOULDERSTARTX  : 2,
    PUSHBOULDERSTARTY  : 3,
    PUSHBOULDERPUSHED  : 4,
    PUSHBOULDERCOMPLETE: 5,
    RESETX             : 6,
    RESETY             : 7,
    RESETENABLED       : 8
}

var Sounds = {}             // filled out later in DATA_LoadSounds()
var RoomsRevealed = [];     // also filled out later in DATA_LoadSounds()

function DRAW_MainMenu()
{
    GFX.cls();
        
    GFX.color(15);
    GFX.print("****************************************");
    GFX.print("*                                      *");
    GFX.print("*                                      *");
    GFX.print("*                                      *");
    GFX.print("****************************************");
    for(var n = 0; n < 14; n++)
    {
        GFX.print("|   |                              |   |");
    }
    GFX.print("----------------------------------------");
    GFX.print("|   |                              |   |");
    GFX.print("|   |                              |   |");
    GFX.print("|   |                              |   |");
    GFX.print("|   |                              |   |");
    GFX.print("----------------------------------------");
    Game.drawSpriteXY(18, 8, SpriteIds.CATLOAF);
    GFX.writeText("CATLOAF 2600", 3, 14);
    GFX.writeText("Copyright (C) 2020", 18, 9);
    GFX.writeText("(H)How to Play   (A)About Game", 21, 7);
    GFX.writeText("press space to begin", 23, 14);
}

function STATE_MainMenu() {}
STATE_MainMenu.prototype.go = function(keyCode, isRepeat, initialize)
{
    if(initialize)
    {
        this.nextState = GameStates.NoChange;
        this.wait = false;
        Game.playSound(Sounds.Title);
    }
    
    if(initialize)
    {
        DRAW_MainMenu();
    }
    
    if(this.wait)
    {
        return GameStates.NoChange;
    }
    if(this.nextState == GameStates.NoChange)
    {
        if(keyCode == KeyCodes.space)
        {
            Game.drawSpriteXY(18, 8, SpriteIds.CATLOAFDEAD);
            Game.playSound(Sounds.Flash);
            var delay = FLASH();
            setTimeout(function(){
                Game.playSound(Sounds.Start);
                GFX.cls();
            }, delay+500);
            setTimeout(function(self){
                self.nextState = GameStates.Next;
                self.wait = false;
            }, delay+3000, this);
            this.wait = true
        }
        if(keyCode == KeyCodes.H)
        {
            return GameStates.InHelp;
        }
        if(keyCode == KeyCodes.A)
        {
            return GameStates.InAbout;
        }
    }
    
    return this.nextState;
}

function MAP_Draw()
{
    var player = Game.player;
    
    if(player.dark == 1) {
        GFX.cls();
        return;
    }
    
    var map = Game.map;
    for(var y = 0; y < 5; y++) {
        for(var x = 0; x < 8; x++) {
            var spriteId = map[x + player.gridX][y + player.gridY];
            Game.drawSprite(x, y, spriteId);
        }
    }
}

function MAP_NextRoom()
{
    MAP_Draw(); PLAYER_Update(true); PLAYER_Draw(true);
        
    var roomId = MAP_GetRoomId();
    if(RoomsRevealed[roomId] == false)
    {
        RoomsRevealed[roomId] = true;
        Game.playSound(Sounds.Reveal);
    }
    else
    {
        Game.playSound(Sounds.Reveal2);
    }
}

function PLAYER_Draw(force)
{
    var player = Game.player;
    
    force = (typeof(force) !== 'undefined') ? force : false;
    
    // Erase the player's old position if he moved
    if(player.hasMoved) {
        Game.drawSprite(player.oldX, player.oldY, SpriteIds.EMPTYSPACE);
    }
    
    if(player.hasMoved || force) {
        // Draw the player
        if(player.dark == 0) {
            if(player.life > 0) {
                Game.drawSprite(player.x, player.y, SpriteIds.CATLOAF);
            } else {
                Game.drawSprite(player.x, player.y, SpriteIds.CATLOAFDEAD);
            }
        } else {
            if(player.life > 0) {
                Game.drawSprite(player.x, player.y, SpriteIds.CATLOAFDARK);
            } else {
                Game.drawSprite(player.x, player.y, SpriteIds.CATLOAFDEAD);
            }
        }
    }
}

function STATE_Intro() {}
STATE_Intro.prototype.go = function(keyCode, isRepeat, initialize)
{
    if(initialize)
    {
        this.step = 0;
        this.timeouts = [];
    }
    
    switch(this.step)
    {
        case 0:
            GFX.cls();
            
            Game.drawSpriteXY(18, 6, SpriteIds.MEATLOAF);
            GFX.writeText("MASTER  MEATLOAF", 3, 4);
            Game.playSound(Sounds.Meatloaf);
            
            setTimeout(function(self){ if(self.step < 2) self.step = 2; }, 1500, this);
            
            this.step += 1
            return GameStates.NoChange;
            break;
       case 1:
            // wait for timeout or keypress
            break;
       case 2:
            GFX.locate(14, 1); GFX.print(TEXT_Repeat(" ", 40)); GFX.writeText("CATLOAF!", 14, 15, true);
            Game.playSound(Sounds.Meatloaf);
            this.step += 1
            return GameStates.NoChange;
            break;
       case 3:
            // wait for keypress
            break;
       case 4:
            GFX.locate(14, 1); GFX.print(TEXT_Repeat(" ", 40)); GFX.writeText("You are nothing but bread to me!", 14, 15, true);
            Game.playSound(Sounds.Meatloaf);
            this.step += 1
            return GameStates.NoChange;
            break;
       case 5:
            // wait for keypress
            break;
       case 6:
            GFX.locate(14, 1); GFX.print(TEXT_Repeat(" ", 40)); GFX.writeText("Find me or perish!", 14, 15, true);
            Game.playSound(Sounds.Meatloaf);
            this.step += 1
            return GameStates.NoChange;
            break;
       case 7:
            // wait for keypress
            break;
       case 8:
            GFX.cls();
            Game.playSound(Sounds.Meatloaf);
            this.timeouts.push(setTimeout(function(){
                    Game.playSound(Sounds.Enter);
                }, 1000));
            this.timeouts.push(setTimeout(function(){
                GFX.locate(14, 1); GFX.print(TEXT_Repeat(" ", 40)); GFX.writeText("Entering the labyrinth...", 10, 15);
            }, 2000));
            this.timeouts.push(setTimeout(function(){
                GFX.cls();
            }, 5500));
            this.timeouts.push(setTimeout(function(self){
                self.step += 1;
            }, 6000, this));
            this.step += 1;
            return GameStates.NoChange;
            break;
        case 9:
            // wait for timeout
            if(keyCode && !isRepeat) {
                for(var i = 0; i < this.timeouts.length; i++) {
                    clearTimeout(this.timeouts[i]);
                }
                this.step += 1;
            }
            return GameStates.NoChange;
            break;
        case 10:
            this.step = 0;
            return GameStates.Next;
            break;
    }
    if(keyCode && !isRepeat)
    {
        this.step += 1;
    }
    return GameStates.NoChange;
}

function MAIN(keyCode, isRepeat)
{
    var self = MAIN;
    
    if(typeof(self.instances) === "undefined")
    {
        self.functions = {};
        self.functions[GameStates.MainMenu   ] = STATE_MainMenu;
        self.functions[GameStates.Intro      ] = STATE_Intro;
        self.functions[GameStates.Init       ] = STATE_InitGame;
        self.functions[GameStates.PlayGame   ] = STATE_PlayGame;
        self.functions[GameStates.InInventory] = STATE_ShowInventory;
        self.functions[GameStates.InHelp     ] = STATE_ShowHelp;
        self.functions[GameStates.InAbout    ] = STATE_ShowAbout;
        self.functions[GameStates.QuitYesNo  ] = STATE_QuitYesNo;
        self.functions[GameStates.EndGame    ] = STATE_EndGame;
        self.functions[GameStates.Dead       ] = STATE_Dead;
        self.functions[GameStates.GameOver   ] = STATE_GameOver;
        
        self.sequence = [
            GameStates.MainMenu,
            GameStates.Intro,
            GameStates.Init,
            GameStates.PlayGame,
            GameStates.EndGame,
            GameStates.GameOver
        ];
        
        self.oldState = Game.state;
        self.stateChanged = true;
        self.waitForKeyboardRelease = true;
        self.instances = [];
    }
    
    if(self.waitForKeyboardRelease)
    {
        if(keyCode && !isRepeat)
        {
            self.waitForKeyboardRelease = false;
        }
        else
        {
            keyCode = 0;
        }
    }
    
    var initialize = self.stateChanged;
    var nextState = false;
    
    if(typeof(self.instances[Game.state]) === "undefined")
    {
        var state = self.functions[Game.state];
        self.instances[Game.state] = new state();
    }
    
    var instance = self.instances[Game.state];
    nextState = instance.go(keyCode, isRepeat, initialize);
    
    switch(nextState)
    {
        case GameStates.NoChange:
            nextState = Game.state;
            break;
        case GameStates.Next:
            for(var i = 0; i < self.sequence.length; i++)
            {
                if(self.sequence[i] == Game.state)
                {
                    nextState = self.sequence[i+1];
                    self.oldState = Game.state;
                    break;
                }
            }
            break;
        case GameStates.Previous:
            nextState = self.oldState;
            self.oldState = Game.state;
            break;
        case GameStates.Reset:
            nextState = self.sequence[0];
            self.oldState = Game.state;
            break;
        default:
            if(nextState != Game.state)
            {
                self.oldState = Game.state;
            }
            break;
    }
    if(nextState != Game.state)
    {
        self.stateChanged = true;
        self.waitForKeyboardRelease = true;
    }
    else
    {
        self.stateChanged = false;
    }
    Game.state = nextState;
}

function STATE_InitGame() {}
STATE_InitGame.prototype.go = function(keyCode)
{
    DATA_LoadMap();
    Game.playSound(Sounds.Respawn);
    Game.startTimer();
    return GameStates.Next;
}

function STATE_PlayGame() {}
STATE_PlayGame.prototype.go = function(keyCode, isRepeat, initialize)
{
    var player = Game.player;
    
    if(initialize)
    {
        MAP_Draw();
        PLAYER_Draw(true);
        this.step = 0;
    }
    
    PLAYER_Draw();
    player.hasMoved = false;
    
    var nextState = null;
    
    if(keyCode == KeyCodes.right || keyCode == KeyCodes.L     ) { nextState = PLAYER_Move( 1,  0); }
    if(keyCode == KeyCodes.left  || keyCode == KeyCodes.J     ) { nextState = PLAYER_Move(-1,  0); }
    if(keyCode == KeyCodes.down  || keyCode == KeyCodes.K     ) { nextState = PLAYER_Move( 0,  1); }
    if(keyCode == KeyCodes.up    || keyCode == KeyCodes.I     ) { nextState = PLAYER_Move( 0, -1); }
    if(keyCode == KeyCodes.space || keyCode == KeyCodes.tab   ) { nextState = GameStates.InInventory; }
    if(keyCode == KeyCodes.H                                  ) { nextState = GameStates.InHelp; }
    if(keyCode == KeyCodes.Q     || keyCode == KeyCodes.escape) { nextState = GameStates.QuitYesNo; }
    
    PLAYER_Draw();
    
    if(player.life <= 0)
    {
        nextState = GameStates.Dead;
        Game.playSound(Sounds.Flash);
    }
    
    return (nextState === null) ? GameStates.NoChange : nextState;
}

function STATE_Dead() {}
STATE_Dead.prototype.go = function(keyCode, isRepeat, initialize)
{
    var player = Game.player;
    
    if(initialize)
    {
        this.step = 0;
        this.nextState = GameStates.NoChange;
    }
    
    switch(this.step)
    {
        case 0:
            player.lives -= 1;
            this.step += 1;
            return GameStates.NoChange;
            break;
        case 1:
            
            var delay = 300;
            var interval = 33;
            
            setTimeout(function(){
                // give the player a chance to see the map
                // again if in the dark
                if(Game.player.dark == 1)
                {
                    Game.player.dark = 0
                    MAP_Draw();
                    PLAYER_Draw(true);
                    Game.player.dark = 1
                }
            }, delay);
            
            delay = FLASH(300) + 500;
            setTimeout(function(self){ self.step += 1 }, delay, this);
            this.step += 1;
            return GameStates.NoChange;
            break;
        case 2:
            // wait for timeout to increment this.step
            return GameStates.NoChange;
            break;
        case 3:
            GFX.color(null, 4);
            GFX.writeText("[    YOU GOT PWNED!!!    ]", 4, 15);
            Game.playSound(Sounds.Meatloaf);
            setTimeout(function(self){ self.step += 1 }, 300, this);
            this.step += 1;
            return GameStates.NoChange;
            break;
        case 4:
            // wait for timeout
            return GameStates.NoChange;
            break;
        case 5:
            // wait for keypress
            break;
        case 6:
            GFX.color(null, 1);
            GFX.writeText("[        LIVES: " + player.lives.toString() + "        ]", 4, 15);
            GFX.color(null, 0);
            Game.playSound(Sounds.Meatloaf);
            setTimeout(function(self){ self.step += 1 }, 300, this);
            this.step += 1;
            return GameStates.NoChange;
            break;
        case 7:
            // wait for timeout
            return GameStates.NoChange;
            break;
        case 8:
            // wait for keypress
            break;
        case 9:
            if(player.lives <= 0)
            {
                GFX.cls();
                Game.playSound(Sounds.Meatloaf);
                setTimeout(function(self){
                    self.nextState = GameStates.GameOver;
                }, 1000, this);
                this.step += 1;
                return GameStates.NoChange;
            }
            else
            {
                Game.playSound(Sounds.Respawn);
                PLAYER_Respawn();
                return GameStates.PlayGame;
            }
            break;
        case 10:
            // wait for timeout
            return this.nextState;
            break;
    }
    if(keyCode && !isRepeat)
    {
        this.step += 1;
    }
    return this.nextState;
}

/**
 * @param int x
 * @param int y 
 */
function PLAYER_Move(x, y)
{
    PLAYER_Update();
    
    var nextState = null;
    
    var player = Game.player;
    
    player.x += x;
    player.y += y;
    
    var map = Game.map;
    
    var mapX = (player.x + player.gridX);
    var mapY = (player.y + player.gridY);
    var drawMapX = mapX - player.gridX;
    var drawMapY = mapY - player.gridY;
    
    var pushX = mapX + x;
    var pushY = mapY + y;
    var drawPushX = pushX - player.gridX;
    var drawPushY = pushY - player.gridY;
    
    var spriteId = Game.map[mapX][mapY];
    if(spriteId != SpriteIds.EMPTYSPACE)
    {
        var changeSpriteTo = 0;
        switch(spriteId)
        {
            case SpriteIds.TRAP:
                player.life = 0;
                changeSpriteTo = -1;
                break;
            case SpriteIds.KEYGOLD:
                player.inv.goldKeys += 1;
                Game.playSound(Sounds.PickupKey);
                break;
            case SpriteIds.KEYSILVER:
                player.inv.silverKeys += 1;
                Game.playSound(Sounds.PickupKey);
                break;
            case SpriteIds.KEYSTONE:
                player.inv.stoneKeys += 1;
                Game.playSound(Sounds.PickupKey);
                break;
            case SpriteIds.GOLDENDOVE:
                player.inv.goldenDove = 1;
                Game.playSound(Sounds.Bonus);
                break;
            case SpriteIds.SUPREMEEYE:
                player.inv.supremeEye = 1;
                Game.playSound(Sounds.Bonus);
                break;
            case SpriteIds.CRYSTALSNAKE:
                player.inv.crystalSnake = 1;
                Game.playSound(Sounds.Bonus);
                break;
            case SpriteIds.DOORGOLD:
                if(player.inv.goldKeys > 0) {
                    player.inv.goldKeys -= 1;
                    Game.playSound(Sounds.Unlock);
                } else {
                    PLAYER_Backstep();
                    changeSpriteTo = -1;
                    Game.playSound(Sounds.DoorBlocked);
                }
                break;
            case SpriteIds.DOORSILVER:
                if(player.inv.silverKeys > 0) {
                    player.inv.silverKeys -= 1;
                    Game.playSound(Sounds.Unlock);
                } else {
                    PLAYER_Backstep();
                    changeSpriteTo = -1;
                    Game.playSound(Sounds.DoorBlocked);
                }
                break;
            case SpriteIds.DOORSTONE:
                if(player.inv.stoneKeys > 0) {
                    player.inv.stoneKeys -= 1;
                    Game.playSound(Sounds.Unlock);
                } else {
                    PLAYER_Backstep();
                    changeSpriteTo = -1;
                    Game.playSound(Sounds.DoorBlocked);
                }
                break;
            case SpriteIds.BRICKWALLPSH:
                if(map[pushX][pushY] == SpriteIds.EMPTYSPACE)
                {
                    map[pushX][pushY] = spriteId;
                    Game.drawSprite(drawPushX, drawPushY, spriteId);
                    Game.playSound(Sounds.PushWall);
                }
                else
                {
                    PLAYER_Backstep();
                    changeSpriteTo = -1;
                    Game.playSound(Sounds.Blocked);
                }
                break;
            case SpriteIds.PUSHBOULDER:
                if(map[pushX][pushY] == SpriteIds.EMPTYSPACE)
                {
                    map[pushX][pushY] = spriteId;
                    Game.drawSprite(drawPushX, drawPushY, spriteId);
                    Game.setVar(GameVars.PUSHBOULDERX, pushX);
                    Game.setVar(GameVars.PUSHBOULDERY, pushY);
                    Game.playSound(Sounds.PushWall);
                    if(!Game.getVar(GameVars.PUSHBOULDERPUSHED))
                    {
                        MAP_HideDoor(SpriteIds.BRICKDOORC);
                        MAP_ShowDoor(SpriteIds.BRICKDOORD);
                        Game.setVar(GameVars.PUSHBOULDERPUSHED, true);
                    }
                    if(!Game.getVar(GameVars.RESETENABLED))
                    {
                        var resetX = Game.getVar(GameVars.RESETX);
                        var resetY = Game.getVar(GameVars.RESETY);
                        var drawX  = (resetX - player.gridX);
                        var drawY  = (resetY - player.gridY);
                        map[resetX][resetY] = SpriteIds.RESETENABLED;
                        Game.drawSprite(drawX, drawY, SpriteIds.RESETENABLED);
                        Game.setVar(GameVars.RESETENABLED, true);
                    }
                }
                else if(map[pushX][pushY] == SpriteIds.BARRICADESWITCH)
                {
                    map[pushX][pushY] = spriteId;
                    Game.drawSprite(drawPushX, drawPushY, spriteId);
                    MAP_HideDoor(SpriteIds.BARRICADE);
                    Game.setVar(GameVars.PUSHBOULDERCOMPLETE, true);
                    Game.playSound(Sounds.Unlock);
                }
                else
                {
                    PLAYER_Backstep();
                    changeSpriteTo = -1;
                    Game.playSound(Sounds.Blocked);
                }
                break;
            case SpriteIds.RESETENABLED:
                var delay = FLASH(0, null, 2);
                setTimeout(function(x, y){
                    if(Game.getVar(GameVars.PUSHBOULDERCOMPLETE))
                    {
                        PLAYER_ToRandomDoor(SpriteIds.RANDOMTELEPORT);
                    }
                    else
                    {
                        // erase current
                        var currentX = Game.getVar(GameVars.PUSHBOULDERX);
                        var currentY = Game.getVar(GameVars.PUSHBOULDERY);
                        var drawX = (currentX - player.gridX);
                        var drawY = (currentY - player.gridY);
                        map[currentX][currentY] = SpriteIds.EMPTYSPACE;
                        Game.drawSprite(drawX, drawY, SpriteIds.EMPTYSPACE);
                        // reset to start position
                        var resetX   = Game.getVar(GameVars.PUSHBOULDERSTARTX);
                        var resetY   = Game.getVar(GameVars.PUSHBOULDERSTARTY);
                        drawX = (resetX - player.gridX);
                        drawY = (resetY - player.gridY);
                        map[resetX][resetY] = SpriteIds.PUSHBOULDER;
                        Game.drawSprite(drawX, drawY, SpriteIds.PUSHBOULDER);
                        Game.setVar(GameVars.PUSHBOULDERX, resetX);
                        Game.setVar(GameVars.PUSHBOULDERY, resetY);
                    }
                }, delay);
                if(!Game.getVar(GameVars.PUSHBOULDERCOMPLETE))
                {
                    // set reset switch to disabled
                    var resetX = Game.getVar(GameVars.RESETX);
                    var resetY = Game.getVar(GameVars.RESETY);
                    var drawX  = (resetX - player.gridX);
                    var drawY  = (resetY - player.gridY);
                    Game.drawSprite(drawX, drawY, SpriteIds.RESETDISABLED);
                    map[resetX][resetY] = SpriteIds.RESETDISABLED;
                    Game.setVar(GameVars.RESETENABLED, false);
                }
                PLAYER_Backstep();
                changeSpriteTo = -1;
                Game.playSound(Sounds.Flash);
                break;
            case SpriteIds.BRICKDOORSWITCHA:
                MAP_HideDoor(SpriteIds.BRICKDOORA);
                MAP_ShowDoor(SpriteIds.BRICKDOORB);
                changeSpriteTo = SpriteIds.BRICKDOORSWITCHB;
                Game.drawSprite(drawMapX, drawMapY, SpriteIds.BRICKDOORSWITCHB);
                PLAYER_Backstep();
                Game.playSound(Sounds.DoorSwitch);
                break;
            case SpriteIds.BRICKDOORSWITCHB:
                MAP_HideDoor(SpriteIds.BRICKDOORB);
                MAP_ShowDoor(SpriteIds.BRICKDOORA);
                changeSpriteTo = SpriteIds.BRICKDOORSWITCHA;
                Game.drawSprite(drawMapX, drawMapY, SpriteIds.BRICKDOORSWITCHA);
                PLAYER_Backstep();
                Game.playSound(Sounds.DoorSwitch);
                break;
            case SpriteIds.PSHBLOCK:
                changeSpriteTo = -1;
                break;
            case SpriteIds.BARRICADESWITCH:
                changeSpriteTo = -1;
                break;
            case SpriteIds.ENDLEVEL:
                player.inv.endToken = 1;
                nextState = GameStates.Next;
                break;
            case SpriteIds.LIGHTOFF:
                player.dark = 1
                changeSpriteTo = -1;
                GFX.cls();
                Game.playSound(Sounds.LightSwitch);
                break;
            case SpriteIds.LIGHTON:
                player.dark = 0;
                changeSpriteTo = -1;
                break;
            default:
                PLAYER_Backstep();
                changeSpriteTo = -1;
                Game.playSound(Sounds.Blocked);
                break;
        }
        if(changeSpriteTo >= 0)
        {
            Game.map[mapX][mapY] = changeSpriteTo;
        }
    }
    else
    {
        Game.playSound(Sounds.Move);
    }
    
    player.hasMoved = (player.x != player.oldX || player.y != player.oldY);
    
    var newRoom = false;
    
    if(player.x > 7) { player.x = 0; player.gridX += 8; newRoom = true; }
    if(player.x < 0) { player.x = 7; player.gridX -= 8; newRoom = true; }
    if(player.y > 4) { player.y = 0; player.gridY += 5; newRoom = true; }
    if(player.y < 0) { player.y = 4; player.gridY -= 5; newRoom = true; }
    
    if(newRoom)
    {
        MAP_NextRoom();
    }
    
    return (nextState ? nextState : GameStates.NoChange);
}

function PLAYER_Update(setRespawn)
{
    var player = Game.player;
    
    player.oldX = player.x
    player.oldY = player.y
    
    setRespawn = (typeof(setRespawn) !== 'undefined') ? setRespawn : false;
    if(setRespawn)
    {
        player.spawnX = player.x;
        player.spawnY = player.y;
        player.spawnDark = player.dark;
    } 
}

function PLAYER_Backstep()
{
    var player = Game.player;
    player.x = player.oldX;
    player.y = player.oldY;
}

function PLAYER_Respawn()
{
    var player = Game.player;
    player.x = player.spawnX;
    player.y = player.spawnY;
    player.dark = player.spawnDark;
    player.oldX = player.x;
    player.oldY = player.y;
    player.life = 100;
    player.hasMoved = false;
}

function PLAYER_ToRandomDoor(spriteId)
{
    var doors = [];
    for(var n = 0; n < Game.doors.length; n++)
    {
        var door = Game.doors[n];
        if(door.spriteId == spriteId)
        {
            doors.push(door);
        }
    }
    var randomDoor = parseInt(Math.random()*doors.length);
    var player = Game.player;
    var doorX = doors[randomDoor].x;
    var doorY = doors[randomDoor].y;
    player.x = (doorX % 8);
    player.y = (doorY % 5);
    player.gridX = parseInt(doorX / 8) * 8;
    player.gridY = parseInt(doorY / 5) * 5;
    MAP_NextRoom();
}

function MAP_HideDoor(spriteId)
{
    var player = Game.player;
    for(var n = 0; n < Game.doors.length; n++)
    {
        var door = Game.doors[n];
        if(door.spriteId == spriteId)
        {
            Game.map[door.x][door.y] = SpriteIds.EMPTYSPACE;
            Game.drawSprite(door.x-player.gridX, door.y-player.gridY, SpriteIds.EMPTYSPACE);
        }
    }
}

function MAP_ShowDoor(spriteId)
{
    var player = Game.player;
    for(var n = 0; n < Game.doors.length; n++)
    {
        var door = Game.doors[n];
        if(door.spriteId == spriteId)
        {
            Game.map[door.x][door.y] = spriteId;
            Game.drawSprite(door.x-player.gridX, door.y-player.gridY, spriteId);
        }
    }
}

function STATE_ShowHelp() {}
STATE_ShowHelp.prototype.go = function(keyCode, isRepeat, initialize)
{
    if(initialize)
    {
        GFX.cls();
        
        GFX.writeText("Use arrow keys or (I,J,K,L) to move", 1, 15);
        GFX.writeText("Press SPACE (or TAB) to view inventory", 3, 15);
        
        GFX.writeText("Basic Obstacles:", 5, 15);
        
        Game.drawSpriteXY(2, 5, SpriteIds.TRAP);
        GFX.color(15, 0);
        GFX.locate(7, 8); GFX.print("TRAP - Avoid these at all cost!");
        
        Game.drawSpriteXY(2, 10, SpriteIds.DOORGOLD);
        Game.drawSpriteXY(36, 10, SpriteIds.KEYGOLD);
        GFX.color(15, 0);
        GFX.locate(12, 8); GFX.print("GOLD DOOR   - Opens with key");
        
        Game.drawSpriteXY(2, 16, SpriteIds.DOORSILVER);
        Game.drawSpriteXY(36, 16, SpriteIds.KEYSILVER);
        GFX.color(15, 0);
        GFX.locate(18, 8); GFX.print("SILVER DOOR - Opens with key");
        
        Game.drawSpriteXY(2, 21, SpriteIds.LIGHTOFF);
        GFX.color(15, 0);
        GFX.locate(23, 8); GFX.print("LIGHTSWITCH - Turns off lights");
        
        Game.playSound(Sounds.Notice);
    }
    
    if(keyCode != 0)
    {
        Game.playSound(Sounds.Notice);
        return GameStates.Previous;
    }
    
    return GameStates.NoChange;
}

function STATE_ShowInventory() {}
STATE_ShowInventory.prototype.go = function(keyCode, isRepeat, initialize)
{
    var player = Game.player;
    
    if(initialize)
    {
        GFX.cls();
        
        GFX.writeText("INVENTORY", 3, 15);
        
        GFX.locate(6, 2);
        GFX.print("LIVES: " + player.lives.toString());
        
        GFX.locate(10, 2);
        GFX.color(14); GFX.print("GOLD KEYS  : " + player.inv.goldKeys.toString());
        GFX.locate(11, 2);
        GFX.color( 7); GFX.print("SILVER KEYS: " + player.inv.silverKeys.toString());
        GFX.locate(12, 2);
        GFX.color( 8); GFX.print("STONE KEYS : " + player.inv.stoneKeys.toString());
        
        GFX.locate(10, 26);
        GFX.color(15); GFX.print("SPECIAL ITEMS");
        var y = 11;
        if(player.inv.goldenDove   == 1) { Game.drawSpriteXY(30, y, SpriteIds.GOLDENDOVE  ); y += 5; }
        if(player.inv.supremeEye   == 1) { Game.drawSpriteXY(30, y, SpriteIds.SUPREMEEYE  ); y += 5; }
        if(player.inv.crystalSnake == 1) { Game.drawSpriteXY(30, y, SpriteIds.CRYSTALSNAKE)          }
        
        Game.playSound(Sounds.Notice);
    }
    
    GFX.locate(20, 2);
    GFX.color(15); GFX.print("ELAPSED TIME: " + Game.getTimeString());
    
    if(keyCode != 0)
    {
        Game.playSound(Sounds.Notice);
    }
    
    return (keyCode != 0) ? GameStates.PlayGame : GameStates.NoChange;
}

function STATE_ShowAbout() {}
STATE_ShowAbout.prototype.go = function(keyCode, isRepeat, initialize)
{
    if(initialize)
    {
        GFX.cls();
        GFX.writeText("CATLOAF 2600", 3, 14);
        GFX.writeText("Created by Joe King", 7, 15);
        GFX.writeText("Copyright (C) 2007-2020 Joe King", 11, 15);
        GFX.writeText("All Rights Reserved", 13, 15);
        GFX.writeText("https://games.joeking.us", 15, 15);
        GFX.writeText("SPECIAL THANKS", 19, 9);
        GFX.writeText("ChipTone (SFB Games)", 21, 7);
        GFX.writeText("FFmpeg  (ffmpeg.org)", 23, 7);
        Game.playSound(Sounds.Notice);
    }
    
    if(keyCode != 0)
    {
        Game.playSound(Sounds.Notice);
        return GameStates.Previous;
    }
    
    return GameStates.NoChange;
}

function STATE_QuitYesNo() {}
STATE_QuitYesNo.prototype.go = function(keyCode, isRepeat, initialize)
{
    if(initialize)
    {
        this.nextState = GameStates.NoChange;
    }
    
    if(initialize)
    {
        GFX.color(null, 1);
        GFX.writeText("[    QUIT GAME? (Y/N)    ]", 4, 15);
        GFX.color(null, 0);
        
        Game.playSound(Sounds.Notice);
    }
    
    if(this.nextState == GameStates.NoChange)
    {
        if(keyCode == KeyCodes.Y)
        {
            setTimeout(function(self){
                self.nextState = GameStates.GameOver;
            }, 1500, this);
            GFX.cls();
            Game.playSound(Sounds.Flash);
        }
        if(keyCode == KeyCodes.N) {
            Game.playSound(Sounds.Notice);
            this.nextState = GameStates.Previous;
        }
    }
    
    return this.nextState;
}

function STATE_EndGame() {}
STATE_EndGame.prototype.go = function(keyCode, isRepeat, initialize)
{
    if(initialize)
    {
        this.monologue = [];
        this.printMonologue = true;
        this.step = -4;
    }
    
    if(initialize)
    {
        Game.stopTimer();
        Game.player.inv.endToken = 1;
        
        var delay = FLASH(0, null, 25);
        setTimeout(function(self){
            if(self.step < -2) {
                self.step = -2;
            }
        }, delay+2000, this);
        setTimeout(function(){
            Game.playSound(Sounds.Flash);
        }, parseInt(delay / 3));
        setTimeout(function(){
            Game.playSound(Sounds.Flash);
        }, parseInt(delay / 3)*2);
        setTimeout(function(self){
            Game.playSound(Sounds.Flash);
            GFX.cls();
            self.step = -3;
        }, parseInt(delay / 3)*3, this);
        Game.playSound(Sounds.Flash);
    }
    
    var player = Game.player;
    var numItems = (player.inv.goldenDove + player.inv.supremeEye + player.inv.crystalSnake);
    
    var monologues = {
        begin: [
            "CATLOAF!",
            "You have survived my labyrinth...",
            "...which takes much skill."
        ],
        tooLong: [
            "But you have taken too much time.",
            "Complete my labyrinth...",
            "...in less than 5 minutes.",
            "Only then can prove your l33tness."
        ],
        notAllItems: [
            "You are good...",
            "...but not good enough!",
            "There are 3 special items within."
        ],
        noItems: [
            "You have none!",
            "You must find them...",
            "...to prove your l33tness."
        ],
        someItems: [
            "You only have "+numItems.toString()+".",
            "You must find the rest...",
            "...to prove your l33tness."
        ],
        allItems: [
            "Good job.",
            "And you found all the special items.",
            "All under five minutes.",
            "Most excellent.",
            "I am not worthy of you.",
            "",
            "What's the matter?",
            "Were you expecting a fight...",
            "...or an epic boss battle?",
            "MWAHAHAHA!!!",
            "Think again!"
        ]
    };
    
    if(initialize)
    {
        var m = [];
        m = m.concat(monologues.begin);
        if(Game.seconds >= 300)
        {
            m = m.concat(monologues.tooLong);
        }
        else
        {
            if(numItems < 3)
            {
                m = m.concat(monologues.notAllItems);
                m = m.concat((numItems == 0) ? monologues.noItems : monologues.someItems);
            }
            else
            {
                m = m.concat(monologues.allItems);
            }
        }
        this.monologue = m;
    }
    
    var text = "";
    if(this.step >= 0)
    {
        text = this.monologue[this.step];
    }
    switch(this.step)
    {
        case -7:
            GFX.cls();
            setTimeout(function(self){
                if(self.step < -3) {
                    self.step += 1;
                }
            }, 1000, this);
            this.step += 1;
            return GameStates.NoChange;
            break;
        case -6:
            // wait for timeout or keypress
            break;
        case -5:
            return GameStates.Next;
            break;
        case -4:
            return GameStates.NoChange;
            break;
        case -3:
            // wait for timeout or keypress
            break;
        case -2:
            GFX.cls();
            Game.drawSpriteXY(18, 6, SpriteIds.MEATLOAF);
            GFX.writeText("MASTER  MEATLOAF", 3, 4);
            Game.playSound(Sounds.Meatloaf);
            setTimeout(function(self){
                if(self.step < 0) {
                    Game.playSound(Sounds.Meatloaf);
                    self.step += 1;
                }
            }, 1500, this);
            this.step += 1;
            break;
        case -1:
            // wait for timeout or keypress
            break;
        default:
            if(this.printMonologue)
            {
                GFX.locate(14, 1); GFX.print(TEXT_Repeat(" ", 40)); GFX.writeText(text, 14, 15, true);
                this.printMonologue = false;
            }
            break;
    }
    if(keyCode && !isRepeat)
    {
        Game.playSound(Sounds.Meatloaf);
        this.printMonologue = true;
        this.step += 1;
        if(this.step >= this.monologue.length)
        {
            this.step = -7;
        }
    }
    return GameStates.NoChange;
}

function STATE_GameOver() {}
STATE_GameOver.prototype.go = function(keyCode, isRepeat, initialize)
{
    if(initialize)
    {
        this.step = 0;
    }
    
    var player = Game.player;
    var showCompleted = false;
    
    switch(this.step)
    {
        case 0:
            Game.stopTimer();
            GFX.cls();
            GFX.writeText("GAME  OVER", 8, 12);
            GFX.writeText(Game.getTimeString(), 15, 15);
            Game.playSound(Sounds.GameOver);
            this.step += 1;
            break;
        case 1:
            setTimeout(function(self){ self.step += 1; }, 300, this);
            this.step += 1;
            return GameStates.NoChange;
            break;
        case 2:
            // wait for timeout
            return GameStates.NoChange;
            break;
        case 3:
            if(keyCode && !isRepeat)
            {
                GFX.cls();
                Game.stopSound(Sounds.GameOver);
                Game.playSound(Sounds.Meatloaf);
                setTimeout(function(self){ self.step += 1 }, 1000, this);
                this.step += 1;
            }
            return GameStates.NoChange;
            break;
        case 4:
            // wait for timeout
            return GameStates.NoChange;
            break;
        case 5:
            if(player.inv.endToken)
            {
                showCompleted = true;
                this.step += 1;
            }
            else
            {
                this.step = 0;
                return GameStates.Reset;
            }
            break;
        case 6:
            if(keyCode != 0)
            {
                GFX.cls();
                Game.playSound(Sounds.Meatloaf);
                setTimeout(function(self){ self.step += 1 }, 1000, this);
                this.step += 1;
            }
            return GameStates.NoChange;
            break;
         case 7:
            // wait for timeout
            return GameStates.NoChange;
            break;
         case 8:
            this.step = 0;
            return GameStates.Reset;
            break;
    }
    
    if(showCompleted)
    {
        var itemsFound = (player.inv.goldenDove + player.inv.supremeEye + player.inv.crystalSnake);
        if(itemsFound == 3)
        {
            GFX.cls();
            GFX.writeText("CONGRATULATIONS!", 4, 15);
            GFX.writeText("You found all the secret items", 6, 15);
            
            Game.drawSprite(18, 7, GOLDENDOVE);
            Game.drawSprite(18, 12, SUPREMEEYE);
            Game.drawSprite(18, 17, CRYSTALSNAKE);
            
            if(Game.seconds >= 300)
            {
                GFX.writeText("Now find them all in under 5 minutes!", 23, 15);
                Game.playSound(Sounds.Forgot);
            }
            else
            {
                GFX.writeText("Thanks for playing!", 23, 15);
                Game.playSound(Sounds.Start);
            }
        }
        else
        {
            GFX.cls();
            GFX.writeText("You forgot something", 4, 15);
            
            if(player.inv.goldenDove == 0)
            {
                Game.drawSpriteXY(18, 7, SpriteIds.GOLDENDOVE);
                GFX.color(14); GFX.locate(9, 3); GFX.print("Golden Dove");
            }
            if(player.inv.supremeEye == 0)
            {
                Game.drawSpriteXY(18, 12, SpriteIds.SUPREMEEYE);
                GFX.color(9); GFX.locate(14, 3); GFX.print("Supreme Eye");
            }
            if(player.inv.crystalSnake == 0)
            {
                Game.drawSpriteXY(18, 17, SpriteIds.CRYSTALSNAKE);
                GFX.color(10); GFX.locate(19, 3); GFX.print("Crystal Snake");
            }
            
            if(itemsFound == 2)
            {
                GFX.writeText("Find this item next time", 23, 15);
            }
            else
            {
                GFX.writeText("Find these items next time", 23, 15);
            }
            Game.playSound(Sounds.Forgot);
        }
    }
    
    return GameStates.NoChange;
}

function FLASH(delay, interval, repeat)
{
    delay    = (typeof(delay   ) == "undefined") ? 500 : ((delay === null   ) ? 500 : delay   );
    interval = (typeof(interval) == "undefined") ?  33 : ((interval === null) ?  33 : interval);
    repeat   = (typeof(repeat  ) == "undefined") ?   8 : ((repeat === null  ) ?   8 : repeat  );
    
    for(var i = 0; i < repeat; i++)
    {
        setTimeout(function(){ GFX.cls(null, 15) }, delay); delay += interval;
        setTimeout(function(){ GFX.cls(null,  4) }, delay); delay += interval;
        setTimeout(function(){ GFX.cls(null, 15) }, delay); delay += interval;
        setTimeout(function(){ GFX.cls(null,  0) }, delay); delay += interval*2;
    }
    return (delay - interval*2);
}

function SYSTEM_Init()
{
    GFX.init('gfxtable');
    Input.init('gamewindow');
    Game.init(GFX, Input);
    DATA_LoadSprites();
}

function DATA_LoadSprites()
{
    var r = 0;
    var n = 0;
    while(typeof(data.sprites[r]) !== 'undefined')
    {
        var sprite = new SpriteType();
        for(var y = 0; y < 5; y++)
        {
            var row = data.sprites[r]; r += 1;
            sprite.rows[y] = new SpriteRow();
            sprite.rows[y].data       = row[0];
            sprite.rows[y].color      = row[1];
            sprite.rows[y].background = row[2];
        }
        Game.sprites[n] = sprite; n += 1;
    }
}

function DATA_LoadSounds()
{
    Game.setSoundPath("sound/");
    Sounds.Blocked     = Game.addSound("blocked.mp3");
    Sounds.DoorBlocked = Game.addSound("blocked2.mp3");
    Sounds.PushWall    = Game.addSound("push.mp3");
    Sounds.PickupKey   = Game.addSound("key.mp3");
    Sounds.GameOver    = Game.addSound("gameover.mp3");
    Sounds.Flash       = Game.addSound("flash.mp3");
    Sounds.Reveal      = Game.addSound("reveal.mp3");
    Sounds.Reveal2     = Game.addSound("reveal2.mp3");
    Sounds.Unlock      = Game.addSound("unlock.mp3");
    Sounds.Bonus       = Game.addSound("bonus.mp3");
    Sounds.DoorSwitch  = Game.addSound("switch0.mp3");
    Sounds.LightSwitch = Game.addSound("switch1.mp3");
    Sounds.Notice      = Game.addSound("notice.mp3");
    Sounds.Forgot      = Game.addSound("forgot.mp3");
    Sounds.Meatloaf    = Game.addSound("meatloaf.mp3");
    Sounds.Respawn     = Game.addSound("respawn.mp3");
    Sounds.Move        = Game.addSound("move.mp3");
    Sounds.Title       = Game.addSound("title.mp3");
    
    Sounds.Start       = Game.addSound("start.mp3");
    Sounds.Enter       = Game.addSound("enter.mp3");
}

function DATA_LoadMap()
{
    var translate = {
        " ": SpriteIds.EMPTYSPACE,
        "@": SpriteIds.CATLOAF,
        "#": SpriteIds.BRICKWALL,
        "D": SpriteIds.DOORGOLD,
        "d": SpriteIds.DOORSILVER,
        "K": SpriteIds.KEYGOLD,
        "k": SpriteIds.KEYSILVER,
        "E": SpriteIds.DOORSTONE,
        "e": SpriteIds.KEYSTONE,
        "T": SpriteIds.TRAP,
        "P": SpriteIds.BRICKWALLPSH,
        "F": SpriteIds.FENCE,
        "t": SpriteIds.TREE,
        "L": SpriteIds.LIGHTOFF,
        "l": SpriteIds.LIGHTON,
        "p": SpriteIds.PUSHBOULDER,
        "$": SpriteIds.GRAYWALL,
        "X": SpriteIds.PSHBLOCK,
        "B": SpriteIds.BARRICADE,
        "b": SpriteIds.BARRICADESWITCH,
        "M": SpriteIds.MEATLOAF,
        "m": SpriteIds.ENDLEVEL,
        "G": SpriteIds.GOLDENDOVE,
        "Y": SpriteIds.SUPREMEEYE,
        "C": SpriteIds.CRYSTALSNAKE,
        "R": SpriteIds.BRICKDOORA,
        "r": SpriteIds.BRICKDOORB,
        "Z": SpriteIds.BRICKDOORC,
        "z": SpriteIds.BRICKDOORD,
        "S": SpriteIds.BRICKDOORSWITCHA,
        "s": SpriteIds.BRICKDOORSWITCHB,
        "~": SpriteIds.RESETDISABLED,
        "?": SpriteIds.RANDOMTELEPORT
    };
    
    var doors = "BRrZz?";
    var skipMap = "@rz?";
    
    for(var x = 0; x < 40; x++)
    {
        Game.map[x] = [];
    }
    for(var i = 0; i < 40; i++)
    {
        RoomsRevealed[i] = false;
    }
    
    for(var y = 0; y < 40; y++) {
        var row = data.map[y];
        for(var x = 0; x < 40; x++) {
            var s = row.substring(x, x+1);
            var spriteId = translate[s];
            if(doors.indexOf(s) >= 0)
            {
                Game.addDoor(x, y, spriteId);
            }
            if(skipMap.indexOf(s) >= 0)
            {
                Game.map[x][y] = SpriteIds.EMPTYSPACE;
            }
            else
            {
                Game.map[x][y] = spriteId;
            }
            if(spriteId == SpriteIds.CATLOAF)
            {
                var startX = (x % 8);
                var startY = (y % 5);
                Game.initPlayer(startX, startY, Constants.StartLife, Constants.StartLives);
                Game.player.gridX = parseInt(x / 8) * 8;
                Game.player.gridY = parseInt(y / 5) * 5;
                
                RoomsRevealed[MAP_GetRoomId()] = true;
            }
            if(spriteId == SpriteIds.PUSHBOULDER)
            {
                Game.setVar(GameVars.PUSHBOULDERX, x);
                Game.setVar(GameVars.PUSHBOULDERY, y);
                Game.setVar(GameVars.PUSHBOULDERSTARTX, x);
                Game.setVar(GameVars.PUSHBOULDERSTARTY, y);
                Game.setVar(GameVars.PUSHBOULDERPUSHED, false);
                Game.setVar(GameVars.PUSHBOULDERCOMPLETE, false);
            }
            if(spriteId == SpriteIds.RESETDISABLED)
            {
                Game.setVar(GameVars.RESETX, x);
                Game.setVar(GameVars.RESETY, y);
                Game.setVar(GameVars.RESETENABLED, false);
            }
        }
    }
}

function MAP_GetRoomId()
{
    var roomId = parseInt(Game.player.gridX / 8) + parseInt(Game.player.gridY / 5) * 5;
    return roomId;
}

function TEXT_Repeat(ch, count)
{
    var string = "";
    for(var i = 0; i < count; i++)
    {
        string += ch;
    }
    return string;
}

function BuildTable()
{
    var table = document.getElementById("gfxtable");
    for(var y = 0; y < 25; y++) {
        var tr = document.createElement("DIV");
        tr.classList.add("tr");
        for(var x = 0; x < 40; x++) {
            var td = document.createElement("DIV");
            td.classList.add("td");
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

var loadingInterval = null;
var SoundsAreLoaded = false;
function loading()
{
    var numLoaded = 0;
    for(var i = 0; i < Game.sounds.length; i++)
    {
        var sound = Game.sounds[i];
        if(sound.loaded)
        {
            numLoaded += 1;
        }
    }
    var percent = parseInt((numLoaded / Game.sounds.length)*100).toString()+"%";
    GFX.locate(14, 1); GFX.print(TEXT_Repeat(" ", 40)); GFX.writeText("Loading..."+percent, 12, 15);
    
    if(numLoaded == Game.sounds.length)
    {
        clearInterval(loadingInterval);
        SoundsAreLoaded   = true;
        Game.unpause();
    }
}

function init()
{
    SYSTEM_Init();
    BuildTable();
    Game.state = GameStates.MainMenu;
    Game.setMain(MAIN);
    Game.pause();
    DRAW_MainMenu();
    
    Input.addButtonKey("moveUp"   , KeyCodes.up    );
    Input.addButtonKey("moveLeft" , KeyCodes.left  );
    Input.addButtonKey("moveDown" , KeyCodes.down  );
    Input.addButtonKey("moveRight", KeyCodes.right );
    Input.addButtonKey("inv"      , KeyCodes.space );
    Input.addButtonKey("help"     , KeyCodes.H     );
    Input.addButtonKey("yes"      , KeyCodes.Y     );
    Input.addButtonKey("no"       , KeyCodes.N     );
    Input.addButtonKey("escape"   , KeyCodes.escape);
    
    document.getElementById("play").addEventListener("click", function(event){
        event.preventDefault();
        document.getElementById("overlay").classList.add("hidden");
        document.getElementById("play-container").classList.add("hidden");
        if(!SoundsAreLoaded)
        {
            GFX.cls();
            loadingInterval = setInterval(loading, 100);
            DATA_LoadSounds();
        }
        else
        {
            Game.unpause();
        }
    });
    window.addEventListener("blur", function(event){
        event.preventDefault();
        document.getElementById("overlay").classList.remove("hidden");
        document.getElementById("play-container").classList.remove("hidden");
        Game.pause();
    });
}

if(document.readyState !== "loading")
{
    init();
}
else
{
    document.addEventListener("DOMContentLoaded", function(event){
        init();
    });
}
