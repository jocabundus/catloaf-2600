'- Catloaf 2600
'- 2007 - Joe King
'- Delta Code (http://deltacode.sytes.net)
'-----------------------------------------
'-----------------------------------------

DECLARE SUB GFX_DrawSprite(x AS INTEGER, y AS INTEGER, n AS INTEGER)
DECLARE SUB GFX_WriteText(text AS STRING, y AS INTEGER, col AS INTEGER)

DECLARE SUB DATA_LoadSprites()
DECLARE SUB DATA_LoadMap()

DECLARE SUB MENU_Main()

DECLARE SUB SYS_ShutDown()
DECLARE SUB SYS_Init()
DECLARE SUB GAME_Intro()
DECLARE SUB GAME_Main()
DECLARE SUB GAME_DrawMap()
DECLARE SUB GAME_DrawPlayer()
DECLARE SUB GAME_MovePlayer(x AS INTEGER, y AS INTEGER)
DECLARE SUB GAME_UpdatePlayer()
DECLARE SUB GAME_BackstepPlayer()
DECLARE SUB GAME_ShowInventory
DECLARE SUB GAME_ShowHelp()
DECLARE SUB GAME_ShowAbout()
DECLARE SUB GAME_EndLevel()
DECLARE SUB GAME_GameOver()

DECLARE SUB AddDoor(x AS INTEGER, y AS INTEGER, doortype AS INTEGER)
DECLARE SUB HideDoor(doortype AS INTEGER)
DECLARE SUB ShowDoor(doortype AS INTEGER)

#include once "SDL2/SDL.bi"

dim shared gfxWindow as SDL_Window ptr
dim shared gfxRenderer as SDL_Renderer ptr
dim shared gfxSprites as SDL_Texture ptr
dim shared SCREEN_X	as integer = 320
dim shared SCREEN_Y	as integer = 200

DECLARE SUB GFX_FillBox(x0 as integer, y0 as integer, x1 as integer, y1 as integer, col as integer)

#include once "gfont.bas"

dim shared game_font as GFONT

dim shared keydown as integer

'OPTION EXPLICIT

TYPE tSprite
    
    strData(5) AS STRING
    col(5, 1) AS INTEGER
        
END TYPE

TYPE tInventory
    
    goldkeys AS INTEGER
    silvkeys AS INTEGER
    stnkeys AS INTEGER
    golddove AS INTEGER
    suprmeye AS INTEGER
    crystsnk AS INTEGER
    
END TYPE

TYPE tPlayer
    
    x AS INTEGER
    y AS INTEGER
    oldx AS INTEGER
    oldy AS INTEGER
    gridx AS INTEGER
    gridy AS INTEGER
    
    life AS INTEGER
    lives AS INTEGER
    dark AS INTEGER
    inv AS tInventory
    
END TYPE

TYPE tDoor
    
    x AS INTEGER
    y AS INTEGER
    doortype AS INTEGER
    
END TYPE

DIM SHARED sprite(100) AS tSprite
DIM SHARED door(30) AS tDoor: DIM SHARED NumDoors AS INTEGER: NumDoors = -1
DIM SHARED player AS tPlayer
DIM SHARED map(40, 40) AS INTEGER
DIM SHARED gameover AS INTEGER
DIM SHARED starttime AS INTEGER
DIM SHARED totaltime AS INTEGER

DECLARE SUB _LOCATE(y AS INTEGER = -1, x AS INTEGER = -1)
DECLARE SUB _PRINT(text AS STRING, cr AS INTEGER = 1)
DECLARE SUB _COLOR(foreground AS INTEGER = -1, background AS INTEGER = -1)
DECLARE SUB _CLS()
DECLARE SUB _WAIT_FOR_KEY()
DECLARE SUB _CLEAR_KEYS()
DECLARE SUB _SLEEP()
DECLARE SUB _COPY_SCREEN()
DECLARE SUB _PULL_EVENTS()

DIM SHARED rgbs(15) AS INTEGER
rgbs( 0) = &h000000
rgbs( 1) = &h0000bb
rgbs( 2) = &h00bb00
rgbs( 3) = &h00bbbb
rgbs( 4) = &hbb0000
rgbs( 5) = &hbb00bb
rgbs( 6) = &hbb7700
rgbs( 7) = &hbbbbbb
rgbs( 8) = &h777777
rgbs( 9) = &h7777ff
rgbs(10) = &h77ff77
rgbs(11) = &h77ffff
rgbs(12) = &hff7777
rgbs(13) = &hff00ff
rgbs(14) = &hffff00
rgbs(15) = &hffffff

DIM SHARED loc_x AS INTEGER
DIM SHARED loc_y AS INTEGER
DIM SHARED col_f AS INTEGER
DIM SHARED col_b AS INTEGER

CONST TRUE = 1
CONST FALSE = 0

CONST EMPTYSPACE = 0
CONST CATLOAF = 1
CONST CATLOAFDEAD = 2
CONST CATLOAFDARK = 3
CONST CATLOAFDEADDARK = 4
CONST MEATLOAF = 5
CONST BRICKWALL = 6
CONST DOORGOLD = 7
CONST DOORSILVER = 8
CONST DOORSTONE = 9
CONST KEYGOLD = 10
CONST KEYSILVER = 11
CONST KEYSTONE = 12
CONST TRAP = 13
CONST BRICKWALLPSH = 14
CONST FENCE = 15
CONST TREE = 16
CONST LIGHTOFF = 17
CONST LIGHTON = 18
CONST PSH2 = 19
CONST GRAYWALL = 20
CONST PSHBLOCK = 21
CONST BARRICADE = 22
CONST BARRICADESWITCH = 23
CONST ENDLEVEL = 24
CONST GOLDENDOVE = 25
CONST SUPREMEEYE = 26
CONST CRYSTALSNK = 27
CONST BRICKDOORA = 28
CONST BRICKDOORB = 29
CONST BRICKDOORC = 30
CONST BRICKDOORD = 31
CONST BRICKDOORSWITCHA = 32
CONST BRICKDOORSWITCHB = 33

