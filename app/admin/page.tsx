'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'products' | 'locations' | 'stock'>('products');
  
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);

  // Formų būsenos
  const [newProd, setNewProd] = useState({ sku: '', name: '', width: '', height: '', depth: '' });
  const [newLoc, setNewLoc] = useState({ code: '', width: '', height: '', depth: '' });
  const [newStock, setNewStock] = useState({ product_id: '', location_id: '', quantity: '1' });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newProd,
        width: parseFloat(newProd.width),
        height: parseFloat(newProd.height),
        depth: parseFloat(newProd.depth),
      }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      setMessage({ text: data.error || 'Klaida kuriant prekę', type: 'error' });
    } else {
      setMessage({ text: 'Prekė sėkmingai sukurta!', type: 'success' });
      setNewProd({ sku: '', name: '', width: '', height: '', depth: '' });
      loadData();
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newLoc,
        width: parseFloat(newLoc.width),
        height: parseFloat(newLoc.height),
        depth: parseFloat(newLoc.depth),
      }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      setMessage({ text: data.error || 'Klaida kuriant lentyną', type: 'error' });
    } else {
      setMessage({ text: 'Lentyna sėkmingai sukurta!', type: 'success' });
      setNewLoc({ code: '', width: '', height: '', depth: '' });
      loadData();
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: parseInt(newStock.product_id),
        location_id: parseInt(newStock.location_id),
        quantity: parseInt(newStock.quantity),
      }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      setMessage({ text: data.error || 'Tetris klaida', type: 'error' });
    } else {
      setMessage({ text: data.message || 'Prekė patalpinta!', type: 'success' });
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Viršutinė juosta */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administratoriaus Pultas</h1>
            <p className="text-sm text-gray-400">Sandėlio valdymas ir milimetrinis tūrio tikrinimas</p>
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

        {/* Navigacijos kortelės (Tabai) */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded font-medium text-sm transition-colors ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
          >
            Prekės ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-5 py-2.5 rounded font-medium text-sm transition-colors ${activeTab === 'locations' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
          >
            Lentynos / Lokacijos ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-5 py-2.5 rounded font-medium text-sm transition-colors ${activeTab === 'stock' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
          >
            Sandėlio Likučiai / Tetris ({stock.length})
          </button>
        </div>

        {/* 1 TABAS: PREKĖS */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit">
              <h2 className="text-lg font-semibold mb-4">Pridėti Naują Prekę</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">SKU Kodas</label>
                  <input type="text" value={newProd.sku} onChange={e => setNewProd({...newProd, sku: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Pavadinimas</label>
                  <input type="text" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Plotis (mm)</label>
                    <input type="number" step="any" value={newProd.width} onChange={e => setNewProd({...newProd, width: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Aukštis (mm)</label>
                    <input type="number" step="any" value={newProd.height} onChange={e => setNewProd({...newProd, height: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Gylis (mm)</label>
                    <input type="number" step="any" value={newProd.depth} onChange={e => setNewProd({...newProd, depth: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors">Sukurti Prekę</button>
              </form>
            </div>

            <div className="md:col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Esamos Prekės</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="border-b border-gray-800 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Pavadinimas</th>
                      <th className="pb-3">Matmenys (P x A x G) mm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className="py-3 font-mono text-blue-400">{p.sku}</td>
                        <td className="py-3">{p.name}</td>
                        <td className="py-3 text-gray-400">{p.width} × {p.height} × {p.depth}</td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={3} className="py-4 text-center text-gray-500">Prekių dar nėra.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2 TABAS: LENTYNOS */}
        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit">
              <h2 className="text-lg font-semibold mb-4">Pridėti Lentyną</h2>
              <form onSubmit={handleAddLocation} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Kodas (pvz. A-1-3)</label>
                  <input type="text" value={newLoc.code} onChange={e => setNewLoc({...newLoc, code: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Plotis (mm)</label>
                    <input type="number" step="any" value={newLoc.width} onChange={e => setNewLoc({...newLoc, width: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Aukštis (mm)</label>
                    <input type="number" step="any" value={newLoc.height} onChange={e => setNewLoc({...newLoc, height: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Gylis (mm)</label>
                    <input type="number" step="any" value={newLoc.depth} onChange={e => setNewLoc({...newLoc, depth: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors">Sukurti Lentyną</button>
              </form>
            </div>

            <div className="md:col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Sandėlio Lentynos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="border-b border-gray-800 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="pb-3">Kodas</th>
                      <th className="pb-3">Matmenys (P x A x G) mm</th>
                      <th className="pb-3">Tūris</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {locations.map(l => {
                      const volM3 = ((l.width * l.height * l.depth) / 1e9).toFixed(4);
                      return (
                        <tr key={l.id}>
                          <td className="py-3 font-mono text-green-400 font-bold">{l.code}</td>
                          <td className="py-3 text-gray-400">{l.width} × {l.height} × {l.depth}</td>
                          <td className="py-3 text-gray-400">{volM3} m³</td>
                        </tr>
                      );
                    })}
                    {locations.length === 0 && (
                      <tr><td colSpan={3} className="py-4 text-center text-gray-500">Lentynų dar nėra.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3 TABAS: SANDĖLIO LIKUČIAI / TETRIS */}
        {activeTab === 'stock' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit">
              <h2 className="text-lg font-semibold mb-4">Padėti Prekę į Lentyną</h2>
              <p className="text-xs text-gray-400 mb-4">Sistema patikrins tūrį pagal milimetrinį Tetris algoritmą.</p>
              <form onSubmit={handleAddStock} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Pasirinkite Prekę</label>
                  <select value={newStock.product_id} onChange={e => setNewStock({...newStock, product_id: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm text-white" required>
                    <option value="">-- Pasirinkite --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Pasirinkite Lentyną</label>
                  <select value={newStock.location_id} onChange={e => setNewStock({...newStock, location_id: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm text-white" required>
                    <option value="">-- Pasirinkite --</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Kiekis</label>
                  <input type="number" min="1" value={newStock.quantity} onChange={e => setNewStock({...newStock, quantity: e.target.value})} className="w-full p-2 bg-gray-950 border border-gray-800 rounded text-sm" required />
                </div>
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors">Tikrinti ir Patalpinti</button>
              </form>
            </div>

            <div className="md:col-span-2 bg-gray-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Dabartinis Sandėlio Turinys</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="border-b border-gray-800 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="pb-3">Lentyna</th>
                      <th className="pb-3">Prekė</th>
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Kiekis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {stock.map(s => (
                      <tr key={s.id}>
                        <td className="py-3 font-mono text-green-400 font-bold">{s.location_code || '-'}</td>
                        <td className="py-3">{s.product_name}</td>
                        <td className="py-3 font-mono text-blue-400">{s.sku}</td>
                        <td className="py-3 font-bold">{s.quantity} vnt.</td>
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
        )}
      </div>
    </div>
  );
}
