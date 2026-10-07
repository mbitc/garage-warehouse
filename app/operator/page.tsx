'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OperatorPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Surinkimo modalas / būsena
  const [pickModalItem, setPickModalItem] = useState<any>(null);
  const [pickQty, setPickQty] = useState('1');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pRes, lRes, sRes] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/locations').then(r => r.json()),
        fetch('/api/stock').then(r => r.json()),
      ]);
      setProducts(pRes);
      setLocations(lRes);
      setStock(sRes);
    } catch (err) {
      console.error('Klaida kraunant duomenis', err);
    }
  };

  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: parseInt(selectedProduct),
          location_id: parseInt(selectedLocation),
          quantity: parseInt(quantity),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Nepavyko patalpinti prekės', type: 'error' });
      } else {
        setMessage({ text: 'Prekė sėkmingai priimta ir patalpinta!', type: 'success' });
        setSelectedProduct('');
        setSelectedLocation('');
        setQuantity('1');
        loadData();
      }
    } catch (err) {
      setMessage({ text: 'Ryšio klaida su serveriu', type: 'error' });
    }
  };

  const handlePickStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickModalItem) return;
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/stock/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_id: pickModalItem.id,
          pick_quantity: parseInt(pickQty),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Nepavyko surinkti prekių', type: 'error' });
      } else {
        setMessage({ text: data.message || 'Prekės surinktos!', type: 'success' });
        setPickModalItem(null);
        setPickQty('1');
        loadData();
      }
    } catch (err) {
      setMessage({ text: 'Ryšio klaida surinkimo metu', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 relative">
      <div className="max-w-5xl mx-auto">
        {/* Viršutinė juosta */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Operatoriaus Pultas</h1>
            <p className="text-sm text-gray-400">Prekių priėmimas ir užsakymų surinkimas</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded transition-colors"
          >
            Atsijungti
          </button>
        </div>

        {/* Pranešimai */}
        {message.text && (
          <div className={`mb-6 p-4 rounded border text-sm ${message.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-green-500/20 border-green-500 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Priėmimo forma */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit">
            <h2 className="text-lg font-semibold mb-4">Prekių Priėmimas (Padėjimas)</h2>
            <form onSubmit={handleReceiveStock} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Prekė</label>
                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">-- Pasirinkite prekę --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Lentyna (Lokacija)</label>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">-- Pasirinkite lentyną --</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.code} ({l.width}×{l.height}×{l.depth} mm)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Kiekis (vnt.)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 transition-colors font-medium rounded text-sm shadow"
              >
                Tikrinti tūrį ir Priimti
              </button>
            </form>
          </div>

          {/* Greita sandėlio apžvalga */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Esami Sandėlio Likučiai</h2>
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="border-b border-gray-800 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="pb-3">Lentyna</th>
                    <th className="pb-3">Prekė</th>
                    <th className="pb-3">Kiekis</th>
                    <th className="pb-3 text-right">Veiksmas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stock.map(s => (
                    <tr key={s.id}>
                      <td className="py-3 font-mono text-green-400 font-bold">{s.location_code || '-'}</td>
                      <td className="py-3">{s.product_name}</td>
                      <td className="py-3 font-bold">{s.quantity} vnt.</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => { setPickModalItem(s); setPickQty('1'); }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs transition-colors font-medium"
                        >
                          Surinkti
                        </button>
                      </td>
                    </tr>
                  ))}
                  {stock.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-gray-500">Sandėlis kol kas tuščias.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Surinkimo / Nurašymo langelis (Modal) */}
      {pickModalItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Prekių Surinkimas (Išdavimas)</h3>
            <p className="text-xs text-gray-400 mb-4">
              Lentyna: <span className="text-green-400 font-mono font-bold">{pickModalItem.location_code}</span> | Prekė: <span className="text-white font-medium">{pickModalItem.product_name}</span>
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Esamas kiekis lentynoje: <span className="text-white font-bold">{pickModalItem.quantity} vnt.</span>
            </p>

            <form onSubmit={handlePickStock} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Kiek surinkti (nurašyti)?</label>
                <input
                  type="number"
                  min="1"
                  max={pickModalItem.quantity}
                  value={pickQty}
                  onChange={e => setPickQty(e.target.value)}
                  className="w-full p-2.5 bg-gray-950 border border-gray-800 rounded text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPickModalItem(null)}
                  className="w-1/2 py-2.5 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-500 rounded text-sm font-medium transition-colors shadow"
                >
                  Patvirtinti Surinkimą
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