CONST NUMSPRITES = 34

RESTORE SpriteData
SYS_Init

DO

    gameover = FALSE
    
    MENU_Main
    
    RESTORE MapData
    DATA_LoadMap
    
    IF gameover = TRUE THEN EXIT DO
    
    GAME_Intro

    _CLS

    '- reset player
    Player.x = 2: Player.y = 2
    Player.oldx = 2: Player.oldy = 2
    Player.gridx = 0: Player.gridy = 0
    Player.life = 100
    Player.lives = 5
    Player.dark = 0
    
    '- clear inventory
    player.inv.goldkeys = 0
    player.inv.silvkeys = 0
    player.inv.stnkeys = 0
    player.inv.golddove = 0
    player.inv.suprmeye = 0
    player.inv.crystsnk = 0

    GAME_Main
    
    
LOOP

SYS_ShutDown

END

'- GAME_Main
'-
'- The main game loop
'- Links together the input, output, and game logic
'-
'-\
SUB GAME_Main

    DIM strKey AS STRING
    DIM quitgame AS INTEGER
    GAME_DrawMap
    GAME_DrawPlayer
    
    '- clear keyboard buffer
    _CLEAR_KEYS
    starttime = TIMER
    quitgame = FALSE
    totaltime = -1
    gameover = FALSE
    
    DO
       
        GAME_DrawPlayer
        
        IF Player.life <= 0 THEN
            
            '- give the player a chance to see the map
            '- again if in the dark
            IF player.dark = 1 THEN
                player.dark = 0
                GAME_DrawMap
                GAME_DrawPlayer
                player.dark = 1
            END IF
            
            _COLOR , 4
            GFX_WriteText "[    YOU GOT PWNED!!!    ]", 4, 15: _COPY_SCREEN
            _SLEEP
            _COLOR , 1
            
            Player.lives = Player.lives - 1
            GFX_WriteText "[        LIVES: " + STR$(Player.lives) + "        ]", 4, 15
            _COLOR , 0
            GAME_DrawPlayer
            
            _COPY_SCREEN
            
            _CLEAR_KEYS
            _WAIT_FOR_KEY
                        
            IF Player.lives <= 0 THEN
                GAME_GameOver
                EXIT DO
            ELSE
                Player.life = 100
                GAME_BackstepPlayer
                IF player.dark = 1 THEN _CLS ELSE GAME_DrawMap
                GAME_DrawPlayer
            END IF
            
        END IF
        
        _COPY_SCREEN
        _WAIT_FOR_KEY
    
        IF keydown = SDLK_RIGHT or keydown = SDLK_L THEN GAME_MovePlayer  1,  0
        IF keydown = SDLK_LEFT  or keydown = SDLK_J THEN GAME_MovePlayer -1,  0
        IF keydown = SDLK_DOWN  or keydown = SDLK_K THEN GAME_MovePlayer  0,  1
        IF keydown = SDLK_UP    or keydown = SDLK_I THEN GAME_MovePlayer  0, -1
        
        IF player.x > 7 THEN player.x = 0: player.gridx = player.gridx + 8: GAME_DrawMap: GAME_UpdatePlayer
        IF player.x < 0 THEN player.x = 7: player.gridx = player.gridx - 8: GAME_DrawMap: GAME_UpdatePlayer
        IF player.y > 4 THEN player.y = 0: player.gridy = player.gridy + 5: GAME_DrawMap: GAME_UpdatePlayer
        IF player.y < 0 THEN player.y = 4: player.gridy = player.gridy - 5: GAME_DrawMap: GAME_UpdatePlayer
    
        IF keydown = SDLK_TAB or keydown = SDLK_V THEN GAME_ShowInventory: GAME_DrawMap
        IF keydown = SDLK_H THEN GAME_ShowHelp: GAME_DrawMap
        IF keydown = SDLK_ESCAPE or keydown = SDLK_Q THEN
            
            _COLOR , 1
            GFX_WriteText "[    QUIT GAME? (Y/N)    ]", 4, 15
            _COLOR , 0
            
            _COPY_SCREEN
            
            DO
            
                _WAIT_FOR_KEY
                
                IF keydown = SDLK_Y THEN quitgame = TRUE: EXIT DO
                IF keydown = SDLK_N THEN quitgame = FALSE: EXIT DO
                
            LOOP
            
            IF quitgame THEN
                EXIT DO
            ELSE
                GAME_DrawMap
            END IF
            
        END IF
    
    LOOP WHILE gameover = FALSE
    
END SUB

