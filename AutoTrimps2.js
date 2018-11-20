var ATversion='2.1.6.9b-genbtc-4-2-2018 + KFrowde + Zeker0 + Keybounce-test',
    atscript=document.getElementById('AutoTrimps-script'),
    // basepath='https://Keybounce.github.io/AutoTrimps/',
    basepath='https://raw.githubusercontent.com/keybounce/AutoTrimps/testBranch/',
    modulepath='modules/';
    null!==atscript&&(basepath=atscript.src.replace(/AutoTrimps2\.js$/,''));
function ATscriptLoad(a,b){null==b&&debug('Wrong Syntax. Script could not be loaded. Try ATscriptLoad(modulepath, \'example.js\'); ');var c=document.createElement('script');null==a&&(a=''),c.src=basepath+a+b+'.js',c.id=b+'_MODULE',document.head.appendChild(c)}
function ATscriptUnload(a){var b=document.getElementById(a+"_MODULE");b&&(document.head.removeChild(b),debug("Removing "+a+"_MODULE","other"))}
ATscriptLoad(modulepath, 'utils');

function initializeAutoTrimps() {
    loadPageVariables();
    ATscriptLoad('','SettingsGUI');
    ATscriptLoad('','Graphs');
    ATmoduleList = ['query', 'portal', 'upgrades', 'heirlooms', 'buildings', 'jobs', 'equipment', 'gather', 'stance', 'maps', 'breedtimer', 'dynprestige', 'fight', 'scryer', 'magmite', 'other', 'import-export', 'perks', 'fight-info', 'performance'];
    for (var m in ATmoduleList) {
        ATscriptLoad(modulepath, ATmoduleList[m]);
    }
    debug('AutoTrimps - keybounce test Loaded!', '*spinner3');
}

var changelogList = [];
changelogList.push({date: "today", version: "test", description: "this is a continually changing test", isNew: true});

function assembleChangelog(a,b,c,d){return d?`<b class="AutoEggs">${a} ${b} </b><b style="background-color:#32CD32"> New:</b> ${c}<br>`:`<b>${a} ${b} </b> ${c}<br>`}
function printChangelog() {
    var body="";
    for (var i in changelogList) {
        var $item = changelogList[i];
        var result = assembleChangelog($item.date,$item.version,$item.description,$item.isNew);
        body+=result;
    }
    var footer =
        '<b>ZӘK Fork</b> - <u>Report any bugs/problems please</u>!\
        <br>Talk with the dev: <b>ZӘK#2509</b> @ <a target="#" href="https://discord.gg/0VbWe0dxB9kIfV2C">AutoTrimps Discord Channel</a>\
        <br>See <a target="#" href="https://github.com/Zorn192/AutoTrimps/blob/gh-pages/README.md">ReadMe</a> Or check <a target="#" href="https://github.com/Zorn192/AutoTrimps/commits/gh-pages" target="#">the commit history</a> (if you want).'
    ,   action = 'cancelTooltip()'
    ,   title = 'Script Update Notice<br>' + ATversion
    ,   acceptBtnText = "Thank you for playing AutoTrimps. Accept and Continue."
    ,   hideCancel = true;
    tooltip('confirm', null, 'update', body+footer, action, title, acceptBtnText, null, hideCancel);
}
function printLowerLevelPlayerNotice() {
    tooltip('confirm', null, 'update', 'The fact that it works at all is misleading new players into thinking its perfect. Its not. If your highest zone is under z60, you have not unlocked the stats required, and have not experienced the full meta with its various paradigm shifts. If you are just starting, my advice is to play along naturally and use AutoTrimps as a tool, not a crutch. Play with the settings as if it was the game, Dont expect to go unattended, if AT chooses wrong, and make the RIGHT choice yourself. Additionally, its not coded to run one-time challenges for you, only repeatable ones for helium. During this part of the game, content is king - automating literally removes the fun of the game. If you find that many flaws in the automation exist for you, level up. Keep in mind the challenge of maintaining the code is that it has to work for everyone. AT cant see the future and doesnt run simulations, it exists only in the present moment. Post any suggestions on how it can be better, or volunteer to adapt the code, or produce some sort of low-level player guide with what youve learned.<br>Happy scripting! -genBTC','cancelTooltip()', '<b>LowLevelPlayer Notes:</b><br><b>PSA: </b><u>AutoTrimps was not designed for new/low-level players.</u>', "I understand I am on my own and I Accept and Continue.", null, true);
}
var runInterval=100,startupDelay=4000;setTimeout(delayStart,startupDelay);function delayStart(){initializeAutoTrimps(),printChangelog(),setTimeout(delayStartAgain,startupDelay)}function delayStartAgain(){8>game.achievements.zones.finished&&printLowerLevelPlayerNotice(),game.global.addonUser=!0,game.global.autotrimps=!0,MODULESdefault=JSON.parse(JSON.stringify(MODULES)),setInterval(mainLoop,runInterval),setInterval(guiLoop,10*runInterval),autoTrimpSettings.PrestigeBackup!==void 0&&''!=autoTrimpSettings.PrestigeBackup.selected&&(document.getElementById('Prestige').value=autoTrimpSettings.PrestigeBackup.selected),''===document.getElementById('Prestige').value&&(document.getElementById('Prestige').value='Off')}
var ATrunning=!0,ATmessageLogTabVisible=!0,enableDebug=!0,autoTrimpSettings={},MODULES={},MODULESdefault={},ATMODULES={},ATmoduleList=[],bestBuilding,scienceNeeded,breedFire=!1,shouldFarm=!1,enoughDamage=!0,enoughHealth=!0,baseDamage=1,baseBlock=1,baseHealth=1,preBuyAmt,preBuyFiring,preBuyTooltip,preBuymaxSplit,currentworld=0,lastrunworld=0,aWholeNewWorld=!1,needGymystic=!0,heirloomFlag=!1,heirloomCache=game.global.heirloomsExtra.length,magmiteSpenderChanged=!1,daily3=!1;

