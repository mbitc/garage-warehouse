'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function LocationsAdminPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  
  // Redagavimo būsena (jei null - kuriame naują, jei skaičius - redaguojame esamą)
  const [editingId, setEditingId] = useState<number | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState('FLOOR');
  const [width, setWidth] = useState('1200');
  const [depth, setDepth] = useState('800');
  const [height, setHeight] = useState('1800');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error('Klaida kraunant lokacijas', err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setType('FLOOR');
    setWidth('1200');
    setDepth('800');
    setHeight('1800');
    setDescription('');
  };

  const handleStartEdit = (loc: any) => {
    setEditingId(loc.id);
    setCode(loc.code);
    setType(loc.type);
    setWidth(loc.width?.toString() || '1200');
    setDepth(loc.depth?.toString() || '800');
    setHeight(loc.height?.toString() || '1800');
    setDescription(loc.description || '');
  };

 const handleDeleteLocation = async (id: number, codeStr: string) => {
    if (!confirm(`Ar tikrai norite pašalinti lokaciją ${codeStr}?`)) return;

    try {
      const res = await fetch(`/api/locations?id=${id}`, {
        method: 'DELETE',
      }); 

      if (!res.ok) {
        const data = await res.json();
        setMessage({ text: data.error || 'Nepavyko ištrinti lokacijos', type: 'error' });
      } else {
        setMessage({ text: `Lokacija ${codeStr} sėkmingai pašalinta!`, type: 'success' });
        loadLocations();
        if (editingId === id) resetForm();
      }
    } catch (err) {
      setMessage({ text: 'Ryšio klaida trinant lokaciją', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const payloadData = {
      id: editingId,
      code,
      type,
      width: parseInt(width) || 0,
      depth: type === 'FLOOR' ? parseInt(depth) || 0 : 0,
      height: parseInt(height) || 0,
      description,
    };

    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/locations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Operacija nepavyko', type: 'error' });
      } else {
        setMessage({ 
          text: editingId ? `Lokacija ${code} sėkmingai atnaujinta!` : `Lokacija ${code} sėkmingai sukurta!`, 
          type: 'success' 
        });
        resetForm();
        loadLocations();
      }
    } catch (err) {
      setMessage({ text: 'Ryšio klaida', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Viršutinė juosta */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sandėlio Erdvės Valdymas</h1>
            <p className="text-sm text-gray-400">Grindų paletės ir stelažų lentynų konfigūracija</p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/admin')}>
            &larr; Atgal į Pultą
          </Button>
        </div>

        {message.text && (
          <div className={`p-4 rounded border text-sm ${message.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-green-500/20 border-green-500 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sukūrimo / Redagavimo forma */}
          <Card className="h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Redaguoti Vietą' : 'Pridėti Naują Vietą'}
              </h2>
              {editingId && (
                <button 
                  onClick={resetForm} 
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  Atšaukti redagavimą
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Lokacijos Tipas"
                value={type}
                onChange={e => {
                  const newType = e.target.value;
                  setType(newType);
                  if (newType === 'FLOOR') {
                    setWidth('1200');
                    setDepth('800');
                    setHeight('1800');
                  } else {
                    setWidth('1000');
                    setDepth('1000');
                    setHeight('500');
                  }
                }}
                options={[
                  { value: 'FLOOR', label: 'Grindų vieta / Paletė' },
                  { value: 'RACK', label: 'Stelažo lentyna' },
                  { value: 'BULK', label: 'Tranzito zona' },
                ]}
              />

              <Input
                label="Lokacijos Kodas"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Pvz. S1-01"
                required
              />

              {type === 'FLOOR' ? (
                <div className="space-y-3 bg-gray-900/50 p-3 rounded border border-gray-800">
                  <p className="text-xs text-gray-400 font-medium">Grindų vieta (Paletės perimetras + Max aukštis):</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Plotis (mm)"
                      type="number"
                      value={width}
                      onChange={e => setWidth(e.target.value)}
                      required
                    />
                    <Input
                      label="Gylis (mm)"
                      type="number"
                      value={depth}
                      onChange={e => setDepth(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    label="Maksimalus aukštis (mm)"
                    type="number"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-3 bg-gray-900/50 p-3 rounded border border-gray-800">
                  <p className="text-xs text-gray-400 font-medium">Stelažo lentyna (3 matmenys):</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="Plotis (mm)"
                      type="number"
                      value={width}
                      onChange={e => setWidth(e.target.value)}
                      required
                    />
                    <Input
                      label="Aukštis (mm)"
                      type="number"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      required
                    />
                    <Input
                      label="Gylis (mm)"
                      type="number"
                      value={depth}
                      onChange={e => setDepth(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <Input
                label="Aprašymas / Pastaba"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Pvz.: Prie kairiojo sienos kampo"
              />

              <Button type="submit" className="w-full mt-2">
                {editingId ? 'Atnaujinti Vietą' : 'Sukurti Vietą'}
              </Button>
            </form>
          </Card>

          {/* Esamų vietų sąrašas su veiksmais */}
          <Card className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Esamos Sandėlio Vietos ({locations.length})</h2>
            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="border-b border-gray-800 text-xs uppercase text-gray-500 sticky top-0 bg-gray-900">
                  <tr>
                    <th className="pb-3 px-2">Kodas</th>
                    <th className="pb-3 px-2">Tipas</th>
                    <th className="pb-3 px-2">Matmenys</th>
                    <th className="pb-3 px-2">Aprašymas</th>
                    <th className="pb-3 px-2 text-right">Veiksmai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {locations.map(l => (
                    <tr key={l.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-2 font-mono text-green-400 font-bold">{l.code}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          l.type === 'FLOOR' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          l.type === 'RACK' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-xs text-gray-400">
                        {l.type === 'FLOOR' 
                          ? `${l.width} × ${l.depth} mm (Max H: ${l.height})`
                          : `${l.width} × ${l.height} × ${l.depth} mm`
                        }
                      </td>
                      <td className="py-3 px-2 text-gray-400">{l.description || '-'}</td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <button 
                          onClick={() => handleStartEdit(l)}
                          className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-2.5 py-1 rounded border border-blue-500/30 transition-colors"
                        >
                          Redaguoti
                        </button>
                        <button 
                          onClick={() => handleDeleteLocation(l.id, l.code)}
                          className="text-xs bg-red-600/20 hover:bg-red-600/40 text-red-300 px-2.5 py-1 rounded border border-red-500/30 transition-colors"
                        >
                          Trinti
                        </button>
                      </td>
                    </tr>
                  ))}
                  {locations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Sandėlyje dar nėra aprašytų vietų. Sukurkite pirmąjį sektorių!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