SUB GAME_ShowInventory
    
    _CLS
    
    GFX_WriteText "INVENTORY", 3, 15
    
    _LOCATE 6, 2
    _PRINT "LIVES: " + STR$(player.lives)
    
    _LOCATE 10, 2
    _COLOR 14: _PRINT "GOLD KEYS  : " + STR$(player.inv.goldkeys)
    _LOCATE 11, 2
    _COLOR 7: _PRINT "SILVER KEYS: " + STR$(player.inv.silvkeys)
    _LOCATE 12, 2
    _COLOR 8: _PRINT "STONE KEYS : " + STR$(player.inv.stnkeys)
    
    _LOCATE 10, 26
    _COLOR 15: _PRINT "SPECIAL ITEMS"
    DIM y AS INTEGER: y = 11
    IF player.inv.golddove = 1 THEN GFX_DrawSprite 30, y, GOLDENDOVE: y = y + 5
    IF player.inv.suprmeye = 1 THEN GFX_DrawSprite 30, y, SUPREMEEYE: y = y + 5
    IF player.inv.crystsnk = 1 THEN GFX_DrawSprite 30, y, CRYSTALSNK
    
    DIM seconds AS INTEGER
    DIM minutes AS INTEGER
    
    DO
    
        seconds = TIMER - starttime
        minutes = seconds \ 60
        seconds = seconds - minutes * 60
    
        DIM s AS STRING
        s = STRING$(2 - LEN(STR$(seconds)), "0")
        
        _LOCATE 20, 2
        _COLOR 15: _PRINT "ELAPSED TIME: " + STR$(minutes) + ":" + s + STR$(seconds)
    
        _COPY_SCREEN
        _PULL_EVENTS
        IF keydown THEN EXIT DO
        
    LOOP
    
END SUB

'- ShowHelp
'-
'- Display the game instructions
'-
'-\
SUB GAME_ShowHelp
    
    _CLS
    
    GFX_WriteText "Use arrow keys or (I,J,K,L) to move", 1, 15
    GFX_WriteText "Press TAB (or V) to view inventory", 3, 15
    
    GFX_WriteText "Basic Obstacles:", 5, 15
    
    GFX_DrawSprite 2, 5, TRAP
    _COLOR 15, 0
    _LOCATE 7, 8: _PRINT "TRAP - Avoid these at all cost!"
    
    GFX_DrawSprite 2, 10, DOORGOLD
    GFX_DrawSprite 36, 10, KEYGOLD
    _COLOR 15, 0
    _LOCATE 12, 8: _PRINT "GOLD DOOR   - Opens with key"
    
    GFX_DrawSprite 2, 16, DOORSILVER
    GFX_DrawSprite 36, 16, KEYSILVER
    _COLOR 15, 0
    _LOCATE 18, 8: _PRINT "SILVER DOOR - Opens with key"
    
    GFX_DrawSprite 2, 21, LIGHTOFF
    _COLOR 15, 0
    _LOCATE 23, 8: _PRINT "LIGHTSWITCH - Turns off lights"
    
    _COPY_SCREEN
    _CLEAR_KEYS
    _WAIT_FOR_KEY
    
END SUB

'- ShowHelp
'-
'- Display the game credits
'-
'-\
SUB GAME_ShowAbout
    
    _CLS
    
    GFX_WriteText "CATLOAF 2600", 3, 15
    
    GFX_WriteText "Created by Joe King", 7, 15
    
    GFX_WriteText "(C) 2007 - Delta Code", 15, 15
    GFX_WriteText "http://deltacode.sytes.net", 17, 15
    
    GFX_WriteText " No, this game was NOT made by Atari", 22, 7
    GFX_WriteText "It is a joke for nostalgia's sake", 23, 7
    
    _COPY_SCREEN
    _SLEEP
    
END SUB

'- UpdatePlayer
'-
'- Update the player's old position with it's current
'-
'-\
SUB GAME_UpdatePlayer
    
    player.oldx = player.x
    player.oldy = player.y
    
END SUB

'- BackstepPlayer
'-
'- Return the player back to the previous coordinates
'-
'-\
SUB GAME_BackstepPlayer
    
    player.x = player.oldx
    player.y = player.oldy
    
END SUB

