import { useState, useEffect } from 'react';
import { jdsApi, userApi } from '../lib/api';
import JdCard from '../components/JdCard';
import Layout from '../components/Layout';

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [jds, setJds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.savedJds().then(async (ids: string[]) => {
      setSavedIds(ids);
      if (ids.length === 0) { setLoading(false); return; }
      const all = await Promise.all(ids.map(id => jdsApi.get(id).catch(() => null)));
      setJds(all.filter(Boolean));
      setLoading(false);
    });
  }, []);

  const toggleSave = async (id: string) => {
    const updated = await userApi.toggleSave(id);
    setSavedIds(updated);
    setJds(prev => updated.includes(id) ? prev : prev.filter(j => j._id !== id));
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-100">Saved JDs</h1>
        <p className="text-stone-500 text-sm mt-1">{savedIds.length} saved</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-5 animate-pulse h-40" />
          ))}
        </div>
      ) : jds.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔖</div>
          <p className="text-stone-500">No saved JDs yet</p>
          <p className="text-stone-600 text-sm mt-2">Click the bookmark icon on any JD to save it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jds.map(jd => (
            <JdCard key={jd._id} jd={jd} saved={savedIds.includes(jd._id)} onToggleSave={toggleSave} />
          ))}
        </div>
      )}
    </Layout>
  );
}
