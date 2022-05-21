/**
 * This file is part of CATLOAF 2600.
 * Copyright (C) 2007-2020 Joe King - All Rights Reserved
 * https://games.joeking.us/
 */
"use strict";

var GFX = {
    colors: [
        '#000',
        '#00a',
        '#0a0',
        '#0aa',
        '#a00',
        '#a0a',
        '#a50',
        '#aaa',
        '#555',
        '#55f',
        '#0f5',
        '#5ff',
        '#f55',
        '#f5f',
        '#ff5',
        '#fff'
    ],
    colorForeground: 0,
    colorBackground: 0,
    drawX: 0,
    drawY: 0,
    cursor: null,
    showCursor: false,
    cursorColor: 15,
    blink: false,
    cursorInterval: null,
    cursorTimeout: null,
    /**
     * Escape HTML entities 
     */
    escape: function(string)
    {
        return string
            .replace('<', '&lt;')
            .replace('>', '&gt;');
    },
    /**
     * @param int foreground
     * @param int background 
     */
    color: function(foreground, background)
    {
        if(typeof(foreground) === 'undefined') { foreground = null; }
        if(typeof(background) === 'undefined') { background = null; }
        this.colorForeground = foreground != null ? foreground : this.colorForeground;
        this.colorBackground = background != null ? background : this.colorBackground;
    },
    /**
     * @param int y
     * @param int x 
     */
    locate: function(y, x)
    {
        this.drawX = x-1;
        this.drawY = y-1;
    },
    /**
     * clear screen 
     */
    cls: function(color, background)
    {
        var color      = (typeof(color     ) !== 'undefined') ? color      : 0;
        var background = (typeof(background) !== 'undefined') ? background : 0;
        var table = document.getElementById(this.tableId);
        var cells = table.getElementsByClassName('td');
        for(var i = 0; i < cells.length; i++)
        {
            var cell = cells[i];
            if(background !== null)
            {
                cell.style.background = this.colors[background];
            }
            if(color !== null)
            {
                cell.style.color = this.colors[color];
                cell.innerHTML = " ";
            }
        }
        this.drawX = 0;
        this.drawY = 0;
    },
    /**
     * @param string string 
     */
    print: function(string, showCursor)
    {
        var n = this.drawX+this.drawY*40;
        var table = document.getElementById(this.tableId);
        var cells = table.getElementsByClassName('td');
        for(var i = 0; i < string.length; i++)
        {
            var cell = cells[n+i];
            var chr  = this.escape(string.substring(i, i+1));
            if(chr == '#')
            {
                cell.style.color = this.colors[this.colorBackground];
                cell.style.background = this.colors[this.colorForeground];
                cell.innerHTML = " ";
            }
            else
            {
                cell.style.color = this.colors[this.colorForeground];
                cell.style.background = this.colors[this.colorBackground];
                cell.innerHTML = chr;
            }
        }
        if(this.cursorInterval)
        {
            clearInterval(this.cursorInterval);
            this.cursorInterval = null;
        }
        if(this.cursorTimeout)
        {
            clearTimeout(this.cursorTimeout);
            this.cursorTimeout = null;
        }
        showCursor = (typeof(showCursor) !== "undefined") ? showCursor : false;
        if(showCursor)
        {
            this.cursor = (typeof(cells[n+string.length]) !== "undefined") ? cells[n+string.length] : null;
            if(this.cursor)
            {
                this.cursor.style.color = this.colors[this.cursorColor];
                this.showCursor = false;
                this.cursorTimeout = setTimeout(function(self){
                    self.showCursor = true;
                    self.cursorInterval = setInterval(self.blinkCursor, 250, self);
                }, 3000, this);
            }
        }
        this.drawX += string.length;
        if(this.drawX >= 40)
        {
            this.drawX = 0;
            this.drawY += 1;
        }
    },
    /**
     * @param string text
     * @param int y
     * @param int color 
     */
    writeText: function(text, y, color, showCursor)
    {
        var l;
        var x;
        
        l = text.length;
        x = parseInt(20 - (l/2));
        
        this.color(color);
        this.locate(y, x+1);
        this.print(text, showCursor);
        this.drawY += 1;
    },
    /**
     * blinkCursor()
     */
    blinkCursor: function(self)
    {
        self.blink = !self.blink;
        if(self.cursor && self.showCursor)
        {
            self.cursor.innerHTML = self.blink ? " " : "_";
        }
    },
    /**
     * init()
     */
    init: function(tableId)
    {
        this.tableId = tableId;
    }
}