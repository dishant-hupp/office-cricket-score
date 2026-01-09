/**
 * Reusable button component with mobile-first large touch targets
 */
export function Button({ children, onClick, disabled = false, variant = 'primary', className = '', ...props }) {
  const baseClasses = 'px-6 py-4 text-lg font-semibold rounded-lg transition-colors min-h-[44px] min-w-[44px]';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed',
    run: 'bg-yellow-500 text-black hover:bg-yellow-600 font-bold',
    extra: 'bg-orange-500 text-white hover:bg-orange-600'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
