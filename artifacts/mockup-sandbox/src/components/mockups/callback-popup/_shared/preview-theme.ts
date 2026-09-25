import type { CSSProperties } from 'react';

export type PreviewPalette = {
  name: string;
  primary: string;
  accent: string;
  surface: string;
};

export const previewPalettes: Record<string, PreviewPalette> = {
  selected: { name: 'Sahsrah Blue & Red · Selected', primary: '#022A6C', accent: '#CE0B11', surface: '#F5F7FB' },
  emerald: { name: 'Emerald Green', primary: '#065F46', accent: '#34D399', surface: '#ECFDF5' },
  sunset: { name: 'Sunset Orange', primary: '#C2410C', accent: '#FB923C', surface: '#FFF7ED' },
};

function hexToRgb(value: string) {
  const normalized = value.trim().replace(/^#/, '');
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function hexToHsl(value: string) {
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
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  if (hue < 0) hue += 360;
  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

function contrastingForeground(value: string) {
  const { red, green, blue } = hexToRgb(value);
  return (red * 299 + green * 587 + blue * 114) / 1000 > 155
    ? '216 48% 13%'
    : '42 33% 97%';
}

function luminance(value: string) {
  const { red, green, blue } = hexToRgb(value);
  const linear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function eyebrowText(value: string) {
  const ratio = (Math.max(luminance(value), 1) + 0.05) / (Math.min(luminance(value), 1) + 0.05);
  return ratio >= 4.5 ? hexToHsl(value) : '216 48% 13%';
}

function adjustLightness(channels: string, amount: number) {
  const match = channels.match(/^(\d+) (\d+)% (\d+)%$/);
  if (!match) return channels;
  return `${match[1]} ${match[2]}% ${Math.max(0, Math.min(100, Number(match[3]) + amount))}%`;
}

export function createPreviewThemeStyle(palette: PreviewPalette): CSSProperties {
  const primary = hexToHsl(palette.primary);
  const accent = hexToHsl(palette.accent);
  const surface = hexToHsl(palette.surface);
  const surfaceText = contrastingForeground(palette.surface);
  const primaryText = contrastingForeground(palette.primary);
  const accentText = contrastingForeground(palette.accent);
  const border = adjustLightness(primary, surfaceText === '216 48% 13%' ? 28 : -24);
  return {
    '--background': surface,
    '--foreground': surfaceText,
    '--border': border,
    '--card': surface,
    '--card-foreground': surfaceText,
    '--primary': primary,
    '--primary-foreground': primaryText,
    '--accent': accent,
    '--accent-foreground': accentText,
    '--ring': accent,
    '--input': border,
    '--muted-foreground': primary,
    '--eyebrow-text': eyebrowText(palette.primary),
    '--eyebrow-dark-text': primaryText,
    '--eyebrow-background': `hsl(${accent} / .08)`,
    '--eyebrow-border': `hsl(${accent} / .28)`,
    '--eyebrow-dark-background': `hsl(${primaryText} / .08)`,
    '--eyebrow-dark-border': `hsl(${primaryText} / .28)`,
  } as CSSProperties;
}