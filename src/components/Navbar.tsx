import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Globe, Sprout, Database, Cpu, Menu, X } from 'lucide-react';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isPythonEngineActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  mobileMenuOpen,
  setMobileMenuOpen,
  isPythonEngineActive,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Banner Notice: Clarifying Sample Data vs Live Mandi Connection */}
      <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 text-[11px] sm:text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium truncate">
            {t.officialDataNotice}
          </span>
        </div>
        <button
          onClick={() => onTabChange('ingestion')}
          className="text-emerald-300 hover:text-white underline font-semibold cursor-pointer shrink-0 ml-2"
        >
          {t.connectLiveMandi} →
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight">
                    {t.appName}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    TN Mandi
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Right actions: ML Engine pill + Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Active ML Engine Indicator */}
            <button
              onClick={() => onTabChange('python_ml')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-emerald-300 bg-stone-50 hover:bg-emerald-50 text-xs text-stone-700 transition-colors"
              title="Click to view Python ML Architecture and deploy FastAPI backend"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {isPythonEngineActive ? 'FastAPI Python ML' : 'Web Edge ML Engine'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>

            {/* Language Switcher Button (Tamil / English) */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold border border-stone-200 transition-all shadow-sm cursor-pointer"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
