import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { VehicleGrid } from '@/components/VehicleGrid';
import { SearchFiltersComponent } from '@/components/SearchFilters';
import { vehicleApi } from '@/services/api';
import { Vehicle, SearchFilters as SearchFiltersType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { user } = useAuth();

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vehicleApi.getVehicles();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = async (filters: SearchFiltersType) => {
    try {
      setLoading(true);
      const data = await vehicleApi.searchVehicles(filters);
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    fetchVehicles();
  };

  const handlePurchase = async (id: string) => {
    try {
      await vehicleApi.purchaseVehicle(id);
      setToast({ message: 'Vehicle purchased successfully!', type: 'success' });
      fetchVehicles();
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ message: 'Failed to purchase vehicle', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <MainLayout>
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vehicle Inventory</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Browse and purchase available vehicles</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
      <SearchFiltersComponent onSearch={handleSearch} onReset={handleReset} />
      <VehicleGrid vehicles={vehicles} onPurchase={handlePurchase} loading={loading} />
    </MainLayout>
  );
};
