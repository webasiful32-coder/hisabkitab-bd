export type Language = 'bn' | 'en';

export type ToolId =
  | 'mfs-fee'
  | 'gold-zakat'
  | 'land-measure'
  | 'loan-dps'
  | 'electricity-bill'
  | 'age-job'
  | 'taka-words-memo';

export interface ToolMeta {
  id: ToolId;
  category: 'finance' | 'property' | 'utility' | 'business';
  categoryLabelBn: string;
  categoryLabelEn: string;
  titleBn: string;
  titleEn: string;
  shortDescBn: string;
  shortDescEn: string;
  cpcEstimateUsd: string;
  monthlySearchVolume: string;
  guideTitleBn: string;
  guideTitleEn: string;
  guideIntroBn: string;
  guideIntroEn: string;
  formulaBoxBn: string;
  formulaBoxEn: string;
  howToStepsBn: string[];
  howToStepsEn: string[];
  faqs: {
    qBn: string;
    aBn: string;
    qEn: string;
    aEn: string;
  }[];
}

export interface ArticlePost {
  id: string;
  slug: string;
  categoryBn: string;
  categoryEn: string;
  titleBn: string;
  titleEn: string;
  publishedDateBn: string;
  publishedDateEn: string;
  readTimeBn: string;
  readTimeEn: string;
  authorBn: string;
  authorEn: string;
  relatedToolId: ToolId;
  summaryBn: string;
  summaryEn: string;
  sections: {
    headingBn: string;
    headingEn: string;
    paragraphsBn: string[];
    paragraphsEn: string[];
    keyTakeawayBn?: string;
    keyTakeawayEn?: string;
  }[];
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBnDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function fromBnDigits(input: string): string {
  return String(input)
    .replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
    .replace(/[^\d.]/g, '');
}

export function parseLocalizedNumber(
  raw: string,
  min = 0,
  max = 999999999
): number {
  const cleaned = fromBnDigits(raw);
  if (!cleaned || cleaned === '.') return 0;
  const parsed = parseFloat(cleaned);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(min, Math.min(max, parsed));
}

export function formatNumber(
  num: number,
  lang: Language = 'bn',
  decimals = 2
): string {
  if (!Number.isFinite(num)) return lang === 'bn' ? '০' : '0';
  const rounded = Number(num.toFixed(decimals));
  const formatted = rounded.toLocaleString('en-IN', {
    minimumFractionDigits: decimals > 0 && rounded % 1 !== 0 ? decimals : 0,
    maximumFractionDigits: decimals,
  });
  return lang === 'bn' ? toBnDigits(formatted) : formatted;
}

export function formatTaka(
  num: number,
  lang: Language = 'bn',
  decimals = 2
): string {
  return `৳ ${formatNumber(num, lang, decimals)}`;
}

// Convert integer Taka (up to 99,99,99,999) into official Bangladeshi Bangla words (কথায় প্রকাশ)
const BN_WORDS_0_TO_99: string[] = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

export function numberToBanglaWords(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return 'সঠিক সংখ্যা দিন';
  const whole = Math.floor(amount);
  const poisha = Math.round((amount - whole) * 100);

  if (whole === 0 && poisha === 0) return 'শূন্য টাকা মাত্র';

  const convertChunk = (n: number): string => {
    if (n === 0) return '';
    const parts: string[] = [];
    const koti = Math.floor(n / 10000000);
    let rem = n % 10000000;
    if (koti > 0) {
      parts.push(`${koti < 100 ? BN_WORDS_0_TO_99[koti] : convertChunk(koti)} কোটি`);
    }
    const lakh = Math.floor(rem / 100000);
    rem = rem % 100000;
    if (lakh > 0) {
      parts.push(`${BN_WORDS_0_TO_99[lakh]} লক্ষ`);
    }
    const hajar = Math.floor(rem / 1000);
    rem = rem % 1000;
    if (hajar > 0) {
      parts.push(`${BN_WORDS_0_TO_99[hajar]} হাজার`);
    }
    const shoto = Math.floor(rem / 100);
    rem = rem % 100;
    if (shoto > 0) {
      parts.push(`${BN_WORDS_0_TO_99[shoto]} শত`);
    }
    if (rem > 0) {
      parts.push(BN_WORDS_0_TO_99[rem]);
    }
    return parts.join(' ');
  };

  let result = whole > 0 ? `${convertChunk(whole)} টাকা` : '';
  if (poisha > 0) {
    result += `${result ? ' ' : ''}${BN_WORDS_0_TO_99[poisha]} পয়সা`;
  }
  return `${result} মাত্র`;
}

const EN_ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];
const EN_TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

