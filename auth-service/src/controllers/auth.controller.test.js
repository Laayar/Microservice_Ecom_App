import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authController from './auth.controller.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mock the dependencies
vi.mock('../models/User.js');
vi.mock('jsonwebtoken');
vi.mock('bcrypt');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup mock request and response objects
    req = {
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
      };

      vi.mocked(User.findOne).mockResolvedValueOnce(null);
      vi.mocked(bcrypt.genSalt).mockResolvedValueOnce('salt');
      vi.mocked(bcrypt.hash).mockResolvedValueOnce('hashedPassword');
      vi.mocked(User.create).mockResolvedValueOnce(mockUser);
      vi.mocked(jwt.sign).mockReturnValueOnce('token123');

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        data: {
          token: 'token123',
          user: mockUser,
        },
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        // password is missing
      };

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Please fill all Fields.',
      });
    });

    it('should return 409 if user already exists', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const existingUser = {
        _id: '456',
        email: 'john@example.com',
      };

      vi.mocked(User.findOne).mockResolvedValueOnce(existingUser);

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('User already exists.');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
      };

      vi.mocked(User.findOne).mockResolvedValueOnce(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true);
      vi.mocked(jwt.sign).mockReturnValueOnce('token123');

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User login successfully',
        data: {
          token: 'token123',
          user: mockUser,
        },
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        email: 'john@example.com',
        // password is missing
      };

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Please fill all Fields.',
      });
    });

    it('should return 404 if user not found', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      vi.mocked(User.findOne).mockResolvedValueOnce(null);

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });

    it('should return 401 if password is invalid', async () => {
      req.body = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: '123',
        email: 'john@example.com',
        password: 'hashedPassword',
      };

      vi.mocked(User.findOne).mockResolvedValueOnce(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false);

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Invalid password');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('signout', () => {
    it('should signout user successfully', async () => {
      await authController.signout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User signed out successfully',
      });
    });
  });
});
