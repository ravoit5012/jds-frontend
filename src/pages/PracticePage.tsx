import { useState, useEffect, useCallback, useRef } from 'react';
import { leetcodeApi } from '../lib/api';
import Layout from '../components/Layout';

interface Problem {
  slug: string;
  name: string;
  link: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | '';
  companies: string[];
  occurrences: Record<string, number>;
  totalOccurrences: number;
  solution: string;
  attempted: boolean;
  solved: boolean;
}

interface Stats {
  total: number;
  totalByDifficulty: Record<string, number>;
  attempted: number;
  solved: number;
  solvedByDifficulty: Record<string, number>;
  attemptedByDifficulty: Record<string, number>;
}

const DIFF_STYLE: Record<string, { badge: string; bar: string; text: string }> = {
  Easy:   { badge: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40', bar: 'bg-emerald-500', text: 'text-emerald-300' },
  Medium: { badge: 'text-amber-300 bg-amber-500/15 border-amber-500/40',       bar: 'bg-amber-400',   text: 'text-amber-300'  },
  Hard:   { badge: 'text-rose-300 bg-rose-500/15 border-rose-500/40',          bar: 'bg-rose-500',    text: 'text-rose-300'   },
};

function DiffBadge({ d }: { d: string }) {
  const s = DIFF_STYLE[d];
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold tracking-wide whitespace-nowrap ${s?.badge ?? 'text-stone-400 bg-stone-700 border-stone-600'}`}>
      {d || '?'}
    </span>
  );
}

function CompanySelect({ companies, value, onChange }: {
  companies: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const filtered = companies.filter(c => c.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all border ${
          value
            ? 'bg-orange-600/20 border-orange-500/50 text-orange-300'
            : 'bg-stone-800 border-stone-600 text-stone-300 hover:border-stone-500 hover:text-stone-100'
        }`}
      >
        <span className="truncate max-w-[140px]">{value || 'Company'}</span>
        <span className="text-stone-500 text-xs shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-stone-900 border border-stone-600 rounded-xl shadow-2xl overflow-hidden w-64">
          <div className="p-2.5 border-b border-stone-700">
            <input autoFocus type="text" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search companies…"
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-1.5 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-orange-500" />
          </div>
          <div className="max-h-60 overflow-y-auto">
            <button onClick={() => { onChange(''); setQ(''); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-stone-800 ${!value ? 'text-orange-400 font-semibold' : 'text-stone-400'}`}>
              All Companies
            </button>
            {filtered.map(c => (
              <button key={c} onClick={() => { onChange(c); setQ(''); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-stone-800 ${value === c ? 'text-orange-300 bg-orange-900/20 font-medium' : 'text-stone-300'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-stone-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-stone-500 text-xs">{sub}</span>}
    </div>
  );
}

function ProgressRing({ solved, total, attempted, diff }: { solved: number; total: number; attempted: number; diff: string }) {
  const s = DIFF_STYLE[diff];
  const solvedPct = total ? Math.round((solved / total) * 100) : 0;
  const attemptedPct = total ? Math.round((attempted / total) * 100) : 0;
  return (
    <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className={`font-semibold text-sm ${s?.text}`}>{diff}</span>
        <span className="text-stone-300 text-sm font-medium">{solved}<span className="text-stone-600 text-xs"> / {total}</span></span>
      </div>
      <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 bg-stone-600 rounded-full transition-all" style={{ width: `${attemptedPct}%` }} />
        <div className={`absolute inset-y-0 left-0 rounded-full transition-all ${s?.bar}`} style={{ width: `${solvedPct}%` }} />
      </div>
      <div className="flex gap-3 mt-1.5">
        <span className={`text-xs font-medium ${s?.text}`}>{solvedPct}% solved</span>
        {attempted > solved && <span className="text-stone-500 text-xs">{attemptedPct}% tried</span>}
      </div>
    </div>
  );
}


const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'Todo' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'solved', label: 'Solved' },
];

export default function PracticePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [stats, setStats] = useState<Stats | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [difficulty, setDifficulty] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchStats = useCallback(() => {
    leetcodeApi.myStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    leetcodeApi.companies().then(setCompanies);
    fetchStats();
  }, [fetchStats]);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 50 };
      if (difficulty) params.difficulty = difficulty;
      if (company) params.company = company;
      if (status !== 'all') params.status = status;
      if (search) params.search = search;
      const data = await leetcodeApi.problems(params);
      setProblems(data.problems);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  }, [difficulty, company, status, search, page]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const handleOpen = async (p: Problem) => {
    window.open(p.link, '_blank', 'noopener,noreferrer');
    if (!p.attempted) {
      await leetcodeApi.markAttempted(p.slug).catch(() => {});
      setProblems(prev => prev.map(x => x.slug === p.slug ? { ...x, attempted: true } : x));
      fetchStats();
    }
  };

  const handleToggleSolve = async (p: Problem, e: React.MouseEvent) => {
    e.stopPropagation();
    const { solved } = await leetcodeApi.toggleSolve(p.slug);
    setProblems(prev => prev.map(x =>
      x.slug === p.slug ? { ...x, solved, attempted: solved ? true : x.attempted } : x
    ));
    fetchStats();
  };

  const activeFilters = [difficulty, company, status !== 'all' ? status : '', search].filter(Boolean).length;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Practice</h1>
            <p className="text-stone-400 text-sm mt-1">LeetCode · Company-wise · 2022 dataset</p>
          </div>
          {stats && (
            <div className="hidden md:flex items-center gap-2 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5">
              <span className="text-orange-400 font-bold text-xl">{stats.solved}</span>
              <span className="text-stone-600 text-lg">/</span>
              <span className="text-stone-300 font-semibold">{stats.total}</span>
              <span className="text-stone-500 text-sm ml-1">solved</span>
            </div>
          )}
        </div>

        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Total" value={stats.total.toLocaleString()} color="text-stone-100" sub="problems" />
            <StatCard label="Solved" value={stats.solved} color="text-emerald-400"
              sub={`${stats.total ? Math.round((stats.solved / stats.total) * 100) : 0}% done`} />
            <ProgressRing diff="Easy"   solved={stats.solvedByDifficulty['Easy']??0}   attempted={stats.attemptedByDifficulty['Easy']??0}   total={stats.totalByDifficulty['Easy']??0} />
            <ProgressRing diff="Medium" solved={stats.solvedByDifficulty['Medium']??0} attempted={stats.attemptedByDifficulty['Medium']??0} total={stats.totalByDifficulty['Medium']??0} />
            <ProgressRing diff="Hard"   solved={stats.solvedByDifficulty['Hard']??0}   attempted={stats.attemptedByDifficulty['Hard']??0}   total={stats.totalByDifficulty['Hard']??0} />
          </div>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 mb-5">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Difficulty pills */}
          {(['', 'Easy', 'Medium', 'Hard'] as const).map(v => {
            const s = v ? DIFF_STYLE[v] : null;
            const active = difficulty === v;
            return (
              <button key={v} onClick={() => { setDifficulty(v); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                  active
                    ? v ? s!.badge : 'bg-orange-600 text-white border-orange-600'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200 hover:border-stone-500'
                }`}>
                {v || 'All'}
              </button>
            );
          })}

          <div className="w-px h-6 bg-stone-700 mx-1 shrink-0" />

          {/* Status tabs */}
          <div className="flex bg-stone-800 border border-stone-700 rounded-lg p-0.5 gap-0.5">
            {STATUS_TABS.map(({ value, label }) => (
              <button key={value} onClick={() => { setStatus(value); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  status === value ? 'bg-orange-600 text-white' : 'text-stone-400 hover:text-stone-200'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-stone-700 mx-1 shrink-0" />

          {/* Company */}
          <CompanySelect companies={companies} value={company} onChange={c => { setCompany(c); setPage(1); }} />

          {/* Search */}
          <div className="flex-1 min-w-40">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setPage(1)}
              placeholder="Search by name…"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          {activeFilters > 0 && (
            <button onClick={() => { setDifficulty(''); setCompany(''); setStatus('all'); setSearch(''); setPage(1); }}
              className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-red-400 transition-colors border border-stone-700 hover:border-red-500/40 rounded-lg px-3 py-2">
              Clear
              <span className="bg-stone-700 text-stone-200 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{activeFilters}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
        {/* Meta row */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-700">
          <span className="text-sm">
            {loading ? (
              <span className="text-stone-500">Loading…</span>
            ) : (
              <>
                <span className="text-white font-bold">{pagination.total.toLocaleString()}</span>
                <span className="text-stone-500 ml-1.5">problems</span>
                {company && <span className="ml-2 text-orange-400 font-semibold">· {company}</span>}
              </>
            )}
          </span>
          <span className="text-stone-600 text-xs hidden md:block">Click any row to open on LeetCode · auto-marks as tried</span>
        </div>

        {/* Column headers */}
        <div className="grid gap-4 px-5 py-3 border-b border-stone-800 bg-stone-950/40 text-xs text-stone-500 font-semibold uppercase tracking-wider"
          style={{ gridTemplateColumns: '2.5rem 6.5rem 1fr 220px 9rem' }}>
          <span>#</span>
          <span>Difficulty</span>
          <span>Problem</span>
          <span>Companies</span>
          <span className="text-right">Status</span>
        </div>

        {loading ? (
          <div>
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="grid gap-4 px-5 py-4 border-b border-stone-800/50 animate-pulse items-center"
                style={{ gridTemplateColumns: '2.5rem 6.5rem 1fr 220px 9rem' }}>
                <div className="h-3 bg-stone-800 rounded w-6" />
                <div className="h-5 bg-stone-800 rounded w-16" />
                <div className="space-y-1.5">
                  <div className="h-4 bg-stone-800 rounded w-2/3" />
                  <div className="h-3 bg-stone-800/60 rounded w-1/3" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 bg-stone-800 rounded w-14" />
                  <div className="h-5 bg-stone-800 rounded w-14" />
                </div>
                <div className="h-7 bg-stone-800 rounded w-24 ml-auto" />
              </div>
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4 opacity-40">🧩</div>
            <p className="text-stone-300 font-semibold">No problems found</p>
            <p className="text-stone-600 text-sm mt-1">Try clearing your filters</p>
          </div>
        ) : (
          <div>
            {problems.map((p, idx) => (
              <div
                key={p.slug}
                onClick={() => handleOpen(p)}
                style={{ gridTemplateColumns: '2.5rem 6.5rem 1fr 220px 9rem' }}
                className={`grid gap-4 px-5 py-4 border-b border-stone-800/50 transition-all cursor-pointer group items-center
                  ${p.solved ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : p.attempted ? 'bg-stone-800/25 hover:bg-stone-800/40' : 'hover:bg-stone-800/30'}`}
              >
                {/* # */}
                <span className="text-stone-500 text-sm tabular-nums">{(page - 1) * 50 + idx + 1}</span>

                {/* Difficulty */}
                <DiffBadge d={p.difficulty} />

                {/* Problem name */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-semibold truncate transition-colors group-hover:text-orange-300 ${
                      p.solved ? 'text-emerald-300' : 'text-stone-100'
                    }`}>
                      {p.name}
                    </span>
                    <span className="text-stone-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0">↗</span>
                  </div>
                  {p.totalOccurrences > 1 && (
                    <div className="text-stone-500 text-xs mt-0.5">
                      Asked <span className="text-stone-400 font-semibold">{p.totalOccurrences}×</span> across companies
                    </div>
                  )}
                </div>

                {/* Companies */}
                <div className="flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
                  {p.companies.slice(0, 3).map(c => (
                    <button key={c}
                      onClick={e => { e.stopPropagation(); setCompany(c === company ? '' : c); setPage(1); }}
                      className={`text-xs px-2 py-0.5 rounded-md border font-medium transition-all ${
                        company === c
                          ? 'bg-orange-600/25 text-orange-300 border-orange-500/50'
                          : 'bg-stone-800 text-stone-300 border-stone-600 hover:bg-stone-700 hover:text-white hover:border-stone-500'
                      }`}>
                      {c}
                      {p.occurrences[c] > 1 && (
                        <span className="ml-1 text-stone-500">×{p.occurrences[c]}</span>
                      )}
                    </button>
                  ))}
                  {p.companies.length > 3 && (
                    <span className="text-stone-500 text-xs self-center font-medium">+{p.companies.length - 3}</span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                  {p.attempted && !p.solved && (
                    <span className="text-xs bg-stone-700 text-stone-300 border border-stone-600 px-2 py-0.5 rounded-full font-medium">tried</span>
                  )}
                  {p.solved ? (
                    <div className="flex items-center gap-1.5 bg-emerald-900/30 border border-emerald-700/40 rounded-lg px-2.5 py-1">
                      <span className="text-emerald-400 font-bold text-sm">✓</span>
                      <span className="text-emerald-300 text-xs font-semibold">Solved</span>
                      <button
                        onClick={e => handleToggleSolve(p, e)}
                        className="text-emerald-800 hover:text-red-400 transition-colors ml-0.5 text-base leading-none font-bold"
                        title="Remove solved mark"
                      >×</button>
                    </div>
                  ) : (
                    <button
                      onClick={e => handleToggleSolve(p, e)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                        bg-stone-800 text-stone-300 border-stone-600
                        hover:bg-emerald-600/20 hover:text-emerald-300 hover:border-emerald-500/50"
                    >
                      Mark Solved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-stone-800 border border-stone-600 hover:bg-stone-700 hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-stone-200 text-sm font-semibold transition-all">
            ← Prev
          </button>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-stone-500">Page</span>
            <span className="text-white font-bold">{page}</span>
            <span className="text-stone-600">of</span>
            <span className="text-stone-400 font-medium">{pagination.pages}</span>
          </div>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
            className="px-4 py-2 bg-stone-800 border border-stone-600 hover:bg-stone-700 hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-stone-200 text-sm font-semibold transition-all">
            Next →
          </button>
        </div>
      )}
    </Layout>
  );
}
