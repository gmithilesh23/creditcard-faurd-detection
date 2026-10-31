import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { Badge, getRiskBadge, getStatusBadge } from '../components/Badge';
import { TransactionModal } from '../components/TransactionModal';
import { fetchDashboardOverview } from '../services/api';
import { DashboardOverview, Transaction } from '../types';

interface OverviewProps {
  onNavigateToMonitoring: () => void;
  onNavigateToDetection: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  onNavigateToMonitoring,
  onNavigateToDetection,
}) => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard overview', err);
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
        <p className="text-sm text-slate-400">Loading intelligence dashboard metrics...</p>
      </div>
    );
  }

  const { kpis, volume_trends, amount_distribution, hourly_patterns, risk_tier_distribution, recent_suspicious } = data;

  const pieColors = ['#10B981', '#F59E0B', '#F97316', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Executive Fraud Intelligence Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time transaction scoring, calibrated model predictions, and continuous threat monitoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3 py-1.5 bg-navy-850 hover:bg-navy-800 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Refresh Data
          </button>
          <button
            onClick={onNavigateToDetection}
            className="px-4 py-1.5 bg-gradient-to-r from-brand-blue to-cyan-500 hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-glow-blue transition"
          >
            + Test Transaction
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Transactions"
          value={kpis.total_transactions.toLocaleString()}
          subtitle="All transactions ingested"
          change="Real-time"
          isPositiveChange={true}
          icon={Layers}
          iconColor="text-blue-400"
          accentGradient="from-blue-500/20 to-transparent"
        />
        <KPICard
          title="Fraudulent Detected"
          value={kpis.fraudulent_transactions.toLocaleString()}
          subtitle={`${kpis.fraud_rate_pct}% population incidence`}
          change="Active Interceptions"
          isPositiveChange={false}
          icon={ShieldAlert}
          iconColor="text-rose-400"
          accentGradient="from-rose-500/20 to-transparent"
        />
        <KPICard
          title="Prevented Exposure"
          value={`$${kpis.total_fraud_amount.toLocaleString()}`}
          subtitle={`Avg Fraud: $${(kpis.total_fraud_amount / (kpis.fraudulent_transactions || 1)).toFixed(2)}`}
          change="Loss Mitigated"
          isPositiveChange={true}
          icon={DollarSign}
          iconColor="text-emerald-400"
          accentGradient="from-emerald-500/20 to-transparent"
        />
        <KPICard
          title="Model Precision-Recall AUC"
          value={`${kpis.model_pr_auc_pct}%`}
          subtitle={`Raw Accuracy: ${kpis.model_accuracy_pct}%`}
          change="Random Forest Champion"
          isPositiveChange={true}
          icon={Activity}
          iconColor="text-cyan-400"
          accentGradient="from-cyan-500/20 to-transparent"
        />
      </div>

      {/* Row 2: 14-Day Volume Trends & Risk Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Volume Trends Area Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">14-Day Transaction Volume & Risk Velocity</h3>
              <p className="text-xs text-slate-400">Total volume vs. intercepted suspicious alerts</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-blue" /> Total
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Fraud Alerts
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volume_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Area type="monotone" dataKey="total_count" name="Total Transactions" stroke="#3B82F6" strokeWidth={2} fill="url(#totalGrad)" />
                <Area type="monotone" dataKey="fraud_count" name="Fraud Alerts" stroke="#EF4444" strokeWidth={2} fill="url(#fraudGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Tier Donut Chart */}
        <div className="rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Portfolio Risk Segmentation</h3>
            <p className="text-xs text-slate-400">Transactions mapped to calibrated risk bands</p>
          </div>
          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk_tier_distribution}
                  dataKey="count"
                  nameKey="tier"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {risk_tier_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800">
            {risk_tier_distribution.map((tier, idx) => (
              <div key={tier.tier} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[idx] }} />
                <span className="text-slate-300 truncate">{tier.tier.split(' ')[0]}</span>
                <span className="ml-auto font-mono text-slate-400">{tier.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Amount Brackets & 24-Hour Fraud Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Amount Distribution Bar Chart */}
        <div className="rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Transaction Amount Distribution</h3>
              <p className="text-xs text-slate-400">Volume across micro, standard, and high-ticket brackets</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amount_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="range_label" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Total Ingested" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraud_count" name="Confirmed Fraud" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-Hour Pattern Line Chart */}
        <div className="rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">24-Hour Fraud Density Pattern</h3>
              <p className="text-xs text-slate-400">Fraud incident frequency by UTC transaction hour</p>
            </div>
            <span className="text-xs text-amber-400 font-medium">Spike Window: 01:00-04:00</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly_patterns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(h) => `${h}h`} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                  labelFormatter={(h) => `Hour ${h}:00 UTC`}
                />
                <Line type="monotone" dataKey="fraud_count" name="Fraud Alerts" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: '#F59E0B' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Recent High-Risk Suspicious Alerts Table */}
      <div className="rounded-2xl bg-navy-900 border border-slate-800 p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">High-Risk Threat Feed</h3>
            <p className="text-xs text-slate-400">Transactions exceeding critical risk thresholds</p>
          </div>
          <button
            onClick={onNavigateToMonitoring}
            className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-medium"
          >
            View All Transactions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-850 text-slate-400 uppercase tracking-wider font-semibold border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {recent_suspicious.map((txn) => (
                <tr
                  key={txn.transaction_id}
                  onClick={() => setSelectedTxn(txn)}
                  className="hover:bg-navy-850/70 cursor-pointer transition"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-white">{txn.transaction_id}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {txn.timestamp ? new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">${txn.transaction_amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-300">{txn.merchant_category || 'Retail'}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-rose-400">{txn.risk_score}/100</span>
                  </td>
                  <td className="py-3 px-4">{getRiskBadge(txn.risk_level, txn.risk_score)}</td>
                  <td className="py-3 px-4">{getStatusBadge(txn.status)}</td>
                  <td className="py-3 px-4 text-right">
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

      {/* Transaction Modal Detail */}
      {selectedTxn && (
        <TransactionModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onStatusUpdated={(updated) => {
            setSelectedTxn(updated);
            loadData();
          }}
        />
      )}
    </div>
  );
};

