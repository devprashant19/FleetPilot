import { vi, describe, it, expect, beforeEach } from 'vitest';
import { validateVehicleForTrip, validateDriverForTrip } from '../trips';

const { mockFindUniqueVehicle, mockFindFirstTrip, mockFindUniqueDriver } = vi.hoisted(() => ({
  mockFindUniqueVehicle: vi.fn(),
  mockFindFirstTrip: vi.fn(),
  mockFindUniqueDriver: vi.fn(),
}));

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      vehicle = { findUnique: mockFindUniqueVehicle };
      trip = { findFirst: mockFindFirstTrip };
      driver = { findUnique: mockFindUniqueDriver };
    },
  };
});

describe('Dispatch Validation Rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateVehicleForTrip', () => {
    it('should return error if vehicle is not found', async () => {
      mockFindUniqueVehicle.mockResolvedValueOnce(null);
      const result = await validateVehicleForTrip('v1');
      expect(result).toEqual({ error: 'Vehicle not found' });
    });

    it('should return error if vehicle is RETIRED', async () => {
      mockFindUniqueVehicle.mockResolvedValueOnce({ status: 'RETIRED', registrationNumber: 'ABC-123' });
      const result = await validateVehicleForTrip('v1');
      expect(result).toEqual({ error: 'Vehicle "ABC-123" is RETIRED and cannot be assigned to trips' });
    });

    it('should return error if vehicle is IN_SHOP', async () => {
      mockFindUniqueVehicle.mockResolvedValueOnce({ status: 'IN_SHOP', registrationNumber: 'ABC-123' });
      const result = await validateVehicleForTrip('v1');
      expect(result).toEqual({ error: 'Vehicle "ABC-123" is IN_SHOP and cannot be assigned to trips' });
    });

    it('should return error if vehicle is ON_TRIP and no excludeTripId is provided', async () => {
      mockFindUniqueVehicle.mockResolvedValueOnce({ status: 'ON_TRIP', registrationNumber: 'ABC-123' });
      const result = await validateVehicleForTrip('v1');
      expect(result).toEqual({ error: 'Vehicle "ABC-123" is already ON_TRIP and cannot be assigned to another trip' });
    });

    it('should return error if vehicle is ON_TRIP and is assigned to a different DISPATCHED trip', async () => {
      mockFindUniqueVehicle.mockResolvedValueOnce({ status: 'ON_TRIP', registrationNumber: 'ABC-123' });
      mockFindFirstTrip.mockResolvedValueOnce({ id: 'other-trip' }); // existing trip found
      const result = await validateVehicleForTrip('v1', 'current-trip');
      expect(result).toEqual({ error: 'Vehicle "ABC-123" is already ON_TRIP and cannot be assigned to another trip' });
    });

    it('should succeed if vehicle is ON_TRIP but no other conflicting trip exists (same trip update)', async () => {
      const mockVehicle = { status: 'ON_TRIP', registrationNumber: 'ABC-123' };
      mockFindUniqueVehicle.mockResolvedValueOnce(mockVehicle);
      mockFindFirstTrip.mockResolvedValueOnce(null); // no other conflicting trip
      const result = await validateVehicleForTrip('v1', 'current-trip');
      expect(result).toEqual({ vehicle: mockVehicle });
    });

    it('should succeed if vehicle is AVAILABLE', async () => {
      const mockVehicle = { status: 'AVAILABLE', registrationNumber: 'ABC-123' };
      mockFindUniqueVehicle.mockResolvedValueOnce(mockVehicle);
      const result = await validateVehicleForTrip('v1');
      expect(result).toEqual({ vehicle: mockVehicle });
    });
  });

  describe('validateDriverForTrip', () => {
    it('should return error if driver is not found', async () => {
      mockFindUniqueDriver.mockResolvedValueOnce(null);
      const result = await validateDriverForTrip('d1');
      expect(result).toEqual({ error: 'Driver not found' });
    });

    it('should return error if driver is SUSPENDED', async () => {
      mockFindUniqueDriver.mockResolvedValueOnce({ status: 'SUSPENDED', name: 'John Doe' });
      const result = await validateDriverForTrip('d1');
      expect(result).toEqual({ error: 'Driver "John Doe" is SUSPENDED and cannot be assigned to trips' });
    });

    it('should return error if driver license is EXPIRED', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      mockFindUniqueDriver.mockResolvedValueOnce({ 
        status: 'AVAILABLE', 
        name: 'John Doe',
        licenseExpiryDate: pastDate.toISOString()
      });
      const result = await validateDriverForTrip('d1');
      expect(result.error).toContain('EXPIRED license');
    });

    it('should return error if driver is ON_TRIP', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      mockFindUniqueDriver.mockResolvedValueOnce({ 
        status: 'ON_TRIP', 
        name: 'John Doe',
        licenseExpiryDate: futureDate.toISOString()
      });
      const result = await validateDriverForTrip('d1');
      expect(result).toEqual({ error: 'Driver "John Doe" is already ON_TRIP and cannot be assigned to another trip' });
    });

    it('should succeed if driver is AVAILABLE with valid license', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const mockDriver = { 
        status: 'AVAILABLE', 
        name: 'John Doe',
        licenseExpiryDate: futureDate.toISOString()
      };
      mockFindUniqueDriver.mockResolvedValueOnce(mockDriver);
      const result = await validateDriverForTrip('d1');
      expect(result).toEqual({ driver: mockDriver });
    });
  });
});
