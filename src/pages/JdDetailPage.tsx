import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jdsApi, userApi } from '../lib/api';
import Layout from '../components/Layout';

function safeStr(v: any): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 mb-4">
      <h3 className="text-stone-100 font-semibold text-lg mb-4 border-b border-stone-700 pb-2">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  const display = safeStr(value);
  if (!display) return null;
  return (
    <div className="grid grid-cols-2 gap-2 py-2 border-b border-stone-800 last:border-0">
      <span className="text-stone-500 text-sm">{label}</span>
      <span className="text-stone-300 text-sm">{display}</span>
    </div>
  );
}

export default function JdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jd, setJd] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      jdsApi.get(id),
      userApi.savedJds(),
    ]).then(([jdData, savedList]) => {
      setJd(jdData);
      setSaved(savedList.includes(id));
    }).finally(() => setLoading(false));
  }, [id]);

  const toggleSave = async () => {
    if (!id) return;
    const updated = await userApi.toggleSave(id);
    setSaved(updated.includes(id));
  };

  if (loading) return (
    <Layout>
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-stone-800 rounded w-1/2" />
        <div className="h-4 bg-stone-800 rounded w-1/3" />
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 h-40" />
      </div>
    </Layout>
  );

  if (!jd) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-stone-500">JD not found</p>
        <button onClick={() => navigate('/')} className="mt-4 text-orange-400 hover:text-orange-300">← Back to Explorer</button>
      </div>
    </Layout>
  );

  const { organisation: org, jobProfile: job, selectionProcess: sel, eligibility: elig, salaryDetails: sal } = jd;

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-stone-500 hover:text-stone-300 text-sm mb-4 flex items-center gap-1">
          ← Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-100">{org?.name}</h1>
            <p className="text-orange-400 text-lg mt-1">{job?.title}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {org?.orgType && <span className="text-xs bg-orange-500/15 text-orange-300 px-2 py-1 rounded-full">{org.orgType}</span>}
              {org?.businessNature && <span className="text-xs bg-stone-800 text-stone-400 px-2 py-1 rounded-full">{org.businessNature}</span>}
              {sel?.mode && <span className="text-xs bg-stone-800 text-stone-400 px-2 py-1 rounded-full">{sel.mode}</span>}
              {jd.year && <span className="text-xs bg-stone-700 text-stone-300 px-2 py-1 rounded-full">{jd.year}</span>}
            </div>
          </div>
          <button
            onClick={toggleSave}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              saved
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'bg-stone-800 text-stone-500 hover:bg-stone-700 border border-stone-700'
            }`}
          >
            {saved ? '🔖 Saved' : '🏷️ Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'CTC', value: sal?.ctcRaw || 'Not disclosed', color: 'text-green-400' },
          { label: 'Min CGPA', value: job?.minCgpa ? `${job.minCgpa}/10` : 'No minimum', color: 'text-orange-400' },
          { label: 'Location', value: job?.locations?.join(', ') || 'TBD', color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <div className="text-stone-500 text-xs mb-1">{label}</div>
            <div className={`font-semibold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <Section title="About Organisation">
        <Field label="Name" value={org?.name} />
        <Field label="Type" value={org?.orgType} />
        <Field label="Nature" value={org?.businessNature} />
        <Field label="Employees" value={org?.employees || undefined} />
        <Field label="Established" value={org?.established} />
        {org?.website && (
          <div className="grid grid-cols-2 gap-2 py-2">
            <span className="text-stone-500 text-sm">Website</span>
            <a href={org.website} target="_blank" rel="noreferrer" className="text-orange-400 hover:text-orange-300 text-sm truncate">{org.website}</a>
          </div>
        )}
      </Section>

      <Section title="Job Profile">
        <Field label="Title" value={job?.title} />
        <Field label="Min Hires" value={job?.minHires || undefined} />
        <Field label="Expected Hires" value={job?.expectedHires || undefined} />
        <Field label="Locations" value={job?.locations?.join(', ')} />
        <Field label="Min CGPA" value={job?.minCgpa} />
        <Field label="Backlog Eligible" value={job?.backlogEligible} />
        {job?.description && (
          <div className="mt-4">
            <div className="text-stone-500 text-sm mb-2">Job Description</div>
            <div className="text-stone-300 text-sm leading-relaxed bg-stone-800/60 rounded-lg p-4 whitespace-pre-wrap border border-stone-700">
              {safeStr(job.description)}
            </div>
          </div>
        )}
        {job?.roleDetails && (
          <div className="mt-4">
            <div className="text-stone-500 text-sm mb-2">Role Details</div>
            <div className="text-stone-300 text-sm leading-relaxed bg-stone-800/60 rounded-lg p-4 whitespace-pre-wrap border border-stone-700">
              {safeStr(job.roleDetails)}
            </div>
          </div>
        )}
        {job?.skills && (
          <div className="mt-4">
            <div className="text-stone-500 text-sm mb-2">Skillset</div>
            <div className="text-stone-300 text-sm leading-relaxed bg-stone-800/60 rounded-lg p-4 whitespace-pre-wrap border border-stone-700">
              {safeStr(job.skills)}
            </div>
          </div>
        )}
      </Section>

      <Section title="Selection Process">
        <Field label="Mode" value={sel?.mode} />
        <Field label="Rounds" value={sel?.rounds || undefined} />
        <Field label="Resume Shortlist" value={sel?.resumeShortlist} />
        <Field label="Test" value={sel?.hasTest} />
        {sel?.hasTest && <>
          <Field label="Test Mode" value={sel?.testMode} />
          <Field label="Test Duration" value={sel?.testDuration ? `${sel.testDuration} min` : undefined} />
          <Field label="Aptitude/Psychometric" value={sel?.aptitude} />
          <Field label="Technical" value={sel?.technical} />
        </>}
        <Field label="Group Discussion" value={sel?.groupDiscussion} />
        <Field label="Personal Interview" value={sel?.personalInterview} />
        <Field label="Technical Round" value={sel?.technicalRound} />
        <Field label="HR Round" value={sel?.hrRound} />
        <Field label="Medical Test" value={sel?.medicalTest} />
        {sel?.otherProcesses && <Field label="Other" value={sel.otherProcesses} />}
      </Section>

      <Section title="Eligibility">
        <Field label="Diversity Recruiting" value={elig?.diversityRecruiting} />
        <Field label="Recruiting PhDs" value={elig?.recruitingPhDs} />
        {elig?.departments?.length > 0 && (
          <div className="mt-3">
            <div className="text-stone-500 text-sm mb-2">Eligible Departments</div>
            <div className="flex flex-wrap gap-2">
              {elig.departments.map((d: string) => (
                <span key={d} className="text-xs bg-stone-800 text-stone-300 px-2 py-1 rounded-full border border-stone-700">{d}</span>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Salary Details">
        <Field label="CTC" value={sal?.ctcRaw} />
        <Field label="Base Salary" value={sal?.baseRaw} />
        <Field label="Gross Salary" value={sal?.grossRaw} />
        <Field label="Joining Bonus" value={sal?.joiningBonus ? `${sal.joiningBonus.toLocaleString()}` : undefined} />
        <Field label="Relocation Bonus" value={sal?.relocationBonus ? `${sal.relocationBonus.toLocaleString()}` : undefined} />
        <Field label="Medical Allowance" value={sal?.medicalAllowance ? `${sal.medicalAllowance.toLocaleString()}` : undefined} />
        <Field label="Retention Bonus" value={sal?.retentionBonus ? `${sal.retentionBonus.toLocaleString()}` : undefined} />
        {sal?.ctcBreakup && (
          <div className="mt-3">
            <div className="text-stone-500 text-sm mb-2">CTC Breakup</div>
            <div className="text-stone-300 text-sm bg-stone-800/60 rounded-lg p-3 whitespace-pre-wrap border border-stone-700">{sal.ctcBreakup}</div>
          </div>
        )}
        {sal?.perks && (
          <div className="mt-3">
            <div className="text-stone-500 text-sm mb-2">Perks & Benefits</div>
            <div className="text-stone-300 text-sm bg-stone-800/60 rounded-lg p-3 border border-stone-700">{sal.perks}</div>
          </div>
        )}
      </Section>
    </Layout>
  );
}
