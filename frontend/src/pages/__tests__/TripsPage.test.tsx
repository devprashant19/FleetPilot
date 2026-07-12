import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TripsPage } from '../TripsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { tripsApi, vehiclesApi, driversApi } from '@/lib/api';
import { useToast } from '@/components/ui/toaster';

vi.mock('@/lib/api', () => ({
  tripsApi: {
    list: vi.fn(),
    create: vi.fn(),
  },
  vehiclesApi: {
    list: vi.fn(),
  },
  driversApi: {
    list: vi.fn(),
  },
}));

vi.mock('@/components/ui/toaster', () => ({
  useToast: vi.fn(),
}));

// Mock Radix Select to simplify testing since it relies on PointerEvents and complex DOM structures
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="mock-select" onClick={() => onValueChange('v1')}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}));

// Mock Dialog to bypass Portal and animation issues in JSDOM
// Removed Dialog mock so Radix can handle onOpenChange natively
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

describe('TripsPage Validation', () => {
  let queryClient: QueryClient;
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    (tripsApi.list as any).mockResolvedValue({ data: [], total: 0, totalPages: 1 });
    (vehiclesApi.list as any).mockResolvedValue([
      { id: 'v1', registrationNumber: 'ABC-123', status: 'AVAILABLE', maxLoadCapacity: 1000 }
    ]);
    (driversApi.list as any).mockResolvedValue([
      { id: 'd1', name: 'John Doe', status: 'AVAILABLE', licenseExpiryDate: '2099-01-01T00:00:00Z' }
    ]);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TripsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('blocks submission and shows toast when cargo weight is negative', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderComponent();

    // Wait for button to be available and click it
    const newTripBtn = await screen.findByRole('button', { name: /New Trip/i });
    fireEvent.click(newTripBtn);
    
    // Select vehicle and driver
    const selects = await screen.findAllByTestId('mock-select');
    fireEvent.click(selects[0]); // Vehicle
    fireEvent.click(selects[1]); // Driver
    
    // Fill required text fields
    await user.type(screen.getByPlaceholderText('London'), 'A');
    await user.type(screen.getByPlaceholderText('Manchester'), 'B');
    await user.type(screen.getByPlaceholderText('320'), '100');

    // Fill form with negative cargo
    const inputs = await screen.findAllByRole('spinbutton');
    const cargoInput = inputs[0] as HTMLInputElement;
    await user.clear(cargoInput);
    await user.type(cargoInput, '-500');

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Create Trip/i });
    fireEvent.submit(submitBtn.closest('form') as HTMLFormElement);

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Invalid Cargo Weight',
      variant: 'destructive',
    }));
    expect(tripsApi.create).not.toHaveBeenCalled();
  });

  it('blocks submission and shows toast when cargo exceeds capacity', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderComponent();

    // Wait for button to be available and click it
    const newTripBtn = await screen.findByRole('button', { name: /New Trip/i });
    fireEvent.click(newTripBtn);
    
    // Select vehicle and driver
    const selects = await screen.findAllByTestId('mock-select');
    fireEvent.click(selects[0]); // Vehicle -> 'v1' with capacity 1000
    fireEvent.click(selects[1]); // Driver
    
    // Fill required text fields
    await user.type(screen.getByPlaceholderText('London'), 'A');
    await user.type(screen.getByPlaceholderText('Manchester'), 'B');
    await user.type(screen.getByPlaceholderText('320'), '100');

    // Fill form with cargo > capacity
    const inputs = await screen.findAllByRole('spinbutton');
    const cargoInput = inputs[0] as HTMLInputElement;
    await user.clear(cargoInput);
    await user.type(cargoInput, '1500'); // > 1000

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Create Trip/i });
    fireEvent.submit(submitBtn.closest('form') as HTMLFormElement);

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Capacity Exceeded',
      variant: 'destructive',
    }));
    expect(tripsApi.create).not.toHaveBeenCalled();
  });
});
