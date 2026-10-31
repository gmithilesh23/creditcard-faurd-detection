import React, { useState, useEffect } from 'react';
import {
  ScanEye,
  Sparkles,
  Zap,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { runPrediction, fetchSamplePresets } from '../services/api';
import { PredictionResult, SamplePreset } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { Badge } from '../components/Badge';

export const FraudDetection: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, any>>({
    Time: 406.0,
    Amount: 289.50,
    merchant_category: 'Crypto Exchange',
    card_type: 'Mastercard World Elite',
    V1: -2.31, V2: 1.95, V3: -1.61, V4: 3.99, V5: -0.52,
    V6: -1.43, V7: -2.54, V8: 1.39, V9: -2.77, V10: -2.77,
    V11: 3.20, V12: -2.90, V13: -0.59, V14: -4.29, V15: 0.39,
    V16: -1.14, V17: -2.83, V18: -0.01, V19: 0.42, V20: 0.13,
    V21: 0.52, V22: -0.04, V23: -0.47, V24: 0.32, V25: 0.04,
    V26: 0.18, V27: 0.26, V28: -0.14
  });

  const [presets, setPresets] = useState<SamplePreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [showAllPca, setShowAllPca] = useState(false);

  useEffect(() => {
    fetchSamplePresets().then((p) => {
      setPresets(p);
    }).catch(console.error);
  }, []);

  const handleInputChange = (field: string, val: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleApplyPreset = (preset: SamplePreset) => {
    setFormData({ ...preset.data });
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await runPrediction(formData);
      setResult(res);
    } catch (err) {
      console.error('Prediction failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ScanEye className="w-6 h-6 text-brand-cyan" /> Real-Time Machine Learning Inference Engine
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Evaluate arbitrary transaction features through the Random Forest Champion model, generating calibrated risk scores and SHAP explainability.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            One-Click Test Scenarios (From Kaggle Validation Holdout)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-left p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-slate-700/70 hover:border-brand-blue/50 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-brand-cyan transition">
                  {p.label}
                </span>
                <Zap className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Panel (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-card space-y-5">
          <h3 className="text-sm font-bold text-white tracking-tight pb-3 border-b border-slate-800">
            Transaction Parameters & Anonymized PCA Features
          </h3>

          {/* Primary Transaction Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transaction Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.Amount ?? 100}
                onChange={(e) => handleInputChange('Amount', parseFloat(e.target.value) || 0)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-brand-blue"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Time Delta (Seconds)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.Time ?? 0}
                onChange={(e) => handleInputChange('Time', parseFloat(e.target.value) || 0)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-brand-blue"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Merchant Category
              </label>
              <select
                value={formData.merchant_category ?? 'Crypto Exchange'}
                onChange={(e) => handleInputChange('merchant_category', e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue"
              >
                <option value="Online Retail">Online Retail</option>
                <option value="Crypto Exchange">Crypto Exchange</option>
                <option value="Luxury Goods">Luxury Goods</option>
                <option value="Electronics">Electronics</option>
                <option value="Travel & Airlines">Travel & Airlines</option>
                <option value="Gaming & Digital">Gaming & Digital</option>
                <option value="Transportation">Transportation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Instrument
              </label>
              <select
                value={formData.card_type ?? 'Mastercard World Elite'}
                onChange={(e) => handleInputChange('card_type', e.target.value)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue"
              >
                <option value="Visa Platinum">Visa Platinum</option>
                <option value="Visa Signature">Visa Signature</option>
                <option value="Mastercard World Elite">Mastercard World Elite</option>
                <option value="American Express Gold">American Express Gold</option>
                <option value="Discover Cash Back">Discover Cash Back</option>
              </select>
            </div>
          </div>

          {/* Core Decision Features (V14, V17, V12, V10, V4, V11) */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-cyan-400">
                Primary Predictive Factors (Top SHAP Ranked)
              </span>
              <span className="text-[11px] text-slate-400">Values typically between -10 and +10</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['V14', 'V17', 'V12', 'V10', 'V4', 'V11'].map((feat) => (
                <div key={feat} className="bg-navy-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-mono text-slate-400">{feat}</span>
                    <span className="text-[9px] text-slate-400">Imp Rank</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData[feat] ?? 0}
                    onChange={(e) => handleInputChange(feat, parseFloat(e.target.value) || 0)}
                    className="w-full bg-navy-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Remaining PCA Features Accordion */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAllPca(!showAllPca)}
              className="w-full py-2 px-3 rounded-xl bg-navy-850 hover:bg-navy-800 text-xs font-semibold text-slate-300 flex items-center justify-between transition"
            >
              <span>{showAllPca ? 'Collapse' : 'Show All'} 22 Remaining PCA Vectors (V1-V28)</span>
              {showAllPca ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAllPca && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3 p-3 bg-navy-950/70 rounded-xl border border-slate-800">
                {Array.from({ length: 28 }, (_, i) => `V${i + 1}`)
                  .filter((v) => !['V14', 'V17', 'V12', 'V10', 'V4', 'V11'].includes(v))
                  .map((feat) => (
                    <div key={feat} className="p-1.5 bg-navy-900 rounded border border-slate-800/80">
                      <span className="block text-[10px] font-mono text-slate-400">{feat}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData[feat] ?? 0}
                        onChange={(e) => handleInputChange(feat, parseFloat(e.target.value) || 0)}
                        className="w-full bg-navy-950 border border-slate-700/60 rounded px-1.5 py-0.5 text-[11px] font-mono text-white"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-brand-blue to-cyan-500 hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-glow-blue transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating ML Pipeline...
              </>
            ) : (
              <>
                <ScanEye className="w-4 h-4" /> Score Transaction & Generate AI Explanation
              </>
            )}
          </button>
        </form>

        {/* Prediction Results Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-card space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inference Output</span>
                <span className="text-xs font-mono text-cyan-400">{result.transaction_id}</span>
              </div>

              {/* Risk Gauge */}
              <div className="flex flex-col items-center bg-navy-850/80 rounded-xl p-5 border border-slate-800">
                <RiskGauge
                  score={result.risk_score}
                  size={200}
                  label="Calibrated Risk Score"
                  classification={result.risk_classification}
                />

                <div className="w-full mt-2 grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-2.5 bg-navy-900 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Fraud Probability</p>
                    <p className="font-mono font-bold text-white text-sm mt-0.5">{(result.fraud_probability * 100).toFixed(2)}%</p>
                  </div>
                  <div className="p-2.5 bg-navy-900 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Model Confidence</p>
                    <p className="font-mono font-bold text-cyan-400 text-sm mt-0.5">{result.confidence_pct}%</p>
                  </div>
                </div>
              </div>

              {/* Action Recommendation Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  result.risk_score > 60
                    ? 'bg-rose-950/40 border-rose-600/40 text-rose-300'
                    : result.risk_score > 30
                    ? 'bg-amber-950/40 border-amber-600/40 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                }`}
              >
                {result.risk_score > 60 ? (
                  <Lock className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                ) : result.risk_score > 30 ? (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide">Operational Action Recommendation</p>
                  <p className="text-xs mt-0.5 font-medium leading-relaxed">{result.action_recommendation}</p>
                </div>
              </div>

              {/* Top Influencing Features (SHAP Drivers) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Key Feature Influences (TreeSHAP)
                </h4>
                <div className="space-y-2">
                  {result.top_influencing_features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-navy-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{feat.feature}</span>
                          <span className="font-mono text-[11px] text-slate-400">({feat.value > 0 ? `+${feat.value}` : feat.value})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{feat.description}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border ${
                          feat.direction.includes('Elevates')
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {feat.direction}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-navy-900 border border-slate-800 rounded-2xl p-8 shadow-card text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-4">
                <ScanEye className="w-8 h-8 text-brand-cyan" />
              </div>
              <h3 className="text-base font-bold text-white">Inference Engine Awaiting Input</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Select a preset scenario above or manually adjust parameters on the left to trigger the real-time calibrated scoring model.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

