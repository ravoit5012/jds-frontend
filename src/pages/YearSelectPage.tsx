import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jdsApi } from '../lib/api';
import { useYear } from '../contexts/YearContext';
import { useAuth } from '../contexts/AuthContext';

interface YearStat {
  year: number;
  count: number;
  companies: number;
  avgCtc: number;
}

function fmtCtc(n: number) {
  if (!n || n <= 0) return null;
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr avg`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L avg`;
  return null;
}

const YEAR_NOTE: Record<number, string> = {
  2022: 'Historic',
  2023: 'Historic',
  2024: 'Historic',
  2025: 'Full Details',
  2026: 'Latest',
};

export default function YearSelectPage() {
  const [years, setYears] = useState<YearStat[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedYear, selectedYear } = useYear();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    jdsApi.years()
      .then(setYears)
      .finally(() => setLoading(false));
  }, []);

  const pickYear = (yr: number) => {
    setSelectedYear(yr);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-xl">📋</span>
          <span className="font-bold text-lg text-stone-100">JD Explorer</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-stone-500 text-sm">{user?.name}</span>
          <button onClick={logout} className="text-sm text-stone-500 hover:text-stone-200 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-stone-100 mb-2">Select Placement Year</h1>
          <p className="text-stone-500 text-sm">Choose which year's job descriptions to explore</p>
          {selectedYear && (
            <p className="text-orange-400 text-sm mt-2">Currently viewing: <strong>{selectedYear}</strong></p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-4xl">
            {[0,1,2,3,4].map(i => (
              <div key={i} className="h-44 bg-stone-900 border border-stone-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-4xl">
              {years.map(stat => {
                const isSelected = selectedYear === stat.year;
                const ctc = fmtCtc(stat.avgCtc);
                return (
                  <button
                    key={stat.year}
                    onClick={() => pickYear(stat.year)}
                    className={`relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-200 hover:scale-105 cursor-pointer group border-2 ${
                      isSelected
                        ? 'bg-stone-800 border-orange-500 shadow-lg shadow-orange-900/30'
                        : 'bg-stone-900 border-stone-700 hover:border-orange-500/60 hover:bg-stone-800 hover:shadow-lg hover:shadow-black/40'
                    }`}
                  >
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${
                      stat.year === 2025
                        ? 'bg-orange-600/20 text-orange-300 border border-orange-600/30'
                        : 'bg-stone-800 text-stone-400 border border-stone-700'
                    }`}>
                      {YEAR_NOTE[stat.year] ?? 'Historic'}
                    </div>

                    <span className={`text-4xl font-black transition-colors ${
                      isSelected ? 'text-orange-400' : 'text-stone-100 group-hover:text-orange-300'
                    }`}>
                      {stat.year}
                    </span>

                    <div className="mt-4 space-y-1 text-center">
                      <div className="text-orange-400 font-semibold text-sm">{stat.count.toLocaleString()} JDs</div>
                      <div className="text-stone-500 text-xs">{stat.companies} companies</div>
                      {ctc ? (
                        <div className="text-green-400 text-xs">{ctc}</div>
                      ) : (
                        <div className="text-stone-700 text-xs">CTC not in data</div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 bg-stone-900 border border-stone-800 rounded-xl px-5 py-4 max-w-xl text-center">
              <p className="text-stone-400 text-sm">
                <span className="text-orange-400 font-medium">2025</span> has the most detailed data (CTC, selection process, salary breakdown) from official JD files.{' '}
                <span className="text-stone-500">2022–2024 and 2026 data is from the placement portal (role, location, departments only — no salary).</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
