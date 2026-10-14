'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTranslation } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Griežtas daugialygis alfanumerinis lyginimas per visus segmentus (1-ą, 2-ą, 3-ią... indeksą)
function naturalSort(aCode: string, bCode: string): number {
  const aChunks = aCode.split(/(\d+)/);
  const bChunks = bCode.split(/(\d+)/);
  const minLen = Math.min(aChunks.length, bChunks.length);

  for (let i = 0; i < minLen; i++) {
    const aChunk = aChunks[i];
    const bChunk = bChunks[i];

    if (aChunk !== bChunk) {
      const aNum = parseInt(aChunk, 10);
      const bNum = parseInt(bChunk, 10);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum !== bNum) return aNum - bNum;
      } else {
        const comp = aChunk.localeCompare(bChunk, undefined, { sensitivity: 'base' });
        if (comp !== 0) return comp;
      }
    }
  }

  return aChunks.length - bChunks.length;
}

export default function LocationsAdminPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [locations, setLocations] = useState<any[]>([]);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Rūšiavimas ir filtravimas
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'code' | 'type'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Formos laukai
  const [code, setCode] = useState('');
  const [type, setType] = useState('FLOOR');
  const [width, setWidth] = useState('1200');
  const [depth, setDepth] = useState('800');
  const [height, setHeight] = useState('1800');
  const [description, setDescription] = useState('');

  const [batchPrefix, setBatchPrefix] = useState('S1-');
  const [batchStart, setBatchStart] = useState('1');
  const [batchCount, setBatchCount] = useState('5');

  const [message, setMessage] = useState({ text: '', type: '' });

  // Pasirinktos lokacijos spausdinimui (ID masyvas)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setLocations(list);
        // Pagal nutylėjimą pažymime visas lokacijas spausdinimui
        setSelectedIds(list.map(l => l.id));
      }
    } catch (err) {
      console.error('Klaida kraunant lokacijas', err);
    }
  };

  const processedLocations = useMemo(() => {
    return [...locations]
      .filter(loc => filterType === 'ALL' || loc.type === filterType)
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'code') {
          comp = naturalSort(a.code || '', b.code || '');
        } else if (sortBy === 'type') {
          comp = (a.type || '').localeCompare(b.type || '');
          if (comp === 0) {
            comp = naturalSort(a.code || '', b.code || '');
          }
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [locations, filterType, sortBy, sortOrder]);

  // Žymėjimo valdymas
  const toggleSelectAll = () => {
    if (selectedIds.length === processedLocations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedLocations.map(l => l.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Atrinktos lokacijos spausdinimui
  const printItems = locations.filter(l => selectedIds.includes(l.id));

  const toggleSort = (field: 'code' | 'type') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const applyPreset = (preset: 'EURO_PALLET' | 'RACK_SHELF' | 'SMALL_BOX') => {
    if (preset === 'EURO_PALLET') {
      setType('FLOOR');
      setWidth('1200');
      setDepth('800');
      setHeight('1800');
    } else if (preset === 'RACK_SHELF') {
      setType('RACK');
      setWidth('1000');
      setDepth('500');
      setHeight('400');
    } else if (preset === 'SMALL_BOX') {
      setType('RACK');
      setWidth('400');
      setDepth('300');
      setHeight('200');
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
    setMode('single');
    setEditingId(loc.id);
    setCode(loc.code || '');
    setType(loc.type || 'FLOOR');
    setWidth(loc.width?.toString() || '1200');
    setDepth(loc.depth?.toString() || '800');
    setHeight(loc.height?.toString() || '1800');
    setDescription(loc.description || '');
  };

  const handleDeleteLocation = async (id: number, codeStr: string) => {
    if (!confirm(`${t?.confirmDelete || 'Ar tikrai norite pašalinti lokaciją'} ${codeStr}?`)) return;

    try {
      const res = await fetch(`/api/locations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ text: `${t?.locationRemoved || 'Lokacija pašalinta'} (${codeStr})`, type: 'success' });
        loadLocations();
        if (editingId === id) resetForm();
      }
    } catch (err) {
      setMessage({ text: t?.connectionError || 'Ryšio klaida', type: 'error' });
    }
  };

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const payload = {
      id: editingId,
      code,
      type,
      width: parseInt(width) || 0,
      depth: parseInt(depth) || 0,
      height: parseInt(height) || 0,
      description,
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch('/api/locations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: `${code} - ${t?.locationSaved || 'Išsaugota!'}`, type: 'success' });
        resetForm();
        loadLocations();
      } else {
        setMessage({ text: data.error || 'Klaida išsaugant lokaciją', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: t?.connectionError || 'Serverio klaida', type: 'error' });
    }
  };

  const handleBatchGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const start = parseInt(batchStart) || 1;
    const count = parseInt(batchCount) || 1;

    let createdCount = 0;
    let lastError = '';

    for (let i = 0; i < count; i++) {
      const numStr = (start + i).toString().padStart(2, '0');
      const generatedCode = `${batchPrefix}${numStr}`;

      try {
        const res = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: generatedCode,
            type,
            width: parseInt(width) || 0,
            depth: parseInt(depth) || 0,
            height: parseInt(height) || 0,
            description: description || 'Sugeneruota serija',
          }),
        });

        const data = await res.json();

        if (res.ok) {
          createdCount++;
        } else {
          lastError = data.error || `Klaida kuriant ${generatedCode}`;
        }
      } catch (err) {
        lastError = t?.connectionError || 'Ryšio klaida';
      }
    }

    if (createdCount > 0) {
      setMessage({
        text: `${t?.batchSuccess || 'Sėkmingai sugeneruota vietų!'} (${createdCount}/${count})`,
        type: 'success',
      });
      loadLocations();
    } else {
      setMessage({ text: lastError || 'Klaida generuojant vietas', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      
      {/* SPAUSDINIMO MAKETAS (matomas TIK spausdinant) */}
      <div className="hidden print:block print:p-0 print:bg-white print:text-black">
        <div className="grid grid-cols-2 gap-4">
          {printItems.map(item => (
            <div 
              key={item.id} 
              className="border-2 border-black p-4 rounded-lg flex items-center justify-between space-x-4 page-break-inside-avoid"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold px-2 py-0.5 border border-black rounded inline-block">
                  {item.type}
                </span>
                <h1 className="text-3xl font-extrabold font-mono tracking-wider">{item.code}</h1>
                <p className="text-xs font-mono">{item.width} × {item.depth} × {item.height} mm</p>
                {item.description && <p className="text-[10px] italic">{item.description}</p>}
              </div>
              <div>
                <QRCodeSVG value={item.code} size={90} level="H" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STANDARTINIS EKRANO VAIZDAS (slepiamas spausdinant) */}
      <div className="max-w-6xl mx-auto space-y-6 print:hidden">
        
        {/* Viršutinė juosta */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t?.locationsTitle || 'Sandėlio Erdvės Valdymas'}</h1>
            <p className="text-sm text-gray-400">{t?.locationsSubtitle || 'Lankstus vietų aprašymas ir masinis generavimas'}</p>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <Button variant="secondary" onClick={() => router.push('/admin')}>
              {t?.backToDashboard || '← Atgal į Pultą'}
            </Button>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded border text-sm font-semibold ${message.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-200' : 'bg-green-500/20 border-green-500 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Kairė pusė: Formos */}
          <Card className="h-fit space-y-4 bg-gray-900 border-gray-800">
            
            {/* Režimų jungiklis */}
            <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                  mode === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t?.singleMode || '🛠️ Specifinė / Vienetinė'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('batch'); resetForm(); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                  mode === 'batch' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t?.batchMode || '⚡ Masinis Generavimas'}
              </button>
            </div>

            {/* Greitieji dydžių šablonai */}
            <div>
              <p className="text-xs text-gray-400 mb-2">{t?.quickPresets || 'Greiti Dydžių Šablonai:'}</p>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => applyPreset('EURO_PALLET')}
                  className="text-[11px] bg-gray-800 hover:bg-gray-700 p-1.5 rounded border border-gray-700 text-center font-medium"
                >
                  {t?.presetEuroPallet || 'Euro Paletė'}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('RACK_SHELF')}
                  className="text-[11px] bg-gray-800 hover:bg-gray-700 p-1.5 rounded border border-gray-700 text-center font-medium"
                >
                  {t?.presetRack || 'Stelažas'}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('SMALL_BOX')}
                  className="text-[11px] bg-gray-800 hover:bg-gray-700 p-1.5 rounded border border-gray-700 text-center font-medium"
                >
                  {t?.presetSmallBox || 'Maža Dėžė'}
                </button>
              </div>
            </div>

            {/* Režimas 1: Vienetinis įvedimas */}
            {mode === 'single' ? (
              <form onSubmit={handleSubmitSingle} className="space-y-3">
                <h2 className="text-sm font-bold text-blue-400">
                  {editingId ? (t?.editLocation || 'Redaguoti Vietą') : (t?.addCustomLocation || 'Pridėti Nestandartinę Vietą')}
                </h2>

                <Select
                  label={t?.locationType || 'Lokacijos Tipas'}
                  value={type}
                  onChange={e => setType(e.target.value)}
                  options={[
                    { value: 'FLOOR', label: t?.typeFloor || 'Grindų vieta / Paletė (2D Plotas)' },
                    { value: 'RACK', label: t?.typeRack || 'Stelažo lentyna / Spinta (3D Tūris)' },
                    { value: 'BULK', label: t?.typeBulk || 'Tranzito / Priėmimo zona' },
                  ]}
                />

                <Input
                  label={t?.locationCode || 'Lokacijos Kodas / Pavadinimas'}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={t?.locationCodePlaceholder || 'Pvz. S1-01 arba KAMPAS-LAIPTAI'}
                  required
                />

                <div className="grid grid-cols-3 gap-2">
                  <Input label={t?.width || 'Plotis (mm)'} type="number" value={width} onChange={e => setWidth(e.target.value)} required />
                  <Input label={t?.depth || 'Gylis (mm)'} type="number" value={depth} onChange={e => setDepth(e.target.value)} required />
                  <Input label={t?.height || 'Aukštis (mm)'} type="number" value={height} onChange={e => setHeight(e.target.value)} required />
                </div>

                <Input
                  label={t?.description || 'Aprašymas / Pastaba'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t?.notePlaceholder || 'Pvz.: Antresolė, kairys kampas'}
                />

                <div className="flex space-x-2 pt-1">
                  <Button type="submit" className="flex-1">
                    {editingId ? (t?.update || 'Atnaujinti') : (t?.save || 'Išsaugoti Vietą')}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="secondary" onClick={resetForm}>
                      {t?.cancel || 'Atšaukti'}
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              /* Režimas 2: Masinis generavimas */
              <form onSubmit={handleBatchGenerate} className="space-y-3">
                <h2 className="text-sm font-bold text-amber-400">{t?.generateBatchTitle || 'Generuoti Vietų Seriją'}</h2>

                <Select
                  label={t?.locationType || 'Lokacijos Tipas'}
                  value={type}
                  onChange={e => setType(e.target.value)}
                  options={[
                    { value: 'FLOOR', label: t?.typeFloor || 'Grindų sektoriai' },
                    { value: 'RACK', label: t?.typeRack || 'Stelažo lentynos' },
                  ]}
                />

                <div className="grid grid-cols-3 gap-2">
                  <Input label={t?.batchPrefix || 'Prefiksas'} value={batchPrefix} onChange={e => setBatchPrefix(e.target.value)} placeholder="A-" required />
                  <Input label={t?.batchStart || 'Nuo nr.'} type="number" value={batchStart} onChange={e => setBatchStart(e.target.value)} required />
                  <Input label={t?.batchCount || 'Kiekis'} type="number" value={batchCount} onChange={e => setBatchCount(e.target.value)} required />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Input label={t?.width || 'Plotis (mm)'} type="number" value={width} onChange={e => setWidth(e.target.value)} required />
                  <Input label={t?.depth || 'Gylis (mm)'} type="number" value={depth} onChange={e => setDepth(e.target.value)} required />
                  <Input label={t?.height || 'Aukštis (mm)'} type="number" value={height} onChange={e => setHeight(e.target.value)} required />
                </div>

                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 font-bold">
                  {t?.generateBtn || '⚡ Sugeneruoti Vietų'} ({batchCount})
                </Button>
              </form>
            )}

          </Card>

          {/* Dešinė pusė: Sąrašas */}
          <Card className="md:col-span-2 space-y-4 bg-gray-900 border-gray-800">
            
            {/* Filtrai ir Įrankiai */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800 pb-3">
              <div>
                <h2 className="text-lg font-bold">
                  {t?.existingLocations || 'Esamos Vietos'} ({processedLocations.length} / {locations.length})
                </h2>
              </div>

              {/* Filtravimo mygtukai pagal tipą */}
              <div className="flex items-center space-x-1 bg-gray-950 p-1 rounded-lg border border-gray-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    filterType === 'ALL' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t?.filterAll || 'Visi'}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('FLOOR')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    filterType === 'FLOOR' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-white'
                  }`}
                >
                  {t?.filterFloor || 'Grindys'}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('RACK')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    filterType === 'RACK' ? 'bg-blue-600 text-white' : 'text-blue-400 hover:text-white'
                  }`}
                >
                  {t?.filterRack || 'Stelažai'}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('BULK')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    filterType === 'BULK' ? 'bg-purple-600 text-white' : 'text-purple-400 hover:text-white'
                  }`}
                >
                  {t?.filterTransit || 'Tranzitas'}
                </button>
              </div>

              <Button 
                onClick={() => window.print()} 
                disabled={selectedIds.length === 0}
                className="text-xs font-bold bg-green-600 hover:bg-green-500 disabled:opacity-40"
              >
                {t?.printSticker || 'Spausdinti Lipdukus' } ({selectedIds.length})
              </Button> 
            </div>

            {/* Lentelė su žymėjimo varnelėmis */}
            <div className="overflow-x-auto max-h-[550px] overflow-y-auto rounded border border-gray-800">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="border-b border-gray-800 text-xs uppercase text-gray-400 sticky top-0 bg-gray-950 select-none">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedIds.length === processedLocations.length && processedLocations.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th 
                      onClick={() => toggleSort('code')} 
                      className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t?.colCode || 'Kodas'}</span>
                        {sortBy === 'code' && (
                          <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>

                    <th 
                      onClick={() => toggleSort('type')} 
                      className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{t?.colType || 'Tipas'}</span>
                        {sortBy === 'type' && (
                          <span className="text-blue-400 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>

                    <th className="py-3 px-3">{t?.colDimensions || 'Matmenys (P×G×A)'}</th>
                    <th className="py-3 px-3">{t?.colDescription || 'Aprašymas'}</th>
                    <th className="py-3 px-3 text-right">{t?.colActions || 'Veiksmai'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-gray-900/50">
                  {processedLocations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 text-sm">
                        Lokacijų nerasta pasirinktame filtre.
                      </td>
                    </tr>
                  ) : (
                    processedLocations.map(l => {
                      const isSelected = selectedIds.includes(l.id);
                      return (
                        <tr key={l.id} className={`hover:bg-gray-800/60 transition-colors ${isSelected ? 'bg-blue-950/20' : ''}`}>
                          <td className="py-3 px-3 text-center">
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(l.id)}
                              className="rounded border-gray-700 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 font-mono text-green-400 font-bold">{l.code}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              l.type === 'FLOOR' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              l.type === 'RACK' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {l.type || 'FLOOR'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-gray-300">
                            {l.width || 0} × {l.depth || 0} × {l.height || 0} mm
                          </td>
                          <td className="py-3 px-3 text-gray-400 text-xs">{l.description || '-'}</td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button 
                              type="button"
                              onClick={() => handleStartEdit(l)}
                              className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-2.5 py-1 rounded border border-blue-500/30 font-semibold"
                            >
                              {t?.edit || 'Redaguoti'}
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteLocation(l.id, l.code)}
                              className="text-xs bg-red-600/20 hover:bg-red-600/40 text-red-300 px-2.5 py-1 rounded border border-red-500/30 font-semibold"
                            >
                              {t?.delete || 'Trinti'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
