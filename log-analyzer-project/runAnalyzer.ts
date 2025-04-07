import { analyzeLogPatterns } from './logAnalyzer';
import * as fs from 'fs';

// Read the log file
const logContent = fs.readFileSync('sample.log', 'utf8');

// Analyze patterns with a 10-second window and minimum 2 events
const patterns = analyzeLogPatterns(logContent, 10000, 2);

// Display the results
console.log('Found patterns:');
patterns.forEach((pattern, index) => {
  console.log(`\nPattern ${index + 1}:`);
  console.log(`Start time: ${pattern.startTime}`);
  console.log(`End time: ${pattern.endTime}`);
  console.log('Events:');
  pattern.events.forEach(event => console.log(`- ${event}`));
});
