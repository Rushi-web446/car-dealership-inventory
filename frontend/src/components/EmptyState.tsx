import { ReactNode } from 'react';

export const EmptyState = ({ icon, title, description, action }: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
};
