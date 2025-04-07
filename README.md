# Log Analyzer API Test Suite

This repository contains a comprehensive TypeScript test suite for testing a log analyzer API using Jest. The test suite covers essential aspects of API testing including authentication, data validation, edge cases, performance, and security.

## Project Overview

The project consists of two main components:

1. A log analyzer that processes and analyzes log files
2. An API test suite that validates the log analyzer's functionality

## Prerequisites

- Node.js 16 or higher
- npm (Node package manager)

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/ElmayB/Warp-Technical-Assessment.git
   cd Warp-Technical-Assessment
   ```

2. Navigate to the project directory:

   ```bash
   cd log-analyzer-project
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Tests

### Running All Tests

Run the complete test suite:

```bash
npm test
```

### Running Individual Test Suites

#### API Test Suite

Run only the API tests (all test cases in the file):

```bash
npm test -- api.test.ts
```

Or use the dedicated script:

```bash
npm run test:api
```

Run API tests in watch mode (useful during development):

```bash
npm run test:watch -- api.test.ts
```

#### Log Analyzer Test

Run only the log analyzer tests (all test cases in the file):

```bash
npm test -- logAnalyzer.test.ts
```

Or use the dedicated script:

```bash
npm run test:log
```

Run log analyzer tests in watch mode:

```bash
npm run test:watch -- logAnalyzer.test.ts
```

### Running Specific Test Cases

You can run a specific test case by using the `-t` flag followed by the test name:

```bash
# Run a specific test in the log analyzer
npm test -- logAnalyzer.test.ts -t "should identify patterns within time window"

# Run a specific test in the API suite
npm test -- api.test.ts -t "should handle authentication"
```

The log analyzer test will:

1. Read the sample log file (`sample.log`)
2. Parse and analyze log entries
3. Generate a report with:
   - Total number of log entries
   - Number of entries by log level
   - Most common log messages
   - Time range of logs
   - Error rate
4. Display detected patterns, including:
   - Start and end times of each pattern
   - Sequence of events in each pattern
   - Pattern duration and event count

Example output:

```
Patterns found within 10-second window:

Pattern 1:
Start Time: 2023-04-15T14:32:15.123Z
End Time: 2023-04-15T14:32:19.789Z
Events:
- LOGIN User logged in
- NAVIGATE User navigated to dashboard
- CLICK User clicked on settings
```

## Test Structure and Implementation Decisions

### Test Organization

- `api.test.ts`: Contains comprehensive API test suite
- `logAnalyzer.test.ts`: Focused tests for log analysis functionality
- Tests are separated to allow running specific test suites independently
- Includes detailed console output for pattern visualization

### Technical Stack Decisions

1. **TypeScript**

   - Used for type safety and better development experience
   - Helps catch errors at compile time
   - Improves code maintainability and documentation

2. **Jest**

   - Excellent TypeScript support
   - Built-in mocking capabilities
   - Clear and readable test syntax
   - Watch mode for efficient development
   - Detailed console output for test results
   - Support for running individual test files and cases

3. **Axios**

   - Used for HTTP requests
   - Provides proper type definitions
   - Handles promises and async/await elegantly

4. **JSON Web Tokens (JWT)**
   - Used for authentication testing
   - Industry standard for secure token-based authentication

### Log Analyzer Implementation

The log analyzer uses a sliding window approach to identify patterns of events within a specified time window. Key features:

- Efficient parsing of log entries using regex
- Time-based pattern detection
- Configurable minimum sequence length
- Type-safe implementation with TypeScript
- Detailed pattern visualization in test output

## Project Structure

```
log-analyzer-project/
├── api.test.ts        # API test suite
├── logAnalyzer.test.ts # Log analyzer tests with pattern visualization
├── logAnalyzer.ts     # Log analyzer implementation
├── runAnalyzer.ts     # Script to run the log analyzer
├── sample.log         # Sample log file for testing
├── package.json       # Project configuration
├── tsconfig.json      # TypeScript configuration
└── jest.config.js     # Jest configuration
```

## Implementation Details

### Log Analysis

- The analyzer processes log files in a streaming fashion to handle large files efficiently
- Uses regular expressions to parse log entries with timestamps and event types
- Implements a sliding window algorithm to detect patterns within specified time windows
- Provides configurable parameters for time window size and minimum sequence length
- Includes detailed pattern visualization in test output

### API Testing

- Comprehensive test coverage for all API endpoints
- Mock implementations for external dependencies
- Tests for various scenarios including:
  - Authentication and authorization
  - Data validation
  - Error handling
  - Rate limiting
  - Performance under load

## Notes

- The test suite uses mocking to avoid making actual HTTP requests
- Includes type safety features through TypeScript
- Implements proper error handling and retry mechanisms
- Follows best practices for API testing
- The log analyzer test processes real log data from `sample.log`
- Test output includes detailed pattern visualization for better understanding
- Individual test suites and specific test cases can be run independently

## Contributing

Feel free to submit issues and enhancement requests!
