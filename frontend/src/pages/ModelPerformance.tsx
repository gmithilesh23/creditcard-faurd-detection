import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { fetchModelPerformance } from '../services/api';
import { ModelPerformanceData } from '../types';

export const ModelPerformance: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModelTab, setActiveModelTab] = useState('Random Forest');

  useEffect(() => {
    fetchModelPerformance()
      .then((res) => {
        setData(res);
        if (res.champion_model) setActiveModelTab(res.champion_model);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
        <p className="text-sm text-slate-400">Loading benchmark matrices and ROC/PR curves...</p>
      </div>
    );
  }

  const modelColors: Record<string, string> = {
    'Random Forest': '#3B82F6', // Blue
    'XGBoost': '#10B981',        // Emerald
    'Logistic Regression': '#F59E0B', // Amber
    'Decision Tree': '#8B5CF6',  // Purple
  };

  // Prepare combined ROC data for Recharts
  // Take 25 sampled steps
  const combinedRocData: any[] = [];
  const rfRoc = data.roc_curves['Random Forest'] || [];
  for (let i = 0; i < rfRoc.length; i++) {
    const pt: any = { fpr: rfRoc[i].x };
    for (const m of ['Random Forest', 'XGBoost', 'Logistic Regression', 'Decision Tree']) {
      const curve = data.roc_curves[m];
      if (curve && curve[i]) {
        pt[m] = curve[i].y;
      }
    }
    combinedRocData.push(pt);
  }

  // Prepare combined PR data for Recharts
  const combinedPrData: any[] = [];
  const rfPr = data.pr_curves['Random Forest'] || [];
  for (let i = 0; i < rfPr.length; i++) {
    const pt: any = { recall: rfPr[i].x };
    for (const m of ['Random Forest', 'XGBoost', 'Logistic Regression', 'Decision Tree']) {
      const curve = data.pr_curves[m];
      if (curve && curve[i]) {
        pt[m] = curve[i].y;
      }
    }
    combinedPrData.push(pt);
  }

  const selectedCm = data.confusion_matrices[activeModelTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-brand-cyan" /> Machine Learning Algorithm Benchmarking
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Comparative evaluation of Random Forest, XGBoost, Logistic Regression, and Decision Tree on 56,962 unseen validation test samples.
        </p>
      </div>

      {/* Champion Selection Rationale Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 via-navy-900 to-navy-900 border border-brand-blue/40 rounded-2xl p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-blue/20 text-brand-cyan rounded-xl border border-brand-blue/40 flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Production Champion: {data.champion_model}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE INFERENCE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {data.selection_rationale}
            </p>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison Table */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
        <h3 className="text-sm font-bold text-white tracking-tight mb-1">
          Model Evaluation Benchmark Matrix
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Precision-Recall AUC and F1-Score are primary drivers due to 0.17% population class imbalance
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-850 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Raw Accuracy</th>
                <th className="py-3 px-4">Precision (Fraud)</th>
                <th className="py-3 px-4">Recall (Fraud)</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">PR-AUC</th>
                <th className="py-3 px-4 text-right">Deployment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {data.benchmark_table.map((row) => (
                <tr
                  key={row.model_name}
                  onClick={() => setActiveModelTab(row.model_name)}
                  className={`hover:bg-navy-850/60 cursor-pointer transition ${
                    activeModelTab === row.model_name ? 'bg-navy-850/80 font-bold' : ''
                  }`}
                >
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: modelColors[row.model_name] }}
                    />
                    <span className="text-white font-semibold">{row.model_name}</span>
                    {row.is_champion && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-blue/20 text-brand-cyan border border-brand-blue/30">
                        Champion
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{(row.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 font-mono text-cyan-400 font-bold">{(row.precision * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{(row.recall * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 font-mono text-white font-bold">{row.f1_score.toFixed(4)}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{row.roc_auc.toFixed(4)}</td>
                  <td className="py-3 px-4 font-mono text-amber-400 font-bold">{row.pr_auc.toFixed(4)}</td>
                  <td className="py-3 px-4 text-right">
                    {row.is_champion ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Deployed
                      </span>
                    ) : (
                      <span className="text-slate-400">Archived Benchmark</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: ROC Curve & PR Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curves */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Receiver Operating Characteristic (ROC)</h3>
              <p className="text-xs text-slate-400">True Positive Rate (TPR) vs. False Positive Rate (FPR)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedRocData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="fpr" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {Object.keys(modelColors).map((m) => (
                  <Line
                    key={m}
                    type="monotone"
                    dataKey={m}
                    stroke={modelColors[m]}
                    strokeWidth={m === 'Random Forest' ? 3 : 1.5}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precision-Recall Curves */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Precision-Recall Curve (PR-AUC)</h3>
              <p className="text-xs text-slate-400">Precision vs. Recall across decision thresholds</p>
            </div>
            <span className="text-xs text-cyan-400 font-mono">Decisive Metric</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedPrData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="recall" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {Object.keys(modelColors).map((m) => (
                  <Line
                    key={m}
                    type="monotone"
                    dataKey={m}
                    stroke={modelColors[m]}
                    strokeWidth={m === 'Random Forest' ? 3 : 1.5}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Confusion Matrix Explorer */}
      {selectedCm && (
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Confusion Matrix: <span className="text-brand-cyan">{activeModelTab}</span>
              </h3>
              <p className="text-xs text-slate-400">Class breakdown evaluated on holdout test set</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(data.confusion_matrices).map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveModelTab(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    activeModelTab === m
                      ? 'bg-brand-blue text-white shadow-glow-blue'
                      : 'bg-navy-850 text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-navy-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">True Negatives (TN)</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {selectedCm.true_negative.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Legitimate transactions correctly approved</p>
            </div>
            <div className="p-4 bg-navy-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">False Positives (FP)</span>
              <p className="text-xl font-bold font-mono text-amber-400 mt-1">
                {selectedCm.false_positive.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Legitimate accounts erroneously flagged</p>
            </div>
            <div className="p-4 bg-navy-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">False Negatives (FN)</span>
              <p className="text-xl font-bold font-mono text-rose-400 mt-1">
                {selectedCm.false_negative.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Fraud attempts missed by algorithm</p>
            </div>
            <div className="p-4 bg-navy-950 border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">True Positives (TP)</span>
              <p className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {selectedCm.true_positive.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Fraudulent transactions intercepted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

