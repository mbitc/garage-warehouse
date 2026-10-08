interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs text-gray-400 font-medium">{label}</label>}
      <input
        className={`w-full p-2.5 bg-gray-950 border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}
