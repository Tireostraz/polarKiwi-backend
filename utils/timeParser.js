export function parseTimeToMs(timeString) {
  const unit = timeString.slice(-1);
  const value = parseInt(timeString.slice(0, -1), 10);

  switch (unit) {
    case "s": // seconds
      return value * 1000;
    case "m": // minutes
      return value * 60 * 1000;
    case "h": // hours
      return value * 60 * 60 * 1000;
    case "d": // days
      return value * 24 * 60 * 60 * 1000;
    default:
      // If no preffics = its mill sec
      return value;
  }
}
