import { Vehicle } from '@/types';
import { VehicleCard } from './VehicleCard';
import { EmptyState } from './EmptyState';

interface VehicleGridProps {
  vehicles: Vehicle[];
  onPurchase: (id: string) => Promise<void>;
  loading?: boolean;
}

export const VehicleGrid = ({ vehicles, onPurchase, loading }: VehicleGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-5 space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-5"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        title="No Vehicles Found"
        description="It looks like there are no vehicles available right now. Check back later!"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle._id} vehicle={vehicle} onPurchase={onPurchase} />
      ))}
    </div>
  );
};