'- MovePlayer
'-
'- Move the player with the given vector <x, y>
'-
'-\
SUB GAME_MovePlayer (x AS INTEGER, y AS INTEGER)

    DIM mp AS INTEGER
    DIM px AS INTEGER, py AS INTEGER

    GAME_UpdatePlayer

    player.x = player.x + x
    player.y = player.y + y
    
    px = player.x+player.gridx
    py = player.y+player.gridy
    
    mp = map(px, py)
    
    '- wallcheck
    IF mp <> EMPTYSPACE THEN
        
        SELECT CASE mp
        CASE TRAP
            player.life = 0
        CASE KEYGOLD
            player.inv.goldkeys = player.inv.goldkeys + 1
            mp = 0
        CASE KEYSILVER
            player.inv.silvkeys = player.inv.silvkeys + 1
            mp = 0
        CASE KEYSTONE
            player.inv.stnkeys = player.inv.stnkeys + 1
            mp = 0
        CASE GOLDENDOVE
            player.inv.golddove = 1
            mp = 0
        CASE SUPREMEEYE
            player.inv.suprmeye = 1
            mp = 0
        CASE CRYSTALSNK
            player.inv.crystsnk = 1
            mp = 0
        CASE DOORGOLD
            IF player.inv.goldkeys > 0 THEN
                player.inv.goldkeys = player.inv.goldkeys - 1
                mp = 0
            ELSE
                GAME_BackstepPlayer
            END IF
        CASE DOORSILVER
            IF player.inv.silvkeys > 0 THEN
                player.inv.silvkeys = player.inv.silvkeys - 1
                mp = 0
            ELSE
                GAME_BackstepPlayer
            END IF
        CASE DOORSTONE
            IF player.inv.stnkeys > 0 THEN
                player.inv.stnkeys = player.inv.stnkeys - 1
                mp = 0
            ELSE
                GAME_BackstepPlayer
            END IF
        CASE BRICKWALLPSH
            IF map(px+x, py+y) = EMPTYSPACE THEN
                map(px+x, py+y) = BRICKWALLPSH
                GFX_DrawSprite (px+x-player.gridx)*5+1, (py+y-player.gridy)*5+1, BRICKWALLPSH
                mp = 0
            ELSE
                GAME_BackstepPlayer
            END IF
        CASE PSH2
            IF map(px+x, py+y) = EMPTYSPACE THEN
                map(px+x, py+y) = PSH2
                GFX_DrawSprite (px+x-player.gridx)*5+1, (py+y-player.gridy)*5+1, PSH2
                mp = 0
                '- turn off/on brick door's c/d
                HideDoor BRICKDOORC
                ShowDoor BRICKDOORD
            ELSEIF map(px+x, py+y) = BARRICADESWITCH THEN
                map(px+x, py+y) = PSH2
                GFX_DrawSprite (px+x-player.gridx)*5+1, (py+y-player.gridy)*5+1, PSH2
                mp = 0
                HideDoor BARRICADE
            ELSE
                GAME_BackstepPlayer
            END IF
        CASE BRICKDOORSWITCHA
            HideDoor BRICKDOORA
            ShowDoor BRICKDOORB
            mp = BRICKDOORSWITCHB
            GFX_DrawSprite (px-player.gridx)*5+1, (py-player.gridy)*5+1, BRICKDOORSWITCHB
            GAME_BackstepPlayer
        CASE BRICKDOORSWITCHB
            HideDoor BRICKDOORB
            ShowDoor BRICKDOORA
            mp = BRICKDOORSWITCHA
            GFX_DrawSprite (px-player.gridx)*5+1, (py-player.gridy)*5+1, BRICKDOORSWITCHA
            GAME_BackstepPLayer
        CASE PSHBLOCK
        CASE BARRICADESWITCH
        CASE ENDLEVEL
            GAME_ENDLEVEL
        CASE LIGHTOFF
            player.dark = 1
            _CLS
        CASE LIGHTON
            player.dark = 0
        CASE ELSE
            GAME_BackstepPlayer
        END SELECT
        
        map(px, py) = mp
        
    END IF

END SUB

'- DrawPlayer
'-
'- Draw Catloaf to the screen
'-
'-\
SUB GAME_DrawPlayer
    
    '- Erase the player's old position if he moved
    IF player.x <> player.oldx OR player.y <> player.oldy THEN
        GFX_DrawSprite Player.oldx*5+1, Player.oldy*5+1, EMPTYSPACE
    END IF
    
    '- Draw the player
    IF Player.dark = 0 THEN
        IF Player.life > 0 THEN
            GFX_DrawSprite Player.x*5+1, Player.y*5+1, CATLOAF
        ELSE
            GFX_DrawSprite Player.x*5+1, Player.y*5+1, CATLOAFDEAD
        END IF
    ELSE
        IF Player.life > 0 THEN
            GFX_DrawSprite Player.x*5+1, Player.y*5+1, CATLOAFDARK
        ELSE
            GFX_DrawSprite Player.x*5+1, Player.y*5+1, CATLOAFDEAD
        END IF
    END IF
    
END SUB

'- DrawMap
'-
'- Draw the map within the screen
'-
'-\
SUB GAME_DrawMap
    
    DIM x AS INTEGER, y AS INTEGER
    DIM sp AS INTEGER
    
    IF player.dark = 1 THEN _CLS: RETURN
    
    FOR y = 0 TO 4
        FOR x = 0 TO 7
            
            sp = map(x + player.gridx, y + player.gridy)
            GFX_DrawSprite x*5+1, y*5+1, sp
            
        NEXT X
    NEXT y

END SUB

'- Init
'-
'- Initialize graphics and anything else that's needed
'- before starting the game
'-
'-\
SUB SYS_Init
    
    SDL_Init( SDL_INIT_VIDEO )
	
	gfxWindow = SDL_CreateWindow( "Window Name", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, 0, 0, SDL_WINDOW_FULLSCREEN_DESKTOP )
	gfxRenderer = SDL_CreateRenderer( gfxWindow, -1, SDL_RENDERER_SOFTWARE )
	'SCREEN_X = int(SCREEN_Y*(SDL_GetWindowSurface(gfxWindow)->w/SDL_GetWindowSurface(gfxWindow)->h)) '// this resizes the width for widescreen or 3:4 screens
	SDL_RenderSetLogicalSize( gfxRenderer, SCREEN_X, SCREEN_Y )
	SDL_SetRenderDrawBlendMode( gfxRenderer, SDL_BLENDMODE_BLEND )
	
	game_font.load("font.bmp", 256, 24, 8, 8, GFONT_W/8)
	SDL_ShowCursor( 0 )
    
    DATA_LoadSprites
    
END SUB

SUB _COLOR(foreground as integer = -1, background as integer = -1)

	if foreground >= 0 then col_f = rgbs(foreground)
	if background >= 0 then col_b = rgbs(background)
	
	game_font.setFontColor(col_f)

END SUB

SUB _LOCATE(y as integer, x as integer)

	if x >= 0 then loc_x = x-1
	if y >= 0 then loc_y = y-1

END SUB