export function numberToEnglishWords(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return 'Enter a valid amount';
  const whole = Math.floor(amount);
  const poisha = Math.round((amount - whole) * 100);
  if (whole === 0 && poisha === 0) return 'Zero Taka Only';

  const twoDigits = (n: number): string => {
    if (n < 20) return EN_ONES[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return `${EN_TENS[t]}${o > 0 ? ' ' + EN_ONES[o] : ''}`;
  };

  const convertSub = (n: number): string => {
    if (n === 0) return '';
    const parts: string[] = [];
    const crore = Math.floor(n / 10000000);
    let rem = n % 10000000;
    if (crore > 0) {
      parts.push(`${crore < 100 ? twoDigits(crore) : convertSub(crore)} Crore`);
    }
    const lakh = Math.floor(rem / 100000);
    rem = rem % 100000;
    if (lakh > 0) {
      parts.push(`${twoDigits(lakh)} Lakh`);
    }
    const thousand = Math.floor(rem / 1000);
    rem = rem % 1000;
    if (thousand > 0) {
      parts.push(`${twoDigits(thousand)} Thousand`);
    }
    const hundred = Math.floor(rem / 100);
    rem = rem % 100;
    if (hundred > 0) {
      parts.push(`${EN_ONES[hundred]} Hundred`);
    }
    if (rem > 0) {
      parts.push(twoDigits(rem));
    }
    return parts.join(' ');
  };

  let res = whole > 0 ? `${convertSub(whole)} Taka` : '';
  if (poisha > 0) {
    res += `${res ? ' and ' : ''}${twoDigits(poisha)} Poisha`;
  }
  return `${res} Only`;
}

export const TOOLS_META: ToolMeta[] = [
  {
    id: 'mfs-fee',
    category: 'finance',
    categoryLabelBn: 'মোবাইল ব্যাংকিং ও ফিন্যান্স',
    categoryLabelEn: 'Mobile Banking & Finance',
    titleBn: 'বিকাশ, নগদ, রকেট ও উপায় ক্যাশ-আউট ক্যালকুলেটর',
    titleEn: 'bKash, Nagad, Rocket & Upay Cash-Out Fee Calculator',
    shortDescBn: 'অ্যাপ, ইউএসএসডি (*247# / *167#) ও প্রিয় এজেন্টের সঠিক ক্যাশ-আউট খরচ তুলনা এবং কত টাকা পাঠালে প্রাপক নির্ধারিত টাকা পাবেন তার তাৎক্ষণিক হিসাব।',
    shortDescEn: 'Compare exact Cash-Out fees across bKash, Nagad, Rocket & Upay (App vs USSD vs Priya Agent) and calculate reverse send amounts.',
    cpcEstimateUsd: '$0.45 – $1.60',
    monthlySearchVolume: '185,000+ / mo',
    guideTitleBn: 'মোবাইল ব্যাংকিং ক্যাশ-আউট চার্জ হিসাব করার সম্পূর্ণ নির্দেশিকা',
    guideTitleEn: 'Complete Guide to Mobile Financial Services (MFS) Cash-Out Charges in Bangladesh',
    guideIntroBn: 'বাংলাদেশে প্রতিদিনের লেনদেনে বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket) এবং উপায় (Upay) অপরিহার্য। কিন্তু অনেকেই জানেন না যে অ্যাপ এবং বাটন ফোনের USSD কোডের চার্জের মধ্যে পার্থক্য থাকে। আবার কাউকে যদি খরচসহ ১০,০০০ টাকা পাঠাতে চান, তবে ঠিক কত টাকা পাঠাতে হবে যেন ক্যাশ-আউট করার পর তিনি পুরো ১০,০০০ টাকা হাতে পান—সেই রিভার্স ক্যালকুলেশন এই টুলে এক ক্লিকে পাওয়া যায়।',
    guideIntroEn: 'Mobile Financial Services (MFS) like bKash, Nagad, Rocket, and Upay handle millions of daily transactions across Bangladesh. Understanding the difference between App rates, USSD dial rates, and Priya/Favourite agent tiers helps users save up to 25% on transaction fees.',
    formulaBoxBn: 'ক্যাশ-আউট চার্জ = (লেনদেনের পরিমাণ × নির্ধারিত হাজারে রেট) ÷ ১,০০০ | খরচসহ পাঠানোর পরিমাণ = মূল টাকা + ক্যাশ-আউট চার্জ',
    formulaBoxEn: 'Cash-Out Fee = (Amount × Rate per 1,000) ÷ 1,000 | Total Send Amount = Principal + Cash-Out Fee + Send Money Fee',
    howToStepsBn: [
      'প্রথমে আপনি যে পরিমাণ টাকা ক্যাশ-আউট করতে বা পাঠাতে চান তা নির্ধারিত বক্সে লিখুন অথবা কুইক অ্যামাউন্ট বাটনে ক্লিক করুন।',
      'আপনার লেনদেনের ধরন নির্বাচন করুন: "সাধারণ ক্যাশ-আউট হিসাব" অথবা "খরচসহ কত পাঠাতে হবে (Reverse Calculation)"।',
      'নিচের তুলনামূলক তালিকায় বিকাশ (প্রিয় এজেন্ট ১৪.৯০ টাকা ও রেগুলার ১৮.৫০ টাকা), নগদ (অ্যাপ ১২.৫০–১৫ টাকা), রকেট এবং উপায়ের খরচ পাশাপাশি দেখুন।'
    ],
    howToStepsEn: [
      'Enter the transaction amount in BDT or select a quick preset amount.',
      'Choose between Standard Cash-Out Fee mode or Reverse Exact Payout mode (how much to send including fee).',
      'Compare side-by-side deductions for bKash Priya Agent, bKash Regular, Nagad App, Rocket ATM/Agent, and Upay.'
    ],
    faqs: [
      {
        qBn: 'বিকাশে মাসে কত টাকা পর্যন্ত প্রিয় এজেন্টে কম খরচে ক্যাশ-আউট করা যায়?',
        aBn: 'একজন বিকাশ গ্রাহক প্রতি ক্যালেন্ডার মাসে সর্বোচ্চ ৫০,০০০ টাকা পর্যন্ত প্রিয় এজেন্টের মাধ্যমে হাজারে ১৪.৯০ টাকা (১.৪৯%) চার্জে ক্যাশ-আউট করতে পারেন। ৫০,০০০ টাকার অতিরিক্ত অংশে রেগুলার ১৮.৫০ টাকা রেট প্রযোজ্য হয়।',
        qEn: 'What is the monthly limit for bKash Priya Agent discounted cash-out?',
        aEn: 'Users can cash out up to BDT 50,000 per calendar month at the discounted 1.49% (BDT 14.90 per thousand) rate via their designated Priya Agent.'
      },
      {
        qBn: 'খরচসহ ১০,০০০ টাকা পাঠাতে হলে বিকাশে কত টাকা পাঠাতে হবে?',
        aBn: 'প্রিয় এজেন্টে ক্যাশ-আউট করলে ১০,০০০ টাকায় ১৪৯ টাকা চার্জ কাটে (মোট ১০,১৪৯ টাকা) এবং রেগুলার এজেন্টে ১৮৫ টাকা চার্জ কাটে (মোট ১০,১৮৫ টাকা)।',
        qEn: 'How much should I send so the recipient gets exactly BDT 10,000 after cash-out?',
        aEn: 'For a Priya Agent cash-out, send BDT 10,149; for a regular agent cash-out, send BDT 10,185.'
      }
    ]
  },
  {
    id: 'gold-zakat',
    category: 'finance',
    categoryLabelBn: 'স্বর্ণ ও ইসলামিক ফিন্যান্স',
    categoryLabelEn: 'Gold & Islamic Finance',
    titleBn: 'স্বর্ণের দাম (ভরি, আনা, রতি) ও যাকাত ক্যালকুলেটর',
    titleEn: 'BAJUS Gold Jewellery Price & Nisab Zakat Calculator',
    shortDescBn: '২২, ২১ ও ১৮ ক্যারেট স্বর্ণের ভরি, আনা, রতি ও পয়েন্ট অনুযায়ী গহনার দাম, ৫% ভ্যাট, মজুরি এবং বাৎসরিক যাকাত ও নিসাবের নির্ভুল হিসাব।',
    shortDescEn: 'Calculate exact gold jewellery cost by Vori, Ana, Rotti, Point with 5% VAT & making charges, plus full Islamic Nisab & Zakat calculation.',
    cpcEstimateUsd: '$0.85 – $2.40',
    monthlySearchVolume: '210,000+ / mo',
    guideTitleBn: 'বাংলাদেশে স্বর্ণের ভরি-আনা-রতি হিসাব এবং যাকাত ও নিসাব নির্ণয়ের নিয়ম',
    guideTitleEn: 'How Gold Weight (Vori, Ana, Rotti) and Zakat Nisab Are Calculated in Bangladesh',
    guideIntroBn: 'বাংলাদেশ জুয়েলার্স অ্যাসোসিয়েশন (BAJUS) আন্তর্জাতিক বাজারের সাথে সমন্বয় করে স্বর্ণের দাম নির্ধারণ করে। বাংলাদেশে সনাতন ওজন পদ্ধতি অনুযায়ী ১ ভরি = ১১.৬৬৪ গ্রাম = ১৬ আনা = ৯৬ রতি = ৯৬০ পয়েন্ট। স্বর্ণের অলংকার কেনার সময় মূল স্বর্ণের দামের সাথে সরকারি ৫% ভ্যাট এবং প্রতি ভরিতে কারিগরি মজুরি (Making Charge) যুক্ত হয়। এছাড়া কারও নিকট সাড়ে ৭ ভরি স্বর্ণ বা সাড়ে ৫২ ভরি রৌপ্য অথবা সমমূল্যের সম্পদ এক চন্দ্রবছর স্থায়ী থাকলে ২.৫% হারে যাকাত প্রদান ফরজ হয়।',
    guideIntroEn: 'In Bangladesh, gold is traditionally measured in Vori (Tola), Ana, Rotti, and Point where 1 Vori equals 11.664 grams (16 Ana or 96 Rotti). When purchasing ornaments from jewellers, 5% government VAT and artisan making charges apply on top of the BAJUS bullion rate.',
    formulaBoxBn: '১ ভরি = ১১.৬৬৪ গ্রাম = ১৬ আনা | ১ আনা = ৬ রতি | ১ রতি = ১০ পয়েন্ট | যাকাত = (মোট যাকাতযোগ্য সম্পদ − তাৎক্ষণিক ঋণ) × ২.৫%',
    formulaBoxEn: '1 Vori = 11.664g = 16 Ana | 1 Ana = 6 Rotti | 1 Rotti = 10 Point | Zakat Due = (Net Zakatable Assets) × 2.5%',
    howToStepsBn: [
      'স্বর্ণের ক্যারেট (২২ ক্যারেট, ২১ ক্যারেট, ১৮ ক্যারেট বা সনাতন) নির্বাচন করুন এবং প্রতি ভরির বর্তমান বাজারমূল্য যাচাই বা পরিবর্তন করুন।',
      'আপনার গহনার ওজন ভরি, আনা, রতি এবং পয়েন্টের ঘরে লিখুন (অথবা সরাসরি গ্রামে ইনপুট দিন)।',
      'যাকাত হিসাব ট্যাবে গিয়ে নগদ টাকা, ব্যাংক ব্যালেন্স, স্বর্ণ-রৌপ্যের মূল্য ও ব্যবসায়িক পণ্যের তথ্য দিলে স্বয়ংক্রিয়ভাবে নিসাব ও প্রদেয় যাকাত বের হয়ে যাবে।'
    ],
    howToStepsEn: [
      'Select the gold purity (22K, 21K, 18K, or Traditional) and verify the current per-Vori price.',
      'Input your ornament weight in Vori, Ana, Rotti, and Point to see raw gold value, 5% VAT, and making charge breakdown.',
      'Switch to the Zakat Calculator tab to compute your net Zakatable wealth against the silver/gold Nisab threshold.'
    ],
    faqs: [
      {
        qBn: '১ ভরি সমান কত গ্রাম এবং কত আনা?',
        aBn: 'আন্তর্জাতিক ট্রয় আউন্স ও দেশীয় পরিমাপ অনুযায়ী ১ ভরি (বা ১ তোলা) সমান ১১.৬৬৪ গ্রাম। ১ ভরিতে ১৬ আনা, ৯৬ রতি এবং ৯৬০ পয়েন্ট থাকে।',
        qEn: 'How many grams, Ana, and Rotti are in 1 Vori of gold?',
        aEn: '1 Vori (Tola) equals exactly 11.664 grams, which is subdivided into 16 Ana, 96 Rotti, or 960 Points.'
      },
      {
        qBn: 'ব্যবহৃত অলংকার বিক্রি বা বদল (Exchange) করলে কত শতাংশ বাদ যায়?',
        aBn: 'বাজুসের নিয়ম অনুযায়ী পুরাতন স্বর্ণালংকার সরাসরি ক্যাশ টাকায় বিক্রি করলে বর্তমান ওজনের দাম থেকে সাধারণত ১৬%–১৭% এবং নতুন গহনার সাথে এক্সচেঞ্জ করলে ৯%–১০% বাদ দিয়ে হিসাব করা হয়।',
        qEn: 'How much is deducted when selling or exchanging old gold ornaments under BAJUS rules?',
        aEn: 'Under standard BAJUS guidelines, exchanging old gold for new jewellery typically carries a 9%–10% deduction, while cash buyback carries a 16%–17% deduction.'
      }
    ]
  },
  {
    id: 'land-measure',
    category: 'property',
    categoryLabelBn: 'ভূমি ও রিয়েল এস্টেট',
    categoryLabelEn: 'Land & Real Estate',
    titleBn: 'জমি ও ফ্ল্যাট পরিমাপ ক্যালকুলেটর (শতক, কাঠা, বিঘা, কানি)',
    titleEn: 'Bangladesh Land Measurement Converter (Shotok, Katha, Bigha, Kani)',
    shortDescBn: 'জমির চারপাশের দৈর্ঘ্য ও প্রস্থ (ফুট/হাত/মিটার) থেকে তাৎক্ষণিক শতক (শতাংশ), কাঠা, বিঘা, একর, কানি ও ছটাকের নিখুঁত হিসাব।',
    shortDescEn: 'Calculate land area from 4-side boundary lengths in feet or convert directly between Decimal (Shotok), Katha, Bigha, Acre, and Kani.',
    cpcEstimateUsd: '$0.70 – $2.10',
    monthlySearchVolume: '160,000+ / mo',
    guideTitleBn: 'বাংলাদেশে জমি মাপার সরকারি সূত্র: শতক, কাঠা, বিঘা ও কানির হিসাব',
    guideTitleEn: 'Official Land Measurement Units in Bangladesh: Decimal, Katha, Bigha & Kani',
    guideIntroBn: 'জমি কেনা-বেচা, নামজারি (Mutation) এবং খতিয়ান যাচাইয়ের সময় শতক (শতাংশ বা ডেসিমেল), কাঠা এবং বিঘার সঠিক রূপান্তর জানা অত্যন্ত জরুরি। সরকারি খতিয়ানে জমির পরিমাণ সবসময় "শতক" বা "একর"-এ লেখা থাকে, কিন্তু স্থানীয়ভাবে কথাবার্তায় কাঠা, বিঘা বা কানি ব্যবহৃত হয়। ১ শতক সমান ৪৩৫.৬ বর্গফুট এবং প্রমিত ১ কাঠা সমান ৭২০ বর্গফুট (১.৬৫ শতক)।',
    guideIntroEn: 'Whether verifying a CS/RS/BS Khatian or purchasing residential plots in Bangladesh, converting accurately between official government Decimals (Shotok) and local units like Katha, Bigha, and Kani prevents costly disputes.',
    formulaBoxBn: '১ শতক (Decimal) = ৪৩৫.৬ বর্গফুট | ১ কাঠা = ৭২০ বর্গফুট = ১.৬৫ শতক | ১ বিঘা = ২০ কাঠা = ৩৩ শতক | ১ একর = ১০০ শতক',
    formulaBoxEn: '1 Decimal (Shotok) = 435.6 sq ft | 1 Katha = 720 sq ft = 1.6529 Shotok | 1 Bigha = 20 Katha = 33 Shotok | 1 Acre = 100 Shotok',
    howToStepsBn: [
      'জমির উত্তর, দক্ষিণ, পূর্ব ও পশ্চিম—এই চার বাহুর দৈর্ঘ্য ফুটে ইনপুট দিন (জমি বাঁকা বা অসমান হলেও গড় পদ্ধতিতে সঠিক ক্ষেত্রফল বের হবে)।',
      'অথবা আপনি যদি সরাসরি শতক থেকে কাঠা বা বর্গফুটে রূপান্তর করতে চান, তবে "সরাসরি একক রূপান্তর" মোড ব্যবহার করুন।',
      'ফলাফল কার্ডে বর্গফুট, শতক, কাঠা, বিঘা, একর, কানি ও ছটাকের পূর্ণাঙ্গ তালিকা দেখুন।'
    ],
    howToStepsEn: [
      'Enter the North, South, East, and West side measurements in feet to calculate average area for rectangular or irregular plots.',
      'Alternatively, switch to Direct Unit Conversion mode to convert any value between Shotok, Katha, Bigha, Square Feet, and Kani.',
      'Review the complete breakdown across standard Bangladesh land registration units.'
    ],
    faqs: [
      {
        qBn: '১ কাঠা সমান কত শতক এবং কত বর্গফুট?',
        aBn: 'বাংলাদেশের প্রমিত হিসাব অনুযায়ী ১ কাঠা = ৭২০ বর্গফুট = ১.৬৫২৯ শতক (প্রায় সোয়া দেড় শতক)। আবার ৩৩ শতকে ১ বিঘা বা ২০ কাঠা হয়।',
        qEn: 'How many Shotok and square feet are in 1 Katha?',
        aEn: 'In standard Bangladesh measurement, 1 Katha equals 720 square feet, which is approximately 1.6529 Shotok (Decimals).'
      },
      {
        qBn: '১ কানি সমান কত শতক?',
        aBn: 'চট্টগ্রাম, নোয়াখালী ও সিলেট অঞ্চলে প্রচলিত প্রমিত ৮ হাতি নলের হিসাবে ১ কানি = ১৭,২৮০ বর্গফুট = ৩৯.৬৭ শতক (প্রায় ৪০ শতক বা ২০ গণ্ডা)। তবে কোনো কোনো এলাকায় ১২০ শতকে ১ কানি (বড় কানি) ধরা হয়।',
        qEn: 'How many Shotok are in 1 Kani?',
        aEn: 'Under the standard 8-Hath Reed measurement, 1 Kani equals 17,280 sq ft or approximately 39.67 Shotok (often rounded to 40 Shotok or 20 Gonda).'
      }
    ]
  },
  {
    id: 'loan-dps',
    category: 'finance',
    categoryLabelBn: 'ব্যাংকিং ও বিনিয়োগ',
    categoryLabelEn: 'Banking & Investment',
    titleBn: 'ব্যাংক লোন ইএমআই (EMI), ডিপিএস ও এফডিআর ক্যালকুলেটর',
    titleEn: 'Bank Loan EMI, DPS & FDR Maturity Calculator (with Tax)',
    shortDescBn: 'হোম লোন, কার লোন বা পার্সোনাল লোনের মাসিক কিস্তি (EMI), মোট সুদ এবং ডিপিএস/এফডিআর মেয়াদান্তে মুনাফা ও উৎস করের (TIN 10% / 15%) হিসাব।',
    shortDescEn: 'Calculate monthly Bank Loan EMI with amortization breakdown, plus DPS & FDR maturity value after 10% (with TIN) or 15% source tax.',
    cpcEstimateUsd: '$1.40 – $3.80',
    monthlySearchVolume: '145,000+ / mo',
    guideTitleBn: 'ব্যাংক লোনের মাসিক কিস্তি (EMI) এবং ডিপিএস/এফডিআর মুনাফা ও করের নিয়ম',
    guideTitleEn: 'Understanding Bank Loan EMI Amortization and DPS/FDR Source Tax (AIT) in Bangladesh',
    guideIntroBn: 'ব্যাংক থেকে ফ্ল্যাট কেনা, ব্যবসা বা ব্যক্তিগত প্রয়োজনে ঋণ নেওয়ার আগে মাসিক কিস্তি (Equated Monthly Installment - EMI) এবং মেয়াদ শেষে মোট কত টাকা সুদ দিতে হবে তা জেনে নেওয়া অত্যন্ত গুরুত্বপূর্ণ। একইভাবে ব্যাংকে মাসিক ডিপিএস (DPS) বা এককালীন এফডিআর (FDR) করার সময় অর্জিত মুনাফার ওপর সরকারি উৎস কর (টিন সার্টিফিকেট বা PSR থাকলে ১০%, না থাকলে ১৫%) কেটে রাখার পর হাতে কত টাকা পাওয়া যাবে তা এই ক্যালকুলেটরে নির্ভুলভাবে জানা যায়।',
    guideIntroEn: 'Before taking a home, auto, or SME loan—or opening a DPS/FDR account in a Bangladeshi commercial bank—calculating exact monthly installments and post-tax maturity returns ensures smart financial planning.',
    formulaBoxBn: 'EMI = [P × r × (1 + r)^n] ÷ [(1 + r)^n − 1] | নিট মুনাফা = মোট মুনাফা − (মোট মুনাফা × উৎস কর ১০% বা ১৫%)',
    formulaBoxEn: 'EMI = [P × r × (1 + r)^n] ÷ [(1 + r)^n − 1] | Net Interest = Gross Interest − (Gross Interest × 10% or 15% AIT)',
    howToStepsBn: [
      'উপরের ট্যাব থেকে নির্বাচন করুন: "ব্যাংক লোন ইএমআই (Loan EMI)", "মাসিক ডিপিএস (DPS)" অথবা "এককালীন এফডিআর (FDR)"।',
      'টাকার পরিমাণ, বার্ষিক সুদের/মুনাফার হার (%) এবং মেয়াদ (বছর বা মাস) ইনপুট দিন।',
      'ডিপিএস বা এফডিআরের ক্ষেত্রে আপনার আয়কর রিটার্ন জমার প্রমাণপত্র (PSR/TIN) আছে কিনা তা সিলেক্ট করলে ১০% বা ১৫% কর বাদ দিয়ে নিট প্রাপ্য টাকা দেখাবে।'
    ],
    howToStepsEn: [
      'Select your calculation mode: Bank Loan EMI, Monthly DPS Savings, or Fixed Deposit (FDR).',
      'Enter the principal/installment amount, annual interest rate (%), and tenure in years.',
      'For DPS/FDR, toggle TIN/PSR status (10% vs 15% tax) to view exact net maturity payout.'
    ],
    faqs: [
      {
        qBn: 'ডিপিএস বা এফডিআরের মুনাফা থেকে ব্যাংক কত শতাংশ ট্যাক্স কাটে?',
        aBn: 'জাতীয় রাজস্ব বোর্ড (NBR)-এর নিয়ম অনুযায়ী, গ্রাহক যদি আয়কর রিটার্ন জমার প্রাপ্তিস্বীকারপত্র (PSR) ব্যাংকে জমা দেন তবে মুনাফার ওপর ১০% উৎস কর কাটা হয়। আর জমা না দিলে ১৫% হারে উৎস কর কাটা হয়।',
        qEn: 'How much tax do banks deduct from DPS or FDR profit in Bangladesh?',
        aEn: 'Banks deduct 10% Advance Income Tax (AIT) on earned interest if the depositor submits Proof of Submission of Return (PSR/TIN), or 15% if no PSR is provided.'
      },
      {
        qBn: 'লোনের মেয়াদ বাড়ালে কি মাসিক কিস্তি কমে?',
        aBn: 'হ্যাঁ, লোনের মেয়াদ (Tenure) বাড়ালে মাসিক কিস্তি (EMI) কমে আসে, তবে দীর্ঘ সময় ধরে সুদ হিসাব হওয়ার কারণে সর্বমোট প্রদেয় সুদের পরিমাণ বেড়ে যায়।',
        qEn: 'Does extending loan tenure reduce monthly EMI?',
        aEn: 'Yes, longer tenure lowers the monthly EMI payment, though it increases the cumulative interest paid over the life of the loan.'
      }
    ]
  },
  {
    id: 'electricity-bill',
    category: 'utility',
    categoryLabelBn: 'ইউটিলিটি ও গৃহস্থালি',
    categoryLabelEn: 'Utility & Household',
    titleBn: 'বিদ্যুৎ বিল (ধাপ ভিত্তিক ট্যারিফ) ও এসি খরচ ক্যালকুলেটর',
    titleEn: 'Bangladesh Electricity Bill (Slab Tariff) & AC Power Calculator',
    shortDescBn: 'বিইআরসি (BERC) অনুমোদিত আবাসিক ধাপ অনুযায়ী মাসিক বিদ্যুৎ বিল, ডিমান্ড চার্জ, ৫% ভ্যাট এবং এসি/ফ্রিজের মাসিক ইউনিট হিসাব।',
    shortDescEn: 'Calculate residential electricity bills across BERC tariff slabs (DESCO, DPDC, BPDB, Palli Bidyut) including demand charge and 5% VAT.',
    cpcEstimateUsd: '$0.40 – $1.25',
    monthlySearchVolume: '115,000+ / mo',
    guideTitleBn: 'বাংলাদেশে আবাসিক বিদ্যুৎ বিলের ধাপ (Slab Rate) ও ইউনিট হিসাব করার নিয়ম',
    guideTitleEn: 'How Residential Electricity Tariff Slabs Work in Bangladesh (BPDB, DESCO, DPDC, REB)',
    guideIntroBn: 'অনেকেই অবাক হন যে মাসে ২০০ ইউনিট ব্যবহার করলে যে বিল আসে, ২১০ ইউনিট ব্যবহার করলে বিল কেন তার চেয়ে অনেক বেশি বাড়ে। এর কারণ বাংলাদেশে আবাসিক বিদ্যুৎ বিল ধাপ বা স্ল্যাব (Tariff Slab) পদ্ধতিতে হিসাব করা হয় (যেমন ০-৭৫ ইউনিট, ৭৬-২০০ ইউনিট, ২০১-৩০০ ইউনিট, ৩০১-৪০০ ইউনিট ইত্যাদি)। এই ক্যালকুলেটরের সাহায্যে আপনার ব্যবহৃত ইউনিট থেকে প্রতিটি ধাপের নিখুঁত খরচ, ডিমান্ড চার্জ এবং ৫% ভ্যাটসহ মোট বিল মুহূর্তেই জানতে পারবেন।',
    guideIntroEn: 'Residential electricity billing in Bangladesh uses progressive consumption slabs defined by BERC. Crossing from the 75-unit or 200-unit bracket shifts higher marginal units into steeper rate tiers.',
    formulaBoxBn: '১ ইউনিট (kWh) = ১,০০০ ওয়াট × ১ ঘণ্টা | মোট বিল = ধাপভিত্তিক এনার্জি চার্জ + ডিমান্ড চার্জ (৪২ টাকা/কি.ওয়াট) + মিটার রেন্ট + ৫% ভ্যাট',
    formulaBoxEn: '1 Unit (kWh) = (Wattage × Hours Used) ÷ 1,000 | Total Bill = Slab Energy Charge + Demand Charge + 5% VAT',
    howToStepsBn: [
      'আপনার মিটারের বর্তমান রিডিং ও পূর্ববর্তী মাসের রিডিংয়ের পার্থক্য (ব্যবহৃত মোট ইউনিট / kWh) ইনপুট দিন।',
      'আপনার সংযোগের অনুমোদিত লোড (সাধারণত আবাসিক সংযোগে ২ কিলোওয়াট) নির্বাচন করুন।',
      'নিচে কোন ধাপে কত ইউনিট এবং কত টাকা চার্জ ধরা হয়েছে তার পূর্ণাঙ্গ স্ল্যাব ব্রেকডাউন টেবিল দেখুন।'
    ],
    howToStepsEn: [
      'Enter your total monthly electricity consumption in units (kWh).',
      'Select your sanctioned load in kW (typically 1 kW or 2 kW for standard residential meters).',
      'Inspect the slab-by-slab tariff breakdown table along with Demand Charge and 5% VAT.'
    ],
    faqs: [
      {
        qBn: '১ টন বা ১.৫ টন ইনভার্টার এসি প্রতিদিন ৮ ঘণ্টা চালালে মাসে কত ইউনিট বিদ্যুৎ খরচ হয়?',
        aBn: 'একটি ১.৫ টন ইনভার্টার এসি গড়ে ঘণ্টায় ০.৯ থেকে ১.১ ইউনিট বিদ্যুৎ খরচ করে। প্রতিদিন ৮ ঘণ্টা করে ৩০ দিন চালালে মাসে প্রায় ২২০ থেকে ২৬০ ইউনিট বিদ্যুৎ খরচ হয়।',
        qEn: 'How many units does a 1.5-ton Inverter AC consume per month if run 8 hours daily?',
        aEn: 'A 1.5-ton inverter AC averages 0.9 to 1.1 kWh per hour once stabilized, consuming roughly 220 to 260 units per month at 8 hours/day.'
      },
      {
        qBn: 'বিদ্যুৎ বিলে লাইফ-লাইন (০ থেকে ৫০ ইউনিট) সুবিধা কারা পান?',
        aBn: 'যেসব আবাসিক গ্রাহকের মাসিক বিদ্যুৎ ব্যবহার মোট ৫০ ইউনিটের মধ্যে সীমাবদ্ধ থাকে, কেবল তাঁরাই সর্বনিম্ন লাইফ-লাইন রেটের সুবিধা পান। ব্যবহার ৫১ ইউনিট হলেই ০-৭৫ ইউনিটের ধাপ প্রযোজ্য হয়।',
        qEn: 'Who qualifies for the 0–50 unit Lifeline electricity tariff?',
        aEn: 'Only residential consumers whose total monthly usage does not exceed 50 kWh qualify for the Lifeline rate.'
      }
    ]
  },
  {
    id: 'age-job',
    category: 'utility',
    categoryLabelBn: 'ক্যারিয়ার ও স্বাস্থ্য',
    categoryLabelEn: 'Career & Health',
    titleBn: 'সঠিক বয়স, সরকারি চাকরির বয়সসীমা ও বিএমআই ক্যালকুলেটর',
    titleEn: 'Exact Age, Govt Job Eligibility (32 Years) & BMI Calculator',
    shortDescBn: 'জন্মতারিখ থেকে আজ বা যেকোনো সার্কুলারের তারিখে বছর-মাস-দিন, সরকারি চাকরির আবেদনের যোগ্যতা (৩২ বছর সীমা) এবং স্বাস্থ্যকর ওজনের (BMI) হিসাব।',
    shortDescEn: 'Calculate exact age in years, months, days as of any job circular date, verify Bangladesh 32-year Govt Job eligibility, and check BMI.',
    cpcEstimateUsd: '$0.35 – $1.10',
    monthlySearchVolume: '240,000+ / mo',
    guideTitleBn: 'চাকরির আবেদনে সঠিক বয়স ও আদর্শ শারীরিক ওজন (BMI) নির্ণয়ের নিয়ম',
    guideTitleEn: 'How to Calculate Exact Age for BCS / Government Job Circulars and BMI',
    guideIntroBn: 'বিসিএস (BCS), ব্যাংক জব কিংবা যেকোনো সরকারি-বেসরকারি চাকরির বিজ্ঞপ্তিতে একটি নির্দিষ্ট তারিখে (Cut-off Date) প্রার্থীর বয়স কত বছর, কত মাস ও কত দিন তা উল্লেখ করতে হয়। বাংলাদেশে সরকারি চাকরিতে প্রবেশের সর্বোচ্চ বয়সসীমা ৩২ বছর নির্ধারণ করা হয়েছে। এই টুলের মাধ্যমে যেকোনো সার্কুলারের তারিখে আপনার বয়স এবং আবেদনের অবশিষ্ট সময় এক সেকেন্ডে বের করতে পারবেন। পাশাপাশি উচ্চতা ও ওজন অনুযায়ী আপনার বিএমআই (BMI) এবং আদর্শ ওজনের পরিসরও জানতে পারবেন।',
    guideIntroEn: 'Every BCS, Bank, and Government job circular in Bangladesh specifies a reference date to determine candidate age eligibility under the 32-year entry cap.',
    formulaBoxBn: 'সরকারি চাকরির সর্বোচ্চ বয়সসীমা = ৩২ বছর | BMI = ওজন (কেজি) ÷ [উচ্চতা (মিটার)]² | আদর্শ BMI = ১৮.৫ থেকে ২৪.৯',
    formulaBoxEn: 'Govt Job Max Age = 32 Years | BMI = Weight (kg) ÷ [Height (m)]² | Healthy BMI Range = 18.5 – 24.9',
    howToStepsBn: [
      'আপনার জাতীয় পরিচয়পত্র (NID) বা এসএসসি সনদ অনুযায়ী জন্মতারিখ নির্বাচন করুন।',
      'আজকের তারিখ অথবা চাকরির সার্কুলারে উল্লেখিত নির্দিষ্ট তারিখটি দ্বিতীয় ঘরে দিন।',
      'নিচে বছর, মাস, দিন, মোট দিন এবং সরকারি চাকরির বয়সসীমা (৩২ বছর) অনুযায়ী আপনার হাতে আর কতদিন সময় আছে তা দেখুন।'
    ],
    howToStepsEn: [
      'Select your Date of Birth according to your SSC certificate or NID.',
      'Choose today or the cut-off date specified in the job circular.',
      'View your exact age in years, months, and days, along with remaining eligibility time under the 32-year cap.'
    ],
    faqs: [
      {
        qBn: 'সরকারি চাকরিতে আবেদনের ক্ষেত্রে কোন সনদের জন্মতারিখ গ্রহণযোগ্য?',
        aBn: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC) ও জনপ্রশাসন মন্ত্রণালয়ের বিধি অনুযায়ী এসএসসি (SSC) বা সমমান পরীক্ষার সনদে উল্লেখিত জন্মতারিখই চূড়ান্ত বলে গণ্য হয় (বয়সের ক্ষেত্রে কোনো এফিডেভিট গ্রহণযোগ্য নয়)।',
        qEn: 'Which document is accepted for Date of Birth in Bangladesh Government job applications?',
        aEn: 'The date of birth recorded on the SSC (Secondary School Certificate) or equivalent certificate is the sole legally accepted proof; affidavits are not accepted.'
      }
    ]
  },
  {
    id: 'taka-words-memo',
    category: 'business',
    categoryLabelBn: 'ব্যবসা ও ডকুমেন্ট টুলস',
    categoryLabelEn: 'Business & Document Tools',
    titleBn: 'টাকা কথায় প্রকাশ (চেক/দলিল) ও ইনস্ট্যান্ট ক্যাশ মেমো জেনারেটর',
    titleEn: 'Taka in Words (Bangla/English Cheque Helper) & Instant Invoice Memo',
    shortDescBn: 'যেকোনো টাকার অংককে ব্যাংকের চেক ও দলিলের জন্য নির্ভুল বাংলা ও ইংরেজি বানানে রূপান্তর এবং প্রিন্টেবল ক্যাশ মেমো তৈরি।',
    shortDescEn: 'Convert any BDT amount into official Bengali & English words for bank cheques/deeds and generate printable business invoices.',
    cpcEstimateUsd: '$0.65 – $1.95',
    monthlySearchVolume: '95,000+ / mo',
    guideTitleBn: 'ব্যাংকের চেক ও জমির দলিলে টাকা কথায় লেখার সঠিক নিয়ম এবং ক্যাশ মেমো তৈরি',
    guideTitleEn: 'Writing Amounts in Words on Bank Cheques & Generating Professional Cash Memos',
    guideIntroBn: 'ব্যাংকে চেক লেখার সময় বা গুরুত্বপূর্ণ বাণিজ্যিক চুক্তিপত্রে টাকার অংক বাংলায় বা ইংরেজিতে কথায় লেখার সময় অনেকেই বানান ও লক্ষ/কোটির হিসাব নিয়ে দ্বিধায় পড়েন (যেমন: ৫৫, বায়ান্ন, তিপ্পান্ন, নিরানব্বই ইত্যাদির সঠিক বানান)। চেকের অংক এবং কথায় লেখার মধ্যে গরমিল হলে চেক ডিজঅনার (Dishonor) হয়ে যায়। এই টুলটি যেকোনো সংখ্যাকে তাৎক্ষণিকভাবে প্রমিত বাংলা ও ইংরেজি কথায় রূপান্তর করে এবং ক্ষুদ্র ও মাঝারি ব্যবসায়ীদের জন্য প্রিন্টযোগ্য ক্যাশ মেমো তৈরি করে দেয়।',
    guideIntroEn: 'Discrepancies between numerical figures and written words on a bank cheque lead to immediate dishonour at clearing houses. Our converter ensures 100% accurate Bengali and English cheque wording.',
    formulaBoxBn: '১ লক্ষ = ১,০০,০০০ টাকা | ১ কোটি = ১,০০,০০,০০০ টাকা (১০০ লক্ষ) | চেকের শেষে সর্বদা "মাত্র" বা "Only" যুক্ত করতে হয়',
    formulaBoxEn: '1 Lakh = 1,00,000 BDT | 1 Crore = 1,00,00,000 BDT (100 Lakh) | Always append "মাত্র" or "Only" to prevent cheque alteration',
    howToStepsBn: [
      'টাকার অংকের ঘরে যেকোনো সংখ্যা লিখুন—সাথে সাথে নিচে প্রমিত বাংলা ও ইংরেজি বানানে পূর্ণাঙ্গ বাক্য তৈরি হয়ে যাবে।',
      'কপি বাটনে ক্লিক করে সরাসরি আপনার দলিল, চিঠি বা ইনভয়েসে পেস্ট করুন।',
      'নিচের ক্যাশ মেমো অংশে প্রতিষ্ঠানের নাম, ক্রেতার নাম ও পণ্যের বিবরণ যোগ করে "প্রিন্ট / পিডিএফ সেভ করুন" বাটনে ক্লিক করুন।'
    ],
    howToStepsEn: [
      'Type any BDT figure to instantaneously see the formal Bengali and English wording.',
      'Click Copy to paste directly into contracts, letters, or payment vouchers.',
      'Add line items in the Cash Memo builder below and click Print / Save PDF for an instant receipt.'
    ],
    faqs: [
      {
        qBn: 'ব্যাংক চেকে টাকার অংক লেখার পর "মাত্র" বা "Only" লেখা কেন জরুরি?',
        aBn: 'টাকার অংক কথায় লেখার পর শেষে "মাত্র" বা "Only" এবং সংখ্যার পর "/-" চিহ্ন দিলে কেউ পরবর্তীতে বাড়তি সংখ্যা বা শব্দ বসিয়ে জালিয়াতি করতে পারে না।',
        qEn: 'Why must you write "Only" or "মাত্র" at the end of a bank cheque amount?',
        aEn: 'Adding "Only" or "মাত্র" immediately after the written amount prevents unauthorized tampering or addition of extra words.'
      }
    ]
  }
];

