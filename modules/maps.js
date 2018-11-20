//moving battle calc

function getBattleStats(what,form,crit) {
    var currentCalc = 0;
    if (what == "health" || what == "attack"){
        currentCalc += (what == "health") ? 50 : 6;

        for (var equip in game.equipment){
            var temp = game.equipment[equip];
            if (typeof temp[what] === 'undefined' || temp.level <= 0 || temp.blockNow) continue;
            var equipStrength = temp[what + "Calculated"] * temp.level;
            currentCalc += equipStrength;
        }
    }
    else if (what == "block"){
        var gym = game.buildings.Gym;
        if (gym.owned > 0){
            var gymStrength = gym.owned * gym.increase.by;
            currentCalc += gymStrength;
        }
        var shield = game.equipment.Shield;
        if (shield.blockNow && shield.level > 0){
            var shieldStrength = shield.level * shield.blockCalculated;
            currentCalc += shieldStrength;
        }
        var trainer = game.jobs.Trainer;
        if (trainer.owned > 0){
            var trainerStrength = trainer.owned * (trainer.modifier / 100);
            trainerStrength = calcHeirloomBonus("Shield", "trainerEfficiency", trainerStrength);
            currentCalc  *= (trainerStrength + 1);
        }
    }
    currentCalc  *= game.resources.trimps.maxSoldiers;
    if (what == "attack" && game.global.achievementBonus > 0){
        currentCalc *= 1 + (game.global.achievementBonus / 100);
    }
    var perk = "";
    if (what == "health") perk = "Toughness";
    if (what == "attack") perk = "Power";
    if (perk && game.portal[perk].level > 0){
        var PerkStrength = (game.portal[perk].level * game.portal[perk].modifier);
        currentCalc  *= (PerkStrength + 1);
    }
    perk = perk + "_II";
    if (game.portal[perk] && game.portal[perk].level > 0){
        var PerkStrength = (game.portal[perk].level * game.portal[perk].modifier);
        currentCalc  *= (PerkStrength + 1);
    }
    if (what == "health" && game.portal.Resilience.level > 0){
        var resStrength = Math.pow(game.portal.Resilience.modifier + 1, game.portal.Resilience.level);
        currentCalc *= resStrength;
    }
    var geneticist = game.jobs.Geneticist;
    if (geneticist.owned > 0 && what == "health"){
        var geneticistStrength = Math.pow(1.01, game.global.lastLowGen);
        currentCalc  *= geneticistStrength;
    }
    var anticipation = game.portal.Anticipation;
    if (anticipation.level > 0 && what == "attack"){
        var antiStrength = ((anticipation.level * anticipation.modifier * game.global.antiStacks) + 1);
        currentCalc *= antiStrength;
    }
    if (form && game.global.formation > 0){
        var formStrength = 0.5;
        if ((game.global.formation == 1 && what == "health") || (game.global.formation == 2 && what == "attack") || (game.global.formation == 3 && what == "block")) formStrength = 4;
        currentCalc *= formStrength;
    }
    if (!game.global.mapsActive && game.global.mapBonus > 0 && what == "attack"){
        var mapBonusMult = 0.2 * game.global.mapBonus;
        currentCalc *= (1 + mapBonusMult);
        mapBonusMult *= 100;
    }
    if (what == "attack" && game.global.roboTrimpLevel > 0){
        var roboTrimpMod = 0.2 * game.global.roboTrimpLevel;
        currentCalc *= (1 + roboTrimpMod);
        roboTrimpMod *= 100;
    }
	if (what == "health" && game.global.challengeActive == "Life"){
		currentCalc *= game.challenges.Life.getHealthMult();
	}
	if (what == "attack" && game.global.challengeActive == "Life"){
		currentCalc *= game.challenges.Life.getHealthMult();
	}
    if (what == "attack" && game.global.challengeActive == "Coordinate"){
		currentCalc /= getBadCoordLevel();
    }
    if (what == "health" && game.global.challengeActive == "Balance"){
        currentCalc *= game.challenges.Balance.getHealthMult();
    }
    if (what == "attack" && game.global.challengeActive == "Lead" && ((game.global.world % 2) == 1)){
        currentCalc *= 1.5;
    }
    var heirloomBonus = calcHeirloomBonus("Shield", "trimp" + capitalizeFirstLetter(what), 0, true);
    if (heirloomBonus > 0){
        currentCalc *= ((heirloomBonus / 100) + 1);
    }
    if (game.global.challengeActive == "Decay" && what == "attack"){
        currentCalc *= 5;
        var stackStr = Math.pow(0.995, game.challenges.Decay.stacks);
        currentCalc *= stackStr;
    }
    if ((game.global.challengeActive == "Electricity" || game.global.challengeActive == "Mapocalypse") && what == "attack") {
        var mult = (1 - (game.challenges.Electricity.stacks * 0.1));
		currentCalc *= mult;
    }
    if (game.global.radioStacks > 0) {
        currentCalc *= (1 - (game.global.radioStacks * 0.1));
    }
    if (game.global.challengeActive == "Daily"){
        var mult = 0;
		if (game.talents.daily.purchased && what == "attack"){
			currentCalc *= 1.5;
		}
		if (typeof game.global.dailyChallenge.weakness !== 'undefined' && what == "attack"){
			mult = dailyModifiers.weakness.getMult(game.global.dailyChallenge.weakness.strength, game.global.dailyChallenge.weakness.stacks);
			currentCalc *= mult;
		}
		if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && what == "attack" && (game.global.world % 2 == 1)){
			mult = dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
			currentCalc *= mult;
		}
		if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && what == "attack" && (game.global.world % 2 == 0)){
			mult = dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
			currentCalc *= mult;
		}
		if (typeof game.global.dailyChallenge.rampage !== 'undefined' && what == "attack"){
			mult = dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);
			currentCalc *= mult;
		}
		if (typeof game.global.dailyChallenge.pressure !== 'undefined' && what == "health"){
			mult = dailyModifiers.pressure.getMult(game.global.dailyChallenge.pressure.strength, game.global.dailyChallenge.pressure.stacks);
			currentCalc *= mult;
		}
    }
    if (what != "block" && game.goldenUpgrades.Battle.currentBonus > 0){
        amt = game.goldenUpgrades.Battle.currentBonus;
        currentCalc *= 1 + amt;
    }
    if (what != "block" && game.talents.voidPower.purchased && game.global.voidBuff){
        amt = (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 65 : 35) : 15;
        currentCalc *= (1 + (amt / 100));
    }
	if (game.talents.stillRowing2.purchased && what == "attack" && game.global.spireRows >= 1){
		amt = game.global.spireRows * 0.06;
		currentCalc *= (amt + 1);
	}
	if (game.talents.healthStrength.purchased && what == "attack" && mutations.Healthy.active()){
		var cellCount = mutations.Healthy.cellCount();
		amt = (0.15 * cellCount);
		currentCalc *= (amt + 1);
	}
	if (game.talents.scry.purchased && what == "attack" && game.global.formation == 4 && (mutations.Healthy.active() || mutations.Corruption.active())){
		currentCalc *= 2
	}
	if (game.global.sugarRush > 0 && what == "attack"){
		currentCalc *= sugarRush.getAttackStrength();
		textString += "<tr class='pumpkimpRow'><td class='bdTitle'>Sugar Rush</td><td>&nbsp;</td><td>&nbsp;</td><td>x " + sugarRush.getAttackStrength() + "</td><td class='bdNumberSm'>" + prettify(currentCalc) + "</td>" + ((what == "attack") ? getFluctuation(currentCalc, minFluct, maxFluct) : "") + "</tr>";
	}
    if (mutations.Magma.active() && (what == "attack" || what == "health")){
        var mult = mutations.Magma.getTrimpDecay();
        var lvls = game.global.world - mutations.Magma.start() + 1;
        currentCalc *= mult;
    }
	if (game.global.totalSquaredReward > 0 && (what == "attack" || what == "health")){
		var amt = game.global.totalSquaredReward;
		currentCalc *= (1 + (amt / 100));
	}
	if (what == "attack" && getEmpowerment() == "Ice"){
		var amt = 1 - game.empowerments.Ice.getCombatModifier();
		currentCalc *= (1 + amt);
	}
	if (what == "attack" && Fluffy.isActive()){
		var amt = Fluffy.getDamageModifier();
		currentCalc *= amt;
	}
	if (what == "attack" && game.jobs.Amalgamator.owned > 0){
		var amt = game.jobs.Amalgamator.getDamageMult();
		currentCalc *= amt;
	}
	if (what == "health" && game.jobs.Amalgamator.owned > 0){
		var amt = game.jobs.Amalgamator.getHealthMult();
		currentCalc *= amt;
	}
	if (what == "attack" && game.singleRunBonuses.sharpTrimps.owned) {
		currentCalc *= 1.5;
	}
	if (game.jobs.Magmamancer.owned > 0) {
		currentCalc *= game.jobs.Magmamancer.getBonusPercent();
	}
	if (what == "attack" && getEmpowerment() == "Poison" && getPageSetting('addpoison') == true){
		var amt = game.empowerments.Poison.getModifier() * 2;
		currentCalc *= (1 + amt);
	}
    if (crit) {
        var critChance = getPlayerCritChance();
        if (what == "attack" && critChance){
            currentCalc *= getPlayerCritDamageMult();
        }
    }
    return currentCalc;
}

