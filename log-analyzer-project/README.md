# Log Analyzer API Test Suite

This repository contains a comprehensive TypeScript test suite for testing a log analyzer API using Jest. The test suite covers essential aspects of API testing including authentication, data validation, edge cases, performance, and security.

## Prerequisites

- Node.js 16 or higher
- npm (Node package manager)

## Installation and Setup

1. Navigate to the project directory:

   ```bash
   cd log-analyzer-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Tests

### API Test Suite

Run all API tests:

```bash
npm test
```

Run API tests in watch mode:

```bash
npm test -- --watch
```

### Log Analyzer Test

Run the log analyzer test:

```bash
npm run test:log
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

## Test Coverage

The test suite includes comprehensive coverage of:

- Authentication and role-based access control
- Data validation and complex data structures
- Edge cases (rate limiting, conflicts)
- Performance testing
- Security testing (SQL injection, XSS, token security)

## Technical Decisions

- Used Jest for its excellent TypeScript support and mocking capabilities
- Implemented axios for HTTP requests with proper type definitions
- Used TypeScript interfaces for type safety and better development experience
- Implemented proper mocking of timers and HTTP requests
- Added comprehensive error handling and retry mechanisms

## Project Structure

```
log-analyzer-project/
├── src/
│   ├── api.test.ts
│   └── log-analyzer.test.ts
├── sample.log
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Notes

- The test suite uses mocking to avoid making actual HTTP requests
- Includes type safety features through TypeScript
- Implements proper error handling and retry mechanisms
- Follows best practices for API testing
- The log analyzer test processes real log data from `sample.log`

## Contributing

Feel free to submit issues and enhancement requests!
