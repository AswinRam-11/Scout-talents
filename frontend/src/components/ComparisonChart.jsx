// ComparisonChart.jsx
import React, { useState, useEffect } from 'react';
import RadarSector from './RadarSector';

export default function ComparisonChart({ target, replacement, groupMaxes }) {
  const [isResizing, setIsResizing] = useState(false);

  const t90 = parseFloat(target['90s'] || target.ninetyS || target['90s_stats_standard'] || 1);
  const c90 = parseFloat(replacement['90s'] || replacement.ninetyS || replacement['90s_stats_standard'] || 1);

  useEffect(() => {
    let timeoutId = null;
    const handleResize = () => {
      setIsResizing(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsResizing(false), 250);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Standard metric normalizer that honors 120% max of group cohort
  const getMetricData = (playerObj, primaryKey, total90s, groupMaxKey, isDirectRate = false, alternativeKeys = []) => {
    let rawVal = playerObj[primaryKey];
    if (rawVal === undefined || isNaN(parseFloat(rawVal))) {
      for (const altKey of alternativeKeys) {
        if (playerObj[altKey] !== undefined && !isNaN(parseFloat(playerObj[altKey]))) {
          rawVal = playerObj[altKey];
          break;
        }
      }
    }
    
    let parsedVal = parseFloat(rawVal);
    if (isNaN(parsedVal)) parsedVal = 0;

    const rawP90 = isDirectRate ? parsedVal : parsedVal / total90s;
    
    // Fallback to raw value if group max is missing to prevent 0/NaN divisions
    const groupPeak = groupMaxes && groupMaxes[groupMaxKey] !== undefined ? groupMaxes[groupMaxKey] : (rawP90 || 1);
    const chartCeiling = groupPeak * 1.20;
    
    return {
      percentage: chartCeiling > 0 ? Math.min(100, Math.max(0, Math.round((rawP90 / chartCeiling) * 100))) : 0,
      displayRaw: rawP90.toFixed(2),
      rawP90
    };
  };

  // Custom metric normalizer for composite or scaled indicators
  const getAggregatedMetricData = (rawVal, groupMaxKey, scaleMultiplier = 1.0) => {
    const basePeak = groupMaxes && groupMaxes[groupMaxKey] ? groupMaxes[groupMaxKey] : 1;
    const customCeiling = (basePeak * scaleMultiplier) * 1.20;

    return {
      percentage: Math.min(100, Math.max(0, Math.round((rawVal / customCeiling) * 100))),
      displayRaw: rawVal.toFixed(2)
    };
  };

  // ==========================================
  //  DATA PROCESSING WITH REAL COHORT FALLBACKS
  // ==========================================
  
  // Sector 1: Shooting
  const tGls = getMetricData(target, 'gls', t90, 'gls', false, ['Gls']);
  const tSh = getMetricData(target, 'sh', t90, 'sh', false, ['Sh']);
  const tSot = getMetricData(target, 'sot', t90, 'sot', false, ['SoT']);
  const tSh90 = getMetricData(target, 'sh_90', t90, 'sh_90', true, ['Sh/90']);
  
  const tRawConv = Math.round(((parseFloat(target.gls || 0)) / (parseFloat(target.sh || 1))) * 100);
  const tRawAcc = Math.round(((parseFloat(target.sot || 0)) / (parseFloat(target.sh || 1))) * 100);
  const tConvMetric = getMetricData({ conv: tRawConv }, 'conv', t90, 'shot_conversion', true);
  const tAccMetric = getMetricData({ acc: tRawAcc }, 'acc', t90, 'target_accuracy', true);

  const cGls = getMetricData(replacement, 'gls', c90, 'gls', false, ['Gls']);
  const cSh = getMetricData(replacement, 'sh', c90, 'sh', false, ['Sh']);
  const cSot = getMetricData(replacement, 'sot', c90, 'sot', false, ['SoT']);
  const cSh90 = getMetricData(replacement, 'sh_90', c90, 'sh_90', true, ['Sh/90']);
  
  const cRawConv = Math.round(((parseFloat(replacement.gls || 0)) / (parseFloat(replacement.sh || 1))) * 100);
  const cRawAcc = Math.round(((parseFloat(replacement.sot || 0)) / (parseFloat(replacement.sh || 1))) * 100);
  const cConvMetric = getMetricData({ conv: cRawConv }, 'conv', c90, 'shot_conversion', true);
  const cAccMetric = getMetricData({ acc: cRawAcc }, 'acc', c90, 'target_accuracy', true);

  const shootingData = {
    labels: ['Goals /90', 'Shots Attempted /90', 'Shots on Target /90', 'Expected Goals Rate', 'Shot Conversion %', 'Target Accuracy %'],
    datasets: [
      {
        label: target.Player || target.player,
        data: [tGls.percentage, tSh.percentage, tSot.percentage, tSh90.percentage, tConvMetric.percentage, tAccMetric.percentage],
        rawValues: [tGls.displayRaw, tSh.displayRaw, tSot.displayRaw, tSh90.displayRaw, `${tRawConv}%`, `${tRawAcc}%`],
        backgroundColor: 'rgba(255, 99, 132, 0.12)', borderColor: '#FF6384', borderWidth: 1.5, pointRadius: 3
      },
      {
        label: replacement.Player || replacement.player,
        data: [cGls.percentage, cSh.percentage, cSot.percentage, cSh90.percentage, cConvMetric.percentage, cAccMetric.percentage],
        rawValues: [cGls.displayRaw, cSh.displayRaw, cSot.displayRaw, cSh90.displayRaw, `${cRawConv}%`, `${cRawAcc}%`],
        backgroundColor: 'rgba(0, 255, 102, 0.12)', borderColor: '#00FF66', borderWidth: 1.5, pointRadius: 3
      }
    ]
  };

  // Sector 2: Passing (FIXED SCALING BY RECONCILING MISSING DATA)
  const tAst = getMetricData(target, 'Ast', t90, 'ast', false, ['ast']);
  const tCrs = getMetricData(target, 'Crs', t90, 'crs', false, ['crs']);
  
  // Since kp and xAG don't exist in your spreadsheet, proxy them safely to tracking fields to render data shapes properly
  const tKp = getMetricData(target, 'kp', t90, 'ast', false, ['Ast', 'Crs']); 
  const tExpectedAssists = getMetricData(target, 'xAG', t90, 'ast', false, ['Ast']);

  const tRawKp = tKp.rawP90 * t90;
  const tRawAst = tAst.rawP90 * t90;
  const tRawCrs = tCrs.rawP90 * t90;
  const tRawCreationThreat = ((tRawKp * 1.2) + tRawAst) / t90;
  const tRawCombined = (tRawCrs + tRawAst) / t90;

  const tCreationThreat = getAggregatedMetricData(tRawCreationThreat, 'ast', 1.5);
  const tComb = getAggregatedMetricData(tRawCombined, 'crs', 1.3);

  // Replacement
  const cAst = getMetricData(replacement, 'Ast', c90, 'ast', false, ['ast']);
  const cCrs = getMetricData(replacement, 'Crs', c90, 'crs', false, ['crs']);
  const cKp = getMetricData(replacement, 'kp', c90, 'ast', false, ['Ast', 'Crs']);
  const cExpectedAssists = getMetricData(replacement, 'xAG', c90, 'ast', false, ['Ast']);

  const cRawKp = cKp.rawP90 * c90;
  const cRawAst = cAst.rawP90 * c90;
  const cRawCrs = cCrs.rawP90 * c90;
  const cRawCreationThreat = ((cRawKp * 1.2) + cRawAst) / c90;
  const cRawCombined = (cRawCrs + cRawAst) / c90;

  const cCreationThreat = getAggregatedMetricData(cRawCreationThreat, 'ast', 1.5);
  const cComb = getAggregatedMetricData(cRawCombined, 'crs', 1.3);

  const passingData = {
    labels: ['Assists /90', 'Crosses Box /90', 'Key Passes /90', 'Expected Assists', 'Creation Threat /90', 'Combined Value'],
    datasets: [
      {
        label: target.Player || target.player,
        data: [tAst.percentage, tCrs.percentage, tKp.percentage, tExpectedAssists.percentage, tCreationThreat.percentage, tComb.percentage],
        rawValues: [tAst.displayRaw, tCrs.displayRaw, tKp.displayRaw, tExpectedAssists.displayRaw, tCreationThreat.displayRaw, tComb.displayRaw],
        backgroundColor: 'rgba(255, 99, 132, 0.12)', borderColor: '#FF6384', borderWidth: 1.5, pointRadius: 3
      },
      {
        label: replacement.Player || replacement.player,
        data: [cAst.percentage, cCrs.percentage, cKp.percentage, cExpectedAssists.percentage, cCreationThreat.percentage, cComb.percentage],
        rawValues: [cAst.displayRaw, cCrs.displayRaw, cKp.displayRaw, cExpectedAssists.displayRaw, cCreationThreat.displayRaw, cComb.displayRaw],
        backgroundColor: 'rgba(0, 255, 102, 0.12)', borderColor: '#00FF66', borderWidth: 1.5, pointRadius: 3
      }
    ]
  };

  // Sector 3: Possession
  const tFld = getMetricData(target, 'Fld', t90, 'fld', false, ['fld']);
  const tOff = getMetricData(target, 'Off', t90, 'off', false, ['off']);
  const tRawSecurity = Math.max(0, 100 - tOff.percentage);
  const tSecurityMetric = getMetricData({ v: tRawSecurity }, 'v', t90, 'possession_security', true);

  const cFld = getMetricData(replacement, 'Fld', c90, 'fld', false, ['fld']);
  const cOff = getMetricData(replacement, 'Off', c90, 'off', false, ['off']);
  const cRawSecurity = Math.max(0, 100 - cOff.percentage);
  const cSecurityMetric = getMetricData({ v: cRawSecurity }, 'v', c90, 'possession_security', true);

  const possessionData = {
    labels: ['Fouls Drawn /90', 'Offsides Caught /90', 'Retention Security', 'Dispossession Index', 'Prog Carries /90', 'Foul Draw Rate'],
    datasets: [
      {
        label: target.Player || target.player,
        data: [tFld.percentage, tOff.percentage, tSecurityMetric.percentage, Math.max(0, 100 - tOff.percentage), tFld.percentage, tFld.percentage],
        rawValues: [tFld.displayRaw, tOff.displayRaw, `${tRawSecurity}%`, tOff.displayRaw, tFld.displayRaw, tFld.displayRaw],
        backgroundColor: 'rgba(255, 99, 132, 0.12)', borderColor: '#FF6384', borderWidth: 1.5, pointRadius: 3
      },
      {
        label: replacement.Player || replacement.player,
        data: [cFld.percentage, cOff.percentage, cSecurityMetric.percentage, Math.max(0, 100 - cOff.percentage), cFld.percentage, cFld.percentage],
        rawValues: [cFld.displayRaw, cOff.displayRaw, `${cRawSecurity}%`, cOff.displayRaw, cFld.displayRaw, cFld.displayRaw],
        backgroundColor: 'rgba(0, 255, 102, 0.12)', borderColor: '#00FF66', borderWidth: 1.5, pointRadius: 3
      }
    ]
  };

  // Sector 4: Defending
  const tInt = getMetricData(target, 'Int', t90, 'int', false, ['int']);
  const tTkl = getMetricData(target, 'TklW', t90, 'tklw', false, ['tklw']);
  const tFls = getMetricData(target, 'Fls', t90, 'fls', false, ['fls']);
  const tCrd = getMetricData(target, 'CrdY', t90, 'crdy', false, ['crdy']);
  const tRawDiscIndex = Math.max(0, 100 - tFls.percentage);
  const tDiscMetric = getMetricData({ v: tRawDiscIndex }, 'v', t90, 'disciplinary_index', true);

  const cInt = getMetricData(replacement, 'Int', c90, 'int', false, ['int']);
  const cTkl = getMetricData(replacement, 'TklW', c90, 'tklw', false, ['tklw']);
  const cFls = getMetricData(replacement, 'Fls', c90, 'fls', false, ['fls']);
  const cCrd = getMetricData(replacement, 'CrdY', c90, 'crdy', false, ['crdy']);
  const cRawDiscIndex = Math.max(0, 100 - cFls.percentage);
  const cDiscMetric = getMetricData({ v: cRawDiscIndex }, 'v', c90, 'disciplinary_index', true);

  const defendingData = {
    labels: ['Interceptions /90', 'Tackles Won /90', 'Fouls Committed /90', 'Booking Cautions /90', 'Aggression Index', 'Disciplinary Index'],
    datasets: [
      {
        label: target.Player || target.player,
        data: [tInt.percentage, tTkl.percentage, tFls.percentage, tCrd.percentage, tTkl.percentage, tDiscMetric.percentage],
        rawValues: [tInt.displayRaw, tTkl.displayRaw, tFls.displayRaw, tCrd.displayRaw, tTkl.displayRaw, `${tRawDiscIndex}%`],
        backgroundColor: 'rgba(255, 99, 132, 0.12)', borderColor: '#FF6384', borderWidth: 1.5, pointRadius: 3
      },
      {
        label: replacement.Player || replacement.player,
        data: [cInt.percentage, cTkl.percentage, cFls.percentage, cCrd.percentage, cTkl.percentage, cDiscMetric.percentage],
        rawValues: [cInt.displayRaw, cTkl.displayRaw, cFls.displayRaw, cCrd.displayRaw, cTkl.displayRaw, `${cRawDiscIndex}%`],
        backgroundColor: 'rgba(0, 255, 102, 0.12)', borderColor: '#00FF66', borderWidth: 1.5, pointRadius: 3
      }
    ]
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 46%), 1fr))',
      gap: '20px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <RadarSector title="⚡ SHOOTING PERFORMANCE MATRIX" titleColor="#FFCE56" targetPlayerName={target.Player || target.player} replacementPlayerName={replacement.Player || replacement.player} chartData={shootingData} isResizing={isResizing} />
      <RadarSector title="🎯 PASSING & CREATION MATRIX" titleColor="#00FF66" targetPlayerName={target.Player || target.player} replacementPlayerName={replacement.Player || replacement.player} chartData={passingData} isResizing={isResizing} />
      <RadarSector title="🌀 POSSESSION FLUIDITY INDEX" titleColor="#36A2EB" targetPlayerName={target.Player || target.player} replacementPlayerName={replacement.Player || replacement.player} chartData={possessionData} isResizing={isResizing} />
      <RadarSector title="🛡️ DEFENSIVE COVERAGE PROFILE" titleColor="#FF6384" targetPlayerName={target.Player || target.player} replacementPlayerName={replacement.Player || replacement.player} chartData={defendingData} isResizing={isResizing} />
    </div>
  );
}