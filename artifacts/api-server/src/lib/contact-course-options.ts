export const DEFAULT_CONTACT_COURSE_OPTIONS = [
  "MPC",
  "BiPC",
  "MPC + IIT-JEE",
  "BiPC + NEET",
  "MPC + EAMCET",
  "NEET Foundation",
  "Other",
];

const LEGACY_DEFAULT_COURSE_OPTIONS = ["MPC", "BiPC"];
const LEGACY_COLLAPSED_DEFAULT = "MPCBiPC";

const courseOptionCatalog = DEFAULT_CONTACT_COURSE_OPTIONS.map((label) => ({
  label,
  compact: label.replace(/\s+/g, "").toLowerCase(),
}));

function splitKnownConcatenatedOptions(value: string): string[] {
  const compact = value.replace(/\s+/g, "").toLowerCase();
  if (compact.length > 512) return [value.trim()];
  const memo = new Map<number, string[][]>();

  const segment = (offset: number): string[][] => {
    if (offset === compact.length) return [[]];
    const cached = memo.get(offset);
    if (cached) return cached;

    const matches: string[][] = [];
    for (const option of courseOptionCatalog) {
      if (!compact.startsWith(option.compact, offset)) continue;
      for (const suffix of segment(offset + option.compact.length)) {
        matches.push([option.label, ...suffix]);
        if (matches.length > 1) break;
      }
      if (matches.length > 1) break;
    }
    memo.set(offset, matches);
    return matches;
  };

  const decompositions = segment(0);
  return decompositions.length === 1 && decompositions[0].length > 1
    ? decompositions[0]
    : [value.trim()];
}

export function normalizeContactCourseOptions(values: unknown[]): string[] {
  const seen = new Set<string>();
  const options: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") continue;
    const label = value.trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    options.push(label);
  }

  return options;
}

function parseLegacySingleLineCourseOptions(value: string): string[] {
  return value
    .split(/[\r\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap(splitKnownConcatenatedOptions);
}

export function parseStoredContactCourseOptions(value: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return normalizeContactCourseOptions(parseLegacySingleLineCourseOptions(value));
  }

  if (Array.isArray(parsed)) {
    const options = parsed.flatMap((item) => {
      if (typeof item !== "string") return [];
      const trimmed = item.trim();
      if (/[\r\n]/.test(trimmed)) return parseLegacySingleLineCourseOptions(trimmed);
      if (trimmed.replace(/\s+/g, "").toLowerCase() === LEGACY_COLLAPSED_DEFAULT.toLowerCase()) {
        return LEGACY_DEFAULT_COURSE_OPTIONS;
      }
      return [trimmed];
    });
    return normalizeContactCourseOptions(options);
  }
  if (typeof parsed === "string") {
    return normalizeContactCourseOptions(parseLegacySingleLineCourseOptions(parsed));
  }
  return [];
}

export function getContactCourseOptions(value: string): string[] {
  const options = parseStoredContactCourseOptions(value);
  return options.length ? options : [...DEFAULT_CONTACT_COURSE_OPTIONS];
}

export function isLegacyCollapsedDefaultCourseOptions(value: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    parsed = value;
  }

  if (Array.isArray(parsed)) {
    return parsed.length === 1
      && isLegacyDefaultContactCourseOptions(parseStoredContactCourseOptions(value));
  }
  if (typeof parsed === "string") {
    return isLegacyDefaultContactCourseOptions(parseStoredContactCourseOptions(value));
  }
  return false;
}

function isLegacyDefaultContactCourseOptions(options: string[]): boolean {
  const normalized = options.map((option) => option.trim().toLowerCase());
  return normalized.length === LEGACY_DEFAULT_COURSE_OPTIONS.length
    && LEGACY_DEFAULT_COURSE_OPTIONS.every((option) => normalized.includes(option.toLowerCase()));
}