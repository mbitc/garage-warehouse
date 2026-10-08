interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export function Select({ label, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs text-gray-400 font-medium">{label}</label>}
      <select
        className={`w-full p-2.5 bg-gray-950 border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-blue-500 ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
