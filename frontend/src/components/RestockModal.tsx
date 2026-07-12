import { useForm, Controller } from 'react-hook-form';
import { LoadingSpinner } from './LoadingSpinner';
import { Vehicle } from '@/types';

interface RestockModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onConfirm: (id: string, quantity: number) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const RestockModal = ({ isOpen, vehicle, onConfirm, onCancel, loading = false }: RestockModalProps) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<{ quantity: number }>({
    defaultValues: { quantity: 1 },
  });

  const handleClose = () => {
    reset();
    onCancel();
  };

  const onSubmit = (data: { quantity: number }) => {
    if (vehicle) {
      onConfirm(vehicle._id, data.quantity);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Restock Vehicle</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {vehicle.make} {vehicle.model} - Current stock: {vehicle.quantity}
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity to Add
            </label>
            <Controller
              name="quantity"
              control={control}
              rules={{ required: 'Quantity is required', min: { value: 1, message: 'Quantity must be at least 1' } }}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  id="quantity"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : null}
              Restock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
