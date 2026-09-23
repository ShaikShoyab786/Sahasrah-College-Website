import type { CSSProperties } from 'react';

export const DEFAULT_PRIMARY_COLOR = '#102846';
export const DEFAULT_ACCENT_COLOR = '#D6AD59';

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

export function createPublicThemeStyle(primaryColor: string, accentColor: string): CSSProperties {
  const primary = hexToHslChannels(primaryColor);
  const accent = hexToHslChannels(accentColor);
  return {
    '--primary': primary,
    '--primary-foreground': contrastingForeground(primaryColor),
    '--eyebrow-text': eyebrowTextColor(primaryColor),
    '--eyebrow-dark-text': contrastingForeground(primaryColor),
    '--eyebrow-background': `hsl(${accent} / .08)`,
    '--eyebrow-border': `hsl(${accent} / .28)`,
    '--eyebrow-dark-background': `hsl(${primary} / .08)`,
    '--eyebrow-dark-border': `hsl(${primary} / .28)`,
    '--accent': accent,
    '--accent-foreground': contrastingForeground(accentColor),
    '--ring': accent,
    '--sidebar-primary': accent,
    '--sidebar-primary-foreground': contrastingForeground(accentColor),
    '--sidebar-ring': accent,
    '--primary-border': `hsl(${primary})`,
    '--accent-border': `hsl(${accent})`,
    '--sidebar-primary-border': `hsl(${accent})`,
  } as CSSProperties;
}