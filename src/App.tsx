/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  Calculator as CalcIcon,
} from 'lucide-react';
import {
  Language,
  ToolId,
  TOOLS_META,
  EDITORIAL_ARTICLES,
  ArticlePost,
  toBnDigits,
} from './data/toolsAndArticles';
import { ActiveCalculator } from './components/Calculators';
import {
  AdSenseSlot,
  AdSenseCenterView,
  PolicyAndTrustView,
  PolicyTab,
} from './components/AdSenseAndPolicies';

type MainView = 'tools' | 'articles' | 'adsense' | 'policies';

export default function App() {
  const [lang, setLang] = useState<Language>('bn');
  const [view, setView] = useState<MainView>('tools');
  const [selectedToolId, setSelectedToolId] = useState<ToolId>('mfs-fee');
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'finance' | 'property' | 'utility' | 'business'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    EDITORIAL_ARTICLES[0].id
  );
  const [activePolicy, setActivePolicy] = useState<PolicyTab>('privacy');

  // AdSense owner state
  const [publisherId, setPublisherId] = useState<string>('ca-pub-8492019482716500');
  const [showAdPreview, setShowAdPreview] = useState<boolean>(true);

  const activeTool = useMemo(
    () => TOOLS_META.find((t) => t.id === selectedToolId) || TOOLS_META[0],
    [selectedToolId]
  );

  const filteredTools = useMemo(() => {
    return TOOLS_META.filter((t) => {
      const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
      if (!searchQuery.trim()) return matchesCat;
      const q = searchQuery.toLowerCase();
      return (
        matchesCat &&
        (t.titleBn.toLowerCase().includes(q) ||
          t.titleEn.toLowerCase().includes(q) ||
          t.shortDescBn.toLowerCase().includes(q) ||
          t.shortDescEn.toLowerCase().includes(q))
      );
    });
  }, [categoryFilter, searchQuery]);

  const activeArticle: ArticlePost = useMemo(
    () =>
      EDITORIAL_ARTICLES.find((a) => a.id === selectedArticleId) ||
      EDITORIAL_ARTICLES[0],
    [selectedArticleId]
  );

  const openPolicyPage = (tab: PolicyTab) => {
    setActivePolicy(tab);
    setView('policies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYearStr =
    lang === 'bn'
      ? toBnDigits(new Date().getFullYear())
      : String(new Date().getFullYear());

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* =====================================================================
          Strict 3-Zone Top Bar Contract
          Zone 1: Single text element wordmark
          Zone 2: 5 clean text navigation links (visible on lg+ desktop)
          Zone 3: 2 primary actions (Language switch & AdSense Setup)
         ===================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 no-print">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Brand Title (Single text element) */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setView('tools');
            }}
            className="text-base sm:text-xl font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
          >
            {lang === 'bn' ? 'হিসাবকিতাব বিডি' : 'HisabKitab BD'}
          </a>

          {/* Zone 2: Clean Text Navigation Links (Tablet & Desktop >= 768px) */}
          <nav className="hidden md:flex items-center gap-3.5 lg:gap-6 text-xs lg:text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setView('tools')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                view === 'tools'
                  ? 'text-teal-800 font-semibold underline underline-offset-8 decoration-2 decoration-teal-700'
                  : ''
              }`}
            >
              {lang === 'bn' ? 'সকল ক্যালকুলেটর' : 'Calculators'}
            </button>
            <button
              type="button"
              onClick={() => setView('articles')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                view === 'articles'
                  ? 'text-teal-800 font-semibold underline underline-offset-8 decoration-2 decoration-teal-700'
                  : ''
              }`}
            >
              {lang === 'bn' ? 'গাইড ও ব্লগ' : 'Guides & Blog'}
            </button>
            <button
              type="button"
              onClick={() => setView('adsense')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                view === 'adsense'
                  ? 'text-teal-800 font-semibold underline underline-offset-8 decoration-2 decoration-teal-700'
                  : ''
              }`}
            >
              {lang === 'bn' ? 'অ্যাডসেন্স আয়' : 'AdSense Hub'}
            </button>
            <button
              type="button"
              onClick={() => openPolicyPage('privacy')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                view === 'policies' && activePolicy === 'privacy'
                  ? 'text-teal-800 font-semibold underline underline-offset-8 decoration-2 decoration-teal-700'
                  : ''
              }`}
            >
              {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
            </button>
            <button
              type="button"
              onClick={() => openPolicyPage('contact')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 ${
                view === 'policies' && activePolicy === 'contact'
                  ? 'text-teal-800 font-semibold underline underline-offset-8 decoration-2 decoration-teal-700'
                  : ''
              }`}
            >
              {lang === 'bn' ? 'যোগাযোগ' : 'Contact'}
            </button>
          </nav>

          {/* Zone 3: 2 Primary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="min-h-[36px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
            <button
              type="button"
              onClick={() => setView('adsense')}
              className="min-h-[36px] px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap"
            >
              {lang === 'bn' ? 'AdSense প্যানেল' : 'AdSense Studio'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row (< 768px) — Full-width wrapped layout with ZERO horizontal scrollbar */}
        <div className="grid grid-cols-5 md:hidden border-t border-slate-100 bg-slate-50/60 text-[11px] font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setView('tools')}
            className={`py-2.5 text-center transition-colors truncate px-1 ${
              view === 'tools'
                ? 'text-teal-800 font-semibold bg-white border-b-2 border-teal-700'
                : 'hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'ক্যালকুলেটর' : 'Tools'}
          </button>
          <button
            type="button"
            onClick={() => setView('articles')}
            className={`py-2.5 text-center transition-colors truncate px-1 ${
              view === 'articles'
                ? 'text-teal-800 font-semibold bg-white border-b-2 border-teal-700'
                : 'hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'গাইড ও ব্লগ' : 'Guides'}
          </button>
          <button
            type="button"
            onClick={() => setView('adsense')}
            className={`py-2.5 text-center transition-colors truncate px-1 ${
              view === 'adsense'
                ? 'text-teal-800 font-semibold bg-white border-b-2 border-teal-700'
                : 'hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'অ্যাডসেন্স' : 'AdSense'}
          </button>
          <button
            type="button"
            onClick={() => openPolicyPage('privacy')}
            className={`py-2.5 text-center transition-colors truncate px-1 ${
              view === 'policies' && activePolicy === 'privacy'
                ? 'text-teal-800 font-semibold bg-white border-b-2 border-teal-700'
                : 'hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'পলিসি' : 'Privacy'}
          </button>
          <button
            type="button"
            onClick={() => openPolicyPage('contact')}
            className={`py-2.5 text-center transition-colors truncate px-1 ${
              view === 'policies' && activePolicy === 'contact'
                ? 'text-teal-800 font-semibold bg-white border-b-2 border-teal-700'
                : 'hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'যোগাযোগ' : 'Contact'}
          </button>
        </div>
      </header>

      {/* =====================================================================
          Main Content Container (Responsive Mobile / Tablet / 1280px Desktop)
         ===================================================================== */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view === 'tools' && (
          <div className="space-y-8 sm:space-y-10">
            {/* Editorial Hero Section + Search & Category Filter */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 no-print">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-teal-800 font-medium">
                    <span>
                      {lang === 'bn'
                        ? 'বাংলাদেশের নম্বর ১ ফিন্যান্স ও ডেইলি ইউটিলিটি পোর্টাল'
                        : 'Bangladesh’s #1 Financial & Daily Utility Portal'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {lang === 'bn'
                        ? '১০০% বিনামূল্যে ও নির্ভুল হিসাব'
                        : '100% Free & Verified Formulas'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                    {lang === 'bn'
                      ? 'প্রতিদিনের আর্থিক, স্বর্ণ, জমি ও ব্যাংকিং হিসাব এখন এক ক্লিকে'
                      : 'Everyday Financial, Gold, Land & Banking Calculators in One Place'}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                    {lang === 'bn'
                      ? 'বিকাশ/নগদ ক্যাশ-আউট চার্জ, বাজুস স্বর্ণের ভরি-আনা-রতি ও যাকাত, জমি পরিমাপ (শতক-কাঠা), ব্যাংক লোন ইএমআই, বিদ্যুৎ বিল এবং টাকা কথায় প্রকাশের নির্ভুল ক্যালকুলেটর ও গাইড।'
                      : 'Compare bKash/Nagad fees, compute BAJUS gold prices & Zakat, measure land in Shotok/Katha, calculate Bank Loan EMI & DPS after tax, and estimate BERC electricity slab bills.'}
                  </p>
                </div>

                {/* Live Search & Quick Filter */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        lang === 'bn'
                          ? 'টুল খুঁজুন (যেমন: বিকাশ, স্বর্ণ, জমি, লোন, বিদ্যুৎ)...'
                          : 'Search tools (e.g. bKash, Gold, Land, EMI, Electricity)...'
                      }
                      className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:bg-white"
                    />
                  </div>

                  {/* Interactive Category Filter Buttons */}
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    {[
                      { id: 'all', bn: 'সবগুলো (৭)', en: 'All (7)' },
                      { id: 'finance', bn: 'ফিন্যান্স', en: 'Finance' },
                      { id: 'property', bn: 'জমি পরিমাপ', en: 'Land' },
                      { id: 'utility', bn: 'বিদ্যুৎ ও বয়স', en: 'Utility' },
                      { id: 'business', bn: 'চেক ও মেমো', en: 'Business' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id as any)}
                        className={`flex-1 min-h-[36px] py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                          categoryFilter === cat.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {lang === 'bn' ? cat.bn : cat.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tool Selector Grid: 1 col Mobile, 2 cols Tablet, 3 cols Laptop, 4 cols Wide Desktop */}
              <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredTools.map((tool) => {
                  const isActive = tool.id === selectedToolId;
                  const cpcText =
                    lang === 'bn'
                      ? `সিপিসি ${toBnDigits(tool.cpcEstimateUsd)}`
                      : `CPC ${tool.cpcEstimateUsd}`;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => setSelectedToolId(tool.id)}
                      className={`text-left p-4 rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-teal-900 text-white border-teal-900'
                          : 'bg-slate-50/70 hover:bg-slate-100 text-slate-900 border-slate-200'
                      }`}
                    >
                      <div
                        className={`text-[11px] flex items-center gap-1.5 ${
                          isActive ? 'text-teal-300' : 'text-slate-500'
                        }`}
                      >
                        <span className="truncate">
                          {lang === 'bn' ? tool.categoryLabelBn : tool.categoryLabelEn}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular shrink-0">{cpcText}</span>
                      </div>
                      <p className="text-sm font-semibold mt-1 leading-snug">
                        {lang === 'bn' ? tool.titleBn : tool.titleEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Top AdSense Leaderboard Slot */}
            <AdSenseSlot
              slotName="top_leaderboard_728x90"
              format="horizontal"
              publisherId={publisherId}
              showPreview={showAdPreview}
              lang={lang}
            />

            {/* Main Workspace Grid: Full-width on Mobile/Tablet/Laptop, 8+4 Split on Wide Desktop (xl: 1280px+) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left 8 Columns: Active Calculator + Deep Crawlable Guide */}
              <div className="xl:col-span-8 space-y-8">
                {/* Active Calculator Container */}
                <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 space-y-6">
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>
                        {lang === 'bn'
                          ? activeTool.categoryLabelBn
                          : activeTool.categoryLabelEn}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {lang === 'bn'
                          ? `মাসিক সার্চ: ${toBnDigits(activeTool.monthlySearchVolume.replace('/ mo', '/ মাস'))}`
                          : `Search Demand: ${activeTool.monthlySearchVolume}`}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular text-teal-700">
                        {lang === 'bn'
                          ? `অ্যাডসেন্স সিপিসি: ${toBnDigits(activeTool.cpcEstimateUsd)}`
                          : `AdSense CPC: ${activeTool.cpcEstimateUsd}`}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
                      {lang === 'bn' ? activeTool.titleBn : activeTool.titleEn}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {lang === 'bn' ? activeTool.shortDescBn : activeTool.shortDescEn}
                    </p>
                  </div>

                  {/* Render Interactive Calculator */}
                  <ActiveCalculator toolId={activeTool.id} lang={lang} />
                </section>

                {/* In-Article Native Ad Slot */}
                <AdSenseSlot
                  slotName="below_calculator_native"
                  format="in-article"
                  publisherId={publisherId}
                  showPreview={showAdPreview}
                  lang={lang}
                />

                {/* =============================================================
                    Deep Educational Guide, Formula & FAQ Section
                    (Guarantees Google AdSense sees rich, authoritative text!)
                   ============================================================= */}
                <article className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 space-y-6 no-print">
                  <div className="border-b border-slate-200 pb-4">
                    <p className="text-xs font-medium text-teal-700">
                      {lang === 'bn'
                        ? 'বিস্তারিত ব্যবহারের নিয়ম, গাণিতিক সূত্র ও প্রশ্নোত্তর'
                        : 'Complete Methodology, Mathematical Formula & User FAQs'}
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                      {lang === 'bn' ? activeTool.guideTitleBn : activeTool.guideTitleEn}
                    </h2>
                  </div>

                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {lang === 'bn' ? activeTool.guideIntroBn : activeTool.guideIntroEn}
                  </p>

                  {/* Mathematical Formula Reference Box */}
                  <div className="p-4 bg-slate-50 border-l-4 border-teal-700 rounded-r-lg">
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      {lang === 'bn'
                        ? 'হিসাবের প্রমিত গাণিতিক সূত্র:'
                        : 'Verified Calculation Formula:'}
                    </p>
                    <p className="text-xs sm:text-sm font-mono-tabular font-semibold text-slate-900">
                      {lang === 'bn' ? activeTool.formulaBoxBn : activeTool.formulaBoxEn}
                    </p>
                  </div>

                  {/* Step by step usage */}
                  <div className="space-y-2.5">
                    <h3 className="text-base font-bold text-slate-900">
                      {lang === 'bn'
                        ? 'ক্যালকুলেটরটি কীভাবে ব্যবহার করবেন (ধাপে ধাপে):'
                        : 'Step-by-Step Instructions:'}
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                      {(lang === 'bn'
                        ? activeTool.howToStepsBn
                        : activeTool.howToStepsEn
                      ).map((step, i) => (
                        <li key={i} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Frequently Asked Questions */}
                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">
                      {lang === 'bn'
                        ? 'সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)'
                        : 'Frequently Asked Questions (FAQ)'}
                    </h3>
                    <div className="divide-y divide-slate-200">
                      {activeTool.faqs.map((faq, index) => (
                        <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                          <h4 className="text-sm font-semibold text-slate-900">
                            {lang === 'bn' ? faq.qBn : faq.qEn}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                            {lang === 'bn' ? faq.aBn : faq.aEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </div>

              {/* Right 4 Columns (2-col grid on Tablet/Laptop, stacked on Wide Desktop Sidebar) */}
              <aside className="xl:col-span-4 space-y-6 no-print">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6 items-start">
                  {/* Quick Tool Directory */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
                      {lang === 'bn'
                        ? 'জনপ্রিয় সকল ক্যালকুলেটর তালিকা'
                        : 'Essential Calculators Directory'}
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {TOOLS_META.map((t, idx) => {
                        const numPrefix =
                          lang === 'bn'
                            ? toBnDigits(`0${idx + 1}.`)
                            : `0${idx + 1}.`;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSelectedToolId(t.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`w-full py-2.5 text-left flex items-center justify-between gap-2 text-xs sm:text-sm transition-colors ${
                              t.id === selectedToolId
                                ? 'text-teal-800 font-semibold'
                                : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            <span className="truncate">
                              {numPrefix} {lang === 'bn' ? t.titleBn : t.titleEn}
                            </span>
                            <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Featured Long-Form Guides */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h3 className="text-base font-bold text-slate-900">
                        {lang === 'bn' ? 'প্রয়োজনীয় ফিন্যান্স গাইড' : 'Featured Financial Guides'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setView('articles')}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                      >
                        {lang === 'bn' ? 'সব দেখুন' : 'View All'}
                      </button>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {EDITORIAL_ARTICLES.map((art) => (
                        <div key={art.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>{lang === 'bn' ? art.categoryBn : art.categoryEn}</span>
                            <span aria-hidden="true">·</span>
                            <span>{lang === 'bn' ? art.readTimeBn : art.readTimeEn}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedArticleId(art.id);
                              setView('articles');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-left text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors leading-snug"
                          >
                            {lang === 'bn' ? art.titleBn : art.titleEn}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar 300x250 AdSense Unit */}
                <AdSenseSlot
                  slotName="sidebar_rectangle_300x250"
                  format="rectangle"
                  publisherId={publisherId}
                  showPreview={showAdPreview}
                  lang={lang}
                />
              </aside>
            </div>
          </div>
        )}

        {/* =====================================================================
            Editorial Articles & Blog View
           ===================================================================== */}
        {view === 'articles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
                {lang === 'bn'
                  ? 'ফিন্যান্স ও ইউটিলিটি আর্টিকেল সমূহ'
                  : 'Editorial Guides & Articles'}
              </h2>
              <div className="divide-y divide-slate-200">
                {EDITORIAL_ARTICLES.map((article) => {
                  const isSelected = article.id === selectedArticleId;
                  return (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => setSelectedArticleId(article.id)}
                      className={`w-full text-left py-3.5 first:pt-0 last:pb-0 transition-colors ${
                        isSelected ? 'text-teal-800' : 'text-slate-800 hover:text-teal-700'
                      }`}
                    >
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>{lang === 'bn' ? article.categoryBn : article.categoryEn}</span>
                        <span aria-hidden="true">·</span>
                        <span>{lang === 'bn' ? article.readTimeBn : article.readTimeEn}</span>
                      </div>
                      <p className="text-sm font-semibold mt-1 leading-snug">
                        {lang === 'bn' ? article.titleBn : article.titleEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <article className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-8 space-y-6">
              <div className="border-b border-slate-200 pb-5 space-y-2">
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-teal-800">
                    {lang === 'bn' ? activeArticle.categoryBn : activeArticle.categoryEn}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {lang === 'bn'
                      ? activeArticle.publishedDateBn
                      : activeArticle.publishedDateEn}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {lang === 'bn' ? activeArticle.readTimeBn : activeArticle.readTimeEn}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {lang === 'bn' ? activeArticle.authorBn : activeArticle.authorEn}
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  {lang === 'bn' ? activeArticle.titleBn : activeArticle.titleEn}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
                  {lang === 'bn' ? activeArticle.summaryBn : activeArticle.summaryEn}
                </p>
              </div>

              <AdSenseSlot
                slotName="article_top_banner"
                format="in-article"
                publisherId={publisherId}
                showPreview={showAdPreview}
                lang={lang}
              />

              <div className="space-y-6">
                {activeArticle.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-3">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {lang === 'bn' ? sec.headingBn : sec.headingEn}
                    </h2>
                    {(lang === 'bn' ? sec.paragraphsBn : sec.paragraphsEn).map((p, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-sm sm:text-base text-slate-700 leading-relaxed"
                      >
                        {p}
                      </p>
                    ))}
                    {(sec.keyTakeawayBn || sec.keyTakeawayEn) && (
                      <div className="p-4 bg-teal-50/70 border-l-4 border-teal-700 rounded-r-lg text-xs sm:text-sm text-teal-950 font-medium">
                        {lang === 'bn' ? sec.keyTakeawayBn : sec.keyTakeawayEn}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    {lang === 'bn'
                      ? 'এই আর্টিকেলের সাথে সম্পর্কিত লাইভ টুল:'
                      : 'Interactive Tool Related to This Guide:'}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {lang === 'bn'
                      ? TOOLS_META.find((t) => t.id === activeArticle.relatedToolId)?.titleBn
                      : TOOLS_META.find((t) => t.id === activeArticle.relatedToolId)?.titleEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedToolId(activeArticle.relatedToolId);
                    setView('tools');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2.5 text-xs sm:text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  <CalcIcon className="w-4 h-4" />
                  {lang === 'bn' ? 'ক্যালকুলেটরটি ওপেন করুন' : 'Open Interactive Calculator'}
                </button>
              </div>
            </article>
          </div>
        )}

        {/* =====================================================================
            AdSense Approval, Setup & Income Estimator View
           ===================================================================== */}
        {view === 'adsense' && (
          <AdSenseCenterView
            lang={lang}
            publisherId={publisherId}
            setPublisherId={setPublisherId}
            showAdPreview={showAdPreview}
            setShowAdPreview={setShowAdPreview}
          />
        )}

        {/* =====================================================================
            Mandatory Policy Pages View (Privacy Policy, About, Disclaimer, Contact)
           ===================================================================== */}
        {view === 'policies' && (
          <PolicyAndTrustView
            lang={lang}
            activePolicy={activePolicy}
            setActivePolicy={setActivePolicy}
          />
        )}
      </main>

      {/* =====================================================================
          Clean Institutional Footer (Mandatory AdSense Policy Links)
         ===================================================================== */}
      <footer className="bg-white border-t border-slate-200 mt-12 sm:mt-16 no-print">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-200">
            <div className="sm:col-span-2 lg:col-span-5 space-y-2.5">
              <p className="text-lg font-bold text-slate-900 font-display">
                {lang === 'bn' ? 'হিসাবকিতাব বিডি (HisabKitab BD)' : 'HisabKitab BD'}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
                {lang === 'bn'
                  ? 'বাংলাদেশের প্রতিদিনের ফিন্যান্স, মোবাইল ব্যাংকিং চার্জ, স্বর্ণের দাম, যাকাত, জমি পরিমাপ, ব্যাংক লোন এবং বিদ্যুৎ বিল হিসাব করার উন্মুক্ত তথ্য ও ইউটিলিটি প্ল্যাটফর্ম।'
                  : 'Bangladesh’s open utility and financial calculation hub for MFS fees, BAJUS gold & Zakat, land survey units, Bank Loan EMI, and BERC electricity bills.'}
              </p>
            </div>

            <div className="lg:col-span-4 space-y-2">
              <p className="text-xs font-semibold text-slate-900">
                {lang === 'bn' ? 'প্রয়োজনীয় ক্যালকুলেটর' : 'Popular Calculators'}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {TOOLS_META.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedToolId(t.id);
                        setView('tools');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-teal-700 transition-colors text-left"
                    >
                      {lang === 'bn' ? t.titleBn : t.titleEn}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-2">
              <p className="text-xs font-semibold text-slate-900">
                {lang === 'bn'
                  ? 'গুরুত্বপূর্ণ লিংক ও নীতিমালা'
                  : 'Legal & AdSense Compliance'}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>
                  <button
                    type="button"
                    onClick={() => openPolicyPage('about')}
                    className="hover:text-teal-700 transition-colors"
                  >
                    {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openPolicyPage('privacy')}
                    className="hover:text-teal-700 transition-colors"
                  >
                    {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openPolicyPage('terms')}
                    className="hover:text-teal-700 transition-colors"
                  >
                    {lang === 'bn' ? 'ব্যবহারের শর্তাবলী ও দায়মুক্তি' : 'Terms & Disclaimer'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openPolicyPage('contact')}
                    className="hover:text-teal-700 transition-colors"
                  >
                    {lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setView('adsense');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-teal-700 font-medium text-teal-800 transition-colors"
                  >
                    {lang === 'bn'
                      ? 'AdSense আয় ও ads.txt জেনারেটর'
                      : 'AdSense Income & ads.txt Setup'}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {currentYearStr} {lang === 'bn' ? 'হিসাবকিতাব বিডি।' : 'HisabKitab BD.'}{' '}
              {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
            </p>
            <p>
              {lang === 'bn'
                ? 'সকল হিসাব ব্রাউজারে তাৎক্ষণিকভাবে সম্পন্ন হয় · Google AdSense নীতিমালা অনুযায়ী নির্মিত'
                : 'Client-side privacy-first calculations · Built to Google AdSense Webmaster Standards'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
