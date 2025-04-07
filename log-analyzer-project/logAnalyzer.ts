/**
 * Analyzes a log file to identify patterns of events within a specified time window
 * @param logContent - The content of the log file as a string
 * @param timeWindowMs - The time window in milliseconds within which events should occur
 * @param minSequenceLength - Minimum number of events to consider as a pattern (default: 2)
 * @returns Array of event sequences that occur within the specified time window
 */
function analyzeLogPatterns(
  logContent: string,
  timeWindowMs: number,
  minSequenceLength: number = 2
): Array<{ events: string[], startTime: Date, endTime: Date }> {
  // Parse log entries into structured data
  const logEntries: Array<{ timestamp: Date, event: string }> = parseLogEntries(logContent);
  
  // Sort log entries by timestamp (if not already sorted)
  logEntries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  const patterns: Array<{ events: string[], startTime: Date, endTime: Date }> = [];
  
  // Use sliding window approach to find event sequences within time window
  for (let i = 0; i < logEntries.length; i++) {
    const currentSequence: Array<{ timestamp: Date, event: string }> = [logEntries[i]];
    const startTime = logEntries[i].timestamp;
    
    for (let j = i + 1; j < logEntries.length; j++) {
      const timeDiff = logEntries[j].timestamp.getTime() - startTime.getTime();
      
      // If event is within time window, add to current sequence
      if (timeDiff <= timeWindowMs) {
        currentSequence.push(logEntries[j]);
      } else {
        // Time window exceeded, stop looking for more events in this sequence
        break;
      }
    }
    
    // If sequence meets minimum length requirement, add to patterns
    if (currentSequence.length >= minSequenceLength) {
      patterns.push({
        events: currentSequence.map(entry => entry.event),
        startTime: currentSequence[0].timestamp,
        endTime: currentSequence[currentSequence.length - 1].timestamp
      });
    }
  }
  
  return patterns;
}

/**
 * Parses log content into structured data
 * @param logContent - The content of the log file as a string
 * @returns Array of parsed log entries with timestamp and event
 */
function parseLogEntries(logContent: string): Array<{ timestamp: Date, event: string }> {
  const lines = logContent.split('\n').filter(line => line.trim() !== '');
  const entries: Array<{ timestamp: Date, event: string }> = [];
  
  // Regular expression to match timestamp and event
  // This regex assumes a format like: "2023-04-15T14:32:15.123Z EVENT_NAME additional info"
  // Adjust the regex based on your actual log format
  const logRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)\s+(\S+)(?:\s+(.*))?$/;
  
  for (const line of lines) {
    const match = line.match(logRegex);
    if (match) {
      const [, timestampStr, event, details] = match;
      entries.push({
        timestamp: new Date(timestampStr),
        event: details ? `${event} ${details}` : event
      });
    }
  }
  
  return entries;
}

// Export functions for use in other modules
export { analyzeLogPatterns, parseLogEntries }; 