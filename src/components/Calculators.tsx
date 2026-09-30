import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Printer,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Language,
  ToolId,
  toBnDigits,
  fromBnDigits,
  formatNumber,
  formatTaka,
  numberToBanglaWords,
  numberToEnglishWords,
} from '../data/toolsAndArticles';

interface CalculatorProps {
  toolId: ToolId;
  lang: Language;
}

/**
 * Smart Number Input that displays বাংলা সংখ্যা (০-৯) in Bangla mode
 * and accepts both Bangla (০-৯) and English (0-9) typing on Mobile, Tablet & Desktop.
 */
interface LocalizedNumInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  lang: Language;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  className?: string;
  placeholder?: string;
}

export const LocalizedNumInput: React.FC<LocalizedNumInputProps> = ({
  id,
  value,
  onChange,
  lang,
  min = 0,
  max = 999999999,
  allowDecimal = false,
  className = '',
  placeholder = '',
}) => {
  const [focused, setFocused] = useState(false);
  const [rawText, setRawText] = useState<string>('');

  useEffect(() => {
    if (!focused) {
      const str = String(value ?? 0);
      setRawText(lang === 'bn' ? toBnDigits(str) : str);
    }
  }, [value, lang, focused]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    // Convert any Bangla digits to ASCII for parsing, keep only digits and optional decimal point
    const ascii = fromBnDigits(inputVal);
    const sanitized = allowDecimal
      ? ascii.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
      : ascii.replace(/[^0-9]/g, '');

    setRawText(lang === 'bn' ? toBnDigits(sanitized) : sanitized);

    if (sanitized === '' || sanitized === '.') {
      onChange(0);
      return;
    }
    const parsed = allowDecimal ? parseFloat(sanitized) : parseInt(sanitized, 10);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  return (
    <input
      id={id}
      type="text"
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      value={rawText}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        const clamped = Math.max(min, Math.min(max, value || 0));
        if (clamped !== value) onChange(clamped);
        const str = String(clamped);
        setRawText(lang === 'bn' ? toBnDigits(str) : str);
      }}
      onChange={handleTextChange}
      placeholder={lang === 'bn' ? toBnDigits(placeholder) : placeholder}
      className={className}
    />
  );
};

export const ActiveCalculator: React.FC<CalculatorProps> = ({ toolId, lang }) => {
  switch (toolId) {
    case 'mfs-fee':
      return <MfsFeeCalculator lang={lang} />;
    case 'gold-zakat':
      return <GoldZakatCalculator lang={lang} />;
    case 'land-measure':
      return <LandMeasureCalculator lang={lang} />;
    case 'loan-dps':
      return <LoanDpsCalculator lang={lang} />;
    case 'electricity-bill':
      return <ElectricityBillCalculator lang={lang} />;
    case 'age-job':
      return <AgeJobCalculator lang={lang} />;
    case 'taka-words-memo':
      return <TakaWordsMemoCalculator lang={lang} />;
    default:
      return <MfsFeeCalculator lang={lang} />;
  }
};

/* ============================================================================
   1. MFS (bKash, Nagad, Rocket, Upay) Cash-Out & Reverse Fee Calculator
   ============================================================================ */
const MFS_PROVIDERS = [
  {
    id: 'bkash-priya',
    nameBn: 'বিকাশ (প্রিয় এজেন্ট - অ্যাপ)',
    nameEn: 'bKash (Priya Agent - App)',
    ratePerThousand: 14.9,
    noteBn: 'মাসে ৫০,০০০ টাকা পর্যন্ত ১.৪৯% চার্জ',
    noteEn: '1.49% up to BDT 50,000/month',
  },
  {
    id: 'bkash-reg',
    nameBn: 'বিকাশ (রেগুলার এজেন্ট / *২৪৭#)',
    nameEn: 'bKash (Regular Agent / *247#)',
    ratePerThousand: 18.5,
    noteBn: 'সাধারণ এজেন্ট ও বাটন ফোনে ১.৮৫% চার্জ',
    noteEn: 'Standard 1.85% agent & USSD rate',
  },
  {
    id: 'nagad-app',
    nameBn: 'নগদ (অ্যাপ ক্যাশ-আউট - ভ্যাটসহ)',
    nameEn: 'Nagad (App Cash-Out incl. VAT)',
    ratePerThousand: 12.5,
    noteBn: 'অ্যাপে সাশ্রয়ী ক্যাশ-আউট রেট (১.২৫%)',
    noteEn: 'Discounted mobile app tier (1.25%)',
  },
  {
    id: 'nagad-ussd',
    nameBn: 'নগদ (বাটন ফোন *১৬৭#)',
    nameEn: 'Nagad (USSD *167#)',
    ratePerThousand: 15.0,
    noteBn: 'ইউএসএসডি ডায়াল ক্যাশ-আউট ১.৫০%',
    noteEn: 'Standard USSD cash-out rate 1.50%',
  },
  {
    id: 'rocket-atm',
    nameBn: 'রকেট (ডাচ-বাংলা এটিএম বুথ)',
    nameEn: 'Rocket (DBBL ATM Booth)',
    ratePerThousand: 9.0,
    noteBn: 'এটিএম বুথ থেকে সর্বনিম্ন ০.৯০% চার্জ',
    noteEn: 'Lowest 0.90% fee at DBBL ATM booths',
  },
  {
    id: 'rocket-agent',
    nameBn: 'রকেট (এজেন্ট পয়েন্ট)',
    nameEn: 'Rocket (Agent Point)',
    ratePerThousand: 16.7,
    noteBn: 'রকেট এজেন্ট থেকে ক্যাশ-আউট ১.৬৭%',
    noteEn: '1.67% at Rocket agent outlets',
  },
  {
    id: 'upay-app',
    nameBn: 'উপায় (অ্যাপ ক্যাশ-আউট)',
    nameEn: 'Upay (App Cash-Out)',
    ratePerThousand: 14.0,
    noteBn: 'উপায় অ্যাপে হাজারে ১৪ টাকা চার্জ',
    noteEn: '1.40% standard Upay app fee',
  },
];

