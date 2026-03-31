/**
 * Formatting utilities for numbers in the application.
 * All monetary values are displayed in Colombian Pesos (COP)
 * with abbreviations: M (millones/millions), B (miles de millones/billions)
 */

/**
 * Format a number in Colombian Pesos in Millions (M)
 * ALWAYS displays in millions, never in billions
 * Examples:
 * - 16745324700 → "16.745 M" (16.745 millones)
 * - 4500000 → "4.5 M" (4.5 millones)
 * - 850000 → "0.85 M"
 * - 1200 → "0.0012 M"
 * - 1000000000 (1 mil millones) → "1000 M"
 */
export const formatCOP = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return '0 M';

  const absValue = Math.abs(numValue);
  const isNegative = numValue < 0;

  // Convert to millions (divide by 1,000,000)
  const millions = absValue / 1_000_000;

  // Determine appropriate decimal places based on magnitude
  let decimalPlaces = 3;
  if (millions >= 1000) {
    decimalPlaces = 1;  // 1000+ M → show 1 decimal (e.g., "1234.5 M")
  } else if (millions >= 100) {
    decimalPlaces = 2;  // 100-999.9 M → show 2 decimals (e.g., "234.56 M")
  } else {
    decimalPlaces = 3;  // < 100 M → show 3 decimals (e.g., "16.745 M")
  }

  const formatted = millions.toLocaleString('es-CO', {
    minimumFractionDigits: Math.min(decimalPlaces, 1),
    maximumFractionDigits: decimalPlaces,
  });

  return `${isNegative ? '-' : ''}${formatted} M`;
};

/**
 * Format a number as full currency (for detailed views)
 * Example: 16745324700 → "$16.745.324.700"
 */
export const formatCOPFull = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(numValue);
};

/**
 * Format a percentage
 * Example: 52.22 → "52.22%"
 */
export const formatPercent = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a ratio/index
 * Example: 0.73 → "0.73"
 */
export const formatRatio = (value: number, decimals = 2): string => {
  return value.toFixed(decimals);
};
