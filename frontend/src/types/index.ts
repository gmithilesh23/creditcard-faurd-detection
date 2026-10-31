/**
 * TypeScript Data Models for FinGuard Fraud Intelligence Platform
 */

export interface Transaction {
  transaction_id: string;
  transaction_time: number;
  transaction_amount: number;
  class_label?: number;
  prediction?: number;
  fraud_probability?: number;
  risk_score?: number;
  risk_level?: 'Low' | 'Medium' | 'High' | 'Critical';
  merchant_category?: string;
  card_type?: string;
  status?: 'Approved' | 'Flagged' | 'Blocked' | 'Under Review';
  timestamp?: string;
  v1?: number;
  v2?: number;
  v3?: number;
  v4?: number;
  v5?: number;
  v6?: number;
  v7?: number;
  v8?: number;
  v9?: number;
  v10?: number;
  v11?: number;
  v12?: number;
  v13?: number;
  v14?: number;
  v15?: number;
  v16?: number;
  v17?: number;
  v18?: number;
  v19?: number;
  v20?: number;
  v21?: number;
  v22?: number;
  v23?: number;
  v24?: number;
  v25?: number;
  v26?: number;
  v27?: number;
  v28?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FeatureInfluenceItem {
  feature: string;
  value: number;
  impact_score: number;
  direction: string;
  description: string;
}

export interface PredictionResult {
  transaction_id: string;
  prediction: 'Fraudulent' | 'Genuine';
  is_fraud: number;
  fraud_probability: number;
  risk_score: number;
  risk_classification: string;
  badge_color: string;
  confidence_pct: number;
  action_recommendation: string;
  top_influencing_features: FeatureInfluenceItem[];
  thresholds_used: {
    low: number;
    medium: number;
    high: number;
  };
  timestamp: string;
}

export interface KPICards {
  total_transactions: number;
  fraudulent_transactions: number;
  genuine_transactions: number;
  fraud_rate_pct: number;
  total_fraud_amount: number;
  total_volume_amount: number;
  avg_transaction_amount: number;
  high_risk_alerts_count: number;
  model_accuracy_pct: number;
  model_pr_auc_pct: number;
}

export interface VolumeTrendPoint {
  date: string;
  total_count: number;
  fraud_count: number;
  genuine_count: number;
  total_amount: number;
  fraud_amount: number;
}

export interface AmountBinItem {
  range_label: string;
  count: number;
  fraud_count: number;
  fraud_rate: number;
}

export interface HourlyPatternItem {
  hour: number;
  total_count: number;
  fraud_count: number;
  fraud_rate: number;
}

export interface RiskDistributionItem {
  tier: string;
  count: number;
  pct: number;
  color: string;
}

export interface DashboardOverview {
  kpis: KPICards;
  volume_trends: VolumeTrendPoint[];
  fraud_vs_genuine: {
    fraud_count: number;
    genuine_count: number;
    fraud_amount: number;
    genuine_amount: number;
    fraud_count_pct: number;
    genuine_count_pct: number;
  };
  amount_distribution: AmountBinItem[];
  hourly_patterns: HourlyPatternItem[];
  risk_tier_distribution: RiskDistributionItem[];
  recent_suspicious: Transaction[];
}

export interface CategoryBreakdownItem {
  category: string;
  total_count: number;
  fraud_count: number;
  fraud_rate: number;
  total_amount: number;
  avg_amount: number;
}

export interface CardTypeBreakdownItem {
  card_type: string;
  total_count: number;
  fraud_count: number;
  fraud_rate: number;
  total_amount: number;
}

export interface AnalyticsData {
  hourly_trends: HourlyPatternItem[];
  category_breakdown: CategoryBreakdownItem[];
  card_type_breakdown: CardTypeBreakdownItem[];
  amount_brackets: AmountBinItem[];
  summary_insights: string[];
}

export interface RiskTierSummary {
  tier: string;
  score_range: string;
  count: number;
  pct: number;
  fraud_count: number;
  total_amount: number;
  color: string;
  action: string;
}

export interface AnomalyPattern {
  id: string;
  title: string;
  description: string;
  affected_count: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  indicator: string;
}

export interface RiskAnalysisData {
  risk_tiers: RiskTierSummary[];
  risk_histogram: { bin: string; count: number; fraud_count: number }[];
  anomalies: AnomalyPattern[];
  high_risk_txns: Transaction[];
}

export interface GlobalSHAPItem {
  feature: string;
  importance: number;
  rank: number;
  correlation: string;
  description: string;
  sample_positive_val: number;
  sample_negative_val: number;
}

export interface DecisionRule {
  rule_id: string;
  condition: string;
  fraud_likelihood: string;
  confidence: number;
  support_count: number;
  explanation: string;
}

export interface AIInsightsData {
  model_name: string;
  methodology: string;
  global_features: GlobalSHAPItem[];
  decision_rules: DecisionRule[];
  fraud_behavior_archetypes: {
    name: string;
    risk: string;
    indicators: string[];
    description: string;
  }[];
}

export interface ModelBenchmarkRow {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  pr_auc: number;
  is_champion: boolean;
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface ConfusionMatrixData {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
}

export interface ModelPerformanceData {
  champion_model: string;
  benchmark_table: ModelBenchmarkRow[];
  confusion_matrices: Record<string, ConfusionMatrixData>;
  roc_curves: Record<string, CurvePoint[]>;
  pr_curves: Record<string, CurvePoint[]>;
  feature_importances: { feature: string; importance: number; rank: number }[];
  selection_rationale: string;
}

export interface SamplePreset {
  label: string;
  description: string;
  data: Record<string, number | string>;
}

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

