import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Send,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Language,
  toBnDigits,
  formatNumber,
  formatTaka,
} from '../data/toolsAndArticles';
import { LocalizedNumInput } from './Calculators';

interface AdSlotProps {
  slotName: string;
  format: 'horizontal' | 'rectangle' | 'in-article';
  publisherId: string;
  showPreview: boolean;
  lang: Language;
}

export const AdSenseSlot: React.FC<AdSlotProps> = ({
  slotName,
  format,
  showPreview,
  lang,
}) => {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  React.useEffect(() => {
    if (!showPreview || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const adHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : 'c0908d1108918847da860e37fb3b6653',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://www.highrevenueformat.com/c0908d1108918847da860e37fb3b6653/invoke.js"></script>
  </body>
</html>`;

    doc.open();
    doc.write(adHtml);
    doc.close();
  }, [showPreview, slotName, format]);

  if (!showPreview) return null;

  return (
    <div
      className="my-5 no-print"
      aria-label={lang === 'bn' ? 'বিজ্ঞাপন স্থান' : 'Advertisement Slot'}
    >
      <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
        <span>{lang === 'bn' ? 'স্পনসরড বিজ্ঞাপন' : 'Sponsored Advertisement'}</span>
        <span className="font-mono-tabular">{slotName}</span>
      </div>
      <div className="w-full min-h-[96px] bg-white border border-slate-200/80 rounded-lg py-1.5 px-2 flex items-center justify-center overflow-x-auto">
        <iframe
          ref={iframeRef}
          title={`ad-${slotName}`}
          width="728"
          height="90"
          scrolling="no"
          frameBorder="0"
          className="max-w-full border-0 overflow-hidden"
        />
      </div>
    </div>
  );
};

interface AdSenseCenterProps {
  lang: Language;
  publisherId: string;
  setPublisherId: (id: string) => void;
  showAdPreview: boolean;
  setShowAdPreview: (show: boolean) => void;
}

export const AdSenseCenterView: React.FC<AdSenseCenterProps> = ({
  lang,
  publisherId,
  setPublisherId,
  showAdPreview,
  setShowAdPreview,
}) => {
  const [dailyVisitors, setDailyVisitors] = useState<number>(2500);
  const [pagesPerVisit, setPagesPerVisit] = useState<number>(2.5);
  const [ctrPercent, setCtrPercent] = useState<number>(2.2);
  const [cpcUsd, setCpcUsd] = useState<number>(0.35);
  const [usdToBdt] = useState<number>(121);
  const [copiedCode, setCopiedCode] = useState(false);

  const dailyPageviews = dailyVisitors * pagesPerVisit;
  const dailyClicks = dailyPageviews * (ctrPercent / 100);
  const dailyRevenueUsd = dailyClicks * cpcUsd;
  const monthlyRevenueUsd = dailyRevenueUsd * 30;
  const monthlyRevenueBdt = monthlyRevenueUsd * usdToBdt;
  const yearlyRevenueBdt = monthlyRevenueBdt * 12;

  const cleanPubId = (publisherId || 'ca-pub-1234567890123456').replace(/^ca-/, '');
  const adsTxtContent = `google.com, ${cleanPubId}, DIRECT, f08c47fec0942fa0`;
  const headScriptSnippet = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${
    publisherId || 'ca-pub-XXXXXXXXXXXXXXXX'
  }" crossorigin="anonymous"></script>`;

  const handleDownloadAdsTxt = () => {
    const blob = new Blob([adsTxtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ads.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const checklistItems = [
    {
      titleBn: '১. হাই-ভ্যালু ফিন্যান্স ও ইউটিলিটি নিশ (উচ্চ সিপিসি)',
      titleEn: '1. High-CPC Financial & Utility Calculator Niche',
      descBn:
        'সাধারণ বিনোদন সাইটের তুলনায় ব্যাংক লোন, স্বর্ণের দাম, জমি পরিমাপ ও মোবাইল ব্যাংকিং টুলসে বিজ্ঞাপনদাতারা ৩ থেকে ৫ গুণ বেশি সিপিসি (CPC) প্রদান করে।',
      descEn:
        'Financial calculators attract banking, MFS, and real estate advertisers paying 3x–5x higher Cost Per Click than general news blogs.',
    },
    {
      titleBn: '২. প্রতিটি ক্যালকুলেটরের নিচে বিস্তারিত গাইড ও প্রশ্নোত্তর (No Thin Content)',
      titleEn: '2. Deep Educational Guides & FAQs Below Every Calculator',
      descBn:
        'শুধু ক্যালকুলেটর থাকলে গুগল "Low Value Content" দেখিয়ে বাতিল করে। তাই এই সাইটের প্রতিটি টুলের নিচে সূত্র, ব্যবহারের নিয়ম ও প্রশ্নোত্তর যুক্ত করা হয়েছে।',
      descEn:
        'Google rejects bare tool pages as "Thin Content". Every calculator on this site includes comprehensive formulas, step-by-step instructions, and FAQs.',
    },
    {
      titleBn: '৩. মৌলিক ফিন্যান্সিয়াল ব্লগ ও আর্টিকেল সেকশন',
      titleEn: '3. Original Long-Form Editorial Articles Section',
      descBn:
        'গুগল ক্রলার যাতে পর্যাপ্ত টেক্সট কনটেন্ট ইনডেক্স করতে পারে, সেজন্য পূর্ণাঙ্গ গাইড ও আর্টিকেল বিভাগ রাখা হয়েছে।',
      descEn:
        'Full-length editorial guides ensure search crawlers index rich semantic text alongside interactive calculators.',
    },
    {
      titleBn: '৪. বাধ্যতামূলক পলিসি পেজ (Privacy Policy, Disclaimer, About, Contact)',
      titleEn: '4. Mandatory Policy Pages (Privacy Policy with DART Cookie Clause)',
      descBn:
        'অ্যাডসেন্স অনুমোদনের জন্য অপরিহার্য গোপনীয়তা নীতি (Google DoubleClick কুকি ঘোষণাসহ), আমাদের সম্পর্কে, দায়মুক্তি এবং যোগাযোগ পেজ সম্পূর্ণ প্রস্তুত।',
      descEn:
        'Includes full Privacy Policy (with mandatory Google DoubleClick DART cookie disclosure), About Us, Financial Disclaimer, and Contact Us pages.',
    },
    {
      titleBn: '৫. পরিচ্ছন্ন নেভিগেশন ও দ্রুত লোডিং (মোবাইল, ট্যাবলেট ও ডেস্কটপ রেসপনসিভ)',
      titleEn: '5. Clean Navigation, Mobile Responsiveness & JSON-LD Schema',
      descBn:
        'কোনো পপ-আপ বা বিভ্রান্তিকর বাটন নেই। মোবাইল, ট্যাবলেট ও ডেস্কটপে সমানভাবে দ্রুত লোড হয় এবং ইনডেক্সিংয়ের জন্য Schema.org যুক্ত করা আছে।',
      descEn:
        'Zero intrusive popups, instant mobile responsiveness, and embedded Schema.org WebApplication structured data.',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header Banner & Income Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-xs font-medium text-teal-700">
              {lang === 'bn'
                ? 'সাইট মালিকের ড্যাশবোর্ড · Google AdSense মনিটাইজেশন হাব'
                : 'Site Owner Dashboard · Google AdSense Monetization Hub'}
            </p>
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mt-1">
              {lang === 'bn'
                ? 'গুগল অ্যাডসেন্স অনুমোদন, সেটআপ ও সম্ভাব্য আয় ক্যালকুলেটর'
                : 'Google AdSense Approval Checklist, Setup & Revenue Calculator'}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowAdPreview(!showAdPreview)}
            className={`inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
              showAdPreview
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {showAdPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showAdPreview
              ? lang === 'bn'
                ? 'বিজ্ঞাপন স্লট প্রিভিউ: চালু আছে'
                : 'Ad Slot Preview: Active'
              : lang === 'bn'
              ? 'বিজ্ঞাপন স্লট প্রিভিউ: বন্ধ আছে'
              : 'Ad Slot Preview: Hidden'}
          </button>
        </div>

        {/* Income Simulator */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'bn'
                ? 'মাসিক অ্যাডসেন্স আয় সিমুলেটর'
                : 'Monthly AdSense Revenue Estimator'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'দৈনিক ভিজিটর সংখ্যা' : 'Daily Unique Visitors'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  min={0}
                  max={10000000}
                  value={dailyVisitors}
                  onChange={setDailyVisitors}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ভিজিটর প্রতি পেজভিউ' : 'Pageviews per Visitor'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  allowDecimal
                  min={1}
                  max={50}
                  value={pagesPerVisit}
                  onChange={setPagesPerVisit}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিজ্ঞাপন ক্লিক রেট (CTR %)' : 'Ad Click-Through Rate (CTR %)'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  allowDecimal
                  min={0.1}
                  max={25}
                  value={ctrPercent}
                  onChange={setCtrPercent}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'গড় সিপিসি (ডলার $)' : 'Average CPC (USD $)'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  allowDecimal
                  min={0.01}
                  max={50}
                  value={cpcUsd}
                  onChange={setCpcUsd}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'সম্ভাব্য মাসিক আয় (টাকায়)' : 'Estimated Monthly Income (BDT)'}
                </p>
                <p className="text-2xl sm:text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
                  {formatTaka(monthlyRevenueBdt, lang, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'মাসিক আয় (ডলারে USD)' : 'Estimated Monthly (USD)'}
                </p>
                <p className="text-2xl sm:text-3xl font-mono-tabular font-bold text-amber-400 mt-1">
                  $ {formatNumber(monthlyRevenueUsd, lang, 0)}
                </p>
              </div>
            </div>
            <div className="divide-y divide-slate-800 text-sm">
              <div className="py-2 flex justify-between gap-2">
                <span className="text-slate-300">
                  {lang === 'bn' ? 'দৈনিক মোট পেজভিউ ও ক্লিক' : 'Daily Pageviews & Ad Clicks'}
                </span>
                <span className="font-mono-tabular font-semibold text-right">
                  {formatNumber(dailyPageviews, lang, 0)}{' '}
                  {lang === 'bn' ? 'ভিউ' : 'views'} · {formatNumber(dailyClicks, lang, 0)}{' '}
                  {lang === 'bn' ? 'ক্লিক' : 'clicks'}
                </span>
              </div>
              <div className="py-2 flex justify-between gap-2">
                <span className="text-slate-300">
                  {lang === 'bn' ? 'দৈনিক গড় আয়' : 'Daily Estimated Revenue'}
                </span>
                <span className="font-mono-tabular font-semibold">
                  $ {formatNumber(dailyRevenueUsd, lang, 2)} ({formatTaka(dailyRevenueUsd * usdToBdt, lang, 0)})
                </span>
              </div>
              <div className="py-2 flex justify-between gap-2 text-teal-300">
                <span>{lang === 'bn' ? 'সম্ভাব্য বার্ষিক আয় (১২ মাস)' : 'Annual Projected Income'}</span>
                <span className="font-mono-tabular font-semibold">
                  {formatTaka(yearlyRevenueBdt, lang, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publisher ID & ads.txt Configurator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          {lang === 'bn'
            ? 'আপনার AdSense Publisher ID ও ads.txt ফাইল জেনারেটর'
            : 'Configure Your AdSense Publisher ID & Download ads.txt'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              {lang === 'bn'
                ? 'আপনার Google AdSense Publisher ID লিখুন:'
                : 'Enter Your Google AdSense Publisher ID:'}
            </label>
            <input
              type="text"
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
              placeholder="ca-pub-1234567890123456"
              className="w-full min-h-[44px] px-3.5 py-2.5 font-mono-tabular text-sm bg-slate-50 border border-slate-300 rounded-lg"
            />
            <button
              type="button"
              onClick={handleDownloadAdsTxt}
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              {lang === 'bn' ? 'ads.txt ফাইল ডাউনলোড করুন' : 'Download Authorised ads.txt'}
            </button>
          </div>

          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {lang === 'bn'
                  ? 'AdSense <head> ভেরিফিকেশন স্ক্রিপ্ট:'
                  : 'AdSense <head> Verification Script:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(headScriptSnippet);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode
                  ? lang === 'bn'
                    ? 'কপি হয়েছে'
                    : 'Copied'
                  : lang === 'bn'
                  ? 'কোড কপি করুন'
                  : 'Copy Snippet'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono-tabular overflow-x-auto">
              {headScriptSnippet}
            </pre>
            <p className="text-xs text-slate-500 break-all">
              {lang === 'bn'
                ? `ads.txt লাইন: ${adsTxtContent}`
                : `Generated ads.txt record: ${adsTxtContent}`}
            </p>
          </div>
        </div>
      </div>

      {/* 5-Point Built-In Approval Architecture */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 space-y-5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          {lang === 'bn'
            ? 'কেন এই ওয়েবসাইটটি Google AdSense-এ দ্রুত অ্যাপ্রুভ হবে?'
            : 'Why This Platform Is Engineered for First-Try Google AdSense Approval'}
        </h2>
        <div className="divide-y divide-slate-200">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  {lang === 'bn' ? item.titleBn : item.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {lang === 'bn' ? item.descBn : item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   Mandatory Trust & Legal Policy Pages (About, Privacy Policy, Disclaimer, Contact)
   ============================================================================ */
export type PolicyTab = 'privacy' | 'about' | 'terms' | 'contact';

export const PolicyAndTrustView: React.FC<{
  lang: Language;
  activePolicy: PolicyTab;
  setActivePolicy: (p: PolicyTab) => void;
}> = ({ lang, activePolicy, setActivePolicy }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 space-y-8">
      {/* Sub-navigation for Legal Pages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-lg max-w-2xl">
        <button
          type="button"
          onClick={() => setActivePolicy('privacy')}
          className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap truncate ${
            activePolicy === 'privacy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
        </button>
        <button
          type="button"
          onClick={() => setActivePolicy('about')}
          className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap truncate ${
            activePolicy === 'about' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
        </button>
        <button
          type="button"
          onClick={() => setActivePolicy('terms')}
          className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap truncate ${
            activePolicy === 'terms' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {lang === 'bn' ? 'শর্তাবলী ও দায়মুক্তি' : 'Terms & Disclaimer'}
        </button>
        <button
          type="button"
          onClick={() => setActivePolicy('contact')}
          className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap truncate ${
            activePolicy === 'contact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}
        </button>
      </div>

      {activePolicy === 'privacy' && (
        <article className="space-y-5 max-w-3xl text-slate-700 text-sm sm:text-base leading-relaxed">
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
            {lang === 'bn'
              ? 'গোপনীয়তা নীতি (Google AdSense নীতিমালা অনুযায়ী)'
              : 'Privacy Policy (Google AdSense & Cookie Compliance)'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'bn'
              ? 'সর্বশেষ হালনাগাদ: সেপ্টেম্বর ২০২৬ · কার্যকরী অঞ্চল: বাংলাদেশ ও আন্তর্জাতিক'
              : 'Last Updated: September 2026 · Effective Jurisdiction: Bangladesh & Global'}
          </p>
          <p>
            {lang === 'bn'
              ? 'হিসাবকিতাব বিডি (HisabKitab BD)-তে আপনাকে স্বাগতম। আমাদের ওয়েবসাইট ব্যবহারের সময় ভিজিটরদের ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করা আমাদের সর্বোচ্চ অগ্রাধিকার। আমাদের সকল ফিন্যান্সিয়াল ও ইউটিলিটি ক্যালকুলেটর সরাসরি আপনার ব্রাউজারে হিসাব সম্পন্ন করে—আপনার ইনপুট দেওয়া টাকার অংক, জমির মাপ বা জন্মতারিখ আমাদের সার্ভারে সংরক্ষণ করা হয় না।'
              : 'At HisabKitab BD, protecting the privacy of our visitors is one of our core priorities. All financial, gold, land, and utility calculations run directly inside your browser—we do not store your personal financial inputs on external servers.'}
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">
            {lang === 'bn'
              ? 'Google DoubleClick DART Cookie ও বিজ্ঞাপন নীতিমালা'
              : 'Google DoubleClick DART Cookie & Third-Party Advertising'}
          </h2>
          <p>
            {lang === 'bn'
              ? 'আমাদের ওয়েবসাইটে তৃতীয় পক্ষের ভেন্ডর হিসেবে Google বিজ্ঞাপন প্রদর্শন করে। Google তার DART কুকি ব্যবহার করে আমাদের সাইট এবং ইন্টারনেটের অন্যান্য সাইটে ভিজিটরদের পূর্ববর্তী ভিজিটের ওপর ভিত্তি করে প্রাসঙ্গিক বিজ্ঞাপন প্রদর্শন করে। ব্যবহারকারীরা চাইলে Google Ad এবং Content Network গোপনীয়তা নীতি ভিজিট করে DART কুকির ব্যবহার বন্ধ (Opt-out) করতে পারেন।'
              : 'Google, as a third-party vendor, uses cookies (including the DoubleClick DART cookie) to serve ads on HisabKitab BD based on a user’s prior visits to our website and other sites on the internet. Users may opt out of the use of the DART cookie by visiting the Google Ad and Content Network Privacy Policy.'}
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">
            {lang === 'bn' ? 'লগ ফাইল ও কুকিজ' : 'Log Files & Analytics'}
          </h2>
          <p>
            {lang === 'bn'
              ? 'অন্যান্য স্ট্যান্ডার্ড ওয়েবসাইটের মতো আমরা ব্রাউজারের ধরন, আইএসপি, তারিখ/সময় এবং রেফারিং পেজ বিশ্লেষণের জন্য স্ট্যান্ডার্ড অ্যানালিটিক্স লগ ব্যবহার করি যা কোনো ব্যক্তিকে এককভাবে চিহ্নিত করে না।'
              : 'Like standard web publishers, HisabKitab BD utilizes standard log files (browser type, timestamp, referring pages) purely to analyze aggregate traffic trends and improve calculator accuracy.'}
          </p>
        </article>
      )}

      {activePolicy === 'about' && (
        <article className="space-y-5 max-w-3xl text-slate-700 text-sm sm:text-base leading-relaxed">
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
            {lang === 'bn'
              ? 'আমাদের সম্পর্কে (হিসাবকিতাব বিডি)'
              : 'About HisabKitab BD – Bangladesh’s Essential Finance & Utility Portal'}
          </h1>
          <p>
            {lang === 'bn'
              ? 'হিসাবকিতাব বিডি বাংলাদেশের সাধারণ মানুষ, ক্ষুদ্র ব্যবসায়ী, শিক্ষার্থী ও চাকরির প্রার্থীদের প্রতিদিনের প্রয়োজনীয় গাণিতিক ও আর্থিক হিসাব সহজ করার লক্ষ্যে নির্মিত একটি উন্মুক্ত ডিজিটাল প্ল্যাটফর্ম।'
              : 'HisabKitab BD is an independent Bangladeshi digital utility and financial literacy platform built to simplify everyday calculations for households, small businesses, land buyers, and job seekers.'}
          </p>
          <p>
            {lang === 'bn'
              ? 'মোবাইল ব্যাংকিং ক্যাশ-আউট চার্জ তুলনা থেকে শুরু করে বাজুস স্বর্ণের ভরি-আনা-রতি হিসাব, ইসলামিক যাকাত ও নিসাব, সরকারি খতিয়ান অনুযায়ী শতক ও কাঠা পরিমাপ, ব্যাংক লোন ইএমআই এবং বিইআরসি ধাপ অনুযায়ী বিদ্যুৎ বিল—সবকিছুই আমরা একটি দ্রুতগতির ও নির্ভুল প্ল্যাটফর্মে নিয়ে এসেছি।'
              : 'From comparing MFS Cash-Out rates across bKash, Nagad, and Rocket to computing BAJUS gold weights in Vori-Ana-Rotti, land measurements in Shotok and Katha, and progressive BERC electricity slab bills, every calculator is backed by verified formulas and educational guides.'}
          </p>
        </article>
      )}

      {activePolicy === 'terms' && (
        <article className="space-y-5 max-w-3xl text-slate-700 text-sm sm:text-base leading-relaxed">
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
            {lang === 'bn'
              ? 'ব্যবহারের শর্তাবলী ও আর্থিক দায়মুক্তি'
              : 'Terms of Use & Financial Disclaimer'}
          </h1>
          <p>
            {lang === 'bn'
              ? '১. তথ্যের উদ্দেশ্য: হিসাবকিতাব বিডি-তে প্রদত্ত সকল ক্যালকুলেটর এবং আর্টিকেল শুধুমাত্র সাধারণ তথ্য ও শিক্ষামূলক উদ্দেশ্যে তৈরি। বাংলাদেশ ব্যাংক, বাজুস, বিইআরসি কিংবা সংশ্লিষ্ট মোবাইল ব্যাংকিং প্রতিষ্ঠানের চার্জ ও নীতিমালা যেকোনো সময় পরিবর্তিত হতে পারে।'
              : '1. Informational Purpose Only: All calculators, rates, and editorial guides on HisabKitab BD are provided for general educational and estimation purposes. Official rates from Bangladesh Bank, BAJUS, NBR, or BERC may change periodically.'}
          </p>
          <p>
            {lang === 'bn'
              ? '২. চূড়ান্ত আর্থিক সিদ্ধান্ত: বড় কোনো ব্যাংক ঋণ গ্রহণ, জমি রেজিস্ট্রেশন বা বিনিয়োগের পূর্বে সংশ্লিষ্ট ব্যাংক কর্মকর্তা, সার্ভেয়ার বা কর উপদেষ্টার সাথে চূড়ান্ত হিসাব যাচাই করে নেওয়ার পরামর্শ দেওয়া হচ্ছে।'
              : '2. Professional Verification: Before executing major property deeds, bank loans, or tax filings, users should verify final figures with their respective bank branch or certified legal surveyor.'}
          </p>
        </article>
      )}

      {activePolicy === 'contact' && (
        <div className="max-w-2xl space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Our Editorial & Technical Team'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'bn'
                ? 'যেকোনো ক্যালকুলেটর সম্পর্কে পরামর্শ, বিজ্ঞাপন অনুসন্ধান বা ভুল সংশোধনের জন্য নিচের ফর্মটি পূরণ করুন।'
                : 'Have feedback on a calculator, rate update request, or advertising inquiry? Reach out below.'}
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
              <p className="text-base font-semibold text-teal-900">
                {lang === 'bn'
                  ? 'আপনার বার্তা সফলভাবে গৃহীত হয়েছে!'
                  : 'Thank you! Your message has been received.'}
              </p>
              <p className="text-xs sm:text-sm text-teal-800">
                {lang === 'bn'
                  ? 'আমাদের সম্পাদনা টিম ২৪–৪৮ ঘণ্টার মধ্যে আপনার ইমেইলে উত্তর প্রদান করবে।'
                  : 'Our support desk will respond to your email address within 24–48 business hours.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setContactName('');
                  setContactEmail('');
                  setContactSubject('');
                  setContactMessage('');
                }}
                className="mt-2 min-h-[40px] px-4 py-2 text-xs font-semibold bg-teal-700 text-white rounded-lg"
              >
                {lang === 'bn' ? 'নতুন বার্তা পাঠান' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={lang === 'bn' ? 'আপনার নাম লিখুন' : 'Your name'}
                    className="w-full min-h-[42px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full min-h-[42px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিষয়' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: নতুন ক্যালকুলেটর যুক্ত করার অনুরোধ / বিজ্ঞাপন'
                      : 'e.g. Calculator rate update / Advertising inquiry'
                  }
                  className="w-full min-h-[42px] px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিস্তারিত বার্তা *' : 'Message *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={lang === 'bn' ? 'আপনার বার্তা এখানে লিখুন...' : 'Write your message...'}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {lang === 'bn' ? 'বার্তা পাঠান' : 'Submit Message'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
