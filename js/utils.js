/**
 * Utility functions for MRU calculations
 */

// Convert values to base units (m, s, m/s)
export function convertToBaseUnit(value, unit, type) {
  if (!value) return null;
  
  switch (type) {
    case 'distance':
      return unit === 'Km' ? value * 1000 : value; // Convert km to m
    case 'velocity':
      return unit === 'Km/h' ? value / 3.6 : value; // Convert km/h to m/s
    case 'time':
      if (unit === 'min') return value * 60; // Convert min to s
      if (unit === 'horas') return value * 3600; // Convert hours to s
      return value;
    default:
      return value;
  }
}

// Convert from base units to selected units
export function convertFromBaseUnit(value, unit, type) {
  if (!value) return null;
  
  switch (type) {
    case 'distance':
      return unit === 'Km' ? value / 1000 : value; // Convert m to km
    case 'velocity':
      return unit === 'Km/h' ? value * 3.6 : value; // Convert m/s to km/h
    case 'time':
      if (unit === 'min') return value / 60; // Convert s to min
      if (unit === 'horas') return value / 3600; // Convert s to hours
      return value;
    default:
      return value;
  }
}

// Function to round to significant digits
export function roundToSignificantDigits(num, sigDigits) {
  if (num === 0) return 0;
  
  const d = Math.ceil(Math.log10(num < 0 ? -num : num));
  const power = sigDigits - d;
  
  const magnitude = Math.pow(10, power);
  const shifted = Math.round(num * magnitude);
  
  return shifted / magnitude;
}

// Get number of significant digits in a value
export function getSignificantDigits(value) {
  if (value === 0) return 1;
  
  // Convert to string and remove leading/trailing zeros
  const strValue = String(value).replace(/^0+|\.0+$|(?:(\.\d*[1-9])0+)$/g, '$1');
  
  // Count digits, ignoring decimal point
  return strValue.replace(/[^0-9]/g, '').length;
}

// Get the minimum number of significant digits from a set of values
export function getMinSignificantDigits(...values) {
  const filtered = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (filtered.length === 0) return 2; // Default
  
  return Math.min(...filtered.map(getSignificantDigits));
}

// Format number with commas instead of periods for decimal separator
export function formatNumber(num, sigDigits) {
  if (num === null || num === undefined || isNaN(num)) return '';
  
  const rounded = roundToSignificantDigits(num, sigDigits);
  return String(rounded).replace('.', ',');
}