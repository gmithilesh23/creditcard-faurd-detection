import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle,
  FileText,
  DollarSign,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { fetchReportsSummary, exportTransactionsCSVUrl } from '../services/api';

export const Reports: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
        <p className="text-sm text-slate-400">Compiling executive audit summary report...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-brand-cyan" /> Risk Intelligence & Compliance Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-grade summaries, regulatory compliance attestations, and raw transaction data exports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-navy-850 hover:bg-navy-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-slate-400" /> Print Summary
          </button>
        </div>
      </div>

      {/* Executive Report Card */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-cyan-400">{summary.report_id}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                AUDIT VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Generated: {new Date(summary.generated_at).toUTCString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-white">{summary.compliance_status}</p>
            <p className="text-[11px] text-slate-400 font-mono">Model Engine: {summary.model_version}</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-navy-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Monitored</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">
              {summary.total_monitored.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Ingested card transactions</p>
          </div>
          <div className="p-4 bg-navy-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">Fraud Intercepted</span>
            <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {summary.total_fraud_identified.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Confirmed fraudulent events</p>
          </div>
          <div className="p-4 bg-navy-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">Prevented Loss</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              ${summary.prevented_loss_usd.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Mitigated financial damages</p>
          </div>
          <div className="p-4 bg-navy-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">False Positive Rate</span>
            <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {summary.false_positive_rate}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Legitimate customer friction</p>
          </div>
        </div>

        {/* Data Export Options */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Download className="w-4 h-4 text-brand-cyan" /> Audit-Grade Data Exports (CSV)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href={exportTransactionsCSVUrl('all')}
              download
              className="p-4 rounded-xl bg-navy-950 hover:bg-navy-850 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-white group-hover:text-brand-cyan transition">Full Ingested Log</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All monitored transactions & risk scores</p>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </a>
            <a
              href={exportTransactionsCSVUrl('high_risk')}
              download
              className="p-4 rounded-xl bg-navy-950 hover:bg-navy-850 border border-slate-800 hover:border-orange-500/50 transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-white group-hover:text-orange-400 transition">High Risk Alerts</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Transactions with risk score &gt;= 60</p>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </a>
            <a
              href={exportTransactionsCSVUrl('fraud_only')}
              download
              className="p-4 rounded-xl bg-navy-950 hover:bg-navy-850 border border-slate-800 hover:border-rose-500/50 transition flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-white group-hover:text-rose-400 transition">Confirmed Fraud Feed</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Verified fraud cases for dispute filing</p>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </a>
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Regulatory Compliance Controls
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-navy-950 border border-slate-800 rounded-xl flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white">PCI-DSS Requirement 10.2</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Automated audit trails recorded for all transaction inquiries and score changes.</p>
              </div>
            </div>
            <div className="p-3 bg-navy-950 border border-slate-800 rounded-xl flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white">Explainability & Adverse Action (FCRA)</span>
                <p className="text-slate-400 text-[11px] mt-0.5">TreeSHAP decision drivers satisfy transparent regulatory reason coding for declined transactions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

