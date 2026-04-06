/**
 * Color Palette Constants
 * Define all available colors here for easy management
 */

export const COLOR_PALETTE = {
  red: "#E53935",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  green: "#10b981",
  orange: "#f97316",
  pink: "#ec4899",
  cyan: "#06b6d4",
  teal: "#14b8a6",
} as const;

// Type for color names
export type ColorName = keyof typeof COLOR_PALETTE;

/**
 * Get hex value from color name
 */
export function getColorHex(colorName: ColorName): string {
  return COLOR_PALETTE[colorName];
}

/**
 * Get all color presets as array
 */
export function getColorPresets() {
  return (Object.entries(COLOR_PALETTE) as [ColorName, string][]).map(([name, hex]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: hex,
    color: hex,
  }));
}
