import React from 'react';
import { Language, Commodity } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowRightLeft,
  Database,
  Sparkles,
  Cpu,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
  selectedCommodity: Commodity;
  selectedMarketName: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  language,
  selectedCommodity,
  selectedMarketName,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const t = TRANSLATIONS[language];

  const navItems = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      id: 'forecast',
      label: t.priceForecast,
      icon: TrendingUp,
      badge: 'ML 80/20',
    },
    {
      id: 'compare',
      label: t.marketComparison,
      icon: ArrowRightLeft,
      badge: 'Net Profit',
    },
    {
      id: 'ingestion',
      label: t.dataIngestion,
      icon: Database,
      badge: 'AGMARKNET',
    },
    {
      id: 'gemini',
      label: t.geminiAdvisor,
      icon: Sparkles,
      badge: 'Gemini 3.8',
    },
    {
      id: 'python_ml',
      label: t.pythonMLService,
      icon: Cpu,
      badge: 'FastAPI',
    },
  ];

  const handleSelect = (id: string) => {
    onTabChange(id);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 lg:w-72 bg-stone-50 border-r border-stone-200 p-4 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/20'
                      : 'text-stone-700 hover:bg-stone-200/70 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                        isActive
                          ? 'bg-emerald-800 text-emerald-100'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Current Focus Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட பயிர்' : 'Current Focus'}
              </span>
              <span className="text-base">{selectedCommodity.icon}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-stone-900 text-sm">
                  {language === 'ta' ? selectedCommodity.nameTa : selectedCommodity.nameEn}
                </p>
                <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span className="truncate max-w-[140px]">{selectedMarketName}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
              <span>{selectedCommodity.defaultUnit}</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                AGMARKNET
              </span>
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-500 space-y-1">
          <p className="font-semibold text-stone-700">FutureCrop AgTech</p>
          <p>
            {language === 'ta'
              ? 'தமிழ்நாடு வேளாண் வணிகத்துறை & AGMARKNET மாதிரி இணைக்கப்பட்டுள்ளது.'
              : 'Calibrated to TN Regulated Markets & AGMARKNET standards.'}
          </p>
        </div>
      </aside>
    </>
  );
};
