import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Vehicle } from '@/types';
import { vehicleApi } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { VehicleForm } from '@/components/VehicleForm';
import { RestockModal } from '@/components/RestockModal';

export const AdminDashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  
  // Current vehicle for modals
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Loading states for actions
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleApi.getVehicles();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setToast({ message: 'Failed to load vehicles', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddVehicle = async (data: any) => {
    try {
      setActionLoading(true);
      await vehicleApi.createVehicle(data);
      showToast('Vehicle added successfully', 'success');
      setShowAddModal(false);
      fetchVehicles();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      showToast('Failed to add vehicle', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditVehicle = async (data: any) => {
    if (!selectedVehicle) return;
    try {
      setActionLoading(true);
      await vehicleApi.updateVehicle(selectedVehicle._id, data);
      showToast('Vehicle updated successfully', 'success');
      setShowEditModal(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      showToast('Failed to update vehicle', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;
    try {
      setActionLoading(true);
      await vehicleApi.deleteVehicle(selectedVehicle._id);
      showToast('Vehicle deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      showToast('Failed to delete vehicle', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestockVehicle = async (id: string, quantity: number) => {
    try {
      setActionLoading(true);
      await vehicleApi.restockVehicle(id, quantity);
      showToast('Vehicle restocked successfully', 'success');
      setShowRestockModal(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Error restocking vehicle:', error);
      showToast('Failed to restock vehicle', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate statistics
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.quantity > 0).length;
  const outOfStock = vehicles.filter(v => v.quantity === 0).length;
  const totalInventoryValue = vehicles.reduce((sum, v) => sum + (v.price * v.quantity), 0);

  return (
    <AdminLayout>
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Page header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your vehicle inventory</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalVehicles}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{availableVehicles}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{outOfStock}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${totalInventoryValue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="xl" />
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyState
              title="No Vehicles Yet"
              description="Get started by adding your first vehicle to the inventory."
            />
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.make} {vehicle.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{vehicle.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">${vehicle.price.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vehicle.quantity === 0
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {vehicle.quantity} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowRestockModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add New Vehicle</h2>
            <VehicleForm
              onSubmit={handleAddVehicle}
              onCancel={() => setShowAddModal(false)}
              isLoading={actionLoading}
            />
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit Vehicle</h2>
            <VehicleForm
              initialData={selectedVehicle}
              onSubmit={handleEditVehicle}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedVehicle(null);
              }}
              isLoading={actionLoading}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Vehicle"
        message={selectedVehicle ? `Are you sure you want to delete ${selectedVehicle.make} ${selectedVehicle.model}? This action cannot be undone.` : ''}
        onConfirm={handleDeleteVehicle}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedVehicle(null);
        }}
        loading={actionLoading}
      />

      {/* Restock Modal */}
      <RestockModal
        isOpen={showRestockModal}
        vehicle={selectedVehicle}
        onConfirm={handleRestockVehicle}
        onCancel={() => {
          setShowRestockModal(false);
          setSelectedVehicle(null);
        }}
        loading={actionLoading}
      />
    </AdminLayout>
  );
};
