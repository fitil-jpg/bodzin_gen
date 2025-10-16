import { 
  STEP_COUNT, 
  AUTOMATION_TRACK_DEFINITIONS,
  LFO_DEFINITIONS,
  CURVE_TYPES,
  SECTION_DEFINITIONS 
} from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

export function createDefaultAutomation(stepCount = STEP_COUNT) {
  return {
    tracks: AUTOMATION_TRACK_DEFINITIONS.map(definition => createAutomationTrack(definition, stepCount)),
    sections: createSectionLayout(stepCount)
  };
}

export function createAutomationTrack(definition, stepCount = STEP_COUNT) {
  return {
    id: definition.id,
    label: definition.label,
    color: definition.color,
    values: normalizeAutomationValues(definition.curve || [], stepCount, definition.curveType),
    curveType: definition.curveType || CURVE_TYPES.LINEAR,
    lfo: definition.lfo || null,
    breakpoints: definition.breakpoints || []
  };
}

export function createSectionLayout(stepCount = STEP_COUNT) {
  const totalSteps = Math.max(Math.floor(stepCount), 0);
  if (totalSteps <= 0) {
    return [];
  }

  const definitions = SECTION_DEFINITIONS.slice(0, Math.min(SECTION_DEFINITIONS.length, totalSteps));
  if (!definitions.length) {
    return [
      { name: 'Loop', start: 0, end: totalSteps - 1, color: 'rgba(255, 255, 255, 0.04)' }
    ];
  }

  const sectionCount = definitions.length;
  const baseLength = Math.floor(totalSteps / sectionCount);
  const remainder = totalSteps % sectionCount;

  let cursor = 0;
  return definitions.map((definition, index) => {
    const extra = index < remainder ? 1 : 0;
    const length = Math.max(baseLength + extra, 1);
    const start = cursor;
    let end = start + length - 1;
    if (index === sectionCount - 1 || end >= totalSteps - 1) {
      end = totalSteps - 1;
    }
    cursor = end + 1;
    return {
      name: definition.name,
      color: definition.color,
      start,
      end
    };
  });
}

export function normalizeAutomationValues(values, stepCount = STEP_COUNT, curveType = CURVE_TYPES.LINEAR) {
  const totalSteps = Math.max(Math.floor(stepCount), 0);
  if (totalSteps <= 0) {
    return [];
  }

  if (!Array.isArray(values) || values.length === 0) {
    return new Array(totalSteps).fill(0);
  }

  const sanitized = values.map(value => {
    const numeric = typeof value === 'number' ? value : Number(value);
    const safeValue = Number.isFinite(numeric) ? numeric : 0;
    return clamp(safeValue, 0, 1);
  });

  if (sanitized.length === 1) {
    return new Array(totalSteps).fill(sanitized[0]);
  }

  if (sanitized.length === totalSteps) {
    return sanitized.slice();
  }

  const lastIndex = sanitized.length - 1;
  if (totalSteps === 1) {
    return [sanitized[lastIndex]];
  }

  return Array.from({ length: totalSteps }, (_, index) => {
    const position = index / (totalSteps - 1);
    const scaledIndex = position * lastIndex;
    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.min(Math.ceil(scaledIndex), lastIndex);
    const lowerValue = sanitized[lowerIndex];
    const upperValue = sanitized[upperIndex];
    if (lowerIndex === upperIndex) {
      return lowerValue;
    }
    const ratio = scaledIndex - lowerIndex;
    const interpolated = interpolateCurve(lowerValue, upperValue, ratio, curveType);
    return clamp(interpolated, 0, 1);
  });
}

export function interpolateCurve(start, end, t, curveType) {
  switch (curveType) {
    case CURVE_TYPES.LINEAR:
      return start + (end - start) * t;
    case CURVE_TYPES.EXPONENTIAL:
      return start + (end - start) * (t * t);
    case CURVE_TYPES.LOGARITHMIC:
      return start + (end - start) * Math.sqrt(t);
    case CURVE_TYPES.SINE:
      return start + (end - start) * (Math.sin(t * Math.PI - Math.PI / 2) * 0.5 + 0.5);
    case CURVE_TYPES.BEZIER:
      // Simple bezier with control points at 0.25 and 0.75
      const p0 = start;
      const p1 = start + (end - start) * 0.25;
      const p2 = start + (end - start) * 0.75;
      const p3 = end;
      return bezierInterpolation(p0, p1, p2, p3, t);
    default:
      return start + (end - start) * t;
  }
}

