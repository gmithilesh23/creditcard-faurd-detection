import React, { useState } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  ScanEye,
  BarChart3,
  AlertTriangle,
  Sparkles,
  Cpu,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Bell,
  Search,
  User,
  ExternalLink
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Transaction Monitoring', icon: CreditCard },
    { id: 'detection', label: 'Fraud Detection (Live ML)', icon: ScanEye },
    { id: 'analytics', label: 'Transaction Analytics', icon: BarChart3 },
    { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'insights', label: 'AI Insights (SHAP)', icon: Sparkles },
    { id: 'performance', label: 'Model Performance', icon: Cpu },
    { id: 'reports', label: 'Reports & Audit', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const notifications = [
    { id: 1, title: 'High Risk Alert Intercepted', desc: 'TXN-100412 ($1,450.00) blocked via velocity rule.', time: '2m ago', type: 'crit' },
    { id: 2, title: 'Model Calibrated', desc: 'Random Forest Champion inference pipeline refreshed.', time: '45m ago', type: 'info' },
    { id: 3, title: 'Threshold Shift', desc: 'Auto-block threshold active at 85/100 risk score.', time: '2h ago', type: 'warn' },
  ];

  return (
    <div className="flex h-screen bg-[#070B14] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside
        className={`relative flex flex-col bg-navy-900 border-r border-slate-800 transition-all duration-300 z-30 select-none ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center shadow-glow-blue flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  FinGuard <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-blue/20 text-brand-cyan border border-brand-cyan/30">AI</span>
                </h1>
                <p className="text-[11px] text-slate-400 truncate">Fraud Intelligence Platform</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/10 text-brand-cyan border border-brand-blue/40 shadow-glow-blue'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-850'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-brand-cyan' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan ml-auto animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Operational Status Pill */}
        {!collapsed && (
          <div className="px-3 py-2 mx-3 mb-3 bg-navy-850 border border-slate-800 rounded-xl text-[11px]">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Pipeline Online</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Model: Random Forest Champion</p>
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs flex-shrink-0">
            SC
          </div>
          {!collapsed && (
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">Sarah Chen</p>
              <p className="text-[10px] text-slate-400 truncate">Lead Fraud Analyst</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-navy-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white tracking-tight capitalize">
              {navItems.find((n) => n.id === activeTab)?.label || 'Overview'}
            </h2>
            <div className="hidden md:flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-navy-800 border border-slate-700/60 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              European Cardholder Dataset (284k benchmark)
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Live Predict Shortcut */}
            <button
              onClick={() => setActiveTab('detection')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/20 hover:bg-brand-blue/30 border border-brand-blue/40 text-brand-cyan rounded-lg text-xs font-semibold transition"
            >
              <ScanEye className="w-4 h-4" /> Score Transaction
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-navy-900 border border-slate-700/80 rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Security Alerts</span>
                    <span className="text-[10px] text-cyan-400">3 New</span>
                  </div>
                  <div className="divide-y divide-slate-800/60 mt-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-2.5 text-xs">
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#070B14]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

