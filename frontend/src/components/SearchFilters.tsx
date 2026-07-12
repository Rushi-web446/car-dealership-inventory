import { SearchFilters } from '@/types';
import { useForm, Controller } from 'react-hook-form';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

export const SearchFiltersComponent = ({ onSearch, onReset }: SearchFiltersProps) => {
  const { control, handleSubmit, reset } = useForm<SearchFilters>({
    defaultValues: {
      make: '',
      model: '',
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
    },
  });

  const onSubmit = (data: SearchFilters) => {
    onSearch(data);
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search Vehicles</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Controller
          name="make"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Make"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        <Controller
          name="model"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Model"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Category"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        <Controller
          name="minPrice"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              placeholder="Min Price"
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
        <Controller
          name="maxPrice"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              placeholder="Max Price"
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        />
      </form>
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
