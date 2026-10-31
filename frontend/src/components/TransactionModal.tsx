import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle, Lock, ArrowUpRight, DollarSign, Calendar, CreditCard, Tag } from 'lucide-react';
import { Transaction } from '../types';
import { RiskGauge } from './RiskGauge';
import { getRiskBadge, getStatusBadge } from './Badge';
import { updateTransactionStatus } from '../services/api';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onStatusUpdated?: (updated: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onStatusUpdated,
}) => {
  const [updating, setUpdating] = useState(false);
  const [currentTxn, setCurrentTxn] = useState<Transaction | null>(transaction);

  if (!transaction) return null;

  const txn = currentTxn || transaction;

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      const res = await updateTransactionStatus(txn.transaction_id, newStatus);
      setCurrentTxn(res);
      if (onStatusUpdated) onStatusUpdated(res);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdating(false);
    }
  };

  // Collect PCA features
  const pcaFeatures: { key: string; val: number }[] = [];
  for (let i = 1; i <= 28; i++) {
    const val = (txn as any)[`v${i}`];
    if (val !== undefined && val !== null) {
      pcaFeatures.push({ key: `V${i}`, val: Number(val) });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy-800 border border-slate-700 rounded-xl text-blue-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono tracking-tight text-white">{txn.transaction_id}</h2>
                {getRiskBadge(txn.risk_level, txn.risk_score)}
                {getStatusBadge(txn.status)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Recorded: {txn.timestamp ? new Date(txn.timestamp).toLocaleString() : 'N/A'} • Time Delta: {txn.transaction_time}s
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          {/* Risk Gauge & Probabilities */}
          <div className="bg-navy-850/80 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <RiskGauge
              score={txn.risk_score ?? 0}
              size={180}
              label="Calculated Risk Score"
              classification={`${txn.risk_level ?? 'Low'} Risk Tier`}
            />
            <div className="w-full mt-3 pt-2 text-xs flex justify-between px-2 text-slate-400">
              <span>Model Probability:</span>
              <span className="font-mono text-white font-semibold">
                {((txn.fraud_probability ?? 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="w-full mt-1.5 text-xs flex justify-between px-2 text-slate-400">
              <span>Ground Truth:</span>
              <span className={`font-mono font-semibold ${txn.class_label === 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {txn.class_label === 1 ? 'Fraudulent' : 'Genuine'}
              </span>
            </div>
          </div>

          {/* Core Metadata */}
          <div className="md:col-span-2 bg-navy-850/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">Transaction Attributes</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-navy-900/90 rounded-lg border border-slate-800">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-[11px] text-slate-400">Transaction Amount</p>
                  <p className="text-lg font-bold font-mono text-white">${txn.transaction_amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-navy-900/90 rounded-lg border border-slate-800">
                <Tag className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-[11px] text-slate-400">Merchant Category</p>
                  <p className="text-sm font-semibold text-white">{txn.merchant_category || 'General Retail'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-navy-900/90 rounded-lg border border-slate-800">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-[11px] text-slate-400">Payment Instrument</p>
                  <p className="text-sm font-semibold text-white">{txn.card_type || 'Visa Platinum'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-navy-900/90 rounded-lg border border-slate-800">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-[11px] text-slate-400">Operational Status</p>
                  <p className="text-sm font-semibold text-white">{txn.status || 'Approved'}</p>
                </div>
              </div>
            </div>

            {/* Analyst Action Bar */}
            <div className="pt-3 border-t border-slate-800">
              <p className="text-xs text-slate-400 mb-2 font-medium">Analyst Disposition Action:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange('Approved')}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve Transaction
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange('Flagged')}
                  className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Flag for Review
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange('Blocked')}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" /> Block & Lock Card
                </button>
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange('Under Review')}
                  className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  Under Investigation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 28 PCA Feature Heatmap Drilldown */}
        <div className="bg-navy-850/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              Anonymized PCA Transformed Feature Vectors (V1 - V28)
            </h4>
            <span className="text-[11px] text-slate-400">Deviations &gt; |2.0| flagged in orange/red</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {pcaFeatures.map((f) => {
              const absVal = Math.abs(f.val);
              let tagStyle = 'bg-navy-900 border-slate-800 text-slate-300';
              if (absVal > 3.5) tagStyle = 'bg-rose-950/40 border-rose-700/60 text-rose-300 font-bold';
              else if (absVal > 2.0) tagStyle = 'bg-amber-950/40 border-amber-700/50 text-amber-300';
              else if (absVal < 0.5) tagStyle = 'bg-navy-900/60 border-slate-800/60 text-slate-400';

              return (
                <div key={f.key} className={`p-2 rounded-lg border text-center font-mono ${tagStyle}`}>
                  <p className="text-[10px] text-slate-400">{f.key}</p>
                  <p className="text-xs truncate">{f.val.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

