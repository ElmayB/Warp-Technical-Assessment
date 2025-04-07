import { analyzeLogPatterns } from './logAnalyzer';

describe('Log Analyzer', () => {
  const sampleLog = `2023-04-15T14:32:15.123Z LOGIN User logged in
2023-04-15T14:32:17.456Z NAVIGATE User navigated to dashboard
2023-04-15T14:32:19.789Z CLICK User clicked on settings
2023-04-15T14:32:45.123Z LOGOUT User logged out
2023-04-15T14:35:15.123Z LOGIN Another user logged in
2023-04-15T14:35:18.456Z ERROR Failed to load dashboard`;

  it('should identify patterns within time window', () => {
    const patterns = analyzeLogPatterns(sampleLog, 10000, 2);
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].events).toContain('LOGIN User logged in');
    expect(patterns[0].events).toContain('NAVIGATE User navigated to dashboard');
    
    console.log('\nPatterns found within 10-second window:');
    patterns.forEach((pattern, index) => {
      console.log(`\nPattern ${index + 1}:`);
      console.log(`Start Time: ${pattern.startTime}`);
      console.log(`End Time: ${pattern.endTime}`);
      console.log('Events:');
      pattern.events.forEach(event => console.log(`- ${event}`));
    });
  });

  it('should handle empty log content', () => {
    const patterns = analyzeLogPatterns('', 10000, 2);
    expect(patterns).toHaveLength(0);
  });

  it('should respect minimum sequence length', () => {
    const patterns = analyzeLogPatterns(sampleLog, 10000, 3);
    expect(patterns.every(pattern => pattern.events.length >= 3)).toBe(true);
    
    console.log('\nPatterns found with minimum length of 3:');
    patterns.forEach((pattern, index) => {
      console.log(`\nPattern ${index + 1}:`);
      console.log(`Start Time: ${pattern.startTime}`);
      console.log(`End Time: ${pattern.endTime}`);
      console.log('Events:');
      pattern.events.forEach(event => console.log(`- ${event}`));
    });
  });
}); 