function mainLoop() {
    if (ATrunning == false) return;
    if(getPageSetting('PauseScript') || game.options.menu.pauseGame.enabled || game.global.viewingUpgrades) return;
    ATrunning = true;
    if (getPageSetting('showbreedtimer')==true) {
        if(game.options.menu.showFullBreed.enabled != 1) toggleSetting("showFullBreed");
            addbreedTimerInsideText.innerHTML = ((game.jobs.Amalgamator.owned > 0) ? Math.floor((new Date().getTime() - game.global.lastSoldierSentAt) / 1000) : Math.floor(game.global.lastBreedTime / 1000)) + 's'; //add breed time for next army;
            addToolTipToArmyCount();
    }
    if (mainCleanup() || portalWindowOpen || (!heirloomsShown && heirloomFlag) || (heirloomCache != game.global.heirloomsExtra.length)) {       
        if (getPageSetting('AutoHeirloomsNew')==2) autoHeirlooms2();
        else if (getPageSetting('AutoHeirloomsNew')==1) autoHeirlooms();
        if (getPageSetting('AutoUpgradeHeirlooms') && !heirloomsShown) autoNull();
        heirloomCache = game.global.heirloomsExtra.length;
    }
    heirloomFlag = heirloomsShown;
    if (aWholeNewWorld) {
        switch (document.getElementById('tipTitle').innerHTML) {
            case 'The Improbability':
            case 'Corruption':
            case 'Spire':
            case 'The Magma':
            cancelTooltip();
        }
        if (getPageSetting('AutoEggs'))
            easterEggClicked();
            setTitle();
    }
    setScienceNeeded();

//Extra

    if (getPageSetting('ExitSpireCell') > 0 && game.global.challengeActive != "Daily" && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive) exitSpireCell();
    if (getPageSetting('dexitspirecell') >= 1 && game.global.challengeActive == "Daily" && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive) dailyexitSpireCell();
    if (getPageSetting('SpireBreedTimer') > 0 && getPageSetting('IgnoreSpiresUntil') <= game.global.world) ATspirebreed();
    if (getPageSetting('trimpsnotdie')==true && !game.global.fighting) helptrimpsnotdie();
    if (getPageSetting('PraidHarder') && getPageSetting('Praidingzone').length && game.global.challengeActive != "Daily" || getPageSetting('dPraidHarder') && getPageSetting('dPraidingzone').length && game.global.challengeActive == "Daily") PraidHarder();
    else {
      if (getPageSetting('Praidingzone').length && game.global.challengeActive != "Daily") Praiding();
      if (getPageSetting('dPraidingzone').length && game.global.challengeActive == "Daily") dailyPraiding();
    }
    if (getPageSetting('BWraid') && game.global.challengeActive != "Daily" || getPageSetting('Dailybwraid') && game.global.challengeActive == "Daily") {setTimeout(BWraiding(), 3000);}
    if ((getPageSetting('BWraid') || getPageSetting('DailyBWraid'))&& bwraidon) buyWeps();
    if (getPageSetting('ForceAbandon')==true || getPageSetting('fuckanti')) trimpcide();
    if (getPageSetting('AutoAllocatePerks')==2 && game.global.world >= getPageSetting('lootdumpz')) lootdump();
    if (game.global.challengeActive == "Daily" && getPageSetting('buyheliumy') >= 1 && getDailyHeliumValue(countDailyWeight()) >= getPageSetting('buyheliumy') && game.global.b >= 100 && !game.singleRunBonuses.heliumy.owned) purchaseSingleRunBonus('heliumy');
    if (!game.global.fighting){
        if (getPageSetting('fightforever')==0) fightalways();
            else if (getPageSetting('fightforever') > 0 && HDratioy() <= getPageSetting('fightforever')) fightalways();
            else if (getPageSetting('cfightforever')==true && (game.global.challengeActive == 'Toxicity' || game.global.challengeActive == 'Nom')) fightalways();
            else if (getPageSetting('dfightforever') == 1 && game.global.challengeActive == "Daily" && typeof game.global.dailyChallenge.empower == 'undefined' && typeof game.global.dailyChallenge.bloodthirst == 'undefined' && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) fightalways();
            else if (getPageSetting('dfightforever') == 2 && game.global.challengeActive == "Daily" && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) fightalways();
    }
    if (game.global.challengeActive != "Daily") cutoffwind();
    if (game.global.challengeActive == "Daily") dcutoffwind();
    if (getPageSetting('spireshitbuy')==true && getPageSetting('IgnoreSpiresUntil') <= game.global.world && game.global.spireActive) buyshitspire();
    if (getPageSetting('buywepsvoid')==true && ((getPageSetting('VoidMaps') == game.global.world && game.global.challengeActive != "Daily") || (getPageSetting('DailyVoidMod') == game.global.world && game.global.challengeActive == "Daily")) && game.global.mapsActive && getCurrentMapObject().location == "Void") buyWeps();
    if (getPageSetting('hardcorewind') >= 1 && game.global.world >= getPageSetting('hardcorewind') && (game.global.world < getPageSetting('hardcorewindmax') || getPageSetting('hardcorewindmax')<=0) && game.global.challengeActive != "Daily") orangewindstack();
    if (getPageSetting('dhardcorewind') >= 1 && game.global.world >= getPageSetting('dhardcorewind') && (game.global.world < getPageSetting('dhardcorewindmax') || getPageSetting('hardcorewindmax')<=0) && game.global.challengeActive == "Daily") dorangewindstack();
    if ((getPageSetting('darmormagic') > 0 && typeof game.global.dailyChallenge.empower == 'undefined' && typeof game.global.dailyChallenge.bloodthirst == 'undefined' && (typeof game.global.dailyChallenge.bogged !== 'undefined' || typeof game.global.dailyChallenge.plague !== 'undefined' || typeof game.global.dailyChallenge.pressure !== 'undefined')) || (getPageSetting('carmormagic') > 0 && (game.global.challengeActive == 'Toxicity' || game.global.challengeActive == 'Nom'))) armormagic();
    if (getPageSetting('mapc2hd') > 0 && game.global.runningChallengeSquared && game.global.challenge == "Mapology" && MODULES.maps.enoughDamageCutoff != getPageSetting('mapc2hd')) MODULES.maps.enoughDamageCutoff = getPageSetting('mapc2hd');
    if (getPageSetting('loomswap') > 0 && getPageSetting('highdmg') != undefined && getPageSetting('lowdmg') != undefined && getPageSetting('loomswaphd') > 0 && game.global.world >= getPageSetting('loomswap')) heirloomSwapping();

//Original

    if (getPageSetting('BuyUpgradesNew') != 0) buyUpgrades();
    var agu = getPageSetting('AutoGoldenUpgrades');
    var dagu = getPageSetting('dAutoGoldenUpgrades');
    var cagu = getPageSetting('cAutoGoldenUpgrades');
    if (agu && agu!='Off' && (!game.global.runningChallengeSquared && game.global.challengeActive != "Daily")) autoGoldenUpgradesAT(agu);
    if (dagu && dagu!='Off' && game.global.challengeActive == "Daily") autoGoldenUpgradesAT(dagu); 
    if (cagu && cagu!='Off' && game.global.runningChallengeSquared) autoGoldenUpgradesAT(cagu); 
    if (getPageSetting('BuyBuildingsNew')===0 && getPageSetting('hidebuildings')==true) buyBuildings();
      else if (getPageSetting('BuyBuildingsNew')==1) { buyBuildings(); buyStorage(); }
      else if (getPageSetting('BuyBuildingsNew')==2) buyBuildings();
      else if (getPageSetting('BuyBuildingsNew')==3) buyStorage();
      if (getPageSetting('BuyJobsNew')===0);
      else if (getPageSetting('BuyJobsNew')==1) { workerRatios(); buyJobs(); }
      else if (getPageSetting('BuyJobsNew')==2) buyJobs();
    if (getPageSetting('ManualGather2')==1) manualLabor2();
        else if (getPageSetting('ManualGather2')==2) autogather3();
    if (getPageSetting('AutoMaps') > 0) autoMap();
    if (getPageSetting('showautomapstatus')== true) updateAutoMapsStatus();
    if (autoTrimpSettings.AutoPortal.selected != "Off" && game.global.challengeActive != "Daily" && !game.global.runningChallengeSquared) autoPortal();
    if (getPageSetting('AutoPortalDaily') > 0 && game.global.challengeActive == "Daily") dailyAutoPortal();
    if (getPageSetting('c2runnerstart') == true && getPageSetting('c2runnerportal') > 0 && game.global.runningChallengeSquared && game.global.world > getPageSetting('c2runnerportal')) c2runnerportal();
    if (getPageSetting('TrapTrimps') && game.global.trapBuildAllowed && game.global.trapBuildToggled == false) toggleAutoTrap();
    if (aWholeNewWorld && getPageSetting('AutoRoboTrimp')) autoRoboTrimp();   
    if (aWholeNewWorld && getPageSetting('FinishC2')>0 && game.global.runningChallengeSquared) finishChallengeSquared();
    autoLevelEquipment();
    if ((getPageSetting('UseScryerStance')== true) || ((getPageSetting('scryvoidmaps') == true && game.global.challengeActive != "Daily") || (getPageSetting('dscryvoidmaps') == true && game.global.challengeActive == "Daily"))) useScryerStance();
        else if ((getPageSetting('AutoStance')==3) || (getPageSetting('use3daily')==true && game.global.challengeActive == "Daily")) autoStance3();
        else if (getPageSetting('AutoStance')==1) autoStance();
        else if (getPageSetting('AutoStance')==2) autoStance2();
    if (getPageSetting('AutoStanceNew')==true) autoStanceNew();
    if (getPageSetting('UseAutoGen')==true && game.global.world > 229) autoGenerator();
    if (getPageSetting('BetterAutoFight')==1) betterAutoFight();
    if (getPageSetting('BetterAutoFight')==2) betterAutoFight2();
    if (getPageSetting('BetterAutoFight')==3) betterAutoFight3();
    var forcePrecZ = (getPageSetting('ForcePresZ')<0) || (game.global.world<getPageSetting('ForcePresZ'));
    if (getPageSetting('DynamicPrestige2')>0 && forcePrecZ) prestigeChanging2();
    else autoTrimpSettings.Prestige.selected = document.getElementById('Prestige').value;
    if (getPageSetting('spendmagmite')==2 && !magmiteSpenderChanged)  autoMagmiteSpender();
    if (getPageSetting('AutoNatureTokens') && game.global.world > 229) autoNatureTokens();
  	if (game.global.mapsActive && getPageSetting('BWraid') == true && game.global.world == getPageSetting('BWraidingz') && getCurrentMapObject().level <= getPageSetting('BWraidingmax')) buyWeps();
    return;
}

function guiLoop(){updateCustomButtons(),safeSetItems('storedMODULES',JSON.stringify(compareModuleVars())),getPageSetting('EnhanceGrids')&&MODULES.fightinfo.Update(),'undefined'!=typeof MODULES&&'undefined'!=typeof MODULES.performance&&MODULES.performance.isAFK&&MODULES.performance.UpdateAFKOverlay()}
function mainCleanup() {
    lastrunworld = currentworld;
    currentworld = game.global.world;
    aWholeNewWorld = lastrunworld != currentworld;
    if (currentworld == 1 && aWholeNewWorld) {
        lastHeliumZone = 0;
        zonePostpone = 0;
        if (getPageSetting('AutoMaps')==0 && !game.upgrades.Battle.done)
            autoTrimpSettings["AutoMaps"].value = 1;
        return true;
    }
}
var userscriptOn = true;
var globalvar0,globalvar1,globalvar2,globalvar3,globalvar4,globalvar5,globalvar6,globalvar7,globalvar8,globalvar9;
function userscripts()
{

}
function throwErrorfromMain(){throw new Error("We have successfully read the thrown error message out of the main file")}