function calcOurDmg(minMaxAvg, incStance, incFlucts) {
  var number = game.global.soldierCurrentAttack;
  var fluctuation = .2;
	var maxFluct = -1;
	var minFluct = -1;
	if (game.jobs.Amalgamator.owned > 0){
		number *= game.jobs.Amalgamator.getDamageMult();
	}
	if (game.challenges.Electricity.stacks > 0) { //Electricity
		number *= (1 - (game.challenges.Electricity.stacks * 0.1));
	}
	if (game.global.antiStacks > 0) {
		number *= ((game.global.antiStacks * game.portal.Anticipation.level * game.portal.Anticipation.modifier) + 1);
	}
	if (!game.global.mapsActive && game.global.mapBonus > 0){
		number *= ((game.global.mapBonus * .2) + 1);
	}
	if (game.global.achievementBonus > 0){
		number *= (1 + (game.global.achievementBonus / 100));
	}
	if (game.global.challengeActive == "Discipline"){
		fluctuation = .995;
	}
	else if (game.portal.Range.level > 0){
		minFluct = fluctuation - (.02 * game.portal.Range.level);
	}
	if (game.global.challengeActive == "Decay"){
		number *= 5;
		number *= Math.pow(0.995, game.challenges.Decay.stacks);
	}
	if (game.global.roboTrimpLevel > 0){
		number *= ((0.2 * game.global.roboTrimpLevel) + 1);
	}
	if (game.global.challengeActive == "Lead" && ((game.global.world % 2) == 1)){
		number *= 1.5;
	}
	if (game.goldenUpgrades.Battle.currentBonus > 0){
		number *= game.goldenUpgrades.Battle.currentBonus + 1;
	}
	if (game.talents.voidPower.purchased && game.global.voidBuff){
		var vpAmt = (game.talents.voidPower2.purchased) ? ((game.talents.voidPower3.purchased) ? 65 : 35) : 15;
		number *= ((vpAmt / 100) + 1);
	}
	if (game.global.totalSquaredReward > 0){
		number *= ((game.global.totalSquaredReward / 100) + 1)
	}
	if (getEmpowerment() == "Ice"){
		number *= 1 + (1 - game.empowerments.Ice.getCombatModifier());
	}
	if (getEmpowerment() == "Poison" && getPageSetting('addpoison') == true){
		number *= 1 + game.empowerments.Poison.getModifier();
	}
	if (game.talents.magmamancer.purchased){
		number *= game.jobs.Magmamancer.getBonusPercent();
	}
	if (game.talents.stillRowing2.purchased){
		number *= ((game.global.spireRows * 0.06) + 1);
	}
	if (game.talents.healthStrength.purchased && mutations.Healthy.active()){
		number *= ((0.15 * mutations.Healthy.cellCount()) + 1);
	}
	if (game.global.sugarRush > 0){
		number *= sugarRush.getAttackStrength();
	}
	if (game.global.challengeActive == "Life") {
		number *= game.challenges.Life.getHealthMult();
	}
    	if (game.global.challengeActive == "Coordinate"){
		number /= getBadCoordLevel();
    	}
	if (game.singleRunBonuses.sharpTrimps.owned){
		number *= 1.5;
	}
	if (game.global.challengeActive == "Daily" && game.talents.daily.purchased){
		number *= 1.5;
	}
	if (game.global.challengeActive == "Daily"){
		if (typeof game.global.dailyChallenge.minDamage !== 'undefined'){
			if (minFluct == -1) minFluct = fluctuation;
			minFluct += dailyModifiers.minDamage.getMult(game.global.dailyChallenge.minDamage.strength);
		}
		if (typeof game.global.dailyChallenge.maxDamage !== 'undefined'){
			if (maxFluct == -1) maxFluct = fluctuation;
			maxFluct += dailyModifiers.maxDamage.getMult(game.global.dailyChallenge.maxDamage.strength);
		}
		if (typeof game.global.dailyChallenge.weakness !== 'undefined'){
			number *= dailyModifiers.weakness.getMult(game.global.dailyChallenge.weakness.strength, game.global.dailyChallenge.weakness.stacks);
		}
		if (typeof game.global.dailyChallenge.oddTrimpNerf !== 'undefined' && ((game.global.world % 2) == 1)){
				number *= dailyModifiers.oddTrimpNerf.getMult(game.global.dailyChallenge.oddTrimpNerf.strength);
		}
		if (typeof game.global.dailyChallenge.evenTrimpBuff !== 'undefined' && ((game.global.world % 2) == 0)){
				number *= dailyModifiers.evenTrimpBuff.getMult(game.global.dailyChallenge.evenTrimpBuff.strength);
		}
		if (typeof game.global.dailyChallenge.rampage !== 'undefined'){
			number *= dailyModifiers.rampage.getMult(game.global.dailyChallenge.rampage.strength, game.global.dailyChallenge.rampage.stacks);
		}
	}
	if (Fluffy.isActive()){
		number *= Fluffy.getDamageModifier();
	}

  if (!incStance && game.global.formation != 0) {
    number /= (game.global.formation == 2) ? 4 : 0.5;
  }

  var min = number;
  var max = number;
  var avg = number;

  var critTier = 0;
  var critChance = getPlayerCritChance();
  if (critChance > 0){
    critTier = Math.floor(critChance);
    critChance = critChance % 1;
    max *= getPlayerCritDamageMult();
    if (critTier > 0){
      min = max;
      if (critTier > 1){
        min *= getMegaCritDamageMult(critTier);
      }
      if (critChance > 0) max *= getMegaCritDamageMult(critTier + 1);
      else max = min;
    }
    avg = max * critChance + min * (1 - critChance);
  }
  if (critChance < 0) {
    min *= 0.2;
    if (critChance <= -1) max *= 0.2;
    avg = max * (1 + critChance) + min * -critChance;
  }

  if (incFlucts) {
    if (minFluct > 1) minFluct = 1;
    if (maxFluct == -1) maxFluct = fluctuation;
    if (minFluct == -1) minFluct = fluctuation;

    min *= (1 - minFluct);
    max *= (1 + maxFluct);
    avg *= 1 + (maxFluct - minFluct)/2;
  }

  if (minMaxAvg == "min") return min;
  else if (minMaxAvg == "max") return max;
  else if (minMaxAvg == "avg") return avg;

}

