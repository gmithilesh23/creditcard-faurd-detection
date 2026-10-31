import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Layers,
  Info,
  RefreshCw,
  ExternalLink,
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
import { fetchRiskAnalysis } from '../services/api';
import { RiskAnalysisData, Transaction } from '../types';
import { getRiskBadge, getStatusBadge } from '../components/Badge';
import { TransactionModal } from '../components/TransactionModal';

export const RiskAnalysis: React.FC = () => {
  const [data, setData] = useState<RiskAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchRiskAnalysis();
      setData(res);
    } catch (err) {
      console.error('Failed to load risk analysis', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
        <p className="text-sm text-slate-400">Computing risk tier distributions and anomaly signatures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-brand-cyan" /> Enterprise Risk Tier Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational boundaries, risk score frequency histograms, and active threat patterns.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3.5 py-1.5 bg-navy-850 hover:bg-navy-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analysis
        </button>
      </div>

      {/* 4 Risk Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.risk_tiers.map((tier) => (
          <div
            key={tier.tier}
            className="rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {tier.tier}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-mono font-bold"
                  style={{ backgroundColor: `${tier.color}20`, color: tier.color, border: `1px solid ${tier.color}40` }}
                >
                  Score {tier.score_range}
                </span>
              </div>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">
                {tier.count.toLocaleString()} <span className="text-xs font-normal text-slate-400">({tier.pct}%)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Exposure: <span className="text-white font-mono font-medium">${tier.total_amount.toLocaleString()}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Action Protocol</span>
              <p className="text-slate-300 font-medium leading-relaxed">{tier.action}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Risk Score Histogram & Behavioral Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Score Histogram (7 cols) */}
        <div className="lg:col-span-7 bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Risk Score Frequency Histogram (0-100)</h3>
              <p className="text-xs text-slate-400">Transaction counts across calibrated 10-point probability buckets</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.risk_histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="bin" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                  labelFormatter={(b) => `Risk Score Range: ${b}`}
                />
                <Bar dataKey="count" name="Total Ingested" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraud_count" name="Confirmed Fraud" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            The bimodal distribution confirms sharp model separation between low-risk authentic transactions (0-20) and clustered high-risk synthetic attempts (80-100).
          </p>
        </div>

        {/* Detected Anomaly Patterns (5 cols) */}
        <div className="lg:col-span-5 bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight mb-1">
              Active Behavioral Threat Signatures
            </h3>
            <p className="text-xs text-slate-400 mb-4">Heuristic pattern flags matched against incoming streams</p>

            <div className="space-y-3">
              {data.anomalies.map((anom) => (
                <div key={anom.id} className="p-3 bg-navy-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{anom.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        anom.severity === 'Critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : anom.severity === 'High'
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {anom.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{anom.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-850 text-[10px] text-slate-400">
                    <span className="font-mono text-cyan-400">{anom.indicator}</span>
                    <span className="font-semibold text-slate-300">{anom.affected_count} matches</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: High-Risk Transactions Table */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
        <h3 className="text-sm font-bold text-white tracking-tight mb-1">Top Critical Risk Transactions</h3>
        <p className="text-xs text-slate-400 mb-4">Urgent items flagged by the Random Forest inference engine</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-850 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Transaction ID</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Card Type</th>
                <th className="py-2.5 px-4">Risk Score</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Drilldown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {data.high_risk_txns.map((txn) => (
                <tr
                  key={txn.transaction_id}
                  onClick={() => setSelectedTxn(txn)}
                  className="hover:bg-navy-850/70 cursor-pointer transition"
                >
                  <td className="py-2.5 px-4 font-mono font-semibold text-white">{txn.transaction_id}</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">${txn.transaction_amount.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-slate-300">{txn.merchant_category || 'Retail'}</td>
                  <td className="py-2.5 px-4 text-slate-400">{txn.card_type}</td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono font-bold text-rose-400">{txn.risk_score}/100</span>
                  </td>
                  <td className="py-2.5 px-4">{getStatusBadge(txn.status)}</td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTxn(txn);
                      }}
                      className="text-xs text-brand-blue hover:text-brand-cyan transition font-semibold"
                    >
                      Investigate →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTxn && (
        <TransactionModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onStatusUpdated={(u) => {
            setSelectedTxn(u);
            loadData();
          }}
        />
      )}
    </div>
  );
};

