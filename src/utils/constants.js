/**
 * Shared constants for Mission Control
 */

export const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes}${ampm}`;
});

/**
 * Returns a filtered list of time options based on the selected date.
 * If date is today, only returns present/future times.
 */
export const getAvailableTimes = (selectedDateStr) => {
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  
  if (selectedDateStr < todayStr) return []; // No times for past dates
  if (selectedDateStr > todayStr) return TIME_OPTIONS; // All times for future dates
  
  // For today, calculate current 15-min index
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentIndex = (currentHour * 4) + Math.ceil(currentMinute / 15);
  
  return TIME_OPTIONS.slice(currentIndex);
};