function calcBadGuyDmg(enemy,attack,daily,maxormin,disableFlucts) {
    var number;
    if (enemy)
        number = enemy.attack;
    else
        number = attack;
    var fluctuation = .2;
    var maxFluct = -1;
    var minFluct = -1;

    if (game.global.challengeActive){
        if (game.global.challengeActive == "Coordinate"){
            number *= getBadCoordLevel();
        }
        else if (game.global.challengeActive == "Meditate"){
            number *= 1.5;
        }
        else if (enemy && game.global.challengeActive == "Nom" && typeof enemy.nomStacks !== 'undefined'){
            number *= Math.pow(1.25, enemy.nomStacks);
        }
        else if (game.global.challengeActive == "Watch") {
            number *= 1.25;
        }
        else if (game.global.challengeActive == "Lead"){
            number *= (1 + (game.challenges.Lead.stacks * 0.04));
        }
        else if (game.global.challengeActive == "Scientist" && getScientistLevel() == 5) {
            number *= 10;
        }
        else if (game.global.challengeActive == "Corrupted"){
            number *= 3;
	    }
	    else if (game.global.challengeActive == "Obliterated"){
            number *= 1e12;
        }
        if (daily)
            number = calcDailyAttackMod(number);
    }
    if (game.global.usingShriek) {
        number *= game.mapUnlocks.roboTrimp.getShriekValue();
    }

    if (!disableFlucts) {
        if (minFluct > 1) minFluct = 1;
        if (maxFluct == -1) maxFluct = fluctuation;
        if (minFluct == -1) minFluct = fluctuation;
        var min = Math.floor(number * (1 - minFluct));
        var max = Math.ceil(number + (number * maxFluct));
        return maxormin ? max : min;
    }
    else
        return number;
}
function calcDailyAttackMod(number) {
    if (game.global.challengeActive == "Daily"){
        if (typeof game.global.dailyChallenge.badStrength !== 'undefined'){
            number *= dailyModifiers.badStrength.getMult(game.global.dailyChallenge.badStrength.strength);
        }
        if (typeof game.global.dailyChallenge.badMapStrength !== 'undefined' && game.global.mapsActive){
            number *= dailyModifiers.badMapStrength.getMult(game.global.dailyChallenge.badMapStrength.strength);
        }
        if (typeof game.global.dailyChallenge.bloodthirst !== 'undefined'){
            number *= dailyModifiers.bloodthirst.getMult(game.global.dailyChallenge.bloodthirst.strength, game.global.dailyChallenge.bloodthirst.stacks);
        }
    }
    return number;
}

MODULES.maps={},MODULES.maps.enoughDamageCutoff=4,MODULES.maps.farmingCutoff=getPageSetting("DisableFarm"),MODULES.maps.numHitsSurvived=8,MODULES.maps.LeadfarmingCutoff=10,MODULES.maps.NomfarmingCutoff=10,MODULES.maps.NomFarmStacksCutoff=[7,30,100],MODULES.maps.MapTierZone=[72,47,16],MODULES.maps.MapTier0Sliders=[9,9,9,"Mountain"],MODULES.maps.MapTier1Sliders=[9,9,9,"Depths"],MODULES.maps.MapTier2Sliders=[9,9,9,"Random"],MODULES.maps.MapTier3Sliders=[9,9,9,"Random"],MODULES.maps.preferGardens=!getPageSetting("PreferMetal"),MODULES.maps.maxMapBonus=10,MODULES.maps.wantHealthMapBonus=10,MODULES.maps.SpireFarm199Maps=!0,MODULES.maps.watchChallengeMaps=[15,25,35,50],MODULES.maps.shouldFarmCell=59,MODULES.maps.SkipNumUnboughtPrestiges=2,MODULES.maps.UnearnedPrestigesRequired=2,MODULES.maps.maxMapBonusAfterZ=MODULES.maps.maxMapBonus;var doVoids=!1,needToVoid=!1,needPrestige=!1,skippedPrestige=!1,HDratio=0,ourBaseDamage=calcOurDmg("avg", false, true),ourBaseDamage2=0,scryerStuck=!1,shouldDoMaps=!1,mapTimeEstimate=0,lastMapWeWereIn=null,preSpireFarming=!1,spireMapBonusFarming=!1,spireTime=0,doMaxMapBonus=!1,vanillaMapatZone=!1,additionalCritMulti=2<getPlayerCritChance()?25:5;

