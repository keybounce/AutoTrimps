// ==UserScript==
// @name         AutoTrimps-Keybounce-testBranch
// @version      1.3-Keybounce
// @namespace    https://raw.githubusercontent.com/keybounce/AutoTrimps/TestRoot
// @updateURL    https://raw.githubusercontent.com/keybounce/AutoTrimps/TestRoot/.user.js
// @description  Keybounce's test branch, may change at any time
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zeker0, keybounce
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @connect      *Keybounce.github.io/AutoTrimps*
// @connect      *raw.githubusercontent.com/keybounce*
// @connect      *trimps.github.io*
// @connect      self
// @grant        none
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-Keybounce-testing';
//This can be edited to point to your own Github Repository URL.
// script.src = 'https://Keybounce.github.io/AutoTrimps/AutoTrimps2.js';
script.src = 'https://raw.githubusercontent.com/keybounce/AutoTrimps/TestRoot/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