export const EDITORIAL_ARTICLES: ArticlePost[] = [
  {
    id: 'art-1',
    slug: 'bkash-nagad-rocket-charge-comparison-guide',
    categoryBn: 'ডিজিটাল ব্যাংকিং গাইড',
    categoryEn: 'Digital Banking Guide',
    titleBn: 'বিকাশ, নগদ ও রকেট ক্যাশ-আউট চার্জ কমানোর ৭টি কার্যকরী উপায় (২০২৬ আপডেট)',
    titleEn: '7 Proven Ways to Reduce bKash, Nagad & Rocket Cash-Out Charges in 2026',
    publishedDateBn: '২২ সেপ্টেম্বর ২০২৬',
    publishedDateEn: 'September 22, 2026',
    readTimeBn: '৫ মিনিট পাঠ',
    readTimeEn: '5 min read',
    authorBn: 'ফিন্যান্সিয়াল রিসার্চ ডেস্ক',
    authorEn: 'Financial Research Desk',
    relatedToolId: 'mfs-fee',
    summaryBn: 'প্রতি মাসে মোবাইল ব্যাংকিংয়ে হাজার হাজার টাকা ক্যাশ-আউট করতে গিয়ে অনেকেই বাড়তি চার্জ গুনছেন। প্রিয় এজেন্ট, ব্যাংক-টু-এমএফএস লিংক এবং এটিএম বুথ ব্যবহার করে কীভাবে খরচ অর্ধেকে নামিয়ে আনবেন তার বিস্তারিত গাইড।',
    summaryEn: 'Millions of users overpay on MFS cash-out fees every month. Learn how Priya Agent tiers, ATM withdrawals, and zero-fee utility payments can cut your costs by up to 40%.',
    sections: [
      {
        headingBn: '১. বিকাশ প্রিয় এজেন্ট ও প্রিয় নাম্বার সঠিকভাবে সেটআপ করুন',
        headingEn: '1. Configure bKash Priya Agent and Favourite Numbers Properly',
        paragraphsBn: [
          'বিকাশে সাধারণ এজেন্ট থেকে ক্যাশ-আউট করলে প্রতি হাজারে ১৮.৫০ টাকা চার্জ কাটে। অথচ আপনি যদি বিকাশ অ্যাপ থেকে আপনার এলাকার নির্দিষ্ট ১টি এজেন্ট নাম্বারকে "প্রিয় এজেন্ট" হিসেবে যুক্ত করেন, তবে প্রতি মাসে ৫০,০০০ টাকা পর্যন্ত হাজারে মাত্র ১৪.৯০ টাকায় ক্যাশ-আউট করতে পারবেন। এতে প্রতি ১০,০০০ টাকায় আপনার সরাসরি ৩৬ টাকা সাশ্রয় হবে।',
          'একইভাবে সেন্ড মানি করার আগে ঘনঘন টাকা পাঠান এমন ৫টি নাম্বারকে "প্রিয় নাম্বার" তালিকায় যুক্ত করে নিলে মাসে ২৫,০০০ টাকা পর্যন্ত সম্পূর্ণ ফ্রিতে টাকা পাঠানো যায়।'
        ],
        paragraphsEn: [
          'Standard agent cash-out on bKash costs BDT 18.50 per thousand. By registering a local agent as your Priya Agent inside the app, your rate drops to BDT 14.90 per thousand up to BDT 50,000 monthly—saving BDT 36 on every BDT 10,000 withdrawn.',
          'Similarly, adding up to 5 frequent contacts as Favourite Numbers unlocks zero-fee Send Money up to BDT 25,000 per month.'
        ],
        keyTakeawayBn: 'টিপস: মাসের শুরুতেই আপনার এলাকার সবচেয়ে বিশ্বস্ত এজেন্ট নাম্বারটি প্রিয় এজেন্ট তালিকায় যুক্ত আছে কিনা যাচাই করুন।',
        keyTakeawayEn: 'Tip: Verify your Priya Agent registration at the start of each calendar month to maximize the 50,000 BDT quota.'
      },
      {
        headingBn: '২. বাটন ফোনের (*247# / *167#) বদলে স্মার্টফোন অ্যাপ ব্যবহার করুন',
        headingEn: '2. Always Prefer Official Smartphone Apps Over USSD Codes',
        paragraphsBn: [
          'নগদ, বিকাশ এবং উপায়—সবগুলো প্রতিষ্ঠানেই বাটন ফোনের USSD কোড ডায়াল করে ক্যাশ-আউট করলে অ্যাপের তুলনায় হাজারে ৩ থেকে ৫ টাকা বেশি চার্জ কাটা হয়। তাই ইন্টারনেট সংযোগ থাকলে সবসময় অফিসিয়াল অ্যাপের মাধ্যমে ক্যাশ-আউট সম্পন্ন করুন।'
        ],
        paragraphsEn: [
          'Across bKash, Nagad, and Upay, USSD dial transactions carry a BDT 3 to BDT 5 higher fee per thousand compared to mobile app transactions.'
        ]
      },
      {
        headingBn: '৩. ক্যাশ-আউট না করে সরাসরি পেমেন্ট ও বিল পে সুবিধা নিন',
        headingEn: '3. Use Direct Merchant QR & Bill Pay Instead of Cashing Out',
        paragraphsBn: [
          'বিদ্যুৎ বিল, গ্যাস বিল, ওয়াসা বিল কিংবা সুপারশপে কেনাকাটার জন্য আগে টাকা ক্যাশ-আউট করে নগদ টাকায় পরিশোধ করলে অযথাই ১.৫% থেকে ১.৮৫% চার্জ নষ্ট হয়। সরাসরি অ্যাপ থেকে মার্চেন্ট পেমেন্ট বা বিল পে করলে অধিকাংশ ক্ষেত্রে কোনো অতিরিক্ত চার্জ লাগে না।'
        ],
        paragraphsEn: [
          'Withdrawing cash just to pay electricity bills or grocery merchants wastes 1.5%–1.85% in fees. Direct in-app utility bill payments and QR merchant checkouts are largely fee-free.'
        ]
      }
    ]
  },
  {
    id: 'art-2',
    slug: 'gold-buying-and-zakat-calculation-bangladesh',
    categoryBn: 'স্বর্ণ ও সঞ্চয় গাইড',
    categoryEn: 'Gold & Wealth Guide',
    titleBn: 'বাংলাদেশে স্বর্ণ কেনার আগে ক্যারেট, হলমার্ক, ভ্যাট ও মজুরি হিসাব করার নিয়ম',
    titleEn: 'How to Verify Gold Karat, Hallmark, VAT & Making Charges Before Buying in Bangladesh',
    publishedDateBn: '১৯ সেপ্টেম্বর ২০২৬',
    publishedDateEn: 'September 19, 2026',
    readTimeBn: '৬ মিনিট পাঠ',
    readTimeEn: '6 min read',
    authorBn: 'অর্থনীতি ও বিনিয়োগ ডেস্ক',
    authorEn: 'Economics & Investment Desk',
    relatedToolId: 'gold-zakat',
    summaryBn: 'স্বর্ণের গহনা কেনার সময় ২২ ক্যারেট ও ২১ ক্যারেটের পার্থক্য, বাজুস নির্ধারিত ন্যূনতম মজুরি, ৫% ভ্যাট এবং ভবিষ্যতে স্বর্ণ বিক্রি বা এক্সচেঞ্জ করার নিয়মগুলো জেনে নিন।',
    summaryEn: 'Understand the difference between 22K, 21K, and 18K gold, BAJUS hallmark verification, 5% VAT rules, and resale deductions before investing in gold ornaments.',
    sections: [
      {
        headingBn: '২২, ২১ এবং ১৮ ক্যারেট স্বর্ণের আসল পার্থক্য কী?',
        headingEn: 'What Is the Real Difference Between 22K, 21K, and 18K Gold?',
        paragraphsBn: [
          'খাঁটি ২৪ ক্যারেট স্বর্ণ অত্যন্ত নরম হওয়ায় তা দিয়ে সরাসরি অলংকার তৈরি করা যায় না। গহনা মজবুত করতে এতে নির্দিষ্ট অনুপাতে তামা বা রূপা (খাদ) মেশানো হয়। ২২ ক্যারেট স্বর্ণে ৯১.৬% খাঁটি স্বর্ণ থাকে (হলমার্ক ৯১৬), ২১ ক্যারেটে ৮৭.৫% খাঁটি স্বর্ণ (হলমার্ক ৮৭৫) এবং ১৮ ক্যারেটে ৭৫% খাঁটি স্বর্ণ (হলমার্ক ৭৫০) থাকে।',
          'পাথর বা ডায়মন্ড বসানো সূক্ষ্ম গহনার জন্য সাধারণত ১৮ ক্যারেট ব্যবহার করা হয়, আর ঐতিহ্যবাহী ভারী গহনা ও দীর্ঘমেয়াদী সঞ্চয়ের জন্য ২২ ক্যারেট সবচেয়ে উত্তম।'
        ],
        paragraphsEn: [
          'Pure 24K gold is too soft for durable jewellery. 22K gold contains 91.6% pure gold (Hallmark 916), 21K contains 87.5% pure gold (Hallmark 875), and 18K contains 75% pure gold (Hallmark 750).'
        ],
        keyTakeawayBn: 'সবসময় গহনার গায়ে লেজার খোদাই করা হলমার্ক (916 / 875 / 750) এবং দোকানের ক্যাশ মেমোতে ক্যারেট উল্লেখ আছে কিনা দেখে নিন।',
        keyTakeawayEn: 'Always inspect the laser-engraved hallmark stamp (916, 875, or 750) and ensure it is explicitly written on the tax invoice.'
      },
      {
        headingBn: 'স্বর্ণের যাকাত কখন এবং কীভাবে ফরজ হয়?',
        headingEn: 'When and How Does Zakat Apply to Gold and Silver?',
        paragraphsBn: [
          'ইসলামী শরিয়াহ অনুযায়ী কারও মালিকানায় যদি সাড়ে ৭ ভরি (৮৭.৪৮ গ্রাম) স্বর্ণ অথবা সাড়ে ৫২ ভরি (৬১২.৩৬ গ্রাম) রৌপ্য কিংবা এর সমমূল্যের নগদ অর্থ ও ব্যবসায়িক পণ্য পূর্ণ এক চন্দ্রবছর গচ্ছিত থাকে, তবে মোট সম্পদের ২.৫% (চল্লিশ ভাগের এক ভাগ) যাকাত হিসেবে প্রদান করতে হয়।'
        ],
        paragraphsEn: [
          'When an individual holds 7.5 Vori (87.48g) of gold or 52.5 Vori (612.36g) of silver—or cash and trade goods exceeding the silver Nisab value—for one full lunar year, 2.5% of net zakatable wealth is obligatory as Zakat.'
        ]
      }
    ]
  },
  {
    id: 'art-3',
    slug: 'land-measurement-khatian-mutation-guide-bd',
    categoryBn: 'ভূমি আইন ও জরিপ',
    categoryEn: 'Land Law & Survey',
    titleBn: 'জমি মাপার সহজ সূত্র: খতিয়ান, দাগ নম্বর ও শতক-কাঠার হিসাব বুঝে নিন',
    titleEn: 'Practical Guide to Land Measurement, Khatian Verification & Shotok-to-Katha Conversion',
    publishedDateBn: '১৫ সেপ্টেম্বর ২০২৬',
    publishedDateEn: 'September 15, 2026',
    readTimeBn: '৭ মিনিট পাঠ',
    readTimeEn: '7 min read',
    authorBn: 'ভূমি ও লিগ্যাল ডেস্ক',
    authorEn: 'Property & Legal Desk',
    relatedToolId: 'land-measure',
    summaryBn: 'জমি কেনার আগে আমিন বা সার্ভেয়ার ছাড়াই নিজে ফিতা দিয়ে জমি মেপে শতক ও কাঠা বের করার পদ্ধতি এবং সিএস, এসএ, আরএস ও বিএস খতিয়ান চেনার উপায়।',
    summaryEn: 'Learn how to measure any rectangular or irregular land parcel using a standard tape and verify CS, SA, RS, and BS Khatian records.',
    sections: [
      {
        headingBn: 'ফিতা দিয়ে জমি মেপে শতক ও কাঠা বের করার নিয়ম',
        headingEn: 'How to Measure Land in Feet and Convert to Shotok & Katha',
        paragraphsBn: [
          'যেকোনো জমির উত্তর ও দক্ষিণ বাহুর দৈর্ঘ্য যোগ করে ২ দিয়ে ভাগ করলে গড় দৈর্ঘ্য পাওয়া যায়। একইভাবে পূর্ব ও পশ্চিম বাহুর প্রস্থ যোগ করে ২ দিয়ে ভাগ করলে গড় প্রস্থ পাওয়া যায়। এরপর গড় দৈর্ঘ্য ও গড় প্রস্থ গুণ করলেই মোট ক্ষেত্রফল (বর্গফুট) বের হয়ে আসে।',
          'প্রাপ্ত মোট বর্গফুটকে ৪৩৫.৬ দিয়ে ভাগ করলে শতক (শতাংশ) এবং ৭২০ দিয়ে ভাগ করলে প্রমিত কাঠা পাওয়া যায়।'
        ],
        paragraphsEn: [
          'Average the North and South lengths, then average the East and West widths. Multiply average length by average width to get total square feet. Divide total square feet by 435.6 for Shotok (Decimals) or by 720 for standard Katha.'
        ],
        keyTakeawayBn: 'মনে রাখুন: ১ একর = ১০০ শতক | ১ বিঘা = ৩৩ শতক = ২০ কাঠা | ১ শতক = ৪৩৫.৬ বর্গফুট।',
        keyTakeawayEn: 'Key conversion: 1 Acre = 100 Shotok | 1 Bigha = 33 Shotok = 20 Katha | 1 Shotok = 435.6 sq ft.'
      }
    ]
  },
  {
    id: 'art-4',
    slug: 'bank-dps-fdr-tax-and-loan-emi-tips',
    categoryBn: 'ব্যাংকিং ও কর পরিকল্পনা',
    categoryEn: 'Banking & Tax Planning',
    titleBn: 'ব্যাংক লোন নেওয়ার আগে ও ডিপিএস/এফডিআর খোলার সময় যে ৫টি হিসাব না জানলেই নয়',
    titleEn: '5 Financial Rules to Know Before Taking a Bank Loan or Opening a DPS/FDR in Bangladesh',
    publishedDateBn: '১০ সেপ্টেম্বর ২০২৬',
    publishedDateEn: 'September 10, 2026',
    readTimeBn: '৬ মিনিট পাঠ',
    readTimeEn: '6 min read',
    authorBn: 'ব্যাংকিং অ্যানালাইসিস টিম',
    authorEn: 'Banking Analysis Team',
    relatedToolId: 'loan-dps',
    summaryBn: 'ব্যাংক লোনের প্রসেসিং ফি, আর্লি সেটেলমেন্ট চার্জ এবং ডিপিএস/এফডিআরে আবগারি শুল্ক (Excise Duty) ও উৎস কর বাঁচানোর বৈধ নিয়মাবলী।',
    summaryEn: 'Understand reducing-balance interest rates, early loan settlement fees, and how submitting your income tax PSR saves 5% tax on DPS/FDR returns.',
    sections: [
      {
        headingBn: 'আয়কর রিটার্ন (PSR) জমা দিয়ে এফডিআর ও ডিপিএসে ৫% কর বাঁচান',
        headingEn: 'Save 5% Source Tax on DPS/FDR by Submitting Your Tax Return Slip (PSR)',
        paragraphsBn: [
          'ব্যাংকে সঞ্চয়ী আমানত, ডিপিএস বা এফডিআরের মুনাফা তোলার সময় ব্যাংক সরকারি কোষাগারে উৎস কর কেটে রাখে। আপনি যদি ব্যাংকে আপনার সর্বশেষ করবর্ষের আয়কর রিটার্ন জমার প্রাপ্তিস্বীকারপত্র (Acknowledgement Receipt / PSR) জমা দেন, তবে ১৫%-এর পরিবর্তে ১০% কর কাটা হবে।'
        ],
        paragraphsEn: [
          'Submitting your latest Income Tax Return Acknowledgement (PSR) to your bank branch lowers the Advance Income Tax deduction on DPS and FDR profits from 15% down to 10%.'
        ]
      }
    ]
  }
];
