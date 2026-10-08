'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchBar } from '@/components/SearchBar';
import { StockTable } from '@/components/StockTable';

export default function OperatorPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Surinkimo modalas
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
        setMessage({ text: 'Prekė sėkmingai priimta ir patalpinta į sandėlį!', type: 'success' });
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
        setMessage({ text: data.message || 'Prekės surinktos ir sėkmingai nurašytos!', type: 'success' });
        setPickModalItem(null);
        setPickQty('1');
        loadData();
      }
    } catch (err) {
      setMessage({ text: 'Ryšio klaida surinkimo metu', type: 'error' });
    }
  };

  // Filtruojami sandėlio likučiai pagal paiešką
  const filteredStock = stock.filter(s => 
    s.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Viršutinė juosta */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Operatoriaus Pultas</h1>
            <p className="text-sm text-gray-400">Sandėlio logistika: prekių priėmimas, paieška ir tikslus surinkimas</p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/')}>
            Atsijungti
          </Button>
        </div>

        {/* Pranešimai */}
        {message.text && (
          <div className={`p-4 rounded border text-sm ${message.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-green-500/20 border-green-500 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Priėmimo forma (1 stulpelis) */}
          <Card className="h-fit">
            <h2 className="text-lg font-semibold mb-4">Prekių Priėmimas</h2>
            <form onSubmit={handleReceiveStock} className="space-y-4">
              <Select
                label="Prekė"
                placeholder="-- Pasirinkite prekę --"
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                options={products.map(p => ({ value: p.id, label: `${p.name} (SKU: ${p.sku})` }))}
                required
              />

              <Select
                label="Lentyna (Lokacija)"
                placeholder="-- Pasirinkite lentyną --"
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                options={locations.map(l => ({ value: l.id, label: `${l.code} (${l.width}×{l.height}×{l.depth} mm)` }))}
                required
              />

              <Input
                label="Kiekis (vnt.)"
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
              />

              <Button type="submit" className="w-full mt-2">
                Tikrinti tūrį ir Priimti
              </Button>
            </form>
          </Card>

          {/* Sandėlio likučiai ir paieška (2 stulpeliai) */}
          <Card className="md:col-span-2 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold">Sandėlio Likučiai ir Surinkimas</h2>
              <div className="w-full sm:w-72">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            </div>

            <div className="flex-grow">
              <StockTable stock={filteredStock} onPick={item => { setPickModalItem(item); setPickQty('1'); }} />
            </div>
          </Card>
        </div>
      </div>

      {/* Surinkimo Modal langas */}
      {pickModalItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Prekių Surinkimas (Išdavimas)</h3>
            <p className="text-xs text-gray-400 mb-2">
              Lentyna: <span className="text-green-400 font-mono font-bold">{pickModalItem.location_code}</span> | Prekė: <span className="text-white font-medium">{pickModalItem.product_name}</span>
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Likutis lentynoje: <span className="text-white font-bold">{pickModalItem.quantity} vnt.</span>
            </p>

            <form onSubmit={handlePickStock} className="space-y-4">
              <Input
                label="Kiek surinkti (nurašyti)?"
                type="number"
                min="1"
                max={pickModalItem.quantity}
                value={pickQty}
                onChange={e => setPickQty(e.target.value)}
                required
              />

              <div className="flex space-x-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setPickModalItem(null)} className="w-1/2">
                  Atšaukti
                </Button>
                <Button type="submit" variant="warning" className="w-1/2">
                  Patvirtinti Surinkimą
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