export function bezierInterpolation(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  
  return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
}

export function normalizeAutomationState(automation, stepCount = STEP_COUNT) {
  const defaults = createDefaultAutomation(stepCount);
  const normalizedTracks = [];
  const seenIds = new Set();

  if (automation && Array.isArray(automation.tracks)) {
    automation.tracks.forEach(trackData => {
      if (!trackData || !trackData.id) {
        return;
      }
      const definition = AUTOMATION_TRACK_DEFINITIONS.find(def => def.id === trackData.id);
      const label = trackData.label || definition?.label || trackData.id;
      const color = trackData.color || definition?.color || '#49a9ff';
      const baseValues = Array.isArray(trackData.values) && trackData.values.length
        ? trackData.values
        : definition?.curve || [];
      normalizedTracks.push({
        id: trackData.id,
        label,
        color,
        values: normalizeAutomationValues(baseValues, stepCount)
      });
      seenIds.add(trackData.id);
    });
  }

  defaults.tracks.forEach(track => {
    if (seenIds.has(track.id)) {
      return;
    }
    normalizedTracks.push({
      id: track.id,
      label: track.label,
      color: track.color,
      values: track.values.slice()
    });
    seenIds.add(track.id);
  });

  const AUTOMATION_TRACK_ORDER = new Map(
    AUTOMATION_TRACK_DEFINITIONS.map((definition, index) => [definition.id, index])
  );

  normalizedTracks.sort((a, b) => {
    const orderA = AUTOMATION_TRACK_ORDER.get(a.id);
    const orderB = AUTOMATION_TRACK_ORDER.get(b.id);
    if (orderA === undefined && orderB === undefined) {
      return a.id.localeCompare(b.id);
    }
    if (orderA === undefined) return 1;
    if (orderB === undefined) return -1;
    return orderA - orderB;
  });

  let sections = defaults.sections.map(section => ({ ...section }));
  if (automation && Array.isArray(automation.sections) && automation.sections.length) {
    const normalizedSections = normalizeSections(automation.sections, stepCount);
    if (normalizedSections.length) {
      sections = normalizedSections;
    }
  }

  return { tracks: normalizedTracks, sections };
}

export function normalizeSections(sections, stepCount = STEP_COUNT) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return createSectionLayout(stepCount);
  }

  const defaultLayout = createSectionLayout(stepCount);
  const sanitized = sections
    .map(section => {
      if (!section) {
        return null;
      }
      const start = Number(section.start);
      const end = Number(section.end);
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return null;
      }
      return {
        name: section.name,
        color: section.color,
        start,
        end
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);

  if (!sanitized.length) {
    return defaultLayout;
  }

  const maxEnd = sanitized.reduce((max, section) => Math.max(max, section.end), 0);
  const sourceSpan = Math.max(maxEnd, 1);
  const targetMax = Math.max(stepCount - 1, 0);

  let lastEnd = -1;
  const normalized = sanitized.map((section, index) => {
    const definition = SECTION_DEFINITIONS.find(def => def.name === section.name);
    const fallback = defaultLayout[index % defaultLayout.length];
    const color = section.color || definition?.color || fallback.color;
    const scaledStart = sourceSpan > 0 ? Math.round((section.start / sourceSpan) * targetMax) : 0;
    const scaledEnd = sourceSpan > 0 ? Math.round((section.end / sourceSpan) * targetMax) : 0;
    let start = clamp(Number.isFinite(scaledStart) ? scaledStart : 0, 0, targetMax);
    let end = clamp(Number.isFinite(scaledEnd) ? scaledEnd : start, 0, targetMax);
    start = Math.min(Math.max(start, lastEnd + 1), targetMax);
    if (end < start) {
      end = start;
    }
    lastEnd = end;
    return {
      name: section.name || definition?.name || fallback.name,
      color,
      start,
      end
    };
  });

  if (normalized.length) {
    normalized[0].start = 0;
    normalized[normalized.length - 1].end = targetMax;
  }

  return normalized;
}