const MfsFeeCalculator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [amount, setAmount] = useState<number>(10000);
  const [mode, setMode] = useState<'cashout' | 'reverse'>('cashout');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('bkash-priya');
  const [copied, setCopied] = useState(false);

  const quickAmounts = [1000, 2000, 5000, 10000, 25000, 50000];
  const selectedProvider =
    MFS_PROVIDERS.find((p) => p.id === selectedProviderId) || MFS_PROVIDERS[0];

  const primaryFee = (amount * selectedProvider.ratePerThousand) / 1000;
  const netReceived = amount - primaryFee;
  const totalToSend = amount + primaryFee;

  const handleCopy = () => {
    const summary =
      lang === 'bn'
        ? `হিসাবকিতাব বিডি — ${selectedProvider.nameBn}\nমূল টাকা: ${formatTaka(amount, 'bn')}\nক্যাশ-আউট চার্জ: ${formatTaka(primaryFee, 'bn')}\nখরচসহ পাঠাতে হবে: ${formatTaka(totalToSend, 'bn')}`
        : `HisabKitab BD — ${selectedProvider.nameEn}\nPrincipal: ${formatTaka(amount, 'en')}\nCash-Out Fee: ${formatTaka(primaryFee, 'en')}\nTotal to Send: ${formatTaka(totalToSend, 'en')}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Input & Result Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              {lang === 'bn' ? 'হিসাবের ধরন নির্বাচন করুন' : 'Select Calculation Mode'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('cashout')}
                className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap truncate ${
                  mode === 'cashout'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'bn' ? 'ক্যাশ-আউট চার্জ কত কাটবে' : 'Standard Cash-Out Fee'}
              </button>
              <button
                type="button"
                onClick={() => setMode('reverse')}
                className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap truncate ${
                  mode === 'reverse'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'bn' ? 'খরচসহ কত টাকা পাঠাতে হবে' : 'Send Amount (With Fee)'}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="mfs-amount"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              {lang === 'bn' ? 'টাকার পরিমাণ লিখুন (৳)' : 'Transaction Amount (BDT)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-500">
                ৳
              </span>
              <LocalizedNumInput
                id="mfs-amount"
                lang={lang}
                min={0}
                max={500000}
                value={amount}
                onChange={setAmount}
                placeholder="10000"
                className="w-full min-h-[48px] pl-10 pr-4 py-2.5 text-xl font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:bg-white transition-colors"
              />
            </div>
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 mt-3">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`min-h-[38px] px-2.5 py-1.5 text-xs font-mono-tabular font-medium rounded-md border transition-colors whitespace-nowrap ${
                    amount === q
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {formatTaka(q, lang, 0)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="mfs-provider"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              {lang === 'bn' ? 'সার্ভিস ও অপশন নির্বাচন করুন' : 'Select MFS Service & Tier'}
            </label>
            <select
              id="mfs-provider"
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700 focus:bg-white"
            >
              {MFS_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {lang === 'bn'
                    ? `${p.nameBn} — হাজারে ${formatNumber(p.ratePerThousand, 'bn')} ৳`
                    : `${p.nameEn} — ${p.ratePerThousand} BDT / 1K`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Primary Focal Output Box */}
        <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? selectedProvider.nameBn : selectedProvider.nameEn}
              </p>
              <p className="text-xs text-teal-400 mt-0.5">
                {lang === 'bn' ? selectedProvider.noteBn : selectedProvider.noteEn}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied
                ? lang === 'bn'
                  ? 'কপি হয়েছে'
                  : 'Copied'
                : lang === 'bn'
                ? 'হিসাব কপি'
                : 'Copy Result'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div>
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'মোট ক্যাশ-আউট চার্জ' : 'Total Cash-Out Fee'}
              </p>
              <p className="text-2xl sm:text-3xl font-mono-tabular font-bold text-amber-400 mt-1">
                {formatTaka(primaryFee, lang)}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-mono-tabular">
                {lang === 'bn'
                  ? `রেট: হাজারে ${formatNumber(selectedProvider.ratePerThousand, 'bn')} টাকা`
                  : `Rate: BDT ${selectedProvider.ratePerThousand} / 1,000`}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                {mode === 'cashout'
                  ? lang === 'bn'
                    ? 'ক্যাশ-আউট পর হাতে পাবেন'
                    : 'Net Cash Received'
                  : lang === 'bn'
                  ? 'খরচসহ মোট পাঠাতে হবে'
                  : 'Total Amount to Send'}
              </p>
              <p className="text-2xl sm:text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
                {formatTaka(mode === 'cashout' ? netReceived : totalToSend, lang)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'cashout'
                  ? lang === 'bn'
                    ? `এজেন্টকে ${formatTaka(amount, 'bn', 0)} দিলে`
                    : `When cashing out ${formatTaka(amount, 'en', 0)}`
                  : lang === 'bn'
                  ? `যেন প্রাপক পুরো ${formatTaka(amount, 'bn', 0)} তুলতে পারেন`
                  : `So recipient withdraws full ${formatTaka(amount, 'en', 0)}`}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? `কথায় (মোট): ${numberToBanglaWords(Math.round(totalToSend))}`
              : `In words: ${numberToEnglishWords(Math.round(totalToSend))}`}
          </div>
        </div>
      </div>

      {/* Side-by-Side All Providers Comparison (Responsive Cards on Mobile, Table on Tablet/Desktop) */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3">
          {lang === 'bn'
            ? `${formatTaka(amount, 'bn', 0)} লেনদেনে সব মোবাইল ব্যাংকিং সার্ভিসের তুলনামূলক চার্জ`
            : `Side-by-Side Fee Comparison for ${formatTaka(amount, 'en', 0)} Across All MFS Providers`}
        </h3>

        {/* Mobile View (< 640px): Clean Touch-Friendly List */}
        <div className="sm:hidden divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
          {MFS_PROVIDERS.map((prov) => {
            const fee = (amount * prov.ratePerThousand) / 1000;
            const withFee = amount + fee;
            const isSelected = prov.id === selectedProviderId;
            return (
              <button
                key={prov.id}
                type="button"
                onClick={() => setSelectedProviderId(prov.id)}
                className={`w-full text-left p-3.5 transition-colors ${
                  isSelected ? 'bg-teal-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {lang === 'bn' ? prov.nameBn : prov.nameEn}
                  </span>
                  <span className="text-xs font-mono-tabular text-slate-500">
                    {formatTaka(prov.ratePerThousand, lang)}/{lang === 'bn' ? 'হাজার' : '1K'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1.5 text-xs">
                  <span className="text-amber-800 font-medium">
                    {lang === 'bn' ? 'চার্জ: ' : 'Fee: '}
                    <strong className="font-mono-tabular">{formatTaka(fee, lang)}</strong>
                  </span>
                  <span className="text-teal-800 font-medium">
                    {lang === 'bn' ? 'খরচসহ: ' : 'Total: '}
                    <strong className="font-mono-tabular">{formatTaka(withFee, lang)}</strong>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tablet & Desktop View (>= 640px): Full Data Table */}
        <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">{lang === 'bn' ? 'সার্ভিসের নাম' : 'Provider & Tier'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'হাজারে রেট' : 'Rate / 1K'}</th>
                <th className="py-3 px-4 text-right">{lang === 'bn' ? 'ক্যাশ-আউট চার্জ' : 'Fee (BDT)'}</th>
                <th className="py-3 px-4 text-right">
                  {lang === 'bn' ? 'খরচসহ পাঠাতে হবে' : 'Send With Fee'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {MFS_PROVIDERS.map((prov) => {
                const fee = (amount * prov.ratePerThousand) / 1000;
                const withFee = amount + fee;
                const isSelected = prov.id === selectedProviderId;
                return (
                  <tr
                    key={prov.id}
                    onClick={() => setSelectedProviderId(prov.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-teal-50/70 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-900">
                      {lang === 'bn' ? prov.nameBn : prov.nameEn}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-slate-600">
                      {formatTaka(prov.ratePerThousand, lang)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-amber-700">
                      {formatTaka(fee, lang)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-teal-800">
                      {formatTaka(withFee, lang)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   2. Gold Price (Vori, Ana, Rotti, Point) & Islamic Zakat Calculator
   ============================================================================ */
const GOLD_KARATS = [
  { id: '22k', labelBn: '২২ ক্যারেট (৯১.৬% খাঁটি - হলমার্ক ৯১৬)', labelEn: '22 Karat (91.6% Pure - 916)', defaultRate: 138500 },
  { id: '21k', labelBn: '২১ ক্যারেট (৮৭.৫% খাঁটি - হলমার্ক ৮৭৫)', labelEn: '21 Karat (87.5% Pure - 875)', defaultRate: 132180 },
  { id: '18k', labelBn: '১৮ ক্যারেট (৭৫.০% খাঁটি - হলমার্ক ৭৫০)', labelEn: '18 Karat (75.0% Pure - 750)', defaultRate: 113300 },
  { id: 'trad', labelBn: 'সনাতন পদ্ধতি (Traditional)', labelEn: 'Traditional Method', defaultRate: 93000 },
];

const GoldZakatCalculator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [subTab, setSubTab] = useState<'gold' | 'zakat'>('gold');

  // Gold Calculator states
  const [karatId, setKaratId] = useState<string>('22k');
  const [voriRate, setVoriRate] = useState<number>(138500);
  const [vori, setVori] = useState<number>(1);
  const [ana, setAna] = useState<number>(4);
  const [rotti, setRotti] = useState<number>(2);
  const [point, setPoint] = useState<number>(0);
  const [makingPerVori, setMakingPerVori] = useState<number>(4500);
  const [includeVat, setIncludeVat] = useState<boolean>(true);

  // Zakat Calculator states
  const [cashBank, setCashBank] = useState<number>(350000);
  const [goldSilverValue, setGoldSilverValue] = useState<number>(250000);
  const [businessGoods, setBusinessGoods] = useState<number>(0);
  const [otherInvestments, setOtherInvestments] = useState<number>(50000);
  const [liabilities, setLiabilities] = useState<number>(20000);
  const [silverNisabPrice, setSilverNisabPrice] = useState<number>(110000);

  const handleKaratChange = (newId: string) => {
    setKaratId(newId);
    const found = GOLD_KARATS.find((k) => k.id === newId);
    if (found) setVoriRate(found.defaultRate);
  };

  // 1 Vori = 16 Ana = 96 Rotti = 960 Points = 11.664 Grams
  const totalPoints = vori * 960 + ana * 60 + rotti * 10 + point;
  const totalVoriFraction = totalPoints / 960;
  const totalGrams = totalVoriFraction * 11.664;

  const rawGoldPrice = totalVoriFraction * voriRate;
  const totalMakingCharge = totalVoriFraction * makingPerVori;
  const vatAmount = includeVat ? rawGoldPrice * 0.05 : 0;
  const totalJewelleryPayable = rawGoldPrice + totalMakingCharge + vatAmount;
  const exchangeValue90 = rawGoldPrice * 0.9;
  const cashSellValue83 = rawGoldPrice * 0.83;

  // Zakat calculation
  const grossAssets = cashBank + goldSilverValue + businessGoods + otherInvestments;
  const netZakatableAssets = Math.max(0, grossAssets - liabilities);
  const isNisabEligible = netZakatableAssets >= silverNisabPrice;
  const zakatPayable = netZakatableAssets * 0.025;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Sub-mode switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg max-w-md">
        <button
          type="button"
          onClick={() => setSubTab('gold')}
          className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            subTab === 'gold'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {lang === 'bn' ? 'স্বর্ণের গহনার দাম হিসাব' : 'Gold Jewellery Calculator'}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('zakat')}
          className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            subTab === 'zakat'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {lang === 'bn' ? 'যাকাত ও নিসাব ক্যালকুলেটর' : 'Zakat & Nisab Calculator'}
        </button>
      </div>

      {subTab === 'gold' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  {lang === 'bn' ? 'স্বর্ণের ক্যারেট নির্বাচন' : 'Select Gold Karat'}
                </label>
                <select
                  value={karatId}
                  onChange={(e) => handleKaratChange(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                >
                  {GOLD_KARATS.map((k) => (
                    <option key={k.id} value={k.id}>
                      {lang === 'bn' ? k.labelBn : k.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  {lang === 'bn' ? 'প্রতি ভরির বাজারমূল্য (৳)' : 'Price per Vori (BDT)'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  min={0}
                  max={500000}
                  value={voriRate}
                  onChange={setVoriRate}
                  className="w-full min-h-[44px] px-3 py-2.5 text-base font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                {lang === 'bn'
                  ? 'স্বর্ণের ওজন দিন (১ ভরি = ১৬ আনা = ৯৬ রতি = ১১.৬৬৪ গ্রাম)'
                  : 'Enter Ornament Weight (Vori, Ana, Rotti, Point)'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="block text-xs text-slate-600 mb-1">
                    {lang === 'bn' ? 'ভরি (০+)' : 'Vori'}
                  </span>
                  <LocalizedNumInput
                    lang={lang}
                    min={0}
                    max={500}
                    value={vori}
                    onChange={setVori}
                    className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <span className="block text-xs text-slate-600 mb-1">
                    {lang === 'bn' ? 'আনা (০–১৫)' : 'Ana (0–15)'}
                  </span>
                  <LocalizedNumInput
                    lang={lang}
                    min={0}
                    max={15}
                    value={ana}
                    onChange={setAna}
                    className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <span className="block text-xs text-slate-600 mb-1">
                    {lang === 'bn' ? 'রতি (০–৫)' : 'Rotti (0–5)'}
                  </span>
                  <LocalizedNumInput
                    lang={lang}
                    min={0}
                    max={5}
                    value={rotti}
                    onChange={setRotti}
                    className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <span className="block text-xs text-slate-600 mb-1">
                    {lang === 'bn' ? 'পয়েন্ট (০–৯)' : 'Point (0–9)'}
                  </span>
                  <LocalizedNumInput
                    lang={lang}
                    min={0}
                    max={9}
                    value={point}
                    onChange={setPoint}
                    className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  {lang === 'bn' ? 'মজুরি প্রতি ভরি (৳)' : 'Making Charge per Vori'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  min={0}
                  max={100000}
                  value={makingPerVori}
                  onChange={setMakingPerVori}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <label className="flex items-center gap-2.5 min-h-[42px] py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeVat}
                  onChange={(e) => setIncludeVat(e.target.checked)}
                  className="w-4 h-4 accent-teal-700 rounded"
                />
                <span className="text-sm font-medium text-slate-800">
                  {lang === 'bn' ? '৫% সরকারি ভ্যাট যুক্ত করুন' : 'Include 5% Govt VAT'}
                </span>
              </label>
            </div>
          </div>

          <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">
                  {lang === 'bn'
                    ? 'মোট গহনার দাম (ভ্যাট ও মজুরিসহ)'
                    : 'Total Jewellery Payable (incl. VAT & Making)'}
                </p>
                <p className="text-2xl sm:text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
                  {formatTaka(totalJewelleryPayable, lang, 0)}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'গ্রামে মোট ওজন' : 'Weight in Grams'}
                </p>
                <p className="text-lg font-mono-tabular font-semibold text-amber-400">
                  {formatNumber(totalGrams, lang, 3)} {lang === 'bn' ? 'গ্রাম' : 'g'}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800 text-sm">
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-slate-300">
                  {lang === 'bn' ? 'শুধু স্বর্ণের মূল্য (খাঁটি ওজন দাম)' : 'Base Gold Value'}
                </span>
                <span className="font-mono-tabular font-semibold">
                  {formatTaka(rawGoldPrice, lang, 0)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-slate-300">
                  {lang === 'bn' ? '৫% সরকারি ভ্যাট' : '5% Government VAT'}
                </span>
                <span className="font-mono-tabular font-semibold text-amber-300">
                  {formatTaka(vatAmount, lang, 0)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-slate-300">
                  {lang === 'bn' ? 'কারিগরি মজুরি' : 'Artisan Making Charge'}
                </span>
                <span className="font-mono-tabular font-semibold">
                  {formatTaka(totalMakingCharge, lang, 0)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2 text-xs text-slate-400">
                <span>
                  {lang === 'bn'
                    ? 'পুরাতন গহনা এক্সচেঞ্জ মূল্য (১০% বাদ)'
                    : 'Resale Exchange Value (-10%)'}
                </span>
                <span className="font-mono-tabular text-slate-200">
                  {formatTaka(exchangeValue90, lang, 0)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2 text-xs text-slate-400">
                <span>
                  {lang === 'bn'
                    ? 'নগদ বিক্রয় মূল্য (১৭% বাদ)'
                    : 'Cash Buyback Value (-17%)'}
                </span>
                <span className="font-mono-tabular text-slate-200">
                  {formatTaka(cashSellValue83, lang, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'নগদ টাকা ও ব্যাংক ব্যালেন্স (৳)' : 'Cash & Bank Savings (BDT)'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  value={cashBank}
                  onChange={setCashBank}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'স্বর্ণ ও রৌপ্যের বাজারমূল্য (৳)' : 'Gold & Silver Value (BDT)'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  value={goldSilverValue}
                  onChange={setGoldSilverValue}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ব্যবসায়িক পণ্যের মজুদ (৳)' : 'Business Inventory (BDT)'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  value={businessGoods}
                  onChange={setBusinessGoods}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সঞ্চয়পত্র / শেয়ার / ডিপিএস (৳)' : 'Investments / Shares (BDT)'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  value={otherInvestments}
                  onChange={setOtherInvestments}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বাদ: তাৎক্ষণিক ঋণ ও বকেয়া (৳)' : 'Less: Immediate Debts (BDT)'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  value={liabilities}
                  onChange={setLiabilities}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'রৌপ্য নিসাব মূল্য (৫২.৫ ভরি রূপা)' : 'Silver Nisab Threshold (BDT)'}
                </label>
                <LocalizedNumInput
                  lang={lang}
                  value={silverNisabPrice}
                  onChange={setSilverNisabPrice}
                  className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <p className="text-xs text-slate-400">
                {lang === 'bn' ? 'মোট প্রদেয় ফরজ যাকাত (২.৫%)' : 'Total Obligatory Zakat (2.5%)'}
              </p>
              <p className="text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
                {formatTaka(isNisabEligible ? zakatPayable : 0, lang, 0)}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {isNisabEligible
                  ? lang === 'bn'
                    ? 'আপনার নিট সম্পদ নিসাব পরিমাণ অতিক্রম করেছে (যাকাত প্রযোজ্য)'
                    : 'Your net wealth exceeds the Nisab threshold (Zakat applicable)'
                  : lang === 'bn'
                  ? 'আপনার নিট সম্পদ নিসাব পরিমাণের নিচে (যাকাত ফরজ নয়)'
                  : 'Below Nisab threshold'}
              </p>
            </div>
            <div className="divide-y divide-slate-800 text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-300">
                  {lang === 'bn' ? 'মোট যাকাতযোগ্য সম্পদ' : 'Gross Assets'}
                </span>
                <span className="font-mono-tabular font-semibold">
                  {formatTaka(grossAssets, lang, 0)}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-300">
                  {lang === 'bn' ? 'ঋণ বাদে নিট সম্পদ' : 'Net Zakatable Wealth'}
                </span>
                <span className="font-mono-tabular font-semibold text-amber-300">
                  {formatTaka(netZakatableAssets, lang, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   3. Bangladesh Land Area Converter (Shotok, Katha, Bigha, Kani, Sq Ft)
   ============================================================================ */
const LandMeasureCalculator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [north, setNorth] = useState<number>(66);
  const [south, setSouth] = useState<number>(66);
  const [east, setEast] = useState<number>(33);
  const [west, setWest] = useState<number>(33);
  const [pricePerShotok, setPricePerShotok] = useState<number>(250000);

  const avgLength = (north + south) / 2;
  const avgWidth = (east + west) / 2;
  const totalSqFt = avgLength * avgWidth;
  const totalSqMeter = totalSqFt / 10.7639;
  const shotok = totalSqFt / 435.6;
  const kathaStandard = totalSqFt / 720;
  const bigha = totalSqFt / 14400;
  const acre = shotok / 100;
  const kani = totalSqFt / 17280;
  const chotak = totalSqFt / 45;
  const totalPlotValue = shotok * pricePerShotok;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-6 space-y-4">
        <p className="text-xs text-slate-600">
          {lang === 'bn'
            ? 'জমির চারপাশের চার বাহুর দৈর্ঘ্য ফুটে ইনপুট দিন:'
            : 'Enter the 4 boundary lengths of the land parcel in Feet:'}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'উত্তর বাহু (ফুট)' : 'North Side (Feet)'}
            </label>
            <LocalizedNumInput
              lang={lang}
              allowDecimal
              value={north}
              onChange={setNorth}
              className="w-full min-h-[44px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'দক্ষিণ বাহু (ফুট)' : 'South Side (Feet)'}
            </label>
            <LocalizedNumInput
              lang={lang}
              allowDecimal
              value={south}
              onChange={setSouth}
              className="w-full min-h-[44px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'পূর্ব বাহু (ফুট)' : 'East Side (Feet)'}
            </label>
            <LocalizedNumInput
              lang={lang}
              allowDecimal
              value={east}
              onChange={setEast}
              className="w-full min-h-[44px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'পশ্চিম বাহু (ফুট)' : 'West Side (Feet)'}
            </label>
            <LocalizedNumInput
              lang={lang}
              allowDecimal
              value={west}
              onChange={setWest}
              className="w-full min-h-[44px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {lang === 'bn' ? 'প্রতি শতক জমির আনুমানিক মূল্য (৳)' : 'Estimated Price per Shotok (BDT)'}
          </label>
          <LocalizedNumInput
            lang={lang}
            value={pricePerShotok}
            onChange={setPricePerShotok}
            className="w-full min-h-[44px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'মোট শতক / শতাংশ' : 'Total Shotok (Decimal)'}
            </p>
            <p className="text-2xl sm:text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
              {formatNumber(shotok, lang, 2)} {lang === 'bn' ? 'শতক' : 'Shotok'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'প্রমিত কাঠা (৭২০ বর্গফুট)' : 'Standard Katha (720 sq ft)'}
            </p>
            <p className="text-2xl sm:text-3xl font-mono-tabular font-bold text-amber-400 mt-1">
              {formatNumber(kathaStandard, lang, 2)} {lang === 'bn' ? 'কাঠা' : 'Katha'}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800 text-sm">
          <div className="py-2 flex justify-between gap-2">
            <span className="text-slate-300">
              {lang === 'bn' ? 'মোট ক্ষেত্রফল (বর্গফুট / বর্গমিটার)' : 'Total Area (Sq Ft / Sq M)'}
            </span>
            <span className="font-mono-tabular font-semibold text-right">
              {formatNumber(totalSqFt, lang, 1)} {lang === 'bn' ? 'বর্গফুট' : 'sq ft'} (
              {formatNumber(totalSqMeter, lang, 1)} {lang === 'bn' ? 'বর্গমি.' : 'm²'})
            </span>
          </div>
          <div className="py-2 flex justify-between gap-2">
            <span className="text-slate-300">
              {lang === 'bn' ? 'বিঘা (৩৩ শতক / ২০ কাঠা)' : 'Bigha (33 Shotok)'}
            </span>
            <span className="font-mono-tabular font-semibold">
              {formatNumber(bigha, lang, 3)} {lang === 'bn' ? 'বিঘা' : 'Bigha'}
            </span>
          </div>
          <div className="py-2 flex justify-between gap-2">
            <span className="text-slate-300">
              {lang === 'bn' ? 'কানি (১৭,২৮০ বর্গফুট)' : 'Kani (17,280 sq ft)'}
            </span>
            <span className="font-mono-tabular font-semibold">
              {formatNumber(kani, lang, 3)} {lang === 'bn' ? 'কানি' : 'Kani'}
            </span>
          </div>
          <div className="py-2 flex justify-between gap-2">
            <span className="text-slate-300">
              {lang === 'bn' ? 'একর ও ছটাক' : 'Acre & Chotak'}
            </span>
            <span className="font-mono-tabular font-semibold">
              {formatNumber(acre, lang, 3)} {lang === 'bn' ? 'একর' : 'Acre'} · {formatNumber(chotak, lang, 1)}{' '}
              {lang === 'bn' ? 'ছটাক' : 'Chotak'}
            </span>
          </div>
          <div className="py-2.5 flex justify-between gap-2 text-teal-300">
            <span>{lang === 'bn' ? 'জমির মোট আনুমানিক মূল্য' : 'Estimated Land Value'}</span>
            <span className="font-mono-tabular font-semibold">
              {formatTaka(totalPlotValue, lang, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   4. Bank Loan EMI, DPS & FDR Calculator (with TIN 10% / 15% Tax)
   ============================================================================ */
const LoanDpsCalculator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [calcType, setCalcType] = useState<'emi' | 'dps' | 'fdr'>('emi');
  const [principal, setPrincipal] = useState<number>(500000);
  const [rate, setRate] = useState<number>(11.5);
  const [years, setYears] = useState<number>(5);
  const [hasTinPsr, setHasTinPsr] = useState<boolean>(true);

  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = rate / 12 / 100;

  // EMI calculation
  const emi =
    monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
      : principal / months;
  const emiTotalPayment = emi * months;
  const emiTotalInterest = Math.max(0, emiTotalPayment - principal);

  // DPS calculation
  const dpsMonthlyDeposit = principal > 50000 ? 5000 : principal;
  const dpsTotalDeposited = dpsMonthlyDeposit * months;
  const dpsGrossInterest =
    dpsMonthlyDeposit * ((months * (months + 1)) / 2) * (rate / 12 / 100);
  const taxRate = hasTinPsr ? 0.1 : 0.15;
  const dpsTaxAmount = dpsGrossInterest * taxRate;
  const dpsNetMaturity = dpsTotalDeposited + (dpsGrossInterest - dpsTaxAmount);

  // FDR calculation
  const fdrGrossInterest = principal * (rate / 100) * years;
  const fdrTaxAmount = fdrGrossInterest * taxRate;
  const fdrNetMaturity = principal + (fdrGrossInterest - fdrTaxAmount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg max-w-lg">
        <button
          type="button"
          onClick={() => {
            setCalcType('emi');
            setPrincipal(500000);
            setRate(11.5);
          }}
          className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            calcType === 'emi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {lang === 'bn' ? 'ব্যাংক লোন ইএমআই' : 'Bank Loan EMI'}
        </button>
        <button
          type="button"
          onClick={() => {
            setCalcType('dps');
            setPrincipal(5000);
            setRate(9.5);
          }}
          className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            calcType === 'dps' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {lang === 'bn' ? 'মাসিক ডিপিএস (DPS)' : 'Monthly DPS'}
        </button>
        <button
          type="button"
          onClick={() => {
            setCalcType('fdr');
            setPrincipal(500000);
            setRate(10.0);
          }}
          className={`min-h-[40px] py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
            calcType === 'fdr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          {lang === 'bn' ? 'এককালীন এফডিআর' : 'Fixed Deposit (FDR)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              {calcType === 'emi'
                ? lang === 'bn'
                  ? 'লোনের পরিমাণ (৳)'
                  : 'Loan Principal (BDT)'
                : calcType === 'dps'
                ? lang === 'bn'
                  ? 'মাসিক কিস্তির পরিমাণ (৳)'
                  : 'Monthly DPS Installment (BDT)'
                : lang === 'bn'
                ? 'এফডিআর জমার পরিমাণ (৳)'
                : 'FDR Deposit Amount (BDT)'}
            </label>
            <LocalizedNumInput
              lang={lang}
              min={0}
              value={principal}
              onChange={setPrincipal}
              className="w-full min-h-[44px] px-3.5 py-2.5 font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                {lang === 'bn' ? 'বার্ষিক সুদ/মুনাফার হার (%)' : 'Annual Rate (%)'}
              </label>
              <LocalizedNumInput
                lang={lang}
                allowDecimal
                min={0.1}
                max={30}
                value={rate}
                onChange={setRate}
                className="w-full min-h-[44px] px-3.5 py-2.5 font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                {lang === 'bn' ? 'মেয়াদ (বছর)' : 'Tenure (Years)'}
              </label>
              <LocalizedNumInput
                lang={lang}
                min={1}
                max={30}
                value={years}
                onChange={(v) => setYears(Math.max(1, v))}
                className="w-full min-h-[44px] px-3.5 py-2.5 font-mono-tabular font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {calcType !== 'emi' && (
            <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={hasTinPsr}
                onChange={(e) => setHasTinPsr(e.target.checked)}
                className="w-4 h-4 accent-teal-700 shrink-0"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-800">
                {lang === 'bn'
                  ? 'আয়কর রিটার্ন স্লিপ (PSR/TIN) জমা দেওয়া আছে (১০% উৎস কর, না থাকলে ১৫%)'
                  : 'Income Tax Return PSR Submitted (10% AIT instead of 15%)'}
              </span>
            </label>
          )}
        </div>

        <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-5 sm:p-6 space-y-4">
          {calcType === 'emi' ? (
            <>
              <div className="border-b border-slate-800 pb-4">
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'মাসিক কিস্তির পরিমাণ (ইএমআই)' : 'Monthly EMI Installment'}
                </p>
                <p className="text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
                  {formatTaka(emi, lang, 0)}
                </p>
              </div>
              <div className="divide-y divide-slate-800 text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-300">
                    {lang === 'bn' ? 'আসল ঋণের পরিমাণ' : 'Principal Loan Amount'}
                  </span>
                  <span className="font-mono-tabular font-semibold">
                    {formatTaka(principal, lang, 0)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-300">
                    {lang === 'bn'
                      ? `${formatNumber(months, 'bn', 0)} মাসে মোট সুদ`
                      : `Total Interest (${months} Months)`}
                  </span>
                  <span className="font-mono-tabular font-semibold text-amber-400">
                    {formatTaka(emiTotalInterest, lang, 0)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-300">
                    {lang === 'bn' ? 'সুদসহ সর্বমোট পরিশোধ' : 'Total Payable (Principal + Interest)'}
                  </span>
                  <span className="font-mono-tabular font-semibold text-teal-300">
                    {formatTaka(emiTotalPayment, lang, 0)}
                  </span>
                </div>
              </div>
            </>
          ) : calcType === 'dps' ? (
            <>
              <div className="border-b border-slate-800 pb-4">
                <p className="text-xs text-slate-400">
                  {lang === 'bn'
                    ? 'উৎস কর বাদে মেয়াদান্তে হাতে পাবেন'
                    : 'Net Maturity Value (After Source Tax)'}
                </p>
                <p className="text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
                  {formatTaka(dpsNetMaturity, lang, 0)}
                </p>
              </div>
              <div className="divide-y divide-slate-800 text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-300">
                    {lang === 'bn' ? 'মোট জমাকৃত আসল' : 'Total Principal Deposited'}
                  </span>
                  <span className="font-mono-tabular font-semibold">
                    {formatTaka(dpsTotalDeposited, lang, 0)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-300">
                    {lang === 'bn' ? 'মোট অর্জিত মুনাফা (কর পূর্ব)' : 'Gross Profit Earned'}
                  </span>
                  <span className="font-mono-tabular font-semibold text-teal-300">
                    {formatTaka(dpsGrossInterest, lang, 0)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-300">
                    {lang === 'bn'
                      ? `সরকারি উৎস কর (${hasTinPsr ? '১০%' : '১৫%'})`
                      : `Source Tax AIT (${hasTinPsr ? '10%' : '15%'})`}
                  </span>
                  <span className="font-mono-tabular font-semibold text-amber-400">
                    - {formatTaka(dpsTaxAmount, lang, 0)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-slate-800 pb-4">
                <p className="text-xs text-slate-400">
                  {lang === 'bn'
                    ? 'এফডিআর মেয়াদান্তে নিট প্রাপ্য (কর বাদে)'
                    : 'FDR Net Maturity Payout (After Tax)'}
                </p>
                <p className="text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
                  {formatTaka(fdrNetMaturity, lang, 0)}
                </p>
              </div>
              <div className="divide-y divide-slate-800 text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-300">
                    {lang === 'bn' ? 'এককালীন জমা (আসল)' : 'FDR Principal'}
                  </span>
                  <span className="font-mono-tabular font-semibold">
                    {formatTaka(principal, lang, 0)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-300">
                    {lang === 'bn' ? 'মোট মুনাফা (কর পূর্ব)' : 'Gross Interest'}
                  </span>
                  <span className="font-mono-tabular font-semibold text-teal-300">
                    {formatTaka(fdrGrossInterest, lang, 0)}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-300">
                    {lang === 'bn'
                      ? `সরকারি উৎস কর (${hasTinPsr ? '১০%' : '১৫%'})`
                      : `Source Tax Deduction (${hasTinPsr ? '10%' : '15%'})`}
                  </span>
                  <span className="font-mono-tabular font-semibold text-amber-400">
                    - {formatTaka(fdrTaxAmount, lang, 0)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. Bangladesh Residential Electricity Bill (BERC Slab Tariff) Calculator
   ============================================================================ */
const BERC_SLABS = [
  { min: 1, max: 75, rate: 5.26, labelBn: '১ম ধাপ (০ – ৭৫ ইউনিট)', labelEn: 'Slab 1 (0 – 75 kWh)' },
  { min: 76, max: 200, rate: 7.2, labelBn: '২য় ধাপ (৭৬ – ২০০ ইউনিট)', labelEn: 'Slab 2 (76 – 200 kWh)' },
  { min: 201, max: 300, rate: 7.59, labelBn: '৩য় ধাপ (২০১ – ৩০০ ইউনিট)', labelEn: 'Slab 3 (201 – 300 kWh)' },
  { min: 301, max: 400, rate: 8.02, labelBn: '৪র্থ ধাপ (৩০১ – ৪০০ ইউনিট)', labelEn: 'Slab 4 (301 – 400 kWh)' },
  { min: 401, max: 600, rate: 12.67, labelBn: '৫ম ধাপ (৪০১ – ৬০০ ইউনিট)', labelEn: 'Slab 5 (401 – 600 kWh)' },
  { min: 601, max: Infinity, rate: 14.61, labelBn: '৬ষ্ঠ ধাপ (৬০০+ ইউনিট)', labelEn: 'Slab 6 (600+ kWh)' },
];

const ElectricityBillCalculator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [units, setUnits] = useState<number>(245);
  const [loadKw, setLoadKw] = useState<number>(2);

  const slabRows: { label: string; usedUnits: number; rate: number; cost: number }[] = [];
  let energyCharge = 0;

  if (units <= 50) {
    const cost = units * 4.63;
    energyCharge = cost;
    slabRows.push({
      label: lang === 'bn' ? 'লাইফ-লাইন (০ – ৫০ ইউনিট)' : 'Lifeline (0 – 50 kWh)',
      usedUnits: units,
      rate: 4.63,
      cost,
    });
  } else {
    let remaining = units;
    let prevMax = 0;
    for (const slab of BERC_SLABS) {
      if (remaining <= 0) break;
      const slabCapacity = slab.max === Infinity ? remaining : slab.max - prevMax;
      const usedInSlab = Math.min(remaining, slabCapacity);
      const cost = usedInSlab * slab.rate;
      energyCharge += cost;
      slabRows.push({
        label: lang === 'bn' ? slab.labelBn : slab.labelEn,
        usedUnits: usedInSlab,
        rate: slab.rate,
        cost,
      });
      remaining -= usedInSlab;
      prevMax = slab.max;
    }
  }

  const demandCharge = loadKw * 42;
  const subtotal = energyCharge + demandCharge;
  const vat5 = subtotal * 0.05;
  const totalBill = subtotal + vat5;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            {lang === 'bn' ? 'মাসিক ব্যবহৃত বিদ্যুৎ (ইউনিট)' : 'Monthly Consumed Units (kWh)'}
          </label>
          <LocalizedNumInput
            lang={lang}
            min={0}
            max={10000}
            value={units}
            onChange={setUnits}
            className="w-full min-h-[44px] px-3.5 py-2.5 text-lg font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            {lang === 'bn'
              ? 'অনুমোদিত মিটার লোড (কিলোওয়াট - ডিমান্ড চার্জ ৪২ ৳)'
              : 'Sanctioned Load (kW - Demand Charge 42 BDT/kW)'}
          </label>
          <select
            value={loadKw}
            onChange={(e) => setLoadKw(Number(e.target.value))}
            className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg"
          >
            {[1, 2, 3, 4, 5, 8].map((kw) => (
              <option key={kw} value={kw}>
                {formatNumber(kw, lang, 0)} {lang === 'bn' ? 'কিলোওয়াট' : 'kW'} ({formatTaka(kw * 42, lang, 0)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="md:col-span-7 bg-slate-900 text-white rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'সর্বমোট মাসিক বিদ্যুৎ বিল (ভ্যাটসহ)' : 'Total Monthly Electricity Bill'}
            </p>
            <p className="text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
              {formatTaka(totalBill, lang, 0)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'গড় প্রতি ইউনিট খরচ' : 'Effective Rate / Unit'}
            </p>
            <p className="text-lg font-mono-tabular font-semibold text-amber-400">
              {formatTaka(units > 0 ? totalBill / units : 0, lang, 2)}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800 text-xs sm:text-sm">
          {slabRows.map((r, idx) => (
            <div key={idx} className="py-2 flex justify-between gap-2">
              <span className="text-slate-300">
                {r.label}: {formatNumber(r.usedUnits, lang, 0)} × {formatNumber(r.rate, lang, 2)}
              </span>
              <span className="font-mono-tabular font-semibold">{formatTaka(r.cost, lang)}</span>
            </div>
          ))}
          <div className="py-2 flex justify-between text-slate-300">
            <span>{lang === 'bn' ? 'ডিমান্ড চার্জ' : 'Demand Charge'}</span>
            <span className="font-mono-tabular">{formatTaka(demandCharge, lang, 0)}</span>
          </div>
          <div className="py-2 flex justify-between text-amber-300">
            <span>{lang === 'bn' ? '৫% সরকারি ভ্যাট' : '5% VAT'}</span>
            <span className="font-mono-tabular">{formatTaka(vat5, lang)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   6. Exact Age, Govt Job Eligibility (32-Year Limit) & BMI Calculator
   ============================================================================ */
const AgeJobCalculator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [dob, setDob] = useState<string>('1998-05-15');
  const [targetDate, setTargetDate] = useState<string>('2026-09-28');
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInch, setHeightInch] = useState<number>(6);
  const [weightKg, setWeightKg] = useState<number>(68);

  const birth = new Date(dob);
  const target = new Date(targetDate);

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.max(
    0,
    Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  );
  const isJobEligible32 = years < 32 || (years === 32 && months === 0 && days === 0);

  // BMI calculation
  const totalInches = heightFeet * 12 + heightInch;
  const heightMeters = totalInches * 0.0254;
  const bmi = heightMeters > 0 ? weightKg / (heightMeters * heightMeters) : 0;
  const idealMinKg = 18.5 * heightMeters * heightMeters;
  const idealMaxKg = 24.9 * heightMeters * heightMeters;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <div className="md:col-span-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'জন্মতারিখ (SSC সনদ/NID অনুযায়ী)' : 'Date of Birth'}
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 font-mono-tabular text-sm bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'সার্কুলারের বা আজকের তারিখ' : 'Target / Circular Date'}
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 font-mono-tabular text-sm bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-700 mb-2">
            {lang === 'bn' ? 'বিএমআই ও আদর্শ ওজন পরিমাপ' : 'BMI & Ideal Weight Check'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="block text-xs text-slate-600 mb-1">
                {lang === 'bn' ? 'উচ্চতা (ফুট)' : 'Feet'}
              </span>
              <LocalizedNumInput
                lang={lang}
                min={3}
                max={7}
                value={heightFeet}
                onChange={setHeightFeet}
                className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <span className="block text-xs text-slate-600 mb-1">
                {lang === 'bn' ? 'ইঞ্চি (০–১১)' : 'Inches (0–11)'}
              </span>
              <LocalizedNumInput
                lang={lang}
                min={0}
                max={11}
                value={heightInch}
                onChange={setHeightInch}
                className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <span className="block text-xs text-slate-600 mb-1">
                {lang === 'bn' ? 'ওজন (কেজি)' : 'Weight (kg)'}
              </span>
              <LocalizedNumInput
                lang={lang}
                min={15}
                max={250}
                value={weightKg}
                onChange={setWeightKg}
                className="w-full min-h-[42px] px-3 py-2 font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-slate-800 pb-4">
          <p className="text-xs text-slate-400">
            {lang === 'bn' ? 'নির্ধারিত তারিখে আপনার সঠিক বয়স' : 'Your Exact Chronological Age'}
          </p>
          <p className="text-2xl sm:text-3xl font-mono-tabular font-bold text-teal-400 mt-1">
            {lang === 'bn'
              ? `${formatNumber(years, 'bn', 0)} বছর ${formatNumber(months, 'bn', 0)} মাস ${formatNumber(days, 'bn', 0)} দিন`
              : `${years} Years, ${months} Months, ${days} Days`}
          </p>
          <p className="text-xs text-slate-300 mt-1.5">
            {isJobEligible32
              ? lang === 'bn'
                ? 'সরকারি চাকরির বয়সসীমা (৩২ বছর): আবেদন করার যোগ্য'
                : 'Govt Job Limit (32 Years): Eligible to Apply'
              : lang === 'bn'
              ? 'সরকারি চাকরির সাধারণ বয়সসীমা (৩২ বছর) অতিক্রান্ত হয়েছে'
              : 'Above 32-year standard Government job entry cap'}
          </p>
        </div>

        <div className="divide-y divide-slate-800 text-sm">
          <div className="py-2 flex justify-between">
            <span className="text-slate-300">
              {lang === 'bn' ? 'সর্বমোট অতিবাহিত দিন' : 'Total Days Lived'}
            </span>
            <span className="font-mono-tabular font-semibold">
              {formatNumber(totalDays, lang, 0)} {lang === 'bn' ? 'দিন' : 'Days'}
            </span>
          </div>
          <div className="py-2 flex justify-between">
            <span className="text-slate-300">
              {lang === 'bn' ? 'বডি মাস ইনডেক্স (BMI)' : 'Body Mass Index (BMI)'}
            </span>
            <span className="font-mono-tabular font-semibold text-amber-400">
              {formatNumber(bmi, lang, 1)} ({bmi >= 18.5 && bmi <= 24.9 ? (lang === 'bn' ? 'স্বাভাবিক' : 'Normal') : (lang === 'bn' ? 'পর্যালোচনা প্রয়োজন' : 'Review')})
            </span>
          </div>
          <div className="py-2 flex justify-between">
            <span className="text-slate-300">
              {lang === 'bn' ? 'আপনার উচ্চতায় আদর্শ ওজন' : 'Ideal Healthy Weight Range'}
            </span>
            <span className="font-mono-tabular font-semibold text-teal-300">
              {formatNumber(idealMinKg, lang, 1)} – {formatNumber(idealMaxKg, lang, 1)}{' '}
              {lang === 'bn' ? 'কেজি' : 'kg'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   7. Taka in Words (Bangla/English Cheque Helper) & Printable Cash Memo
   ============================================================================ */
const TakaWordsMemoCalculator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [chequeAmount, setChequeAmount] = useState<number>(125500);
  const [shopName, setShopName] = useState<string>('মেসার্স আল-আমিন ট্রেডার্স');
  const [customerName, setCustomerName] = useState<string>('মোঃ রাশেদুল ইসলাম');
  const [items, setItems] = useState([
    { id: 1, name: 'প্রিমিয়াম বাসমতি চাল (২৫ কেজি বস্তা)', qty: 2, price: 2450 },
    { id: 2, name: 'সয়াবিন তেল (৫ লিটার বোতল)', qty: 3, price: 890 },
  ]);
  const [copiedBn, setCopiedBn] = useState(false);

  const bnWords = numberToBanglaWords(chequeAmount);
  const enWords = numberToEnglishWords(chequeAmount);

  const memoTotal = items.reduce((acc, item) => acc + item.qty * item.price, 0);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), name: lang === 'bn' ? 'নতুন পণ্য বা সেবা' : 'New Item', qty: 1, price: 500 },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Cheque Number to Words Converter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            {lang === 'bn'
              ? 'চেক বা দলিলে লেখার জন্য টাকার অংক দিন (৳)'
              : 'Enter Amount for Cheque / Deed Wording (BDT)'}
          </label>
          <LocalizedNumInput
            lang={lang}
            min={0}
            max={999999999}
            value={chequeAmount}
            onChange={setChequeAmount}
            className="w-full min-h-[48px] px-4 py-2.5 text-xl font-mono-tabular font-semibold bg-slate-50 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="md:col-span-7 bg-slate-900 text-white rounded-xl p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <p className="text-xs text-slate-400">বাংলায় কথায় প্রকাশ (ব্যাংক চেক ও দলিল):</p>
              <p className="text-base sm:text-lg font-semibold text-teal-400 mt-0.5">{bnWords}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(bnWords);
                setCopiedBn(true);
                setTimeout(() => setCopiedBn(false), 1800);
              }}
              className="min-h-[36px] px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-md whitespace-nowrap"
            >
              {copiedBn ? 'কপি হয়েছে' : 'কপি করুন'}
            </button>
          </div>
          <div>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'ইংরেজিতে কথায় প্রকাশ (English Cheque):' : 'In Words (English Bank Cheque):'}
            </p>
            <p className="text-sm sm:text-base font-medium text-amber-300 mt-0.5">{enWords}</p>
          </div>
        </div>
      </div>

      {/* Instant Printable Cash Memo */}
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900">
            {lang === 'bn'
              ? 'ইনস্ট্যান্ট ক্যাশ মেমো / ইনভয়েস জেনারেটর'
              : 'Instant Printable Cash Memo / Invoice Builder'}
          </h3>
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'নতুন সারি যোগ করুন' : 'Add Item Row'}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'প্রিন্ট / PDF সেভ' : 'Print / Save PDF'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              {lang === 'bn' ? 'প্রতিষ্ঠান বা দোকানের নাম' : 'Business / Shop Name'}
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              {lang === 'bn' ? 'ক্রেতার নাম' : 'Customer Name'}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* Responsive Cash Memo Items */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="hidden sm:grid sm:grid-cols-12 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 py-2.5 px-3 gap-2">
            <div className="col-span-6">{lang === 'bn' ? 'পণ্যের বিবরণ' : 'Item Description'}</div>
            <div className="col-span-2 text-right">{lang === 'bn' ? 'পরিমাণ' : 'Qty'}</div>
            <div className="col-span-2 text-right">{lang === 'bn' ? 'দর (৳)' : 'Rate'}</div>
            <div className="col-span-2 text-right">{lang === 'bn' ? 'মোট (৳)' : 'Total'}</div>
          </div>

          <div className="divide-y divide-slate-200">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:py-2 sm:px-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-sm"
              >
                <div className="sm:col-span-6">
                  <span className="sm:hidden block text-[11px] text-slate-500 mb-1">
                    {lang === 'bn' ? 'পণ্যের বিবরণ' : 'Item Description'}
                  </span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      setItems(
                        items.map((i) => (i.id === item.id ? { ...i, name: e.target.value } : i))
                      )
                    }
                    className="w-full min-h-[38px] px-2.5 py-1.5 bg-slate-50 sm:bg-transparent border border-slate-200 sm:border-transparent focus:border-slate-300 rounded"
                  />
                </div>

                <div className="grid grid-cols-3 sm:contents gap-2 items-end">
                  <div className="sm:col-span-2">
                    <span className="sm:hidden block text-[11px] text-slate-500 mb-1">
                      {lang === 'bn' ? 'পরিমাণ' : 'Qty'}
                    </span>
                    <LocalizedNumInput
                      lang={lang}
                      min={1}
                      max={99999}
                      value={item.qty}
                      onChange={(val) =>
                        setItems(
                          items.map((i) =>
                            i.id === item.id ? { ...i, qty: Math.max(1, val) } : i
                          )
                        )
                      }
                      className="w-full min-h-[38px] px-2 py-1 text-right font-mono-tabular bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <span className="sm:hidden block text-[11px] text-slate-500 mb-1">
                      {lang === 'bn' ? 'দর (৳)' : 'Rate'}
                    </span>
                    <LocalizedNumInput
                      lang={lang}
                      min={0}
                      max={9999999}
                      value={item.price}
                      onChange={(val) =>
                        setItems(
                          items.map((i) => (i.id === item.id ? { ...i, price: val } : i))
                        )
                      }
                      className="w-full min-h-[38px] px-2 py-1 text-right font-mono-tabular bg-slate-50 border border-slate-200 rounded"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-end gap-2">
                    <div className="text-right">
                      <span className="sm:hidden block text-[11px] text-slate-500 mb-1">
                        {lang === 'bn' ? 'মোট' : 'Total'}
                      </span>
                      <span className="font-mono-tabular font-semibold text-slate-900">
                        {formatTaka(item.qty * item.price, lang, 0)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 no-print"
                      title="Delete row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 font-semibold">
            <span className="text-xs sm:text-sm text-slate-700">
              {lang === 'bn'
                ? `কথায়: ${numberToBanglaWords(memoTotal)}`
                : `In Words: ${numberToEnglishWords(memoTotal)}`}
            </span>
            <span className="font-mono-tabular text-base sm:text-lg text-teal-800">
              {lang === 'bn' ? 'সর্বমোট: ' : 'Total: '}
              {formatTaka(memoTotal, lang, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
