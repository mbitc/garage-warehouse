export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      {children}
    </div>
  );
}
