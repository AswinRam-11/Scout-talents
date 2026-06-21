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

  // Safe normalization tool applying the 120% margin ceiling rule
  const getMetricData = (val, total90s, metricKey, isDirectRate = false, customFieldName = '') => {
    // Handle variable field naming fallbacks cleanly
    let rawVal = parseFloat(val);
    if (isNaN(rawVal) && customFieldName) {
      rawVal = parseFloat(target[customFieldName] || replacement[customFieldName] || 0);
    }
    if (isNaN(rawVal)) rawVal = 0;

    const rawP90 = isDirectRate ? rawVal : rawVal / total90s;
    
    // Get the peak value of the 11-player group
    const groupPeak = groupMaxes ? groupMaxes[metricKey] : 1;
    
    // Set the outer 100% boundary of the chart to 120% of the group highest value
    const chartCeiling = groupPeak * 1.20;
    
    let percentage = 0;
    if (chartCeiling > 0) {
      percentage = Math.min(100, Math.max(0, Math.round((rawP90 / chartCeiling) * 100)));
    }
    
    return {
      percentage,
      displayRaw: rawP90.toFixed(2)
    };
  };

  // ==========================================
  //  DATA PROCESSING (WITH FIELD KEY FALLBACKS)
  // ==========================================
  
  // Sector 1: Shooting
  const tGls = getMetricData(target.gls, t90, 'gls', false, 'Gls');
  const tSh = getMetricData(target.sh, t90, 'sh', false, 'Sh');
  const tSot = getMetricData(target.sot, t90, 'sot', false, 'SoT');
  const tSh90 = getMetricData(target.sh_90, t90, 'sh_90', true, 'Sh/90');
  const tConv = Math.round(((parseFloat(target.gls || target.Gls || 0)) / (parseFloat(target.sh || target.Sh || 1))) * 100);
  const tAcc = Math.round(((parseFloat(target.sot || target.SoT || 0)) / (parseFloat(target.sh || target.Sh || 1))) * 100);

  const cGls = getMetricData(replacement.gls, c90, 'gls', false, 'Gls');
  const cSh = getMetricData(replacement.sh, c90, 'sh', false, 'Sh');
  const cSot = getMetricData(replacement.sot, c90, 'sot', false, 'SoT');
  const cSh90 = getMetricData(replacement.sh_90, c90, 'sh_90', true, 'Sh/90');
  const cConv = Math.round(((parseFloat(replacement.gls || replacement.Gls || 0)) / (parseFloat(replacement.sh || replacement.Sh || 1))) * 100);
  const cAcc = Math.round(((parseFloat(replacement.sot || replacement.SoT || 0)) / (parseFloat(replacement.sh || replacement.Sh || 1))) * 100);

  const shootingData = {
    labels: ['Goals /90', 'Shots Attempted /90', 'Shots on Target /90', 'Expected Goals Rate', 'Shot Conversion %', 'Target Accuracy %'],
    datasets: [
      {
        label: target.player,
        data: [tGls.percentage, tSh.percentage, tSot.percentage, tSh90.percentage, tConv, tAcc],
        rawValues: [tGls.displayRaw, tSh.displayRaw, tSot.displayRaw, tSh90.displayRaw, `${tConv}%`, `${tAcc}%`],
        backgroundColor: 'rgba(255, 99, 132, 0.12)', borderColor: '#FF6384', borderWidth: 1.5, pointRadius: 3
      },
      {
        label: replacement.player,
        data: [cGls.percentage, cSh.percentage, cSot.percentage, cSh90.percentage, cConv, cAcc],
        rawValues: [cGls.displayRaw, cSh.displayRaw, cSot.displayRaw, cSh90.displayRaw, `${cConv}%`, `${cAcc}%`],
        backgroundColor: 'rgba(0, 255, 102, 0.12)', borderColor: '#00FF66', borderWidth: 1.5, pointRadius: 3
      }
    ]
  };

  // Sector 2: Passing
  const tAst = getMetricData(target.ast, t90, 'ast', false, 'Ast');
  const tCrs = getMetricData(target.crs, t90, 'crs', false, 'Crs');
  const tKp = getMetricData(target.kp, t90, 'kp', false, 'Kp');
  const tComb = getMetricData((parseFloat(target.crs || 0) + parseFloat(target.kp || 0)), t90, 'crs');

  const cAst = getMetricData(replacement.ast, c90, 'ast', false, 'Ast');
  const cCrs = getMetricData(replacement.crs, c90, 'crs', false, 'Crs');
  const cKp = getMetricData(replacement.kp, c90, 'kp', false, 'Kp');
  const cComb = getMetricData((parseFloat(replacement.crs || 0) + parseFloat(replacement.kp || 0)), c90, 'crs');

  const passingData = {
    labels: ['Assists /90', 'Crosses Box /90', 'Key Passes /90', 'Expected Assists', 'Creation Threat /90', 'Combined Value'],
    datasets: [
      {
        label: target.player,
        data: [tAst.percentage, tCrs.percentage, tKp.percentage, tAst.percentage, tKp.percentage, tComb.percentage],
        rawValues: [tAst.displayRaw, tCrs.displayRaw, tKp.displayRaw, tAst.displayRaw, tKp.displayRaw, tComb.displayRaw],
        backgroundColor: 'rgba(255, 99, 132, 0.12)', borderColor: '#FF6384', borderWidth: 1.5, pointRadius: 3
      },
      {
        label: replacement.player,
        data: [cAst.percentage, cCrs.percentage, cKp.percentage, cAst.percentage, cKp.percentage, cComb.percentage],
        rawValues: [cAst.displayRaw, cCrs.displayRaw, cKp.displayRaw, cAst.displayRaw, cKp.displayRaw, cComb.displayRaw],
        backgroundColor: 'rgba(0, 255, 102, 0.12)', borderColor: '#00FF66', borderWidth: 1.5, pointRadius: 3
      }
    ]
  };

  // Sector 3: Possession
  const tFld = getMetricData(target.fld, t90, 'fld', false, 'Fld');
  const tOff = getMetricData(target.off, t90, 'off', false, 'Off');
  const cFld = getMetricData(replacement.fld, c90, 'fld', false, 'Fld');
  const cOff = getMetricData(replacement.off, c90, 'off', false, 'Off');

  const possessionData = {
    labels: ['Fouls Drawn /90', 'Offsides Caught /90', 'Retention Security', 'Dispossession Index', 'Prog Carries /90', 'Foul Draw Rate'],
    datasets: [
      {
        label: target.player,
        data: [tFld.percentage, tOff.percentage, tFld.percentage, Math.max(0, 100 - tOff.percentage), tFld.percentage, tFld.percentage],
        rawValues: [tFld.displayRaw, tOff.displayRaw, tFld.displayRaw, tOff.displayRaw, tFld.displayRaw, tFld.displayRaw],
        backgroundColor: 'rgba(255, 99, 132, 0.12)', borderColor: '#FF6384', borderWidth: 1.5, pointRadius: 3
      },
      {
        label: replacement.player,
        data: [cFld.percentage, cOff.percentage, cFld.percentage, Math.max(0, 100 - cOff.percentage), cFld.percentage, cFld.percentage],
        rawValues: [cFld.displayRaw, cOff.displayRaw, cFld.displayRaw, cOff.displayRaw, cFld.displayRaw, cFld.displayRaw],
        backgroundColor: 'rgba(0, 255, 102, 0.12)', borderColor: '#00FF66', borderWidth: 1.5, pointRadius: 3
      }
    ]
  };

  // Sector 4: Defending
  const tInt = getMetricData(target.int, t90, 'int', false, 'Int');
  const tTkl = getMetricData(target.tklw, t90, 'tklw', false, 'TklW');
  const tFls = getMetricData(target.fls, t90, 'fls', false, 'Fls');
  const tCrd = getMetricData(target.crdy || target.CrdY || 0, t90, 'crdy');

  const cInt = getMetricData(replacement.int, c90, 'int', false, 'Int');
  const cTkl = getMetricData(replacement.tklw, c90, 'tklw', false, 'TklW');
  const cFls = getMetricData(replacement.fls, c90, 'fls', false, 'Fls');
  const cCrd = getMetricData(replacement.crdy || replacement.CrdY || 0, c90, 'crdy');

  const defendingData = {
    labels: ['Interceptions /90', 'Tackles Won /90', 'Fouls Committed /90', 'Booking Cautions /90', 'Aggression Index', 'Disciplinary Index'],
    datasets: [
      {
        label: target.player,
        data: [tInt.percentage, tTkl.percentage, tFls.percentage, tCrd.percentage, tTkl.percentage, Math.max(0, 100 - tFls.percentage)],
        rawValues: [tInt.displayRaw, tTkl.displayRaw, tFls.displayRaw, tCrd.displayRaw, tTkl.displayRaw, tFls.displayRaw],
        backgroundColor: 'rgba(255, 99, 132, 0.12)', borderColor: '#FF6384', borderWidth: 1.5, pointRadius: 3
      },
      {
        label: replacement.player,
        data: [cInt.percentage, cTkl.percentage, cFls.percentage, cCrd.percentage, cTkl.percentage, Math.max(0, 100 - cFls.percentage)],
        rawValues: [cInt.displayRaw, cTkl.displayRaw, cFls.displayRaw, cCrd.displayRaw, cTkl.displayRaw, cFls.displayRaw],
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
      <RadarSector 
        title="⚡ SHOOTING PERFORMANCE MATRIX" 
        titleColor="#FFCE56"
        targetPlayerName={target.player}
        replacementPlayerName={replacement.player}
        chartData={shootingData}
        isResizing={isResizing}
      />

      <RadarSector 
        title="🎯 PASSING & CREATION MATRIX" 
        titleColor="#00FF66"
        targetPlayerName={target.player}
        replacementPlayerName={replacement.player}
        chartData={passingData}
        isResizing={isResizing}
      />

      <RadarSector 
        title="🌀 POSSESSION FLUIDITY INDEX" 
        titleColor="#36A2EB"
        targetPlayerName={target.player}
        replacementPlayerName={replacement.player}
        chartData={possessionData}
        isResizing={isResizing}
      />

      <RadarSector 
        title="🛡️ DEFENSIVE COVERAGE PROFILE" 
        titleColor="#FF6384"
        targetPlayerName={target.player}
        replacementPlayerName={replacement.player}
        chartData={defendingData}
        isResizing={isResizing}
      />
    </div>
  );
}