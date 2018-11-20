// ==UserScript==
// @name         AutoTrimps-Keybounce
// @version      1.0-Keybounce
// @namespace    https://Keybounce.github.io/AutoTrimps
// @updateURL    https://Keybounce.github.io/AutoTrimps/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zeker0, keybounce
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @connect      *Keybounce.github.io/AutoTrimps*
// @connect      *cdn.jsdelivr.net/gh/keybounce/AutoTrimps*
// @connect      *trimps.github.io*
// @connect      self
// @grant        none
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-Keybounce';
//This can be edited to point to your own Github Repository URL.
// script.src = 'https://Keybounce.github.io/AutoTrimps/AutoTrimps2.js';
script.src = 'https://cdn.jsdelivr.net/gh/keybounce/AutoTrimps@mapTest/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
