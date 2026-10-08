'use client';

import { Input } from './ui/Input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Paieška pagal prekę, SKU ar lentynos kodą...' }: SearchBarProps) {
  return (
    <div className="w-full">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
