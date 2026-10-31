import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Activity,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Bell,
  Database,
  Lock,
} from 'lucide-react';
import { fetchSettings, updateSettings, fetchHealth } from '../services/api';
import { SystemSetting } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [lowThresh, setLowThresh] = useState(30);
  const [medThresh, setMedThresh] = useState(60);
  const [highThresh, setHighThresh] = useState(80);
  const [autoBlockThresh, setAutoBlockThresh] = useState(85);
  const [activeModel, setActiveModel] = useState('Random Forest');

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, h] = await Promise.all([fetchSettings(), fetchHealth()]);
      setSettings(s);
      setHealth(h);

      const sMap: Record<string, string> = {};
      s.forEach((item) => {
        sMap[item.key] = item.value;
      });

      if (sMap['threshold_low']) setLowThresh(parseInt(sMap['threshold_low']));
      if (sMap['threshold_medium']) setMedThresh(parseInt(sMap['threshold_medium']));
      if (sMap['threshold_high']) setHighThresh(parseInt(sMap['threshold_high']));
      if (sMap['auto_block_threshold']) setAutoBlockThresh(parseInt(sMap['auto_block_threshold']));
      if (sMap['active_model']) setActiveModel(sMap['active_model']);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      await updateSettings({
        threshold_low: lowThresh,
        threshold_medium: medThresh,
        threshold_high: highThresh,
        auto_block_threshold: autoBlockThresh,
        active_model: activeModel,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
        <p className="text-sm text-slate-400">Loading system parameters and health checks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-cyan" /> System Settings & Risk Engine Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune operational risk boundaries, configure automatic freeze triggers, and monitor platform health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form (8 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          {/* Threshold Sliders & Inputs */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-blue" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Calibrated Operational Risk Thresholds
                </h3>
              </div>
              <span className="text-xs text-slate-400">Score Range: 0 - 100</span>
            </div>

            {/* Low Risk Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-emerald-400">Low Risk Upper Bound (Auto-Approve)</span>
                <span className="font-mono font-bold text-white">0 to {lowThresh}</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={lowThresh}
                onChange={(e) => setLowThresh(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-navy-950 rounded-lg h-2 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Transactions scoring below {lowThresh} are passed automatically with 0 friction.
              </p>
            </div>

            {/* Medium Risk Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-amber-400">Medium Risk Upper Bound (2FA / Step-Up)</span>
                <span className="font-mono font-bold text-white">{lowThresh + 1} to {medThresh}</span>
              </div>
              <input
                type="range"
                min="41"
                max="70"
                value={medThresh}
                onChange={(e) => setMedThresh(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-navy-950 rounded-lg h-2 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Scores between {lowThresh + 1} and {medThresh} trigger automated step-up authentication.
              </p>
            </div>

            {/* High Risk Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-orange-400">High Risk Upper Bound (Analyst Review)</span>
                <span className="font-mono font-bold text-white">{medThresh + 1} to {highThresh}</span>
              </div>
              <input
                type="range"
                min="71"
                max="85"
                value={highThresh}
                onChange={(e) => setHighThresh(parseInt(e.target.value))}
                className="w-full accent-orange-500 bg-navy-950 rounded-lg h-2 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Transactions between {medThresh + 1} and {highThresh} are held in queue for fraud analyst verification.
              </p>
            </div>

            {/* Auto-Block Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-rose-400">Immediate Auto-Block Threshold</span>
                <span className="font-mono font-bold text-white">&gt;= {autoBlockThresh}</span>
              </div>
              <input
                type="range"
                min="75"
                max="98"
                value={autoBlockThresh}
                onChange={(e) => setAutoBlockThresh(parseInt(e.target.value))}
                className="w-full accent-rose-500 bg-navy-950 rounded-lg h-2 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Scores at or exceeding {autoBlockThresh} immediately decline the transaction and freeze the card.
              </p>
            </div>
          </div>

          {/* Model Selection & Parameters */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Active Production Model Engine</h3>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Champion Inference Model
              </label>
              <select
                value={activeModel}
                onChange={(e) => setActiveModel(e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue"
              >
                <option value="Random Forest">Random Forest (Champion - PR-AUC 0.8900)</option>
                <option value="XGBoost">XGBoost Classifier (Benchmark - PR-AUC 0.8857)</option>
                <option value="Decision Tree">Decision Tree Classifier (Baseline)</option>
                <option value="Logistic Regression">Logistic Regression (Linear Baseline)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Switching models updates real-time transaction scoring across the monitoring engine.
              </p>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Operational thresholds updated successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Changes take effect immediately on next scored transaction.</span>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-blue to-cyan-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-glow-blue transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
            </button>
          </div>
        </form>

        {/* System Health & Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Health Status Card */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">API & Service Health</h3>
            </div>

            {health && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-navy-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Backend API</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Healthy
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-navy-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Database Engine</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" /> Connected
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-navy-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Transactions Ingested</span>
                  <span className="text-white font-mono font-bold">
                    {health.database_records?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-navy-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">ML Artifacts Status</span>
                  <span className="text-cyan-400 font-bold">
                    {health.model_artifacts_loaded ? 'Loaded (Active)' : 'Missing'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-navy-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Environment</span>
                  <span className="text-slate-300 font-mono uppercase">{health.environment}</span>
                </div>
              </div>
            )}
          </div>

          {/* Security & Access */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-card space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Lock className="w-4 h-4 text-brand-blue" />
              <h4 className="text-sm font-bold text-white">Analyst Credentials</h4>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Authenticated Session: <strong className="text-white">Sarah Chen</strong> (Lead Fraud Analyst). Permissions include rule configuration, card freezing, and audit log generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