SUB _PRINT(text as string, cr AS INTEGER = 1)

	GFX_FillBox loc_x*GFONT_W, loc_y*GFONT_H, loc_x*GFONT_W+len(text)*GFONT_W, loc_y*GFONT_H+GFONT_H, col_b
    game_font.writeText(text, loc_x*GFONT_W, loc_y*GFONT_H)
	
	IF cr then
		loc_y += 1
	else
		loc_x += len(text)
	end if

END SUB

SUB _CLS()

	SDL_SetRenderDrawColor( gfxRenderer, 0, 0, 0, SDL_ALPHA_OPAQUE ): SDL_RenderClear( gfxRenderer )
	loc_x = 0: loc_y = 0

END SUB

SUB _PULL_EVENTS()

	dim event as SDL_Event
	
	keydown = 0

	while( SDL_PollEvent( @event ) )
		select case event.type
		case SDL_QUIT_
			end
		case SDL_KEYDOWN
			keydown = event.key.keysym.sym
		end select
	wend

END SUB

SUB _WAIT_FOR_KEY()

	DO: _PULL_EVENTS(): LOOP WHILE keydown = 0

END SUB

SUB _CLEAR_KEYS()

	DO: _PULL_EVENTS(): LOOP WHILE keydown <> 0

END SUB

SUB _SLEEP()

	_WAIT_FOR_KEY

END SUB

SUB _COPY_SCREEN()

	SDL_RenderPresent( gfxRenderer )

END SUB

'- Shutdown
'-
'- Prepare to return to the OS
'- Do any unfinished business
'-
'-\
SUB SYS_ShutDown

    SETMOUSE ,,1

END SUB

'- Menu
'-
'- The main menu
'-
'-\
SUB MENU_Main
    
    DIM n AS INTEGER
    DIM key AS INTEGER
    
    DO
    
		_CLEAR_KEYS
		
		_CLS
    
        _COLOR 15
        _PRINT "****************************************"
        _PRINT "*                                      *"
        _PRINT "*                                      *"
        _PRINT "*                                      *"
        _PRINT "****************************************"
        FOR n = 1 TO 14
            _PRINT "|   |                              |   |"
        NEXT n
        _PRINT "----------------------------------------"
        _PRINT "|   |                              |   |"
        _PRINT "|   |                              |   |"
        _PRINT "|   |                              |   |"
        _PRINT "|   |                              |   |"
        _PRINT "----------------------------------------"
        GFX_DrawSprite 18, 8, CATLOAF
        GFX_WriteText "CATLOAF 2600", 3, 14
        GFX_WriteText "1981 ATARI", 18, 9
        GFX_WriteText "F1 How to Play", 21, 7
        GFX_WriteText "press space to begin", 23, 14
        GFX_WriteText "esc to exit", 24, 8
        
        _COPY_SCREEN
            
        _WAIT_FOR_KEY
        
        key = keydown
        
        IF key = SDLK_H THEN GAME_ShowHelp
        IF key = SDLK_A THEN GAME_ShowAbout
        IF key = SDLK_ESCAPE THEN gameover = TRUE: EXIT DO
        IF key = SDLK_SPACE THEN EXIT DO
        
    LOOP

END SUB

'- Intro
'-
'- Runs the intro at the beginning of each level
'-
'-\
SUB GAME_Intro
    
    _CLS
    
    'DrawSprite 3, 7, 0
    'DrawSprite 33, 7, 1
    GFX_DrawSprite 18, 6, MEATLOAF
    
    GFX_WriteText "MASTER  MEATLOAF", 3, 4
    
    _COPY_SCREEN: _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "CATLOAF!", 14, 15
    _COPY_SCREEN: _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "I have survived your predecessors...", 14, 15
    _COPY_SCREEN: _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "...and I will survive you!", 14, 15
    _COPY_SCREEN: _SLEEP
    
END SUB

'- EndLevel
'-
'- End the level
'- Show the end dialog
'- Game Over
'-
'-\
SUB GAME_EndLevel
    
    DIM numItems AS INTEGER
        
    _CLS
    
    totaltime = TIMER - starttime
    numItems = player.inv.golddove + player.inv.suprmeye + player.inv.crystsnk
    
    GFX_DrawSprite 18, 6, MEATLOAF
    
    GFX_WriteText "MASTER  MEATLOAF", 3, 4
    
    _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "CATLOAF!", 14, 15
    _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "You have survived my labyrinth...", 14, 15
    _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "...which takes much skill.", 14, 15
    
    IF totaltime >= 300 THEN
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "But you have taken too much time.", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "Complete my labyrinth...", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "...in less than 5 minutes.", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "Only then can prove your l33tness.", 14, 15
    ELSEIF numItems < 3 THEN
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "But there is more than meets the eye.", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "There are 3 special items within.", 14, 15
        IF numItems = 0 THEN
            _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "You have none.", 14, 15
            _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "You must find them...", 14, 15
        ELSE
            _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "You only have " + STR$(numItems) + ".", 14, 15
            _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "You must find the rest...", 14, 15
        END IF
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "...to prove your l33tness.", 14, 15
    ELSE
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "Good job.", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "I am not worthy of you.", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "...", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "What's a matter?", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "Were you expecting a fight...", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "...or an epic boss battle?", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "MUWAHAHA!!!", 14, 15
        _SLEEP: _LOCATE 14, 1: _PRINT SPACE$(40), 0: GFX_WriteText "Think again!", 14, 15
    END IF
    
    _SLEEP
    
    GAME_GameOver

END SUB

