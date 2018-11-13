// ==UserScript==
// @name         AutoTrimps-Timeslice
// @version      1.0-Timeslice
// @namespace    https://Timeslice42.github.io/AutoTrimps
// @updateURL    https://Timeslice42.github.io/AutoTrimps/.user.js
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru, genBTC, Zeker0
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @connect      *Timeslice42.github.io/AutoTrimps*
// @connect      *trimps.github.io*
// @connect      self
// @grant        none
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-Timeslice';
//This can be edited to point to your own Github Repository URL.
script.src = 'https://Timeslice42.github.io/AutoTrimps/AutoTrimps2.js';
//script.setAttribute('crossorigin',"use-credentials");
script.setAttribute('crossorigin',"anonymous");
document.head.appendChild(script);
