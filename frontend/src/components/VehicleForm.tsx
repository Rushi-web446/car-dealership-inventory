import { useForm, Controller } from 'react-hook-form';
import { CreateVehicleData, Vehicle } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

interface VehicleFormProps {
  onSubmit: (data: CreateVehicleData) => Promise<void>;
  initialData?: Vehicle;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const VehicleForm = ({ onSubmit, initialData, onCancel, isLoading = false }: VehicleFormProps) => {
  const { control, handleSubmit, formState: { errors } } = useForm<CreateVehicleData>({
    defaultValues: initialData ? {
      make: initialData.make,
      model: initialData.model,
      category: initialData.category,
      price: initialData.price,
      quantity: initialData.quantity,
    } : {
      make: '',
      model: '',
      category: '',
      price: 0,
      quantity: 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="make" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Make</label>
        <Controller
          name="make"
          control={control}
          rules={{ required: 'Make is required' }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id="make"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>}
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
        <Controller
          name="model"
          control={control}
          rules={{ required: 'Model is required' }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id="model"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
        <Controller
          name="category"
          control={control}
          rules={{ required: 'Category is required' }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              id="category"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
        <Controller
          name="price"
          control={control}
          rules={{ required: 'Price is required', min: { value: 0, message: 'Price must be positive' } }}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              id="price"
              onChange={(e) => field.onChange(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
        <Controller
          name="quantity"
          control={control}
          rules={{ required: 'Quantity is required', min: { value: 0, message: 'Quantity must be positive' } }}
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : null}
          {initialData ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
};