'- GameOver
'-
'- End the game
'-
'-\
SUB GAME_GameOver
    
    DIM seconds AS INTEGER
    DIM minutes AS INTEGER
    DIM strTime AS STRING
    DIm numItems AS INTEGER
    
    _CLS
    
    GFX_WriteText "GAME  OVER", 8, 12
    
    IF totaltime = -1 THEN
        
        GFX_WriteText "Try  Again", 15, 15
        
    ELSE
        
        seconds = totaltime
        minutes = seconds \ 60
        seconds = seconds - minutes * 60
    
        strTime = STR$(minutes) + ":" + STRING$(2 - LEN(STR$(seconds)), "0") + STR$(seconds)
    
        GFX_WriteText strTime, 15, 15
        
        numItems = player.inv.golddove + player.inv.suprmeye + player.inv.crystsnk
        IF numItems < 3 THEN
            
            _SLEEP
            _CLS
            GFX_WriteText "You forgot something", 4, 15
            
            IF player.inv.golddove = 0 THEN
                GFX_DrawSprite 18, 7, GOLDENDOVE
                _COLOR 14: _LOCATE 9, 3: _PRINT "Golden Dove"
            END IF
            IF player.inv.suprmeye = 0 THEN
                GFX_DrawSprite 18, 12, SUPREMEEYE
                _COLOR  9: _LOCATE 14, 3: _PRINT"Supreme Eye"
            END IF
            IF player.inv.crystsnk = 0 THEN
                GFX_DrawSprite 18, 17, CRYSTALSNK
                _COLOR 10: _LOCATE 19, 3: _PRINT"Crystal Snake"
            END IF
            
            IF numItems = 2 THEN
                GFX_WriteText "Find this item next time", 23, 15
            ELSE
                GFX_WriteText "Find these items next time", 23, 15
            END IF
        
        ELSE
            
            _SLEEP
            _CLS
            GFX_WriteText "CONGRATULATIONS!", 4, 15
            GFX_WriteText "You found all the secret items", 6, 15
            
            GFX_DrawSprite 18, 7, GOLDENDOVE
            GFX_DrawSprite 18, 12, SUPREMEEYE
            GFX_DrawSprite 18, 17, CRYSTALSNK
            
            IF totaltime >= 300 THEN
                GFX_WriteText "Now find them all in under 5 minutes!", 23, 15
            ELSE
                GFX_WriteText "Thanks for playing!", 23, 15
            END IF
            
        END IF
        
        
    END IF
    
    _SLEEP
    
    gameover = TRUE
    
END SUB

'- DrawSprite
'-
'- Draws a text sprite to the screen at the given coordinates
'-
'- Params:
'- x    the left coordinate
'- y    the top coordinate
'- n    the number of the sprite to draw
'-
'-\
SUB GFX_DrawSprite(x AS INTEGER, y AS INTEGER, n AS INTEGER)
    
    DIM row AS INTEGER
    
    IF x >= 0 AND x < 40 AND y >= 0 AND y < 25 THEN
    
        FOR row = 0 TO 4
            _COLOR sprite(n).col(row, 0), sprite(n).col(row, 1)
            _LOCATE y+row, x
            _PRINT sprite(n).strData(row), 0
        NEXT row
        
    END IF
    
END SUB

'- WriteText
'-
'- Center's the given text on the screen
'-
'- Params:
'- text     the text to print to the screen
'- y        the vertical location
'- col      the color to print the text in
'-
'-\
SUB GFX_WriteText(text AS STRING, y AS INTEGER, col AS INTEGER)
    
    DIM l AS INTEGER
    DIM x AS INTEGER
    
    l = LEN(text)
    x = 20 - (l / 2)
    
    _COLOR col
    
    _LOCATE y, x+1
    _PRINT text
    
END SUB

SUB GFX_FillBox(x0 as integer, y0 as integer, x1 as integer, y1 as integer, col as integer)

	DIM rect as SDL_rect = (x0, y0, x1-x0+1, y1-y0+1)
	
	SDL_SetRenderDrawColor( gfxRenderer, (col and &hff0000) shr 16, (col and &hff00) shr 8, col and &hff, SDL_ALPHA_OPAQUE )
	SDL_RenderFillRect( gfxRenderer, @rect )

END SUB

'- LoadSprites
'-
'- Read in the text sprites
'-
'-\
SUB DATA_LoadSprites
    
    DIM n AS INTEGER, y AS INTEGER, x AS INTEGER
    DIM row AS STRING
    
    FOR n = 0 TO NUMSPRITES - 1
        FOR y = 0 TO 4
            READ row
                FOR x = 1 TO 5
                    IF MID$(row, x, 1) = "#" THEN MID$(row, x, 1) = CHR$(219)
                NEXT x
            sprite(n).strData(y) = row
            READ sprite(n).col(y, 0)
            READ sprite(n).col(y, 1)
        NEXT y
    NEXT n
    
END SUB

