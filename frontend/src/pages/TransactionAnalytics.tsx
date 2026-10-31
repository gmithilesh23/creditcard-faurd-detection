import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Clock,
  Tag,
  CreditCard,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { fetchAnalytics } from '../services/api';
import { AnalyticsData } from '../types';

export const TransactionAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics', err);
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
        <p className="text-sm text-slate-400">Computing multidimensional transaction analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-cyan" /> Multidimensional Transaction Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Behavioral analysis across 24-hour cycles, merchant categories, payment methods, and ticket brackets.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3.5 py-1.5 bg-navy-850 hover:bg-navy-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Strategic Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.summary_insights.map((insight, idx) => (
          <div key={idx} className="bg-navy-900 border border-slate-800 rounded-2xl p-4 shadow-card flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-navy-800 text-brand-cyan border border-slate-700/80 mt-0.5 flex-shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                Strategic Discovery #{idx + 1}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{insight}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Category Breakdown & Card Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant Category Breakdown */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-blue" /> Merchant Category Risk Exposure
              </h3>
              <p className="text-xs text-slate-400">Total volume ingested vs. confirmed fraudulent attempts</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.category_breakdown}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis dataKey="category" type="category" stroke="#94A3B8" fontSize={11} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total_count" name="Total Volume" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="fraud_count" name="Fraud Alerts" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Instrument Breakdown */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" /> Payment Instrument Fraud Rates
              </h3>
              <p className="text-xs text-slate-400">Distribution across card types and associated incidence %</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.card_type_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="card_type" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total_count" name="Total Volume" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraud_count" name="Fraud Count" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Hourly Patterns & Ticket Size Brackets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 24-Hour Fraud Rate Percentage */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Hourly Fraud Incidence Velocity (%)
              </h3>
              <p className="text-xs text-slate-400">Percentage of transactions flagged as fraud by UTC hour</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(h) => `${h}h`} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                  labelFormatter={(h) => `Hour ${h}:00 UTC`}
                />
                <Line
                  type="monotone"
                  dataKey="fraud_rate"
                  name="Fraud Rate %"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#F59E0B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Amount Bracket Analysis Table */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Amount Tier Vulnerability Breakdown
            </h3>
            <p className="text-xs text-slate-400">Volume and fraud density grouped by monetary ranges</p>
          </div>
          <div className="overflow-x-auto my-3">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-850 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Bracket</th>
                  <th className="py-2.5 px-3">Total Txns</th>
                  <th className="py-2.5 px-3">Fraud Count</th>
                  <th className="py-2.5 px-3 text-right">Fraud Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {data.amount_brackets.map((b) => (
                  <tr key={b.range_label} className="hover:bg-navy-850/50">
                    <td className="py-2.5 px-3 font-semibold text-white">{b.range_label}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono">{b.count.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-rose-400 font-mono font-bold">{b.fraud_count}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                      {b.fraud_rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Note: Attackers frequently execute micro-authorizations ($0-$25) to probe card validity before initiating institutional drains.
          </div>
        </div>
      </div>
    </div>
  );
};

