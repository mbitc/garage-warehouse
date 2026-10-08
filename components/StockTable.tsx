'use client';

import { Button } from './ui/Button';

interface StockItem {
  id: number;
  location_code: string;
  product_name: string;
  sku: string;
  quantity: number;
}

interface StockTableProps {
  stock: StockItem[];
  onPick: (item: StockItem) => void;
}

export function StockTable({ stock, onPick }: StockTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="border-b border-gray-800 text-xs uppercase text-gray-500">
          <tr>
            <th className="pb-3">Lentyna</th>
            <th className="pb-3">Prekė</th>
            <th className="pb-3">SKU</th>
            <th className="pb-3">Kiekis</th>
            <th className="pb-3 text-right">Veiksmas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {stock.map(s => (
            <tr key={s.id} className="hover:bg-gray-800/40 transition-colors">
              <td className="py-3 font-mono text-green-400 font-bold">{s.location_code || '-'}</td>
              <td className="py-3 font-medium text-white">{s.product_name}</td>
              <td className="py-3 text-gray-400 text-xs">{s.sku}</td>
              <td className="py-3 font-bold">{s.quantity} vnt.</td>
              <td className="py-3 text-right">
                <Button variant="warning" onClick={() => onPick(s)} className="py-1 px-3 text-xs ml-auto">
                  Surinkti
                </Button>
              </td>
            </tr>
          ))}
          {stock.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-500">
                Nerasta jokių prekių sandėlyje pagal šią užklausą.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
