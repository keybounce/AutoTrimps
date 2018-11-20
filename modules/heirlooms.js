var worth = {'Shield': {}, 'Staff': {}};
function worthOfHeirlooms(){for(var c in worth={Shield:{},Staff:{}},game.global.heirloomsExtra){var d=game.global.heirloomsExtra[c];worth[d.type][c]=d.rarity}for(var e in worth)worth[e]=Object.keys(worth[e]).sort(function(f,g){return worth[e][g]==worth[e][f]?evaluateHeirloomMods(g,'heirloomsExtra')-evaluateHeirloomMods(f,'heirloomsExtra'):worth[e][g]-worth[e][f]})}
var animated = (game.options.menu.showHeirloomAnimations.enabled) ? "animated " : "";
var worth2 = {'Shield': [], 'Staff': []};
function worthOfHeirlooms2(){for(var c in worth2={Shield:[],Staff:[]},game.global.heirloomsExtra){var d=game.global.heirloomsExtra[c],e={location:'heirloomsExtra',index:c,rarity:d.rarity,eff:evaluateHeirloomMods(c,'heirloomsExtra')};worth2[d.type].push(e)}var f=function(g,h){return h.rarity==g.rarity?h.eff-g.eff:h.rarity-g.rarity};worth2.Shield.sort(f),worth2.Staff.sort(f)}
function autoHeirlooms2(){if(!heirloomsShown&&0<game.global.heirloomsExtra.length){for(var a=game.global.heirloomsCarried.length,b=0;b<a;b++)selectHeirloom(0,'heirloomsCarried'),stopCarryHeirloom();for(var c,a=game.global.heirloomsExtra.length,b=0;b<a;b++)c=game.global.heirloomsExtra[b],c.protected&&game.global.heirloomsCarried.length<game.global.maxCarriedHeirlooms&&(selectHeirloom(b,'heirloomsExtra'),carryHeirloom(),b--,a--);for(worthOfHeirlooms2();game.global.heirloomsCarried.length<game.global.maxCarriedHeirlooms&&0<game.global.heirloomsExtra.length;){if(worthOfHeirlooms2(),0<worth2.Shield.length){var d=worth2.Shield.shift();selectHeirloom(d.index,'heirloomsExtra'),carryHeirloom()}if(worthOfHeirlooms2(),0<worth2.Staff.length){var e=worth2.Staff.shift();selectHeirloom(e.index,'heirloomsExtra'),carryHeirloom()}}for(var f in worthOfHeirlooms(),game.global.heirloomsCarried){var c=game.global.heirloomsCarried[f],g={Shield:'Staff',Staff:'Shield'};if(0!=worth[g[c.type]].length){var b=worth[g[c.type]][0];c.rarity<game.global.heirloomsExtra[b].rarity&&!c.protected&&(selectHeirloom(f,'heirloomsCarried'),stopCarryHeirloom(),selectHeirloom(b,'heirloomsExtra'),carryHeirloom(),worthOfHeirlooms())}}}else heirloomsShown&&0<game.global.selectedHeirloom.length}
function autoHeirlooms(){if(!heirloomsShown&&0<game.global.heirloomsExtra.length){for(var a in game.global.heirloomsExtra){var b=game.global.heirloomsExtra[a];b.protected&&game.global.heirloomsCarried.length<game.global.maxCarriedHeirlooms&&(selectHeirloom(a,'heirloomsExtra'),carryHeirloom())}for(var c in worthOfHeirlooms(),game.global.heirloomsCarried){var b=game.global.heirloomsCarried[c];if(0!=worth[b.type].length){var d=worth[b.type][0];(b.rarity<game.global.heirloomsExtra[d].rarity||b.rarity==game.global.heirloomsExtra[d].rarity&&evaluateHeirloomMods(c,'heirloomsCarried')<evaluateHeirloomMods(d,'heirloomsExtra'))&&!b.protected&&(selectHeirloom(c,'heirloomsCarried'),stopCarryHeirloom(),selectHeirloom(d,'heirloomsExtra'),carryHeirloom(),worthOfHeirlooms())}}game.global.heirloomsCarried.length<game.global.maxCarriedHeirlooms&&(0<worth.Shield.length?selectHeirloom(worth.Shield[0],'heirloomsExtra'):0<worth.Staff.length&&selectHeirloom(worth.Staff[0],'heirloomsExtra'),carryHeirloom())}else heirloomsShown&&0<game.global.selectedHeirloom.length}
function autoNull(){try{for(var b,g,c=[game.global.ShieldEquipped,game.global.StaffEquipped],f=0;2>f;f++)if(g=c[f],b=evaluateHeirloomMods(0,g.type+"Equipped",!0),b.index){selectedMod=b.index;var h=getModUpgradeCost(g,selectedMod);if(game.global.nullifium<h)continue;game.global.nullifium-=h;var j=getModUpgradeValue(g,selectedMod),k=g.mods[selectedMod];k[1]=j,"undefined"==typeof k[3]?(k[2]=0,k[3]=1):k[3]++,game.heirlooms[g.type][g.mods[selectedMod][0]].currentBonus=j}}catch(m){debug("AutoSpendNull Error encountered, no Heirloom detected?: "+m.message,"general")}}
function checkForMod(a,b,c){var d=game.global[c][b];for(var e in d.mods)if(d.mods[e][0]==a)return!0;return!1}

