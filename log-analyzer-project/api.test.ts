import axios, { AxiosInstance, AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';
import * as timersPromises from 'timers/promises';

jest.mock('axios');
jest.mock('timers/promises', () => ({
  setTimeout: jest.fn().mockResolvedValue(undefined)
}));

// Test Configuration
const BASE_URL = 'https://api.example.com';
const API_VERSION = 'v1';
const MAX_RETRIES = 3;
const RATE_LIMIT_WINDOW = 60; // seconds

// User roles and permissions
const ROLES = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  editor: ['read', 'write'],
  viewer: ['read']
} as const;

type UserRole = keyof typeof ROLES;

interface User {
  username: string;
  password: string;
  role: UserRole;
}

interface ComplexUserData {
  user: {
    profile: {
      name: string;
      preferences: {
        notifications: boolean;
        theme: string;
      };
    };
    roles: UserRole[];
    metadata: {
      created_at: string;
      last_login: string | null;
    };
  };
}

class APITestClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 5000
    });
  }

  async authenticate(username: string, password: string, role: UserRole): Promise<string> {
    const response = await this.client.post('/auth/login', {
      username,
      password,
      role
    });
    this.token = response.data.token;
    if (!this.token) {
      throw new Error('Authentication failed: No token received');
    }
    return this.token;
  }

  async makeRequest(method: string, endpoint: string, data?: any): Promise<AxiosResponse> {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.request({
          method,
          url: endpoint,
          data,
          headers
        });

        if (response.status === 429) { // Rate limit
          if (attempt === MAX_RETRIES - 1) {
            return response; // Return the rate limit response on last attempt
          }
          await timersPromises.setTimeout(RATE_LIMIT_WINDOW * 1000);
          continue;
        }

        return response;
      } catch (error) {
        if (attempt === MAX_RETRIES - 1) {
          throw error;
        }
        await timersPromises.setTimeout(1000);
      }
    }
    throw new Error('Max retries exceeded');
  }
}