function autoMap() {
    var customVars = MODULES["maps"];
    var prestige = autoTrimpSettings.Prestige.selected;
    if (prestige != "Off" && game.options.menu.mapLoot.enabled != 1) toggleSetting('mapLoot');
    if (game.options.menu.repeatUntil.enabled == 2) toggleSetting('repeatUntil');
    if (game.options.menu.exitTo.enabled != 0) toggleSetting('exitTo');
    if (game.options.menu.repeatVoids.enabled != 0) toggleSetting('repeatVoids');
    if (!game.global.mapsUnlocked || baseDamage <= 0) {
        enoughDamage = true;
        enoughHealth = true;
        shouldFarm = false;
        updateAutoMapsStatus();
        return;
    }
    if (game.global.challengeActive == "Mapology" && game.challenges.Mapology.credits < 1) {
        updateAutoMapsStatus();
        return;
    }
    var challSQ = game.global.runningChallengeSquared;
    var extraMapLevels = getPageSetting('AdvMapSpecialModifier') ? getExtraMapLevels() : 0;
    var voidMapLevelSetting = 0;
    if (game.global.challengeActive != "Daily") {
        voidMapLevelSetting = getPageSetting('VoidMaps');
    }
    var dailyVoidMod = getPageSetting('DailyVoidMod');
    if ((game.global.challengeActive == "Daily") && (getPageSetting('DailyVoidMod') >= 1)) {
        (voidMapLevelSetting = dailyVoidMod);
    }
    var voidMapLevelSettingZone = (voidMapLevelSetting + "").split(".")[0];
    var voidMapLevelSettingMap = (voidMapLevelSetting + "").split(".")[1];
    if (voidMapLevelSettingMap === undefined || (game.global.challengeActive == 'Lead' && !challSQ))
        voidMapLevelSettingMap = 90;
    if (voidMapLevelSettingMap.length == 1) voidMapLevelSettingMap += "0";
    needToVoid = voidMapLevelSetting > 0 && game.global.totalVoidMaps > 0 && game.global.lastClearedCell + 1 >= voidMapLevelSettingMap && (game.global.world == voidMapLevelSettingZone || (game.global.world >= voidMapLevelSettingZone && getPageSetting('RunNewVoidsUntilNew') != 0 && (getPageSetting('RunNewVoidsUntilNew') == -1 || game.global.world <= (getPageSetting('RunNewVoidsUntilNew') + voidMapLevelSettingZone))));
    if (game.global.totalVoidMaps == 0 || !needToVoid)
        doVoids = false;

    if ((getPageSetting('ForcePresZ') >= 0) && ((game.global.world + extraMapLevels) >= getPageSetting('ForcePresZ'))) {
        const prestigeList = ['Supershield', 'Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP'];
        needPrestige = prestigeList.some(prestige => game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5);
    } else

        needPrestige = prestige != "Off" && game.mapUnlocks[prestige] && game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5 && game.global.challengeActive != "Frugal";

    skippedPrestige = false;
    if (needPrestige && (getPageSetting('PrestigeSkip1_2') == 1 || getPageSetting('PrestigeSkip1_2') == 2)) {
        var prestigeList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP'];
        var numUnbought = 0;
        for (var i in prestigeList) {
            var p = prestigeList[i];
            if (game.upgrades[p].allowed - game.upgrades[p].done > 0)
                numUnbought++;
        }
        if (numUnbought >= customVars.SkipNumUnboughtPrestiges) {
            needPrestige = false;
            skippedPrestige = true;
        }
    }

    if ((needPrestige || skippedPrestige) && (getPageSetting('PrestigeSkip1_2') == 1 || getPageSetting('PrestigeSkip1_2') == 3)) {
        const prestigeList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest'];
        const numLeft = prestigeList.filter(prestige => game.mapUnlocks[prestige].last <= (game.global.world + extraMapLevels) - 5);
        const shouldSkip = numLeft <= customVars.UnearnedPrestigesRequired;
        if (shouldSkip != skippedPrestige) {
            needPrestige = !needPrestige;
            skippedPrestige = !skippedPrestige;
        }
    }
    var AutoStance = getPageSetting('AutoStance');
    ourBaseDamage = calcOurDmg("avg", false, true);
    if (game.global.mapsActive && getEmpowerment() == "Ice") {
        ourBaseDamage /= 1 + (1 - game.empowerments.Ice.getCombatModifier());
    }
    var mapbonusmulti = 1 + (0.20 * game.global.mapBonus);
    if (game.global.mapsActive) {
        ourBaseDamage2 = ourBaseDamage;
        ourBaseDamage *= mapbonusmulti;
    } else {
        ourBaseDamage2 = ourBaseDamage;
        ourBaseDamage2 /= mapbonusmulti;
    }
    var enemyDamage;
    var enemyHealth;
    if (AutoStance <= 1) {
        enemyDamage = getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.2);
        enemyDamage = calcDailyAttackMod(enemyDamage);
    } else {
        enemyDamage = calcBadGuyDmg(null, getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.0), true, true);
    }
    enemyHealth = getEnemyMaxHealth(game.global.world + 1, 50);
    if (game.global.challengeActive == "Toxicity") {
        enemyHealth *= 2;
    }
    var corrupt = game.global.world >= mutations.Corruption.start(true);
    if (getPageSetting('CorruptionCalc') && corrupt) {
        var cptnum = getCorruptedCellsNum();
        var cpthlth = getCorruptScale("health");
        var cptpct = cptnum / 100;
        var hlthprop = cptpct * cpthlth;
        if (hlthprop >= 1)
            enemyHealth *= hlthprop;
        var cptatk = getCorruptScale("attack");
        var atkprop = cptpct * cptatk;
        if (atkprop >= 1)
            enemyDamage *= atkprop;
    }
    if (getPageSetting('DisableFarm') >= 1) {
        shouldFarm = enemyHealth > (ourBaseDamage * getPageSetting('DisableFarm'));
        if (game.options.menu.repeatUntil.enabled == 1) toggleSetting('repeatUntil'); //turn repeat forever on if farming is on.
    }
    if ((game.global.challengeActive == 'Lead' && !challSQ)) {
        ourBaseDamage /= mapbonusmulti;
        if (AutoStance <= 1)
            enemyDamage *= (1 + (game.challenges.Lead.stacks * 0.04));
        enemyHealth *= (1 + (game.challenges.Lead.stacks * 0.04));
        if (game.global.world % 2 == 1 && game.global.world != 179) {
            if (AutoStance <= 1) {
                enemyDamage = getEnemyMaxAttack(game.global.world + 1, 99, 'Snimp', 1.2);
                enemyDamage = calcDailyAttackMod(enemyDamage);
            } else {
                enemyDamage = calcBadGuyDmg(null, getEnemyMaxAttack(game.global.world + 1, 99, 'Snimp', 1.0), true, true);
            }
            enemyDamage *= (1 + (100 * 0.04));
            ourBaseDamage /= 1.5;
        }
        if (game.global.world == 179) {
            ourBaseDamage *= mapbonusmulti;
        }
        if (getPageSetting('DisableFarm') >= 1) {
            shouldFarm = enemyHealth > (ourBaseDamage * customVars.LeadfarmingCutoff);
        }
    }
    var pierceMod = (game.global.brokenPlanet && !game.global.mapsActive) ? getPierceAmt() : 0;
    const FORMATION_MOD_1 = game.upgrades.Dominance.done ? 2 : 1;
    calcBaseDamageinX2();
    enoughHealth = (getBattleStats("health") / FORMATION_MOD_1 > customVars.numHitsSurvived * (enemyDamage - baseBlock / FORMATION_MOD_1 > 0 ? enemyDamage - baseBlock / FORMATION_MOD_1 : enemyDamage * pierceMod));
    enoughDamage = (ourBaseDamage * customVars.enoughDamageCutoff > enemyHealth);
    HDratio = enemyHealth / ourBaseDamage;
    updateAutoMapsStatus();
    var selectedMap = "world";
    var shouldFarmLowerZone = false;
    shouldDoMaps = false;
    if (ourBaseDamage > 0) {
        shouldDoMaps = !enoughDamage || shouldFarm || scryerStuck;
    }
    mapTimeEstimate = mapTimeEstimater();

    var shouldDoHealthMaps = false;
    if (game.global.mapBonus >= customVars.maxMapBonus && !shouldFarm)
        shouldDoMaps = false;
    else if (game.global.mapBonus >= customVars.maxMapBonus && shouldFarm)
        shouldFarmLowerZone = getPageSetting('LowerFarmingZone');
    else if (game.global.mapBonus < customVars.wantHealthMapBonus && !enoughHealth && !shouldDoMaps && !needPrestige) {
        shouldDoMaps = true;
        shouldDoHealthMaps = true;
    }
    var restartVoidMap = false;
    if (game.global.challengeActive == 'Nom' && getPageSetting('FarmWhenNomStacks7')) {
        if (game.global.gridArray[99].nomStacks > customVars.NomFarmStacksCutoff[0]) {
            if (game.global.mapBonus != customVars.maxMapBonus)
                shouldDoMaps = true;
        }
        if (game.global.gridArray[99].nomStacks == customVars.NomFarmStacksCutoff[1]) {
            shouldFarm = (HDratio > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
        }
        if (!game.global.mapsActive && game.global.gridArray[game.global.lastClearedCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
            shouldFarm = (HDratio > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
        }
        if (game.global.mapsActive && game.global.mapGridArray[game.global.lastClearedMapCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
            shouldFarm = (HDratio > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
            restartVoidMap = true;
        }
    }
    if (shouldFarm && !needPrestige) {
        var capped = areWeAttackLevelCapped();
        var prestigeitemsleft;
        if (game.global.mapsActive) {
            prestigeitemsleft = addSpecials(true, true, getCurrentMapObject());
        } else if (lastMapWeWereIn) {
            prestigeitemsleft = addSpecials(true, true, lastMapWeWereIn);
        }
        const prestigeList = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest'];
        var numUnbought = 0;
        for (var i = 0, len = prestigeList.length; i < len; i++) {
            var p = prestigeList[i];
            if (game.upgrades[p].allowed - game.upgrades[p].done > 0)
                numUnbought++;
        }
        if (capped && prestigeitemsleft == 0 && numUnbought == 0) {
            shouldFarm = false;
            if (game.global.mapBonus >= customVars.maxMapBonus && !shouldFarm)
                shouldDoMaps = false;
        }
    }
    var watchmaps = customVars.watchChallengeMaps;
    var shouldDoWatchMaps = false;
    if (game.global.challengeActive == 'Watch' && watchmaps.indexOf(game.global.world) > -1 && game.global.mapBonus < 1) {
        shouldDoMaps = true;
        shouldDoWatchMaps = true;
    }
    var shouldDoSpireMaps = false;
    preSpireFarming = (isActiveSpireAT()) && (spireTime = (new Date().getTime() - game.global.zoneStarted) / 1000 / 60) < getPageSetting('MinutestoFarmBeforeSpire');
    spireMapBonusFarming = getPageSetting('MaxStacksForSpire') && isActiveSpireAT() && game.global.mapBonus < customVars.maxMapBonus;
    if (preSpireFarming || spireMapBonusFarming) {
        shouldDoMaps = true;
        shouldDoSpireMaps = true;
    }
    var maxMapBonusZ = getPageSetting('MaxMapBonusAfterZone');
    doMaxMapBonus = (maxMapBonusZ >= 0 && game.global.mapBonus < customVars.maxMapBonusAfterZ && game.global.world >= maxMapBonusZ);
    if (doMaxMapBonus)
        shouldDoMaps = true;
    vanillaMapatZone = (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone && !isActiveSpireAT());
    if (vanillaMapatZone)
        for (var x = 0; x < game.options.menu.mapAtZone.setZone.length; x++) {
            if (game.global.world == game.options.menu.mapAtZone.setZone[x])
                shouldDoMaps = true;
        }
    var siphlvl = shouldFarmLowerZone ? game.global.world - 10 : game.global.world - game.portal.Siphonology.level;
    var maxlvl = game.talents.mapLoot.purchased ? game.global.world - 1 : game.global.world;
    maxlvl += extraMapLevels;
    if (getPageSetting('DynamicSiphonology') || shouldFarmLowerZone) {
        for (siphlvl; siphlvl < maxlvl; siphlvl++) {
            var maphp = getEnemyMaxHealth(siphlvl) * 1.1;
            var cpthlth = getCorruptScale("health") / 2;
            if (mutations.Magma.active())
                maphp *= cpthlth;
            var mapdmg = ourBaseDamage2;
            if (game.upgrades.Dominance.done && !getPageSetting('ScryerUseinMaps2'))
                mapdmg *= 4;
            if (mapdmg < maphp) {
                break;
            }
        }
    }
    var obj = {};
    var siphonMap = -1;
    for (var map in game.global.mapsOwnedArray) {
        if (!game.global.mapsOwnedArray[map].noRecycle) {
            obj[map] = game.global.mapsOwnedArray[map].level;
            if (game.global.mapsOwnedArray[map].level == siphlvl)
                siphonMap = map;
        }
    }
    var keysSorted = Object.keys(obj).sort(function(a, b) {
        return obj[b] - obj[a];
    });
    var highestMap;
    var lowestMap;
    if (keysSorted[0]) {
        highestMap = keysSorted[0];
        lowestMap = keysSorted[keysSorted.length - 1];
    } else
        selectedMap = "create";
    var runUniques = (getPageSetting('AutoMaps') == 1);
    if (runUniques) {
        for (var map in game.global.mapsOwnedArray) {
            var theMap = game.global.mapsOwnedArray[map];
            if (theMap.noRecycle) {
                if (theMap.name == 'The Wall' && game.upgrades.Bounty.allowed == 0 && !game.talents.bounty.purchased) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if (game.global.world < 15 + theMapDifficulty) continue;
                    selectedMap = theMap.id;
                    break;
                }
                if (theMap.name == 'Dimension of Anger' && document.getElementById("portalBtn").style.display == "none" && !game.talents.portal.purchased) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if (game.global.world < 20 + theMapDifficulty) continue;
                    selectedMap = theMap.id;
                    break;
                }
                var runningC2 = game.global.runningChallengeSquared;
                if (theMap.name == 'The Block' && !game.upgrades.Shieldblock.allowed && ((game.global.challengeActive == "Scientist" || game.global.challengeActive == "Trimp") && !runningC2 || getPageSetting('BuyShieldblock'))) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if (game.global.world < 11 + theMapDifficulty) continue;
                    selectedMap = theMap.id;
                    break;
                }
                var treasure = getPageSetting('TrimpleZ');
                if (theMap.name == 'Trimple Of Doom' && (!runningC2 && game.mapUnlocks.AncientTreasure.canRunOnce && game.global.world >= treasure)) {
                    var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                    if ((game.global.world < 33 + theMapDifficulty) || treasure > -33 && treasure < 33) continue;
                    selectedMap = theMap.id;
                    if (treasure < 0)
                        setPageSetting('TrimpleZ', 0);
                    break;
                }
                if (!runningC2) {
                    if (theMap.name == 'The Prison' && (game.global.challengeActive == "Electricity" || game.global.challengeActive == "Mapocalypse")) {
                        var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                        if (game.global.world < 80 + theMapDifficulty) continue;
                        selectedMap = theMap.id;
                        break;
                    }
                    if (theMap.name == 'Bionic Wonderland' && game.global.challengeActive == "Crushed") {
                        var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                        if (game.global.world < 125 + theMapDifficulty) continue;
                        selectedMap = theMap.id;
                        break;
                    }
                }
            }
        }
    }
    if (needToVoid) {
        var voidArray = [];
        var prefixlist = {
            'Deadly': 10,
            'Heinous': 11,
            'Poisonous': 20,
            'Destructive': 30
        };
        var prefixkeys = Object.keys(prefixlist);
        var suffixlist = {
            'Descent': 7.077,
            'Void': 8.822,
            'Nightmare': 9.436,
            'Pit': 10.6
        };
        var suffixkeys = Object.keys(suffixlist);
        for (var map in game.global.mapsOwnedArray) {
            var theMap = game.global.mapsOwnedArray[map];
            if (theMap.location == 'Void') {
                for (var pre in prefixkeys) {
                    if (theMap.name.includes(prefixkeys[pre]))
                        theMap.sortByDiff = 1 * prefixlist[prefixkeys[pre]];
                }
                for (var suf in suffixkeys) {
                    if (theMap.name.includes(suffixkeys[suf]))
                        theMap.sortByDiff += 1 * suffixlist[suffixkeys[suf]];
                }
                voidArray.push(theMap);
            }
        }
        var voidArraySorted = voidArray.sort(function(a, b) {
            return a.sortByDiff - b.sortByDiff;
        });
        for (var map in voidArraySorted) {
            var theMap = voidArraySorted[map];
            doVoids = true;
            var eAttack = getEnemyMaxAttack(game.global.world, theMap.size, 'Voidsnimp', theMap.difficulty);
            if (game.global.world >= 181 || (game.global.challengeActive == "Corrupted" && game.global.world >= 60))
                eAttack *= (getCorruptScale("attack") / 2).toFixed(1);
            var ourHealth = getBattleStats("health");
            if (game.global.challengeActive == 'Balance') {
                var stacks = game.challenges.Balance.balanceStacks ? (game.challenges.Balance.balanceStacks > theMap.size) ? theMap.size : game.challenges.Balance.balanceStacks : false;
                eAttack *= 2;
                if (stacks) {
                    for (i = 0; i < stacks; i++) {
                        ourHealth *= 1.01;
                    }
                }
            }
            if (game.global.challengeActive == 'Toxicity') eAttack *= 5;
            var ourBlock = getBattleStats("block", true);
            if (getPageSetting('DisableFarm') < 1)
                    shouldFarm = shouldFarm || false;
            if (!restartVoidMap)
                selectedMap = theMap.id;
            if (game.global.mapsActive && getCurrentMapObject().location == "Void" && game.global.challengeActive == "Nom" && getPageSetting('FarmWhenNomStacks7')) {
                if (game.global.mapGridArray[theMap.size - 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
                    mapsClicked(true);
                }
            }
            break;
        }
    }
    if (shouldDoMaps || doVoids || needPrestige) {
        if (selectedMap == "world") {
            if (preSpireFarming) {
                var spiremaplvl = (game.talents.mapLoot.purchased && MODULES["maps"].SpireFarm199Maps) ? game.global.world - 1 : game.global.world;
                selectedMap = "create";
                for (var i = 0; i < keysSorted.length; i++) {
                    if (game.global.mapsOwnedArray[keysSorted[i]].level >= spiremaplvl &&
                        game.global.mapsOwnedArray[keysSorted[i]].location == ((customVars.preferGardens && game.global.decayDone) ? 'Plentiful' : 'Mountain')) {
                        selectedMap = game.global.mapsOwnedArray[keysSorted[i]].id;
                        break;
                    }
                }
            } else if (needPrestige || (extraMapLevels > 0)) {
                if ((game.global.world + extraMapLevels) <= game.global.mapsOwnedArray[highestMap].level)
                    selectedMap = game.global.mapsOwnedArray[highestMap].id;
                else
                    selectedMap = "create";
            } else if (siphonMap != -1)
                selectedMap = game.global.mapsOwnedArray[siphonMap].id;
            else
                selectedMap = "create";
        }
    }
    if ((game.global.challengeActive == 'Lead' && !challSQ) && !doVoids && (game.global.world % 2 == 0 || game.global.lastClearedCell < customVars.shouldFarmCell)) {
        if (game.global.preMapsActive)
            mapsClicked();
        return;
    }
    if (!game.global.preMapsActive && game.global.mapsActive) {
        var doDefaultMapBonus = game.global.mapBonus < customVars.maxMapBonus - 1;
        if (selectedMap == game.global.currentMapId && (!getCurrentMapObject().noRecycle && (doDefaultMapBonus || vanillaMapatZone || doMaxMapBonus || shouldFarm || needPrestige || shouldDoSpireMaps))) {
            var targetPrestige = autoTrimpSettings.Prestige.selected;
            if (!game.global.repeatMap) {
                repeatClicked();
            }
            if (!shouldDoMaps && (game.global.mapGridArray[game.global.mapGridArray.length - 1].special == targetPrestige && game.mapUnlocks[targetPrestige].last >= (game.global.world + extraMapLevels - 9))) {
                repeatClicked();
            }
            if (shouldDoWatchMaps)
                repeatClicked();
            if (shouldDoHealthMaps && game.global.mapBonus >= customVars.wantHealthMapBonus - 1) {
                repeatClicked();
                shouldDoHealthMaps = false;
            }
            if (doMaxMapBonus && game.global.mapBonus >= customVars.maxMapBonusAfterZ - 1) {
                repeatClicked();
                doMaxMapBonus = false;
            }
        } else {
            if (game.global.repeatMap) {
                repeatClicked();
            }
            if (restartVoidMap) {
                mapsClicked(true);
            }
        }
    } else if (!game.global.preMapsActive && !game.global.mapsActive) {
        if (selectedMap != "world") {
            if (!game.global.switchToMaps) {
                mapsClicked();
            }
            if ((!getPageSetting('PowerSaving') || (getPageSetting('PowerSaving') == 2) && doVoids) && game.global.switchToMaps && !shouldDoWatchMaps &&
                (needPrestige || doVoids ||
                    ((game.global.challengeActive == 'Lead' && !challSQ) && game.global.world % 2 == 1) ||
                    (!enoughDamage && enoughHealth && game.global.lastClearedCell < 9) ||
                    (shouldFarm && game.global.lastClearedCell >= customVars.shouldFarmCell) ||
                    (scryerStuck)) &&
                (
                    (game.resources.trimps.realMax() <= game.resources.trimps.owned + 1) ||
                    ((game.global.challengeActive == 'Lead' && !challSQ) && game.global.lastClearedCell > 93) ||
                    (doVoids && game.global.lastClearedCell > 93)
                )
            ) {
                if (scryerStuck) {
                    debug("Got perma-stuck on cell " + (game.global.lastClearedCell + 2) + " during scryer stance. Are your scryer settings correct? Entering map to farm to fix it.");
                }
                mapsClicked();
            }
        }
        if (shouldDoWatchMaps) {
            mapsClicked();
        }
    } else if (game.global.preMapsActive) {
        if (selectedMap == "world") {
            mapsClicked();
        } else if (selectedMap == "create") {
            var $mapLevelInput = document.getElementById("mapLevelInput");
            $mapLevelInput.value = needPrestige ? game.global.world : siphlvl;
            if (preSpireFarming && MODULES["maps"].SpireFarm199Maps)
                $mapLevelInput.value = game.talents.mapLoot.purchased ? game.global.world - 1 : game.global.world;
            var decrement;
            var tier;
            var useGardens = (customVars.preferGardens && game.global.decayDone);
            if (game.global.world >= customVars.MapTierZone[0]) {
                tier = customVars.MapTier0Sliders;
                decrement = [];
            } else if (game.global.world >= customVars.MapTierZone[1]) {
                tier = customVars.MapTier1Sliders;
                decrement = ['loot'];
            } else if (game.global.world >= customVars.MapTierZone[2]) {
                tier = customVars.MapTier2Sliders;
                decrement = ['loot'];
            } else {
                tier = customVars.MapTier3Sliders;
                decrement = ['diff', 'loot'];
            }
            sizeAdvMapsRange.value = tier[0];
            adjustMap('size', tier[0]);
            difficultyAdvMapsRange.value = tier[1];
            adjustMap('difficulty', tier[1]);
            lootAdvMapsRange.value = tier[2];
            adjustMap('loot', tier[2]);
            biomeAdvMapsSelect.value = useGardens ? "Plentiful" : tier[3];
            updateMapCost();
            if (shouldFarm || !enoughDamage || !enoughHealth || game.global.challengeActive == 'Metal') {
                biomeAdvMapsSelect.value = useGardens ? "Plentiful" : "Mountain";
                updateMapCost();
            }
            if (updateMapCost(true) > game.resources.fragments.owned) {
                if (needPrestige && !enoughDamage) decrement.push('diff');
                if (shouldFarm) decrement.push('size');
            }
            while (decrement.indexOf('loot') > -1 && lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                lootAdvMapsRange.value -= 1;
            }
            while (decrement.indexOf('diff') > -1 && difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                difficultyAdvMapsRange.value -= 1;
            }
            while (decrement.indexOf('size') > -1 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                sizeAdvMapsRange.value -= 1;
            }
            while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                lootAdvMapsRange.value -= 1;
            }
            while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                difficultyAdvMapsRange.value -= 1;
            }
            while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                sizeAdvMapsRange.value -= 1;
            }
            if (getPageSetting('AdvMapSpecialModifier'))
                testMapSpecialModController();
            var maplvlpicked = parseInt($mapLevelInput.value) + (getPageSetting('AdvMapSpecialModifier') ? getExtraMapLevels() : 0);
            if (updateMapCost(true) > game.resources.fragments.owned) {
                selectMap(game.global.mapsOwnedArray[highestMap].id);
                debug("Can't afford the map we designed, #" + maplvlpicked, "maps", '*crying2');
                debug("...selected our highest map instead # " + game.global.mapsOwnedArray[highestMap].id + " Level: " + game.global.mapsOwnedArray[highestMap].level, "maps", '*happy2');
                runMap();
                lastMapWeWereIn = getCurrentMapObject();
            } else {
                debug("Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
                var result = buyMap();
                if (result == -2) {
                    debug("Too many maps, recycling now: ", "maps", 'th-large');
                    recycleBelow(true);
                    debug("Retrying, Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
                    result = buyMap();
                    if (result == -2) {
                        recycleMap(lowestMap);
                        result = buyMap();
                        if (result == -2)
                            debug("AutoMaps unable to recycle to buy map!");
                        else
                            debug("Retrying map buy after recycling lowest level map");
                    }
                }
            }
        } else {
            selectMap(selectedMap);
            var themapobj = game.global.mapsOwnedArray[getMapIndex(selectedMap)];
            var levelText = " Level: " + themapobj.level;
            var voidorLevelText = themapobj.location == "Void" ? " Void: " : levelText;
            debug("Running selected " + selectedMap + voidorLevelText + " Name: " + themapobj.name, "maps", 'th-large');
            runMap();
            lastMapWeWereIn = getCurrentMapObject();
        }
    }
}

function updateAutoMapsStatus(a){var b,c=getPageSetting('MinutestoFarmBeforeSpire');if(0==getPageSetting('AutoMaps'))b='Off';else if('Mapology'==game.global.challengeActive&&1>game.challenges.Mapology.credits)b='Out of Map Credits';else if(preSpireFarming){var d=Math.floor(60-60*spireTime%60).toFixed(0),e=Math.floor(c-spireTime).toFixed(0),f=c-(spireTime/60).toFixed(2),g=60<=spireTime?f+'h':e+'m:'+(10<=d?d:'0'+d)+'s';b='Farming for Spire '+g+' left'}else spireMapBonusFarming?b='Getting Spire Map Bonus':doMaxMapBonus?b='Max Map Bonus After Zone':game.global.mapsUnlocked?needPrestige&&!doVoids?b='Prestige':doVoids?b='Void Maps: '+game.global.totalVoidMaps+' remaining':needToVoid&&!doVoids&&0<game.global.totalVoidMaps?b='Farming: '+HDratio.toFixed(4)+'x':scryerStuck?b='Scryer Got Stuck, Farming':enoughHealth||enoughDamage?enoughDamage?enoughHealth?enoughHealth&&enoughDamage&&(b='Advancing'):b='Want more health':b='Want '+HDratio.toFixed(4)+'x &nbspmore damage':b='Want Health & Damage':b='&nbsp;';skippedPrestige&&(b+='<br><b style="font-size:.8em;color:pink;margin-top:0.2vw">Prestige Skipped</b>');var h=100*(game.stats.heliumHour.value()/(game.global.totalHeliumEarned-(game.global.heliumLeftover+game.resources.helium.owned))),i=100*(game.resources.helium.owned/(game.global.totalHeliumEarned-game.resources.helium.owned)),j='He/hr: '+h.toFixed(3)+'%<br>&nbsp;&nbsp;&nbsp;He: '+i.toFixed(3)+'%';return a?[b,h,i]:void(document.getElementById('autoMapStatus').innerHTML=b,document.getElementById('hiderStatus').innerHTML=j)}
MODULES["maps"].advSpecialMapMod_numZones = 3;
var advExtraMapLevels = 0;
function testMapSpecialModController() {
	var a = [];
	if (Object.keys(mapSpecialModifierConfig).forEach(function (o) {
			var p = mapSpecialModifierConfig[o];
			game.global.highestLevelCleared + 1 >= p.unlocksAt && a.push(p.abv.toLowerCase());
		}), !(1 > a.length)) {
		var c = document.getElementById("advSpecialSelect");
		if (c) {
			if (59 <= game.global.highestLevelCleared) {
				if (needPrestige && a.includes("p")) { // Prestiging, so use Prestigious
					c.value = "p";
				}
				else if (shouldFarm || !enoughHealth) { // Need better equipment, pick the best modifier for metals (in descdending order: "Large Metal Cache", "Huge Cache", "Small Metal Cache", "Large Cache")
					c.value = a.includes("lmc") ? "lmc" : a.includes("hc") ? "hc" : a.includes("smc") ? "smc" : "lc";
				}
				else c.value = "fa"; // Just farming for map stacks, so use Fast Attacks
				// Only use a modifier we can actually afford
				for (var d = updateMapCost(!0), e = game.resources.fragments.owned, f = 100 * (d / e); 0 < c.selectedIndex && d > e; )
				{
					c.selectedIndex -= 1;
					"0" != c.value && console.log("Could not afford " + mapSpecialModifierConfig[c.value].name);
				}
				var d = updateMapCost(!0),
				e = game.resources.fragments.owned;
				"0" != c.value && debug("Set the map special modifier to: " + mapSpecialModifierConfig[c.value].name + ". Cost: " + (100 * (d / e)).toFixed(2) + "% of your fragments.")
			}
			var g = getSpecialModifierSetting(),
			h = 109 <= game.global.highestLevelCleared,
			i = checkPerfectChecked(),
			j = document.getElementById("advPerfectCheckbox"),
			k = getPageSetting("AdvMapSpecialModifier") ? getExtraMapLevels() : 0,
			l = 209 <= game.global.highestLevelCleared;
			if (l) {
				var m = document.getElementById("advExtraMapLevelselect");
				if (!m)
					return;
				var n = document.getElementById("mapLevelInput").value;
				for (m.selectedIndex = n == game.global.world ? MODULES.maps.advSpecialMapMod_numZones : 0; 0 < m.selectedIndex && updateMapCost(!0) > game.resources.fragments.owned; )
					m.selectedIndex -= 1
			}
		}
	}
}
function mapTimeEstimater(){var a=lookUpZoneData(game.global.world),b=lookUpZoneData(game.global.world-1);return mapTimeEstimate=a&&b?a.currentTime-b.currentTime:0,mapTimeEstimate}
function HDratioy(){return HDratio}