function evaluateHeirloomMods(loom, location, upgrade) {
    var index = loom;
    var bestUpgrade = {
        'index': null,
        'name': '',
        'effect': 0
    };
    var tempEff;
    var steps;
    if (location.includes('Equipped'))
        loom = game.global[location];
    else
        loom = game.global[location][loom];
    var eff = 0;
    for (var m in loom.mods) {
        var critmult = getPlayerCritDamageMult();
        var critchance = getPlayerCritChance();
        var cmb = (critmult - game.heirlooms.Shield.critDamage.currentBonus / 100);
        var ccb = (critchance - game.heirlooms.Shield.critChance.currentBonus / 100);
        switch (loom.mods[m][0]) {
            case 'critChance':
                tempEff = ((loom.mods[m][1] / 10) * cmb) / (ccb * cmb + 1 - ccb);
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.Shield.critChance.steps[loom.rarity];
                    tempEff = ((steps[2] / 10) * critmult) / ((critchance * critmult) + 1 - critchance);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'critChance';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'critDamage':
                tempEff = ((loom.mods[m][1] / 10) * ccb) / (cmb * ccb + 1 - ccb);
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.Shield.critDamage.steps[loom.rarity];
                    tempEff = ((steps[2] / 10) * critchance) / ((critchance * critmult) + 1 - critchance);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'critDamage';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'trimpAttack':
                tempEff = loom.mods[m][1] / 10;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.Shield.trimpAttack.steps[loom.rarity];
                    tempEff = (steps[2] / 10) / ((game.heirlooms.Shield.trimpAttack.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'trimpAttack';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'voidMaps':
                tempEff = loom.mods[m][1] / 10;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.Shield.voidMaps.steps[loom.rarity];
                    tempEff = (steps[2] / 10) / ((game.heirlooms.Shield.voidMaps.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'voidMaps';
                        bestUpgrade.index = m;
                    }
                }
                break;

            case 'plaguebringer':
                tempEff = loom.mods[m][1] / 10;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.Shield.plaguebringer.steps[loom.rarity];
                    tempEff = (steps[2] / 1) / ((game.heirlooms.Shield.plaguebringer.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'plaguebringer';
                        bestUpgrade.index = m;
                    }
                }
                break;

            case 'MinerSpeed':
                tempEff = 0.75 * loom.mods[m][1] / 10;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.75 * steps[2] / 10) / ((game.heirlooms.Staff.MinerSpeed.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'MinerSpeed';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'metalDrop':
                tempEff = 0.75 * loom.mods[m][1] / 10;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.75 * steps[2] / 10) / ((game.heirlooms.Staff.metalDrop.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'metalDrop';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'fragmentsDrop':
                tempEff = 0.75 * loom.mods[m][1] / 10;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.75 * steps[2] / 10) / ((game.heirlooms.Staff.fragmentsDrop.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'DragimpSpeed';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'ExplorerSpeed':
                tempEff = 0.75 * loom.mods[m][1] / 10;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.75 * steps[2] / 100) / ((game.heirlooms.Staff.ExplorerSpeed.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'gemsDrop';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'FarmerSpeed':
                tempEff = 0.75 * loom.mods[m][1] / 100;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.5 * steps[2] / 100) / ((game.heirlooms.Staff.FarmerSpeed.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'FarmerSpeed';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'LumberjackSpeed':
                tempEff = 0.75 * loom.mods[m][1] / 100;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.5 * steps[2] / 100) / ((game.heirlooms.Staff.LumberjackSpeed.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'LumberjackSpeed';
                        bestUpgrade.index = m;
                    }
                }
            case 'FluffyExp':
                tempEff = 0.9 * loom.mods[m][1] / 10;
                eff += tempEff;
                if (upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.5 * steps[2] / 1) / ((game.heirlooms.Staff.FluffyExp.currentBonus / 100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if (tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'FluffyExp';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'empty':
                var av;
                if (upgrade) break;
                if (loom.type == 'Shield') {
                    if (!checkForMod('trimpAttack', index, location)) {
                        steps = game.heirlooms[loom.type].trimpAttack.steps[loom.rarity];
                        av = steps[0] + ((steps[1] - steps[0]) / 2);
                        tempEff = av / 10;
                        eff += tempEff;
                    } else if (!checkForMod('voidMaps', index, location)) {
                        steps = game.heirlooms[loom.type].voidMaps.steps[loom.rarity];
                        av = steps[0] + ((steps[1] - steps[0]) / 2);
                        tempEff = (steps[2] / 10);
                        eff += tempEff;
                    } else if (!checkForMod('critChance', index, location)) {
                        steps = game.heirlooms[loom.type].critChance.steps[loom.rarity];
                        av = steps[0] + ((steps[1] - steps[0]) / 2);
                        tempEff = (av * cmb) / (ccb * cmb + 1 - ccb);
                        eff += tempEff;
                    } else if (!checkForMod('critDamage', index, location)) {
                        steps = game.heirlooms[loom.type].critDamage.steps[loom.rarity];
                        av = steps[0] + ((steps[1] - steps[0]) / 2);
                        tempEff = (av * ccb) / (cmb * ccb + 1 - ccb);
                        eff += tempEff;
                    } else if (!checkForMod('plaguebringer', index, location)) {
                        steps = game.heirlooms[loom.type].plaguebringer.steps[loom.rarity];
                        av = steps[0] + ((steps[1] - steps[0]) / 2);
                        tempEff = av / 1;
                        eff += tempEff;
                    }
                }
                if (loom.type == 'Staff') {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    av = steps[0] + ((steps[1] - steps[0]) / 2);
                    if (!checkForMod('MinerSpeed', index, location) || !checkForMod('metalDrop', index, location) || !checkForMod('fragmentsDrop', index, location) || !checkForMod('ExplorerSpeed', index, location) || !checkForMod('FluffyExp', index, location)) {
                        eff += 0.8 * av / 100;
                    }
                }
                break;
        }
    }
    if (upgrade) return bestUpgrade;
    return eff;
}

var hrlmProtBtn1=document.createElement('DIV');hrlmProtBtn1.setAttribute('class','noselect heirloomBtnActive heirBtn'),hrlmProtBtn1.setAttribute('onclick','protectHeirloom(this, true)'),hrlmProtBtn1.innerHTML='Protect/Unprotect',hrlmProtBtn1.id='protectHeirloomBTN1';var hrlmProtBtn2=document.createElement('DIV');hrlmProtBtn2.setAttribute('class','noselect heirloomBtnActive heirBtn'),hrlmProtBtn2.setAttribute('onclick','protectHeirloom(this, true)'),hrlmProtBtn2.innerHTML='Protect/Unprotect',hrlmProtBtn2.id='protectHeirloomBTN2';var hrlmProtBtn3=document.createElement('DIV');hrlmProtBtn3.setAttribute('class','noselect heirloomBtnActive heirBtn'),hrlmProtBtn3.setAttribute('onclick','protectHeirloom(this, true)'),hrlmProtBtn3.innerHTML='Protect/Unprotect',hrlmProtBtn3.id='protectHeirloomBTN3',document.getElementById('equippedHeirloomsBtnGroup').appendChild(hrlmProtBtn1),document.getElementById('carriedHeirloomsBtnGroup').appendChild(hrlmProtBtn2),document.getElementById('extraHeirloomsBtnGroup').appendChild(hrlmProtBtn3);
function protectHeirloom(a,b){var c=game.global.selectedHeirloom,d=c[1],e=game.global[d];if(-1!=c[0])var e=e[c[0]];b&&(e.protected=!e.protected),a||(d.includes("Equipped")?a=document.getElementById("protectHeirloomBTN1"):"heirloomsCarried"==d?a=document.getElementById("protectHeirloomBTN2"):"heirloomsExtra"==d&&(a=document.getElementById("protectHeirloomBTN3"))),a&&(a.innerHTML=e.protected?"UnProtect":"Protect")}
function newSelectHeirloom(a,b,c){selectHeirloom(a,b,c),protectHeirloom()}
function generateHeirloomIcon(a,b,c){if("undefined"==typeof a.name)return"<span class='icomoon icon-sad3'></span>";var d="Shield"==a.type?"icomoon icon-shield3":"glyphicon glyphicon-grain",e=game.options.menu.showHeirloomAnimations.enabled?"animated ":"",f="<span class=\"heirloomThing "+e+"heirloomRare"+a.rarity;"Equipped"==b&&(f+=" equipped");var g="";return g+="Equipped"==b?"-1,'"+a.type+"Equipped'":c+", 'heirlooms"+b+"'",f+="\" onmouseover=\"tooltip('Heirloom', null, event, null, "+g+")\" onmouseout=\"tooltip('hide')\" onclick=\"newSelectHeirloom(",f+=g+", this)\"> <span class=\""+d+"\"></span></span>",f}

//loom swapping
function highdmgshield(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('highdmg'))return loom}
function lowdmgshield(){for(loom of game.global.heirloomsCarried)if(loom.name==getPageSetting('lowdmg'))return loom}

function heirloomSwapping() {
    if (getEmpowerment() == "Wind" && HDratioy() < getPageSetting('loomswaphd') && game.global.ShieldEquipped.name == getPageSetting('highdmg')) {
        lowdmgshield();
        selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
        equipHeirloom();
    }
    else if (((HDratioy() >= getPageSetting('loomswaphd')) || (getEmpowerment() != "Wind")) && game.global.ShieldEquipped.name == getPageSetting('lowdmg')) {
        highdmgshield();
        selectHeirloom(game.global.heirloomsCarried.indexOf(loom), "heirloomsCarried", true);
        equipHeirloom();
    }
}
