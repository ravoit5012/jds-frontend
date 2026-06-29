import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  {
    key: 'jds',
    icon: '📋',
    title: 'JD Explorer',
    subtitle: 'Placement job descriptions',
    description: 'Browse and filter campus placement JDs across 5 years. View CTC, selection process, departments, and save roles.',
    badge: '4,400+ JDs',
    badgeColor: 'bg-orange-600/20 text-orange-300 border-orange-600/30',
    accentColor: 'group-hover:border-orange-500/60 group-hover:shadow-orange-900/30',
    activeColor: 'border-orange-500 shadow-orange-900/30',
    statColor: 'text-orange-400',
    stats: [
      { label: 'Years', value: '2022–2026' },
      { label: 'Companies', value: '500+' },
      { label: 'Roles', value: '4,400+' },
    ],
    dest: '/select-year',
  },
  {
    key: 'practice',
    icon: '🧩',
    title: 'Practice',
    subtitle: 'LeetCode company-wise problems',
    description: 'Solve company-tagged LeetCode problems. Filter by company or difficulty, track attempts, and mark problems solved.',
    badge: '1,263 problems',
    badgeColor: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
    accentColor: 'group-hover:border-emerald-500/60 group-hover:shadow-emerald-900/30',
    activeColor: 'border-emerald-500 shadow-emerald-900/30',
    statColor: 'text-emerald-400',
    stats: [
      { label: 'Companies', value: '187' },
      { label: 'Problems', value: '1,263' },
      { label: 'Difficulties', value: 'E / M / H' },
    ],
    dest: '/practice',
  },
];

export default function FeatureSelectPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-stone-100 mb-2">What do you want to do?</h1>
          <p className="text-stone-500 text-sm">Choose a section to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {FEATURES.map(f => (
            <button
              key={f.key}
              onClick={() => navigate(f.dest)}
              className={`group relative flex flex-col items-start p-7 rounded-2xl transition-all duration-200 hover:scale-[1.03] cursor-pointer border-2 bg-stone-900 border-stone-700 hover:bg-stone-800 hover:shadow-xl ${f.accentColor} text-left`}
            >
              {/* Badge */}
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-5 ${f.badgeColor}`}>
                {f.badge}
              </span>

              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{f.icon}</span>
                <div>
                  <div className={`text-xl font-black text-stone-100 group-hover:${f.statColor.replace('text-', 'text-')} transition-colors`}>
                    {f.title}
                  </div>
                  <div className="text-stone-500 text-xs">{f.subtitle}</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-stone-400 text-sm leading-relaxed mt-3 mb-5">
                {f.description}
              </p>

              {/* Stats row */}
              <div className="flex gap-5 mt-auto">
                {f.stats.map(s => (
                  <div key={s.label}>
                    <div className={`font-bold text-sm ${f.statColor}`}>{s.value}</div>
                    <div className="text-stone-600 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-700 text-xl group-hover:text-stone-400 group-hover:translate-x-1 transition-all">
                →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
