import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jdsApi, userApi } from '../lib/api';
import JdCard from '../components/JdCard';
import Layout from '../components/Layout';
import { useYear } from '../contexts/YearContext';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'ctc', label: 'Highest CTC' },
  { value: 'cgpa', label: 'Lowest CGPA' },
  { value: 'company', label: 'Company (A-Z)' },
  { value: 'popular', label: 'Most Viewed' },
];

const JOB_TYPE_PILLS = [
  { value: '', label: 'All' },
  { value: 'SDE', label: 'SDE' },
  { value: 'Quant', label: 'Quant' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Analytics', label: 'Analytics' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Core Engineering', label: 'Core Engg' },
  { value: 'Research', label: 'Research' },
  { value: 'Product', label: 'Product' },
  { value: 'Design / UX', label: 'Design / UX' },
  { value: 'Trainee', label: 'Trainee' },
];

function DeptSelect({ departments, value, onChange }: {
  departments: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = departments.filter(d =>
    d.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (d: string) => { onChange(d); setQuery(''); setOpen(false); };
  const clear = () => { onChange(''); setQuery(''); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between bg-stone-800 border rounded-lg px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
          value ? 'border-orange-500/60 text-stone-200' : 'border-stone-700 text-stone-500'
        }`}
      >
        <span className="truncate">{value || 'All Departments'}</span>
        <span className="text-stone-600 shrink-0 ml-1">▼</span>
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-stone-900 border border-stone-700 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-stone-800">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search departments…"
              className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-1.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            <button
              type="button"
              onClick={clear}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-stone-800 transition-colors ${!value ? 'text-orange-400 font-medium' : 'text-stone-500'}`}
            >
              All Departments
            </button>
            {filtered.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => select(d)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-stone-800 transition-colors ${value === d ? 'text-orange-400 font-medium' : 'text-stone-300'}`}
              >
                {d}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-stone-600 text-sm">No match</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedYear } = useYear();

  const [jds, setJds] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 20 });
  const [filterOptions, setFilterOptions] = useState<any>({ orgTypes: [], locations: [], departments: [] });
  const [stats, setStats] = useState<any>(null);
  const [savedJds, setSavedJds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [orgType, setOrgType] = useState(searchParams.get('orgType') ?? '');
  const [location, setLocation] = useState(searchParams.get('location') ?? '');
  const [department, setDepartment] = useState(searchParams.get('department') ?? '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') ?? '');
  const [myCgpa, setMyCgpa] = useState(searchParams.get('myCgpa') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    jdsApi.filters(selectedYear ?? undefined).then(setFilterOptions);
    userApi.savedJds().then(setSavedJds);
  }, [selectedYear]);

  const fetchJds = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20, sortBy };
      if (selectedYear) params.year = selectedYear;
      if (search) params.search = search;
      if (orgType) params.orgType = orgType;
      if (location) params.location = location;
      if (department) params.department = department;
      if (jobType) params.jobType = jobType;
      if (myCgpa && parseFloat(myCgpa) > 0) params.myCgpa = myCgpa;

      const data = await jdsApi.list(params);
      setJds(data.jds);
      setPagination(data.pagination);
      setStats(data.stats);
    } finally {
      setLoading(false);
    }
  }, [search, orgType, location, department, jobType, myCgpa, sortBy, page, selectedYear]);

  useEffect(() => { fetchJds(); }, [fetchJds]);

  const updateSearch = () => {
    setPage(1);
    const p: Record<string, string> = {};
    if (search) p.search = search;
    if (orgType) p.orgType = orgType;
    if (location) p.location = location;
    if (department) p.department = department;
    if (jobType) p.jobType = jobType;
    if (myCgpa) p.myCgpa = myCgpa;
    if (sortBy !== 'newest') p.sortBy = sortBy;
    setSearchParams(p);
  };

  const toggleSave = async (id: string) => {
    const updated = await userApi.toggleSave(id);
    setSavedJds(updated);
  };

  const clearFilters = () => {
    setSearch(''); setOrgType(''); setLocation(''); setDepartment('');
    setJobType(''); setMyCgpa(''); setSortBy('newest'); setPage(1); setSearchParams({});
  };

  const hasCgpaFilter = Boolean(myCgpa && parseFloat(myCgpa) > 0);
  const activeFilterCount = [search, orgType, location, department, jobType, hasCgpaFilter ? '1' : ''].filter(Boolean).length;

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  const hasCtc = (stats?.averageCtc ?? 0) > 0;

  const statCards = [
    { label: 'Total JDs', value: loading ? '…' : fmt(stats?.totalJds ?? 0), color: 'text-orange-400' },
    { label: 'Companies', value: loading ? '…' : fmt(stats?.totalCompanies ?? 0), color: 'text-amber-400' },
    {
      label: hasCgpaFilter ? 'Eligible Avg CTC' : 'Avg CTC',
      value: loading ? '…' : hasCtc ? `₹${(stats.averageCtc / 100000).toFixed(1)}L` : 'N/A',
      color: 'text-green-400',
    },
    { label: 'Min Hires', value: loading ? '…' : fmt(stats?.totalMinHires ?? 0), color: 'text-cyan-400' },
    { label: 'Expected Hires', value: loading ? '…' : fmt(stats?.totalExpectedHires ?? 0), color: 'text-yellow-400' },
    { label: 'Saved', value: savedJds.length, color: 'text-purple-400' },
  ];

  return (
    <Layout>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-center">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-stone-600 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Job type pills */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {JOB_TYPE_PILLS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setJobType(value); setPage(1); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              jobType === value
                ? 'bg-orange-600 text-white'
                : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700 hover:text-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + filter panel */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && updateSearch()}
            placeholder="Search companies, roles, skills…"
            className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={updateSearch}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-white font-medium transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative px-4 py-2.5 rounded-lg font-medium transition-colors ${showFilters ? 'bg-orange-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700 border border-stone-700'}`}
          >
            Filters {showFilters ? '▲' : '▼'}
            {activeFilterCount > 0 && !showFilters && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-stone-800 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={orgType}
                onChange={e => setOrgType(e.target.value)}
                className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Org Types</option>
                {filterOptions.orgTypes.map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Locations</option>
                {filterOptions.locations.map((l: string) => <option key={l} value={l}>{l}</option>)}
              </select>
              <DeptSelect
                departments={filterOptions.departments}
                value={department}
                onChange={d => { setDepartment(d); setPage(1); }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${hasCgpaFilter ? 'bg-emerald-950/50 border-emerald-700/60' : 'bg-stone-800 border-stone-700'}`}>
                <div className="flex-1 min-w-0">
                  <label className={`text-xs font-medium block mb-0.5 ${hasCgpaFilter ? 'text-emerald-400' : 'text-stone-500'}`}>
                    My CGPA — shows JDs you're eligible for
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={myCgpa}
                    onChange={e => { setMyCgpa(e.target.value); setPage(1); }}
                    placeholder="e.g. 7.2"
                    className="w-full bg-transparent text-stone-200 placeholder-stone-600 focus:outline-none text-sm"
                  />
                </div>
                {hasCgpaFilter && (
                  <button onClick={() => setMyCgpa('')} className="text-emerald-400 hover:text-white text-xl leading-none shrink-0">×</button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-stone-600 text-xs">Active:</span>
            {search && <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">"{search}"</span>}
            {jobType && <span className="text-xs bg-orange-600/20 text-orange-200 px-2 py-0.5 rounded-full">{jobType}</span>}
            {orgType && <span className="text-xs bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full">{orgType}</span>}
            {location && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">{location}</span>}
            {department && <span className="text-xs bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full">{department}</span>}
            {hasCgpaFilter && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-700/40 px-2 py-0.5 rounded-full">
                CGPA ≥ {myCgpa}
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300">Clear all ×</button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-stone-500 text-sm">
          {loading ? 'Loading…' : `${pagination.total.toLocaleString()} JDs found`}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-stone-600 text-sm">Sort:</span>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-stone-200 text-sm focus:outline-none"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-stone-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-stone-800 rounded w-1/2 mb-4" />
              <div className="h-3 bg-stone-800 rounded w-full mb-2" />
              <div className="h-3 bg-stone-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : jds.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-stone-500">No JDs found matching your criteria</p>
          {hasCgpaFilter && (
            <p className="text-stone-600 text-sm mt-2">
              No eligible JDs found for CGPA {myCgpa} with the current filters.
            </p>
          )}
          <button onClick={clearFilters} className="mt-4 text-orange-400 hover:text-orange-300 text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jds.map(jd => (
            <JdCard
              key={jd._id}
              jd={jd}
              saved={savedJds.includes(jd._id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-stone-800 border border-stone-700 hover:bg-stone-700 disabled:opacity-30 rounded-lg text-stone-300 text-sm transition-colors"
          >
            ← Prev
          </button>
          <span className="text-stone-500 text-sm">Page {page} of {pagination.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-stone-800 border border-stone-700 hover:bg-stone-700 disabled:opacity-30 rounded-lg text-stone-300 text-sm transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </Layout>
  );
}