'- LoadMap
'-
'- Read in the map data
'- Convert the text data to map objects
'-
'-\
SUB DATA_LoadMap
    
    DIM s AS STRING, row AS STRING
    DIM y AS INTEGER, n AS INTEGER
    
    ERASE door: NumDoors = -1
        
    FOR y = 0 TO 39
        READ row
        FOR n = 0 TO 39
            s = MID(row, n+1, 1)
            IF s = " " THEN map(n, y) = EMPTYSPACE
            IF s = "#" THEN map(n, y) = BRICKWALL
            IF s = "D" THEN map(n, y) = DOORGOLD
            IF s = "d" THEN map(n, y) = DOORSILVER
            IF s = "K" THEN map(n, y) = KEYGOLD
            IF s = "k" THEN map(n, y) = KEYSILVER
            IF s = "E" THEN map(n, y) = DOORSTONE
            IF s = "e" THEN map(n, y) = KEYSTONE
            IF s = "T" THEN map(n, y) = TRAP
            IF s = "P" THEN map(n, y) = BRICKWALLPSH
            IF s = "F" THEN map(n, y) = FENCE
            IF s = "t" THEN map(n, y) = TREE
            IF s = "L" THEN map(n, y) = LIGHTOFF
            IF s = "l" THEN map(n, y) = LIGHTON
            IF s = "p" THEN map(n, y) = PSH2
            IF s = "$" THEN map(n, y) = GRAYWALL
            IF s = "X" THEN map(n, y) = PSHBLOCK
            IF s = "B" THEN AddDoor n, y, BARRICADE
            IF s = "b" THEN map(n, y) = BARRICADESWITCH
            IF s = "M" THEN map(n, y) = MEATLOAF
            IF s = "m" THEN map(n, y) = ENDLEVEL
            IF s = "G" THEN map(n, y) = GOLDENDOVE
            IF s = "Y" THEN map(n, y) = SUPREMEEYE
            IF s = "C" THEN map(n, y) = CRYSTALSNK
            IF s = "R" THEN AddDoor n, y, BRICKDOORA
            IF s = "r" THEN AddDoor n, y, BRICKDOORB: map(n, y) = 0
            IF s = "Z" THEN AddDoor n, y, BRICKDOORC
            IF s = "z" THEN AddDoor n, y, BRICKDOORD: map(n, y) = 0
            IF s = "S" THEN map(n, y) = BRICKDOORSWITCHA
            IF s = "s" THEN map(n, y) = BRICKDOORSWITCHB
        NEXT n
    NEXT y
    
END SUB

'- AddDoor
'-
'- Add a custom door to the array
'-
'-\
SUB AddDoor(x AS INTEGER, y AS INTEGER, doortype AS INTEGER)
    
    DIM n AS INTEGER
    
    map(x, y) = doortype
    
    NumDoors = NumDoors + 1
    n = NumDoors
    door(n).x = x
    door(n).y = y
    door(n).doortype = doortype
    
END SUB

'- HideDoor
'-
'- Hide the given custom doortype from the map
'- Remove all doors with the given type from the map
'-
'-\
SUB HideDoor(doortype AS INTEGER)
    
    DIM n AS INTEGER
    DIM x AS INTEGER, y AS INTEGER
    
    FOR n = 0 TO NumDoors
        
        IF door(n).doortype = doortype THEN
            
            x = door(n).x
            y = door(n).y
            map(x, y) = EMPTYSPACE
            GFX_DrawSprite (x-player.gridx)*5+1, (y-player.gridy)*5+1, EMPTYSPACE
            
        END IF
        
    NEXT n
    
END SUB

'- ShowDoor
'-
'- Reveal the given custom doortype to the map
'- Add all doors with the given type to the map
'-
'-\
SUB ShowDoor(doortype AS INTEGER)
    
    DIM n AS INTEGER
    DIM x AS INTEGER, y AS INTEGER
    
    FOR n = 0 TO NumDoors
        
        IF door(n).doortype = doortype THEN
            
            x = door(n).x
            y = door(n).y
            map(x, y) = doortype
            GFX_DrawSprite (x-player.gridx)*5+1, (y-player.gridy)*5+1, doortype
            
        END IF
        
    NEXT n
    
END SUB

SpriteData:

'- empty space
DATA "     ", 0, 0
DATA "     ", 0, 0
DATA "     ", 0, 0
DATA "     ", 0, 0
DATA "     ", 0, 0

'- catloaf
DATA "^___^", 15, 0
DATA "|. .|", 15, 0
DATA "| ^ |", 15, 0
DATA "|   |", 15, 0
DATA "|___|", 15, 0

'- catloaf dead
DATA "^___^", 4, 0
DATA "|X X|", 4, 0
DATA "| O |", 4, 0
DATA "|   |", 4, 0
DATA "|___|", 4, 0

'- catloaf in the dark
DATA "     ", 15, 0
DATA " . . ", 15, 0
DATA "  ^  ", 15, 0
DATA "     ", 15, 0
DATA "     ", 15, 0

'- catloaf dead in the dark
DATA "     ", 4, 0
DATA " X X ", 4, 0
DATA "  O  ", 4, 0
DATA "     ", 4, 0
DATA "     ", 4, 0

'- meatloaf
DATA "^_^_^", 12, 0
DATA "|\ /|", 12, 0
DATA "| - |", 12, 0
DATA "|~~~|", 12, 0
DATA "_~~~_", 12, 0

'- brick wall
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "=|===", 6, 0

'- gold door
DATA "|||||", 0, 6
DATA "|###|", 0, 14
DATA "|||||", 0, 6
DATA "|||]|", 0, 6
DATA "|||||", 0, 6

'- silver door
DATA "|||||", 0, 6
DATA "|###|", 0, 7
DATA "|||||", 0, 6
DATA "|||]|", 0, 6
DATA "|||||", 0, 6

'- stone door
DATA ".....", 0, 7
DATA ".###.", 0, 7
DATA ".....", 0, 7
DATA ".....", 0, 7
DATA ".....", 0, 7

