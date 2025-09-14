function applyPresetData(p) {
  const defaultStep = { note: 0, vel: 0, rat: 1, on: false };
  ['leadPattern', 'bassPattern', 'hatsPattern'].forEach(key => {
    let arr = Array.isArray(p[key]) ? p[key] : [];
    arr = arr.slice(0, 16).map(step => ({
      note: step && step.note !== undefined ? step.note : defaultStep.note,
      vel: step && step.vel !== undefined ? step.vel : defaultStep.vel,
      rat: step && step.rat !== undefined ? step.rat : defaultStep.rat,
      on: step && step.on !== undefined ? step.on : defaultStep.on
    }));
    while (arr.length < 16) {
      arr.push({ ...defaultStep });
    }
    p[key] = arr;
  });
  return p;
}

module.exports = { applyPresetData };
