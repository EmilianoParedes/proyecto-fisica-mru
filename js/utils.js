export function convertToBaseUnit(value, unit, type) {
  if (value === null || isNaN(value)) return null;
  
  switch (type) {
    case 'distance':
      // Convert to meters
      switch (unit) {
        case 'm': return value;
        case 'Km': return value * 1000;
        default: return value;
      }
      
    case 'velocity':
      // Convert to m/s
      switch (unit) {
        case 'm/s': return value;
        case 'Km/h': return value * (1000 / 3600); // km/h to m/s
        default: return value;
      }
      
    case 'time':
      // Convert to seconds
      switch (unit) {
        case 's': return value;
        case 'min': return value * 60;
        case 'horas': return value * 3600;
        default: return value;
      }
      
    default:
      return value;
  }
}

/**
 * Converts a value from base unit to a specific unit
 * @param {number} value - The value in base units
 * @param {string} unit - The target unit
 * @param {string} type - The type of measurement ('distance', 'velocity', 'time')
 * @returns {number} - The converted value
 */
export function convertFromBaseUnit(value, unit, type) {
  if (value === null || isNaN(value)) return null;
  
  switch (type) {
    case 'distance':
      // Convert from meters
      switch (unit) {
        case 'm': return value;
        case 'Km': return value / 1000;
        default: return value;
      }
      
    case 'velocity':
      // Convert from m/s
      switch (unit) {
        case 'm/s': return value;
        case 'Km/h': return value * (3600 / 1000); // m/s to km/h
        default: return value;
      }
      
    case 'time':
      // Convert from seconds
      switch (unit) {
        case 's': return value;
        case 'min': return value / 60;
        case 'horas': return value / 3600;
        default: return value;
      }
      
    default:
      return value;
  }
}

/**
 * Rounds a number to a specific number of significant digits
 * @param {number} num - The number to round
 * @param {number} sigDigits - The number of significant digits
 * @returns {number} - The rounded number
 */
export function roundToSignificantDigits(num, sigDigits) {
  if (num === 0) return 0;
  
  const magnitude = Math.floor(Math.log10(Math.abs(num))) + 1;
  const factor = Math.pow(10, sigDigits - magnitude);
  
  return Math.round(num * factor) / factor;
}

/**
 * Validates that all required inputs are filled
 * @param {Array<HTMLInputElement>} inputs - Array of input elements
 * @returns {boolean} - True if all inputs are valid
 */
export function validateInputs(inputs) {
  let valid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      valid = false;
    } else {
      input.classList.remove('error');
    }
  });
  
  return valid;
}

/**
 * Adds error styling to an element
 * @param {HTMLElement} element - The element to style
 * @param {string} message - Error message to display
 */
export function showError(element, message) {
  element.classList.add('error');
  
  // Create error message if it doesn't exist
  let errorMsg = element.parentNode.querySelector('.error-message');
  if (!errorMsg) {
    errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    element.parentNode.appendChild(errorMsg);
  }
  
  errorMsg.textContent = message;
}

/**
 * Removes error styling from an element
 * @param {HTMLElement} element - The element to remove styling from
 */
export function clearError(element) {
  element.classList.remove('error');
  
  // Remove error message if it exists
  const errorMsg = element.parentNode.querySelector('.error-message');
  if (errorMsg) {
    errorMsg.remove();
  }
}