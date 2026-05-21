
import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="my-6 p-4 bg-red-800/70 border border-red-600 text-red-200 rounded-md shadow-lg" role="alert">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline ml-1">{message}</span>
    </div>
  );
};