'- gold key
DATA "     ", 0, 0
DATA "     ", 0, 0
DATA " O-> ", 14, 0
DATA "     ", 0, 0
DATA "     ", 0, 0

'- silver key
DATA "     ", 0, 0
DATA "     ", 0, 0
DATA " ]-> ", 7, 0
DATA "     ", 0, 0
DATA "     ", 0, 0

'- stone key
DATA "     ", 0, 0
DATA "     ", 0, 0
DATA " O=> ", 7, 0
DATA "     ", 0, 0
DATA "     ", 0, 0

'- trap
DATA "     ", 0, 0
DATA " ^^^ ", 7, 0
DATA " ^^^ ", 4, 0
DATA " ^^^ ", 7, 0
DATA "     ", 0, 0

'- movable brick wall
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "=|===", 6, 0

'- grass
DATA "/////", 2, 0
DATA "\\\\\", 2, 0
DATA "/////", 2, 0
DATA "\\\\\", 2, 0
DATA "/////", 2, 0

'- tree
DATA " /|\ ", 2, 0
DATA " /|\ ", 2, 0
DATA "//|\\", 2, 0
DATA "//|\\", 2, 0
DATA " \|/ ", 6, 0

'- lightswitch / off
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA " [O] ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0

'- lightswitch / on
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0

'- moveable wall 2
DATA "/---\", 7, 0
DATA "|\ /|", 7, 0
DATA "|( )|", 7, 0
DATA "|/ \|", 7, 0
DATA "\---/", 7, 0

'- graywall
DATA "/\|/\", 7, 0
DATA "\/|\/", 7, 0
DATA "-- --", 7, 0
DATA "/\|/\", 7, 0
DATA "\/|\/", 7, 0

'- push block
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0

'- barricade
DATA "     ", 7, 0
DATA "=====", 7, 0
DATA "=====", 7, 0
DATA "=====", 7, 0
DATA "     ", 7, 0

'- barricade switch
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0
DATA "     ", 7, 0

'- endlevel
DATA "     ", 0, 0
DATA "     ", 0, 0
DATA "     ", 0, 0
DATA "     ", 0, 0
DATA "     ", 0, 0

'- golden dove
DATA "     ",  0, 0
DATA " o^o ", 14, 0
DATA "-\|/-", 14, 0
DATA " < > ", 14, 0
DATA "     ",  0, 0

'- supreme eye
DATA "     ",  0, 0
DATA " \|/ ", 14, 0
DATA " <O> ",  9, 0
DATA " /|\ ", 14, 0
DATA "     ",  0, 0

'- crystal snake
DATA "   _ ", 10, 0
DATA "  \oo", 10, 0
DATA "<\_) ", 10, 0
DATA "     ",  0, 0
DATA "     ",  0, 0

'- brick door A
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "=|===", 6, 0

'- brick door B
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "=|===", 6, 0

'- brick door C
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "=|===", 6, 0

'- brick door D
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "=|===", 6, 0

'- brick door switch A
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "|[O]=", 6, 0
DATA "==|=|", 4, 0
DATA "=|===", 6, 0

'- brick door switch B
DATA "|==|=", 6, 0
DATA "==|=|", 4, 0
DATA "|[X]=", 6, 0
DATA "==|=|", 4, 0
DATA "=|===", 6, 0

MapData:

'- map
DATA "#########################FFFFFFFFFFFFFFF"
DATA "#   #  ##      ##      ##              F"
DATA "#      D   TT          D            t  F"
DATA "#   #  ##      ##      ##         T    F"
DATA "## ################ #############      F"
DATA "## ################ #############      F"
DATA "#   #####  #      #           T##    t F"
DATA "#         T###### # #####  TT  ##rrrrrrF"
DATA "#   #####     K##      ## T X T## tT   F"
DATA "###################### #####P####      F"
DATA "###################### ##### ####      F"
DATA "# T  P ########## ##   ##  X X ##T   t F"
DATA "#K   # ##            # ##  X X     t   F"
DATA "#    #         ## ##   ##   X  ##ttttttF"
DATA "##r### #####################l###########"
DATA "##r### ##################### ###########"
DATA "#  P   ##          t   ##T  LT ##      #"
DATA "# ##   ## tttttttt ttt ##T TTT ##  G   #"
DATA "# XP   ##   t kt t   t ##T   TT##      #"
DATA "##R######tt t    t t t ##TTT  T###### ##"
DATA "##R######     tttttt   ######l#######D##"
DATA "# Y #  ##tttttt      tt######  ##      #"
DATA "#####   d     tttt t    d           k  #"
DATA "#      ##  t       t   ####d#  ##      #"
DATA "## ######################## ############"
DATA "## ######################## ############"
DATA "#$XX#####X#TTXT##XXXXX###X$XXXX##      #"
DATA "#b        E        X#     p  kX##  C   #"
DATA "#$XX#P###X#XXXT##X X# ###X$XXXX##      #"
DATA "##B## ############ ## ##############   #"
DATA "## ## ############ ## ##############BBB#"
DATA "## ##      T# e###    X##ZZPX  ## zz   #"
DATA "## ## ###     ####X### ##ZZ#   P   P   #"
DATA "## ###### ##   ###         z   ## zz   #"
DATA "##l#########################Z###########"
DATA "##                     ###S# ###########"
DATA "#T ######################  R ###   m   #"
DATA "## T   #T   TT     T   ## r#r      m M #"
DATA "##L  T    T    #TT   T  l  R ###   m   #"
DATA "########################################"
