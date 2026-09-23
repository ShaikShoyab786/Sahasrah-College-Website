import type { CSSProperties } from 'react';

export const DEFAULT_PRIMARY_COLOR = '#022A6C';
export const DEFAULT_ACCENT_COLOR = '#CE0B11';
export const DEFAULT_SURFACE_COLOR = '#F5F7FB';

export type ThemePresetId = 'sahsrah-blue-red' | 'midnight-purple' | 'crimson-red' | 'emerald-green' | 'ocean-blue' | 'sunset-orange' | 'custom';

export type ThemePreset = {
  id: ThemePresetId;
  name: string;
  description: string;
  primary: string;
  accent: string;
  surface: string;
};

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'sahsrah-blue-red', name: 'Sahsrah Blue & Red', description: 'The official Sahsrah logo palette.', primary: '#022A6C', accent: '#CE0B11', surface: '#F5F7FB' },
  { id: 'midnight-purple', name: 'Midnight Purple', description: 'Deep purple with a bright violet highlight.', primary: '#32156B', accent: '#8B5CF6', surface: '#F5F3FF' },
  { id: 'crimson-red', name: 'Crimson Red', description: 'A focused red palette with a soft rose surface.', primary: '#7F1D1D', accent: '#EF4444', surface: '#FFF1F2' },
  { id: 'emerald-green', name: 'Emerald Green', description: 'A calm, confident green palette.', primary: '#065F46', accent: '#34D399', surface: '#ECFDF5' },
  { id: 'ocean-blue', name: 'Ocean Blue', description: 'Clear blue tones for a fresh academic feel.', primary: '#0369A1', accent: '#38BDF8', surface: '#F0F9FF' },
  { id: 'sunset-orange', name: 'Sunset Orange', description: 'Warm orange accents on a welcoming surface.', primary: '#C2410C', accent: '#FB923C', surface: '#FFF7ED' },
];

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (/^#[0-9A-F]{3}$/.test(trimmed)) {
    return `#${trimmed.slice(1).split('').map((character) => `${character}${character}`).join('')}`;
  }
  return /^#[0-9A-F]{6}$/.test(trimmed) ? trimmed : null;
}

function hexToRgb(value: string) {
  const normalized = normalizeHexColor(value) ?? DEFAULT_PRIMARY_COLOR;
  return {
    red: Number.parseInt(normalized.slice(1, 3), 16),
    green: Number.parseInt(normalized.slice(3, 5), 16),
    blue: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function hexToHslChannels(value: string): string {
  const { red, green, blue } = hexToRgb(value);
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    switch (max) {
      case r:
        hue = 60 * (((g - b) / delta) % 6);
        break;
      case g:
        hue = 60 * ((b - r) / delta + 2);
        break;
      default:
        hue = 60 * ((r - g) / delta + 4);
    }
  }

  if (hue < 0) hue += 360;
  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

function adjustHslLightness(channels: string, amount: number): string {
  const match = channels.match(/^(\d+) (\d+)% (\d+)%$/);
  if (!match) return channels;
  return `${match[1]} ${match[2]}% ${Math.max(0, Math.min(100, Number(match[3]) + amount))}%`;
}

function contrastingForeground(value: string): string {
  const { red, green, blue } = hexToRgb(value);
  const perceivedBrightness = (red * 299 + green * 587 + blue * 114) / 1000;
  return perceivedBrightness > 155 ? '216 48% 13%' : '42 33% 97%';
}

function relativeLuminance(value: string): number {
  const { red, green, blue } = hexToRgb(value);
  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return (0.2126 * toLinear(red)) + (0.7152 * toLinear(green)) + (0.0722 * toLinear(blue));
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function eyebrowTextColor(value: string): string {
  return contrastRatio(value, '#FFFFFF') >= 4.5 ? hexToHslChannels(value) : '216 48% 13%';
}

export function createPublicThemeStyle(primaryColor: string, accentColor: string, surfaceColor = DEFAULT_SURFACE_COLOR): CSSProperties {
  const primary = hexToHslChannels(primaryColor);
  const accent = hexToHslChannels(accentColor);
  const surface = hexToHslChannels(surfaceColor);
  const surfaceForeground = contrastingForeground(surfaceColor);
  const primaryForeground = contrastingForeground(primaryColor);
  const accentForeground = contrastingForeground(accentColor);
  const border = adjustHslLightness(primary, surfaceForeground === '216 48% 13%' ? 28 : -24);
  return {
    '--theme-primary': `hsl(${primary})`,
    '--theme-accent': `hsl(${accent})`,
    '--theme-surface': `hsl(${surface})`,
    '--theme-text': `hsl(${surfaceForeground})`,
    '--theme-text-muted': `hsl(${primary} / .68)`,
    '--theme-on-primary': `hsl(${primaryForeground})`,
    '--theme-on-accent': `hsl(${accentForeground})`,
    '--theme-border': `hsl(${border})`,
    '--theme-surface-soft': `hsl(${surface})`,
    '--background': surface,
    '--foreground': surfaceForeground,
    '--border': border,
    '--input': border,
    '--card': surface,
    '--card-foreground': surfaceForeground,
    '--card-border': border,
    '--secondary': adjustHslLightness(surface, surfaceForeground === '216 48% 13%' ? -3 : 3),
    '--secondary-foreground': surfaceForeground,
    '--muted': adjustHslLightness(surface, surfaceForeground === '216 48% 13%' ? -4 : 4),
    '--muted-foreground': primary,
    '--popover': surface,
    '--popover-foreground': surfaceForeground,
    '--popover-border': border,
    '--primary': primary,
    '--primary-foreground': primaryForeground,
    '--eyebrow-text': eyebrowTextColor(primaryColor),
    '--eyebrow-dark-text': primaryForeground,
    '--eyebrow-background': `hsl(${accent} / .08)`,
    '--eyebrow-border': `hsl(${accent} / .28)`,
    '--eyebrow-dark-background': `hsl(${primaryForeground} / .08)`,
    '--eyebrow-dark-border': `hsl(${primaryForeground} / .28)`,
    '--accent': accent,
    '--accent-foreground': accentForeground,
    '--ring': accent,
    '--sidebar': adjustHslLightness(primary, -7),
    '--sidebar-foreground': primaryForeground,
    '--sidebar-border': border,
    '--sidebar-primary': accent,
    '--sidebar-primary-foreground': accentForeground,
    '--sidebar-accent': adjustHslLightness(primary, 7),
    '--sidebar-accent-foreground': primaryForeground,
    '--sidebar-ring': accent,
    '--primary-border': `hsl(${primary})`,
    '--accent-border': `hsl(${accent})`,
    '--sidebar-primary-border': `hsl(${accent})`,
  } as CSSProperties;
}