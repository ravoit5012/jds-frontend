import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function safeStr(v: any): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function Field({ label, value }: { label: string; value: any }) {
  const display = safeStr(value);
  if (!display) return null;
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-stone-700/40 last:border-0">
      <span className="text-stone-500 text-xs">{label}</span>
      <span className="text-stone-200 text-xs">{display}</span>
    </div>
  );
}

interface JdModalProps {
  jd: any;
  onClose: () => void;
}

export default function JdModal({ jd, onClose }: JdModalProps) {
  const navigate = useNavigate();
  const { organisation: org, jobProfile: job, selectionProcess: sel, eligibility: elig, salaryDetails: sal } = jd;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-stone-700">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold text-stone-100 truncate">{safeStr(org?.name)}</h2>
            <p className="text-orange-400 text-sm mt-0.5 truncate">{safeStr(job?.title)}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {org?.orgType && <span className="text-xs bg-orange-500/15 text-orange-300 px-2 py-0.5 rounded-full">{org.orgType}</span>}
              {sel?.mode && <span className="text-xs bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full">{safeStr(sel.mode)}</span>}
              {jd.year && <span className="text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">{jd.year}</span>}
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-stone-500 hover:text-stone-200 transition-colors text-xl leading-none">✕</button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 divide-x divide-stone-700 border-b border-stone-700">
          {[
            { label: 'CTC', val: sal?.ctcRaw || '—', color: 'text-green-400' },
            { label: 'Min CGPA', val: job?.minCgpa ? `${job.minCgpa}/10` : 'No min', color: 'text-orange-400' },
            { label: 'Location', val: job?.locations?.join(', ') || '—', color: 'text-amber-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="px-4 py-3 text-center">
              <div className="text-stone-500 text-xs mb-0.5">{label}</div>
              <div className={`text-sm font-semibold ${color} truncate`}>{val}</div>
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {job?.description && (
            <div>
              <div className="text-orange-400 text-xs font-medium mb-2 uppercase tracking-wide">Job Description</div>
              <div className="text-stone-300 text-sm leading-relaxed bg-stone-800/60 rounded-xl p-3 whitespace-pre-wrap border border-stone-700">
                {safeStr(job.description)}
              </div>
            </div>
          )}

          {job?.skills && (
            <div>
              <div className="text-orange-400 text-xs font-medium mb-2 uppercase tracking-wide">Skillset</div>
              <div className="text-stone-300 text-sm bg-stone-800/60 rounded-xl p-3 border border-stone-700">{safeStr(job.skills)}</div>
            </div>
          )}

          <div>
            <div className="text-orange-400 text-xs font-medium mb-2 uppercase tracking-wide">Details</div>
            <div className="bg-stone-800/40 rounded-xl p-3 border border-stone-700/60">
              <Field label="Min Hires" value={job?.minHires || undefined} />
              <Field label="Expected Hires" value={job?.expectedHires || undefined} />
              <Field label="Backlog Eligible" value={job?.backlogEligible} />
              <Field label="Resume Shortlist" value={sel?.resumeShortlist} />
              <Field label="Rounds" value={sel?.rounds || undefined} />
              <Field label="Test" value={sel?.hasTest} />
              <Field label="Group Discussion" value={sel?.groupDiscussion} />
              <Field label="Personal Interview" value={sel?.personalInterview} />
            </div>
          </div>

          {elig?.departments?.length > 0 && (
            <div>
              <div className="text-orange-400 text-xs font-medium mb-2 uppercase tracking-wide">Eligible Departments</div>
              <div className="flex flex-wrap gap-1.5">
                {elig.departments.map((d: string) => (
                  <span key={d} className="text-xs bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full border border-stone-700">{d}</span>
                ))}
              </div>
            </div>
          )}

          {sal?.ctcRaw && (
            <div>
              <div className="text-orange-400 text-xs font-medium mb-2 uppercase tracking-wide">Salary</div>
              <div className="bg-stone-800/40 rounded-xl p-3 border border-stone-700/60">
                <Field label="CTC" value={sal?.ctcRaw} />
                <Field label="Base Salary" value={sal?.baseRaw} />
                <Field label="Gross" value={sal?.grossRaw} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-700 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm text-stone-400 border border-stone-700 hover:border-stone-500 hover:text-stone-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => navigate(`/jd/${jd._id}`)}
            className="flex-1 py-2 rounded-xl text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white transition-colors"
          >
            View Full Details →
          </button>
        </div>
      </div>
    </div>
  );
}
