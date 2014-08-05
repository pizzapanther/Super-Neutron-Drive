// Title: "Minecraft Code" Ace Highlighting
// Authors: @_authorblues (http://twitter.com/_authorblues)
//	    @lemoesh (http://lemoesh.com)
// Description:
//	To be used for the ".mcc" file extension.
//
//	Provides syntax highlighting with the intention of keeping it as
//	future proof as possible. Map makers for Minecraft use hundreds
//	upon hundreds of lines of commands in Minecraft to build the logic
//	and game loop for their maps.

define('ace/mode/minecraft', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function(require, exports, module) {
"use strict";
 
var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var TextMode = require("./text").Mode;

var MinecraftHighlightRules = function() {
 
var keywords = (
        ""
    );
 
    var builtinFunctions = (
        // Player commands
        "me|tell|msg|w|trigger|"+
       
        // Operator-only commands
        "achievment|blockdata|clear|clone|debug|defaultgamemode|difficulty|effect|execute|fill|enchant|"+
        "gamemode|gamerule|give|kill|particle|playsound|publish|say|scoreboard|seed|setblock|setworldspawn|"+
        "spawnpoint|spreadplayers|summon|tellraw|testfor|testforblock|time|toggledownfall|tp|weather|xp|"+
       
        // Multiplayer-only commands (only list can be used in Command Blocks)
        "list"
    );
 
    var builtinConstants = (
        // Operations
        "add|clear|set|on|off|reload|remove|replace|"+       
        
        // States
        "true|false|start|stop|day|night|clear|rain|thunder|"+
        "peaceful|easy|normal|hard|"+
        "survival|creative|adventure|spectator|"+
        
        // Colors
        "black|dark_blue|dark_green|dark_aqua|dark_red|dark_purple|gold|gray|dark_gray|blue|green|aqua|red|"+
        "light_purple|yellow|white|"+
        
        // Scoreboard objectives
        "dummy|trigger|deathCount|playerKillCount|totalKillCount|health|"+
       
        // Display slots
        "list|sidebar|belowName|"+
 
        // Scoreboard commands
        "objectives|players|teams|"+
        "list|setdisplay|list|reset|enable|test|operation|empty|join|leave|option|color|"+
        "friendlyfire|seeFriendlyInvisibles|namtagVisibility|"+
            "never|hideForOtherTeams|hideForOwnTeam|always|"+
       
        // Gamerules
        "commandBlockOutput|doDaylightCycle|doFireTick|doMobLoot|doMobSpawning|doTileDrops|keepInventory|"+
        "mobGriefing|naturalRegeneration|logAdminCommands|showDeathMessages"
    );
 
 
   
    var keywordMapper = this.createKeywordMapper({
        "support.function": builtinFunctions,
        "keyword": keywords,
        "constant.language": builtinConstants
    },
    "identifier", true);
 
    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "\\/\\/",
            next : "line_comment"
        }, {
            token : "comment", // multi line comment
            regex : /\/\*/,
            next : "comment"
        }, {
            token : "string",
            regex : /".*?"/
        }, {
            token : "string",
            regex : /'.*?'/
        }, {
            token : ["keyword", "paren.lparen"],
            regex : /(@.)(\[)?/,
            next: "qualargs"
        }, {
            token : "keyword",
            regex : /minecraft:([a-zA-Z_]+)/
        }, {
            token : ["constant.language", "keyword.operator"],
            regex : /(\w+)(:)/
        }, {
            token : "constant.numeric",
            regex : "~|~?[+-]?(\\d+(\\.\\d+)?)L?\\b"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_][a-zA-Z0-9_]*\\b"
        }, {
            token : "keyword.operator",
            regex : "\\+|\\-|="
        }, {
             token : "punctuation.operator",
             regex : /,/
        }, {
            token : "paren.lparen",
            regex : /[[{]/
        }, {
            token : "paren.rparen",
            regex : /[\\]}]/
        }, {
            token : "text",
            regex : /\s+/
        } ],
        
        "qualargs" : [ {
            token : ["keyword", "keyword.operator", "constant.numeric"],
            regex : "([a-zA-Z0-9_\\.]+)(=)(\\d+)"
        }, {
            token : ["keyword", "keyword.operator", "constant.keyword"],
            regex : "([a-zA-Z0-9_\\.]+)(=)([^, \\]]+)?"
        }, {
            token : "punctuation.operator",
            regex : /[, ]+/
        }, {
            token: "paren.rparen",
            regex: "]",
            next: "start"
        }, {
            token: "empty",
            regex: "",
            next: "start"
        } ],
        
        "comment" : [
            {token : "comment", regex : "\\*\\/", next : "start"},
            {defaultToken : "comment"}
        ],
        "line_comment" : [
            {token : "comment", regex : "$|^", next : "start"},
            {defaultToken : "comment"}
        ],
    };
};
 
oop.inherits(MinecraftHighlightRules, TextHighlightRules);
exports.MinecraftHighlightRules = MinecraftHighlightRules;

var Mode = function() {
    this.HighlightRules = MinecraftHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {
    
}).call(Mode.prototype);
exports.Mode = Mode;

});
