import { Vehicle } from '@/types';
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (id: string) => Promise<void>;
}

export const VehicleCard = ({ vehicle, onPurchase }: VehicleCardProps) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await onPurchase(vehicle._id);
    } finally {
      setIsPurchasing(false);
    }
  };

  const isOutOfStock = vehicle.quantity === 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
        <svg className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{vehicle.make} {vehicle.model}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.category}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isOutOfStock
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {isOutOfStock ? 'Out of Stock' : `${vehicle.quantity} in stock`}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${vehicle.price.toLocaleString()}</p>
        </div>
        <button
          onClick={handlePurchase}
          disabled={isOutOfStock || isPurchasing}
          className={`mt-5 w-full py-2.5 rounded-lg font-medium transition-all ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isPurchasing ? <LoadingSpinner size="sm" className="inline-block" /> : 'Purchase'}
        </button>
      </div>
    </div>
  );
};
