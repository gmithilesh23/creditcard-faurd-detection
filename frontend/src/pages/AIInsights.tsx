import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Cpu,
  HelpCircle,
  FileCode,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { fetchAIInsights } from '../services/api';
import { AIInsightsData } from '../types';

export const AIInsights: React.FC = () => {
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIInsights()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
        <p className="text-sm text-slate-400">Loading TreeSHAP explainability vectors and rule engines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-cyan" /> Explainable AI (XAI) & TreeSHAP Decision Drivers
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Auditable decision boundaries, global Shapley additive importances, and behavioral fraud patterns.
        </p>
      </div>

      {/* Methodology Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-navy-900 to-cyan-950/40 border border-brand-blue/30 rounded-2xl p-4 shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-blue/20 text-brand-cyan border border-brand-blue/40">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {data.model_name}
            </span>
            <p className="text-xs text-slate-300 mt-0.5">{data.methodology}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 100 Tree Estimators
        </div>
      </div>

      {/* Row 2: Global SHAP Feature Importance Chart & Detailed Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight mb-1">
              Global Feature Importance (TreeSHAP)
            </h3>
            <p className="text-xs text-slate-400 mb-4">Mean absolute Shapley contribution across validation population</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.global_features}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis dataKey="feature" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}% Weight`, 'TreeSHAP Score']}
                />
                <Bar dataKey="importance" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Explanations Feed (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-bold text-white tracking-tight mb-1">
            Plain-English Feature Interpretations
          </h3>
          <p className="text-xs text-slate-400 mb-4">How PCA vectors map to real banking risk factors</p>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {data.global_features.map((feat) => (
              <div key={feat.feature} className="p-3 bg-navy-950 border border-slate-800 rounded-xl text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{feat.feature}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Rank #{feat.rank}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      feat.correlation.includes('Negative')
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : feat.correlation.includes('Positive')
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {feat.correlation} Correlation
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{feat.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-850">
                  <span>Fraud Sample Mean: <strong className="text-rose-400">{feat.sample_positive_val}</strong></span>
                  <span>Genuine Sample Mean: <strong className="text-emerald-400">{feat.sample_negative_val}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Transparent Decision Tree Rules & Archetypes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Extracted Decision Boundaries */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Production Decision Boundaries (Tree Surrogate Rules)
            </h3>
          </div>
          <div className="space-y-3">
            {data.decision_rules.map((rule) => (
              <div key={rule.rule_id} className="p-3.5 bg-navy-950 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-cyan-400">{rule.rule_id}</span>
                  <span className="text-xs font-bold text-white font-mono">{rule.fraud_likelihood}</span>
                </div>
                <div className="p-2 rounded bg-navy-900 border border-slate-800 font-mono text-[11px] text-amber-300">
                  {rule.condition}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{rule.explanation}</p>
                <div className="mt-2 text-[10px] text-slate-400 flex justify-between font-mono">
                  <span>Confidence: {(rule.confidence * 100).toFixed(1)}%</span>
                  <span>Validated Support: {rule.support_count.toLocaleString()} rows</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fraud Behavior Archetypes */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Behavioral Fraud Archetypes
            </h3>
          </div>
          <div className="space-y-3">
            {data.fraud_behavior_archetypes.map((arch, idx) => (
              <div key={idx} className="p-3.5 bg-navy-950 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{arch.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      arch.risk === 'Critical'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {arch.risk} Threat
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">{arch.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {arch.indicators.map((ind, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-900 border border-slate-800 text-slate-400">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