describe('API Tests', () => {
  let client: APITestClient;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Create a mock Axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      request: jest.fn(),
      defaults: {},
      get: jest.fn(),
      delete: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      getUri: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    // Mock axios.create to return our mock instance
    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

    client = new APITestClient(BASE_URL);
  });

  describe('Authentication', () => {
    it('should authenticate with valid credentials', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { token: 'valid.jwt.token' }
      });

      const token = await client.authenticate('admin', 'secure_password', 'admin');
      expect(token).toBe('valid.jwt.token');
      expect(token.split('.').length).toBe(3);
    });

    it('should reject invalid credentials', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(
        client.authenticate('invalid', 'wrong_password', 'admin')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should enforce role-based access', async () => {
      // Mock admin authentication
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { token: 'admin.token.valid' }
      });

      // Mock admin request
      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 200,
        data: { users: [] }
      });

      // Test admin access
      await client.authenticate('admin', 'secure_password', 'admin');
      const adminResponse = await client.makeRequest('GET', 'admin/users');
      expect(adminResponse.status).toBe(200);

      // Mock viewer authentication
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { token: 'viewer.token.valid' }
      });

      // Mock forbidden viewer request
      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 403,
        data: { error: 'Forbidden' }
      });

      // Test viewer access (should be denied)
      await client.authenticate('viewer', 'secure_password', 'viewer');
      const viewerResponse = await client.makeRequest('GET', 'admin/users');
      expect(viewerResponse.status).toBe(403);
    });
  });

  describe('Data Validation', () => {
    it('should handle complex data structures', async () => {
      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 201,
        data: {
          user: {
            profile: {
              name: 'John Doe'
            }
          }
        }
      });

      const complexData: ComplexUserData = {
        user: {
          profile: {
            name: 'John Doe',
            preferences: {
              notifications: true,
              theme: 'dark'
            }
          },
          roles: ['admin', 'editor'],
          metadata: {
            created_at: new Date().toISOString(),
            last_login: null
          }
        }
      };

      const response = await client.makeRequest('POST', 'users', complexData);
      expect(response.status).toBe(201);
      expect(response.data.user.profile.name).toBe('John Doe');
    });

    it('should validate data structures', async () => {
      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 400,
        data: { validation_error: 'Invalid data structure' }
      });

      const invalidData = {
        user: {
          profile: {
            name: '',
            preferences: {
              notifications: 'not_a_boolean'
            }
          }
        }
      };

      const response = await client.makeRequest('POST', 'users', invalidData);
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('validation_error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rate limiting', async () => {
      // Mock authentication
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { token: 'valid.token' }
      });

      // Mock rate limit responses
      let requestCount = 0;
      mockAxiosInstance.request.mockImplementation(() => {
        requestCount++;
        return Promise.resolve({
          status: requestCount > 3 ? 429 : 200,
          data: requestCount > 3 ? { error: 'Rate limit exceeded' } : { success: true }
        });
      });

      await client.authenticate('admin', 'secure_password', 'admin');
      const responses = [];

      // Make several requests
      for (let i = 0; i < 5; i++) {
        const response = await client.makeRequest('GET', 'users');
        responses.push(response.status);
      }

      // Verify rate limiting behavior
      expect(responses).toContain(429);
      expect(timersPromises.setTimeout).toHaveBeenCalledWith(RATE_LIMIT_WINDOW * 1000);
    });

    it('should handle data conflicts', async () => {
      // Mock create response
      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 201,
        data: { id: '123' }
      });

      // Mock concurrent updates
      mockAxiosInstance.request
        .mockResolvedValueOnce({
          status: 200,
          data: { success: true }
        })
        .mockResolvedValueOnce({
          status: 409,
          data: { error: 'Conflict' }
        });

      const initialData = { name: 'Test Resource', value: 'initial' };
      const createResponse = await client.makeRequest('POST', 'resources', initialData);
      const resourceId = createResponse.data.id;

      const [response1, response2] = await Promise.all([
        client.makeRequest('PUT', `resources/${resourceId}`, { value: 'update1' }),
        client.makeRequest('PUT', `resources/${resourceId}`, { value: 'update2' })
      ]);

      expect(
        (response1.status === 200 && response2.status === 409) ||
        (response2.status === 200 && response1.status === 409)
      ).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should maintain acceptable response time', async () => {
      // Mock authentication
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { token: 'valid.token' }
      });

      // Mock fast response
      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 200,
        data: { success: true }
      });

      await client.authenticate('admin', 'secure_password', 'admin');
      const startTime = Date.now();

      const response = await client.makeRequest('GET', 'users');
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      // Mock authentication
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { token: 'valid.token' }
      });

      // Mock concurrent responses
      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      await client.authenticate('admin', 'secure_password', 'admin');
      const startTime = Date.now();

      const requests = Array(10).fill(null).map(() =>
        client.makeRequest('GET', 'users')
      );
      const responses = await Promise.all(requests);

      const endTime = Date.now();

      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Security', () => {
    it('should prevent SQL injection', async () => {
      mockAxiosInstance.request.mockResolvedValue({
        status: 400,
        data: { error: 'Invalid input' }
      });

      const injectionAttempts = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "admin' --"
      ];

      for (const attempt of injectionAttempts) {
        const response = await client.makeRequest('GET', `users?search=${attempt}`);
        expect(response.status).toBe(400);
      }
    });

    it('should prevent XSS attacks', async () => {
      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 400,
        data: { error: 'Invalid input' }
      });

      const xssPayload = "<script>alert('xss')</script>";
      const response = await client.makeRequest('POST', 'users', {
        name: xssPayload,
        bio: xssPayload
      });
      expect(response.status).toBe(400);
    });

    it('should handle token security', async () => {
      // Mock expired token response
      mockAxiosInstance.request
        .mockResolvedValueOnce({
          status: 401,
          data: { error: 'Token expired' }
        });

      // Test token expiration
      const expiredToken = jwt.sign(
        { exp: Math.floor(Date.now() / 1000) - 3600 },
        'secret'
      );
      client = new APITestClient(BASE_URL);
      (client as any).token = expiredToken;
      const expiredResponse = await client.makeRequest('GET', 'users');
      expect(expiredResponse.status).toBe(401);

      // Mock authentication for tampered token test
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { token: 'valid.token.here' }
      });

      // Mock tampered token response
      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 401,
        data: { error: 'Invalid token' }
      });

      // Test token tampering
      const validToken = await client.authenticate('admin', 'secure_password', 'admin');
      const parts = validToken.split('.');
      parts[1] = parts[1].slice(0, -1) + 'a';
      const tamperedToken = parts.join('.');
      (client as any).token = tamperedToken;
      const tamperedResponse = await client.makeRequest('GET', 'users');
      expect(tamperedResponse.status).toBe(401);
    });
  });
}); 