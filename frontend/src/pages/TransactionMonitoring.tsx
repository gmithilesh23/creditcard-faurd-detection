import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';
import { fetchTransactions, exportTransactionsCSVUrl, updateTransactionStatus } from '../services/api';
import { Transaction, TransactionListResponse } from '../types';
import { Badge, getRiskBadge, getStatusBadge } from '../components/Badge';
import { TransactionModal } from '../components/TransactionModal';

export const TransactionMonitoring: React.FC = () => {
  const [data, setData] = useState<TransactionListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetchTransactions({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        risk_level: riskFilter !== 'all' ? riskFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page, pageSize, statusFilter, riskFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  };

  const handleSortToggle = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Real-Time Transaction Monitoring</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit, triage, and take operational actions on ingested credit card transactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={exportTransactionsCSVUrl(riskFilter === 'High' || riskFilter === 'Critical' ? 'high_risk' : 'all')}
            download
            className="px-3.5 py-1.5 bg-navy-850 hover:bg-navy-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-brand-cyan" /> Export Audit CSV
          </a>
          <button
            onClick={loadTransactions}
            className="p-2 bg-navy-850 hover:bg-navy-800 border border-slate-700/80 rounded-xl text-slate-300 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-cyan' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Category, Card..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-blue transition"
            />
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-navy-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-blue transition"
            >
              <option value="all">All Risk Tiers</option>
              <option value="Low">Low Risk (0-30)</option>
              <option value="Medium">Medium Risk (31-60)</option>
              <option value="High">High Risk (61-80)</option>
              <option value="Critical">Critical Risk (81-100)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-navy-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-blue transition"
            >
              <option value="all">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Flagged">Flagged</option>
              <option value="Blocked">Blocked</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-850 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                  onClick={() => handleSortToggle('timestamp')}
                >
                  <span className="flex items-center gap-1">
                    Timestamp <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                  onClick={() => handleSortToggle('transaction_amount')}
                >
                  <span className="flex items-center gap-1">
                    Amount ($) <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white transition"
                  onClick={() => handleSortToggle('risk_score')}
                >
                  <span className="flex items-center gap-1">
                    Risk Score <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 text-brand-cyan animate-spin mx-auto mb-2" />
                    Querying transactions database...
                  </td>
                </tr>
              ) : !data || data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                data.transactions.map((txn) => (
                  <tr
                    key={txn.transaction_id}
                    onClick={() => setSelectedTxn(txn)}
                    className="hover:bg-navy-850/70 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-white">{txn.transaction_id}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {txn.timestamp ? new Date(txn.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">${txn.transaction_amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-300">{txn.merchant_category || 'Retail'}</td>
                    <td className="py-3 px-4 text-slate-400">{txn.card_type || 'Visa'}</td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold ${
                        (txn.risk_score ?? 0) > 60 ? 'text-rose-400' : (txn.risk_score ?? 0) > 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {txn.risk_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">{getRiskBadge(txn.risk_level, txn.risk_score)}</td>
                    <td className="py-3 px-4">{getStatusBadge(txn.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTxn(txn);
                        }}
                        className="p-1.5 bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                        title="View Full PCA & Explainability"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-t border-slate-800 text-xs text-slate-400 gap-3">
            <div>
              Showing <span className="font-semibold text-white">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-white">{Math.min(page * pageSize, data.total)}</span> of{' '}
              <span className="font-semibold text-white">{data.total.toLocaleString()}</span> entries
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-navy-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
              >
                <option value={15}>15 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg bg-navy-850 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-navy-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-white">
                Page {page} of {data.total_pages || 1}
              </span>
              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-navy-850 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-navy-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drilldown Modal */}
      {selectedTxn && (
        <TransactionModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onStatusUpdated={(updated) => {
            setSelectedTxn(updated);
            loadTransactions();
          }}
        />
      )}
    </div>
  );
};

