import { Link } from 'react-router-dom';

interface JdCardProps {
  jd: any;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
}

function formatCtc(value: number, raw: string) {
  if (!value && !raw) return 'Not disclosed';
  if (raw) return raw.replace(' Per Annum', '/yr');
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L/yr`;
  return `₹${value.toLocaleString()}/yr`;
}

const ORG_TYPE_COLORS: Record<string, string> = {
  STARTUP: 'bg-orange-500/20 text-orange-300',
  MNC: 'bg-blue-500/20 text-blue-300',
  PSU: 'bg-green-500/20 text-green-300',
  RESEARCH: 'bg-purple-500/20 text-purple-300',
  CONSULTING: 'bg-yellow-500/20 text-yellow-300',
};

export default function JdCard({ jd, saved, onToggleSave }: JdCardProps) {
  const { organisation: org, jobProfile: job, salaryDetails: sal, selectionProcess: sel } = jd;
  const orgType = org?.orgType ?? '';
  const badgeClass = Object.entries(ORG_TYPE_COLORS).find(([k]) =>
    orgType.toUpperCase().includes(k),
  )?.[1] ?? 'bg-gray-500/20 text-gray-300';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-500/50 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <Link
            to={`/jd/${jd._id}`}
            className="text-white font-semibold text-base leading-tight hover:text-blue-400 transition-colors line-clamp-2 group-hover:text-blue-400"
          >
            {org?.name}
          </Link>
          <div className="text-gray-400 text-sm mt-0.5 truncate">{job?.title}</div>
        </div>
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(jd._id)}
            className="flex-shrink-0 text-xl hover:scale-110 transition-transform"
            title={saved ? 'Unsave' : 'Save'}
          >
            {saved ? '🔖' : '🏷️'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
          {orgType || 'Company'}
        </span>
        {sel?.mode && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
            {sel.mode}
          </span>
        )}
        {job?.backlogEligible && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
            Backlog OK
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-500">CTC</div>
        <div className="text-green-400 font-medium truncate">
          {formatCtc(sal?.ctcValue, sal?.ctcRaw)}
        </div>
        <div className="text-gray-500">Min CGPA</div>
        <div className="text-gray-200">{job?.minCgpa ? `${job.minCgpa}/10` : 'N/A'}</div>
        <div className="text-gray-500">Location</div>
        <div className="text-gray-200 truncate">
          {job?.locations?.slice(0, 2).join(', ') || 'N/A'}
        </div>
      </div>

      <Link
        to={`/jd/${jd._id}`}
        className="mt-4 block text-center text-sm text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400 rounded-lg py-1.5 transition-colors"
      >
        View Details →
      </Link>
    </div>
  );
}
