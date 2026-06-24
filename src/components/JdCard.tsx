import { useNavigate } from 'react-router-dom';
import JdModal from './JdModal';
import { useState } from 'react';

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

export default function JdCard({ jd, saved, onToggleSave }: JdCardProps) {
  const { organisation: org, jobProfile: job, salaryDetails: sal, selectionProcess: sel } = jd;
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const orgType = org?.orgType ?? '';

  return (
    <>
      <div
        className="bg-stone-900 border border-stone-700 rounded-xl p-5 hover:border-orange-500/60 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-black/40 cursor-pointer group"
        onClick={() => setModalOpen(true)}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="text-stone-100 font-semibold text-base leading-tight group-hover:text-orange-300 transition-colors line-clamp-2">
              {org?.name}
            </div>
            <div className="text-stone-500 text-sm mt-0.5 truncate">{job?.title}</div>
          </div>
          {onToggleSave && (
            <button
              onClick={e => { e.stopPropagation(); onToggleSave(jd._id); }}
              className="shrink-0 text-xl hover:scale-110 transition-transform"
              title={saved ? 'Unsave' : 'Save'}
            >
              {saved ? '🔖' : '🏷️'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {orgType && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-stone-800 text-stone-300 border border-stone-700">
              {orgType}
            </span>
          )}
          {sel?.mode && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
              {sel.mode}
            </span>
          )}
          {job?.backlogEligible && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-600/20">
              Backlog OK
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-stone-600">CTC</div>
          <div className="text-green-400 font-medium truncate">
            {formatCtc(sal?.ctcValue, sal?.ctcRaw)}
          </div>
          <div className="text-stone-600">Min CGPA</div>
          <div className="text-stone-300">{job?.minCgpa ? `${job.minCgpa}/10` : 'N/A'}</div>
          <div className="text-stone-600">Location</div>
          <div className="text-stone-300 truncate">
            {job?.locations?.slice(0, 2).join(', ') || 'N/A'}
          </div>
        </div>

        <button
          onClick={e => { e.stopPropagation(); navigate(`/jd/${jd._id}`); }}
          className="mt-4 block w-full text-center text-sm text-orange-500 hover:text-orange-300 border border-stone-700 hover:border-orange-500/50 rounded-lg py-1.5 transition-colors"
        >
          View Details →
        </button>
      </div>

      {modalOpen && <JdModal jd={jd} onClose={() => setModalOpen(false)} />}
    </>
  );
}
