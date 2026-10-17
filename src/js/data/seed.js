// @ts-check
/**
 * @fileoverview Deterministic seed dataset for the application bootstrap.
 *
 * Architectural Layer: Infrastructure / Data Seeding.
 * Pattern: In-Memory Seed Snapshot / Mock Database.
 * Why: For educational and sandbox environments, embedding rich initial records
 * directly into localStorage guarantees reproducible state, realistic search
 * and filtering behaviors, and immediate out-of-the-box exploratory value.
 */

/**
 * Generates an SVG data URI with a modern tech-luxury minimalist aesthetic.
 * @param {string} bgFrom - Gradient start color.
 * @param {string} bgTo - Gradient end color.
 * @param {string} iconSvg - Inner SVG path or shape.
 * @param {string} label - Technical label badge.
 * @returns {string} Safe Data URI string.
 */
function makeIllustration(bgFrom, bgTo, iconSvg, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgFrom}" />
        <stop offset="100%" stop-color="${bgTo}" />
      </linearGradient>
      <linearGradient id="p" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#g)" rx="16"/>
    <rect width="600" height="400" fill="url(#p)" rx="16"/>
    <circle cx="300" cy="180" r="110" fill="rgba(255,255,255,0.06)" />
    <circle cx="300" cy="180" r="75" fill="rgba(255,255,255,0.08)" />
    <g transform="translate(300, 180) scale(1.4)" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${iconSvg}
    </g>
    <rect x="210" y="318" width="180" height="34" rx="17" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="300" y="340" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="600" letter-spacing="1.5" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Icons for tech products
const laptopIcon = `<rect x="-36" y="-28" width="72" height="46" rx="4"/><line x1="-48" y1="22" x2="48" y2="22" stroke-width="4"/><line x1="-12" y1="22" x2="12" y2="22" stroke-width="2"/>`;
const headphonesIcon = `<path d="M-28,10 A28,28 0 0,1 28,10 V20 A8,8 0 0,1 20,28 H18 A8,8 0 0,1 10,20 V12 H-10 V20 A8,8 0 0,1 -18,28 H-20 A8,8 0 0,1 -28,20 Z"/><path d="M-28,8 V-4 A28,28 0 0,1 28,-4 V8"/>`;
const keyboardIcon = `<rect x="-42" y="-20" width="84" height="42" rx="6"/><circle cx="-28" cy="-8" r="2.5" fill="#fff"/><circle cx="-14" cy="-8" r="2.5" fill="#fff"/><circle cx="0" cy="-8" r="2.5" fill="#fff"/><circle cx="14" cy="-8" r="2.5" fill="#fff"/><circle cx="28" cy="-8" r="2.5" fill="#fff"/><circle cx="-21" cy="4" r="2.5" fill="#fff"/><circle cx="-7" cy="4" r="2.5" fill="#fff"/><circle cx="7" cy="4" r="2.5" fill="#fff"/><circle cx="21" cy="4" r="2.5" fill="#fff"/><line x1="-14" y1="14" x2="14" y2="14" stroke-width="3"/>`;
const monitorIcon = `<rect x="-44" y="-30" width="88" height="52" rx="4"/><line x1="0" y1="22" x2="0" y2="34" stroke-width="4"/><line x1="-24" y1="34" x2="24" y2="34" stroke-width="4"/>`;
const watchIcon = `<rect x="-14" y="-36" width="28" height="72" rx="6" stroke-dasharray="4 2"/><rect x="-24" y="-22" width="48" height="44" rx="12" fill="rgba(255,255,255,0.15)" stroke-width="2.5"/><circle cx="0" cy="0" r="14"/><line x1="0" y1="0" x2="0" y2="-7"/><line x1="0" y1="0" x2="6" y2="0"/>`;
const micIcon = `<rect x="-12" y="-28" width="24" height="38" rx="12"/><path d="M-22,-4 A22,22 0 0,0 22,-4"/><line x1="0" y1="18" x2="0" y2="30" stroke-width="3"/><line x1="-16" y1="30" x2="16" y2="30" stroke-width="3"/>`;
const mouseIcon = `<rect x="-18" y="-30" width="36" height="60" rx="18"/><line x1="0" y1="-28" x2="0" y2="-12" stroke-width="3"/>`;
const standIcon = `<path d="M-36,24 L-12,-18 L12,-18 L36,24"/><line x1="-28" y1="24" x2="28" y2="24" stroke-width="3"/><rect x="-22" y="-28" width="44" height="10" rx="3"/>`;

/** @type {import('../types/typedefs.js').CategoryMeta[]} */
export const seedCategories = [
  { slug: 'همه', name: 'همه دسته‌ها', icon: '✦', description: 'نمایش کاتالوگ جامع محصولات' },
  { slug: 'دیجیتال', name: 'لپ‌تاپ و پردازش', icon: '💻', description: 'ایستگاه‌های کاری پرقدرت و مهندسی' },
  { slug: 'صوتی', name: 'صوتی و مانیتورینگ', icon: '🎧', description: 'تجهیزات آکوستیک، هدفون و میکروفون' },
  { slug: 'محیط کار', name: 'ارگونومی و دسک‌تاپ', icon: '⌨️', description: 'کیبورد مکانیکی، ماوس و هاب' },
  { slug: 'نمایشگر', name: 'نمایشگر و تصویر', icon: '🖥️', description: 'مانیتورهای تخصصی کالیبره‌شده OLED' },
  { slug: 'پوشیدنی', name: 'پوشیدنی‌های هوشمند', icon: '⌚', description: 'ساعت و پایشگرهای سلامت تیتانیوم' }
];

export const seedData = {
  users: [
    {
      id: 'usr-admin-01',
      name: 'مهندس کیوان رادمنش',
      email: 'admin@example.com',
      role: 'admin',
      password: 'admin123',
      wishlist: ['prod-laptop-01', 'prod-display-04']
    },
    {
      id: 'usr-cust-02',
      name: 'سارا شایگان',
      email: 'user@example.com',
      role: 'customer',
      password: 'user123',
      wishlist: ['prod-audio-02', 'prod-desk-03']
    }
  ],
  session: null,
  products: [
    {
      id: 'prod-laptop-01',
      name: 'اولترابوک مهندسی استودیویی ۱۶ اینچ پرو',
      price: 89500000,
      discount: 12,
      category: 'دیجیتال',
      stock: 6,
      rating: 4.9,
      popularity: 98,
      badge: 'پرچمدار مهندسی',
      image: makeIllustration('#1e293b', '#0f172a', laptopIcon, 'WORKSTATION 16'),
      description: 'شاسی آلومینیومی ماشین‌کاری‌شده با تراشهٔ پرسرعت نسل جدید، ۳۲ گیگابایت رم یکپارچه و سیستم خنک‌کنندهٔ محفظهٔ بخار بی‌صدا برای کامپایل سنگین و رندرهای معماری.',
      specs: {
        'پردازنده': '۱۲ هسته اختصاصی هوش مصنوعی و پردازش موازی',
        'حافظه رم': '۳۲ گیگابایت LPDDR5X',
        'فضای ذخیره‌سازی': '۱ ترابایت NVMe Gen4',
        'نمایشگر': '۱۶ اینچ Mini-LED با نرخ نوسازی ۱۲۰ هرتز',
        'وزن': '۱.۶۲ کیلوگرم'
      },
      createdAt: '2026-09-15T10:00:00.000Z'
    },
    {
      id: 'prod-audio-02',
      name: 'هدفون مانیتورینگ Hi-Res استودیو پرو',
      price: 16800000,
      discount: 15,
      category: 'صوتی',
      stock: 14,
      rating: 4.8,
      popularity: 92,
      badge: 'صدای رفرنس',
      image: makeIllustration('#134e4a', '#042f2e', headphonesIcon, 'HI-RES STUDIO'),
      description: 'درایورهای بریلیومی ۵۰ میلی‌متری با پاسخ فرکانسی گسترده ۵ هرتز تا ۴۵ کیلوهرتز، حذف نویز فعال هیبریدی و اتصال بی‌سیم بدون افت کیفیت LDAC.',
      specs: {
        'درایور': '۵۰ میلی‌متر داینامیک پوشش بریلیوم',
        'طول عمر باتری': '۵۵ ساعت با ANC روشن',
        'کدک‌های پشتیبانی': 'LDAC, aptX Adaptive, AAC',
        'پدهای گوش': 'مموری فوم تنفس‌پذیر با روکش چرم ارگانیک'
      },
      createdAt: '2026-08-20T14:30:00.000Z'
    },
    {
      id: 'prod-desk-03',
      name: 'صفحه‌کلید مکانیکی ارگونومیک بی‌سیم آلومینیومی',
      price: 9400000,
      discount: 8,
      category: 'محیط کار',
      stock: 19,
      rating: 4.7,
      popularity: 88,
      badge: 'پیشنهاد نویسندگان',
      image: makeIllustration('#312e81', '#1e1b4b', keyboardIcon, 'CUSTOM KEYBOARD'),
      description: 'طراحی زاویه‌دار ارگونومیک با سوییچ‌های خطی کارخانه‌ای روغن‌کاری‌شده، فوم‌های جاذب صدا دو لایه و ساختار واشر (Gasket Mount) برای تایپ طولانی‌مدت بدون خستگی مچ دست.',
      specs: {
        'سوییچ‌ها': 'سوییچ‌های خطی روان با نیروی تحریک ۴۵ گرم',
        'بدنه': 'آلومینیوم آنودایز شده سری ۶۰۰۰',
        'اتصال': 'سه حالته (بلوتوث ۵.۳، دانگل ۲.۴G، کابل تایپ‌سی)',
        'نورپردازی': 'RGB جنوب‌سو با بیش از ۲۰ جلوه'
      },
      createdAt: '2026-09-02T09:15:00.000Z'
    },
    {
      id: 'prod-display-04',
      name: 'نمایشگر ۳۲ اینچ 4K OLED کالیبره‌شده',
      price: 64000000,
      discount: 10,
      category: 'نمایشگر',
      stock: 4,
      rating: 4.9,
      popularity: 95,
      badge: 'دقت رنگ ۹۹٪',
      image: makeIllustration('#701a75', '#4a044e', monitorIcon, 'OLED PRO 4K'),
      description: 'پنل اختصاصی OLED با عمق رنگ واقعی ۱۰ بیت، پوشش ۹۹ درصدی دامنه رنگ DCI-P3، درگاه تاندربولت ۴ با توان شارژ ۹۶ وات به همراه هاب سخت‌افزاری داخلی.',
      specs: {
        'رزولوشن': '۳۸۴۰ در ۲۱۶۰ پیکسل (4K UHD)',
        'نرخ نوسازی': '۱۴۴ هرتز متغیر با پشتیبانی FreeSync Premium',
        'روشنایی بیشینه': '۱۰۰۰ نیت (HDR Peak)',
        'پورت‌ها': '۲ عدد تاندربولت ۴، ۲ عدد HDMI 2.1، ۴ پورت USB-A'
      },
      createdAt: '2026-07-28T16:45:00.000Z'
    },
    {
      id: 'prod-wear-05',
      name: 'ساعت هوشمند پایش زیستی با بدنه تیتانیوم گرید ۵',
      price: 24500000,
      discount: 0,
      category: 'پوشیدنی',
      stock: 8,
      rating: 4.6,
      popularity: 84,
      badge: 'متریال هوافضا',
      image: makeIllustration('#7c2d12', '#431407', watchIcon, 'TITANIUM WATCH'),
      description: 'سنسورهای نوری نسل هشتم برای اندازه‌گیری دقیق تغییرات ضربان قلب (HRV)، اکسیژن خون و شاخص بازیابی عصبی به همراه شیشهٔ کریستال یاقوت کبود ضدخش.',
      specs: {
        'جنس بدنه': 'تیتانیوم گرید هوافضا با کریستال سافایر',
        'مقاومت در برابر آب': '۱۰ اتمسفر (تا عمق ۱۰۰ متر)',
        'ماندگاری باتری': '۱۴ روز در استفاده عادی',
        'سنسورها': 'نوار قلب الکتریکی (ECG)، دماسنج پوست، ژیروسکوپ'
      },
      createdAt: '2026-08-30T11:00:00.000Z'
    },
    {
      id: 'prod-audio-06',
      name: 'میکروفون کاندنسر استودیویی دیافراگم بزرگ USB-C',
      price: 11200000,
      discount: 5,
      category: 'صوتی',
      stock: 11,
      rating: 4.5,
      popularity: 76,
      badge: 'کیفیت برودکست',
      image: makeIllustration('#064e3b', '#022c22', micIcon, 'BROADCAST MIC'),
      description: 'میکروفون حرفه‌ای با کپسول ۲۵ میلی‌متری روکش طلا، پردازشگر داخلی DSP و مدار پیش‌تقویت‌کننده کم‌نویز برای ضبط پادکست، جلسات و استریمینگ سازمانی.',
      specs: {
        'الگوی قطبی': 'کاردیوئید، فیگور ۸، تمام‌جهتی',
        'نرخ نمونه‌برداری': '۲۴ بیت در ۱۹۲ کیلوهرتز',
        'خروجی مانیتورینگ': 'جک ۳.۵ میلی‌متری بدون تاخیر',
        'پایه ضد لرزش': 'شوک‌مانت فلزی به همراه پاپ‌فیلتر مغناطیسی'
      },
      createdAt: '2026-09-10T13:20:00.000Z'
    },
    {
      id: 'prod-desk-07',
      name: 'ماوس عمودی بی‌سیم ارگونومیک با سنسور لیزری',
      price: 4800000,
      discount: 0,
      category: 'محیط کار',
      stock: 25,
      rating: 4.4,
      popularity: 71,
      badge: 'سلامت مچ دست',
      image: makeIllustration('#1e3a5f', '#0b1c33', mouseIcon, 'VERTICAL MOUSE'),
      description: 'زاویه طبیعی ۵۷ درجه برای کاهش فشار بر عصب مچ و تاندون‌ها، کلیک‌های سایلنت لمسی و اسکرول مغناطیسی فوق‌سریع برای اسناد و کدهای حجیم.',
      specs: {
        'دقت سنسور': '۴۰۰۰ DPI قابل تنظیم با سنسور Darkfield',
        'زاویه ساختار': '۵۷ درجه آناتومیک',
        'شارژدهی': 'تا ۷۰ روز با یک بار شارژ تایپ‌سی',
        'کلیدهای میانبر': '۴ کلید جانبی با قابلیت برنامه‌ریزی'
      },
      createdAt: '2026-08-05T08:00:00.000Z'
    },
    {
      id: 'prod-desk-08',
      name: 'استند آلومینیومی لپ‌تاپ به همراه هاب ۱۰ کاره',
      price: 5900000,
      discount: 20,
      category: 'محیط کار',
      stock: 0,
      rating: 4.3,
      popularity: 65,
      badge: 'ناموجود موقت',
      image: makeIllustration('#374151', '#1f2937', standIcon, 'HUB STAND 10IN1'),
      description: 'پایه خنک‌کننده یکپارچه با هاب آلومینیومی شامل پورت شبکه اترنت گیگابیت، دو خروجی HDMI 4K، کارت‌خوان SD و درگاه ورودی ۱۰۰ وات توان شارژ لپ‌تاپ.',
      specs: {
        'متریال': 'آلومینیوم CNC برس خورده مات',
        'درگاه‌ها': '۱۰ درگاه شامل تاندربولت پاس‌ترو، شبکه، جک صدا',
        'تنظیم زاویه': '۶ زاویه دید از ۱۵ تا ۴۵ درجه',
        'سازگاری': 'تمام لپ‌تاپ‌های ۱۱ تا ۱۷ اینچ'
      },
      createdAt: '2026-06-18T12:00:00.000Z'
    }
  ],
  articles: [
    {
      id: 'art-arch-01',
      title: 'معماری پردازش در لپ‌تاپ‌های مدرن: تعادل توان و مصرف بهینه',
      excerpt: 'بررسی نقش موتورهای عصبی، ترانزیستورهای گیت‌سراسر و سیستم‌های خنک‌کننده بخار در عملکرد پیوسته پردازنده‌های نوین.',
      tags: ['دیجیتال', 'سخت‌افزار', 'معماری پردازنده'],
      author: 'تحریریه مهندسی سیستم',
      createdAt: '2026-09-22T08:30:00.000Z',
      readTimeMinutes: 6,
      relatedProductIds: ['prod-laptop-01', 'prod-display-04'],
      body: `## مقدمه و چالش گلوگاه حرارتی
در ایستگاه‌های کاری امروزی، کارایی دیگر صرفاً با فرکانس خام پردازنده سنجیده نمی‌شود؛ گلوگاه اصلی در دستگاه‌های قابل حمل، مدیریت اتلاف حرارتی و هدایت پایدار توان است. هنگامی که یک پروژه نرم‌افزاری بزرگ کامپایل می‌شود، یا رندرهای شبیه‌سازی اجرا می‌گردند، پردازنده‌ها در کسری از ثانیه به حداکثر توان مصرفی می‌رسند.

## لایه‌های محفظه بخار و هماهنگی هوای خنک
استفاده از شاسی آلومینیومی یکپارچه در ترکیب با فناوری اتاقک بخار (Vapor Chamber)، امکان انتقال گرما در دو بعد را فراهم می‌سازد. در این سیستم‌ها، سیال درون لایه‌های مویرگی تبخیر شده و پس از انتقال حرارت به پره‌های فن، مجدداً به مایع تبدیل می‌شود. نتیجه، حفظ فرکانس بیشینه توربو بدون افت ناگهانی ناشی از تراتلینگ است.

## بهینه‌سازی حافظه یکپارچه در خط لوله رندر
یکی دیگر از پیشرفت‌های چشمگیر، انتقال به معماری حافظه مشترک یا یکپارچه است. در این شیوه، پردازنده گرافیکی و پردازنده مرکزی بدون نیاز به کپی سنگین داده روی گذرگاه PCIe، مستقیماً به بافر حافظه رم دسترسی دارند. این امر عملکرد رندرینگ و بارگذاری داده‌های برداری را تا دو برابر ارتقا می‌دهد.`
    },
    {
      id: 'art-ergo-02',
      title: 'اصول طراحی محیط کار ارگونومیک برای مهندسان و برنامه‌نویسان',
      excerpt: 'راهنمای گام‌به‌گام کاهش فشارهای اسکلتی با زاویه دست طبیعی، صفحه‌کلیدهای واشردار و نمایشگرهای هم‌سطح چشم.',
      tags: ['محیط کار', 'ارگونومی', 'بهره‌وری'],
      author: 'دکتر بهاره صادقی',
      createdAt: '2026-09-08T11:00:00.000Z',
      readTimeMinutes: 5,
      relatedProductIds: ['prod-desk-03', 'prod-desk-07', 'prod-display-04'],
      body: `## آناتومی خستگی مچ و گردن
نشستن مداوم و کار با کیبوردهای صاف سنتی، مچ دست را در وضعیت پرونیشن غیرطبیعی قرار می‌دهد. این کشش پیوسته روی کانال کارپال فشار مضاعف وارد ساخته و به مرور زمان موجب افت سرعت تایپ و گزگز انگشتان می‌گردد.

## سوییچ‌های مکانیکی و تاثیر ساختار گسکت (Gasket Mount)
صفحه‌کلیدهای مدرن ارگونومیک با صفحه شناور پلی‌کربنات و واشرهای سیلیکونی مانع از برخورد سخت کلید با سینی فلزی زیرین می‌شوند. این کاهش شوک مکانیکی، انرژی بازگشتی به مفاصل انگشتان را تا ۳۵ درصد مهار می‌کند.

## تنظیم ارتفاع و فاصله نمایشگر
لبه بالایی صفحه نمایش باید دقیقاً در راستای خط افق نگاه شما قرار گیرد. استفاده از پایه‌های قابل تنظیم آلومینیومی مانع از خم شدن مهره‌های گردن به جلو شده و فشار روی ستون فقرات را در نشستن‌های کاری کاهش می‌دهد.`
    },
    {
      id: 'art-sound-03',
      title: 'آکوستیک رفرنس و تفاوت هدفون‌های مانیتورینگ با هدفون‌های تفریحی',
      excerpt: 'چرا پاسخ فرکانسی تخت برای مهندسان صدا، سازندگان محتوا و تمرکز عمیق حیاتی است؟ بررسی درایورهای بریلیومی.',
      tags: ['صوتی', 'مانیتورینگ', 'تولید محتوا'],
      author: 'مهرداد ارجمند',
      createdAt: '2026-08-18T14:10:00.000Z',
      readTimeMinutes: 7,
      relatedProductIds: ['prod-audio-02', 'prod-audio-06'],
      body: `## دروغ شیرین صدای رنگ‌آمیزی‌شده
اکثر هدفون‌های تجاری فرکانس‌های بم (Bass) و زیر (Treble) را به شکل منحنی V تقویت می‌کنند تا صدا در نگاه اول گرم و پرهیجان به نظر رسد. اما در کارهای تولیدی، ویرایش پادکست و بررسی دقیق صدا، این تغییر مصنوعی خطاهای میکس را پنهان می‌کند.

## درایورهای پوشش بریلیوم و سرعت پاسخ ضربه‌ای
فلز بریلیوم به دلیل نسبت استحکام به جرم فوق‌العاده‌اش، ارتعاشات ناخواسته را حذف کرده و مانع از درهم‌ریختگی سیگنال در صداهای ناگهانی می‌شود. در نتیجه، تفکیک سازها و خطوط صوتی با خلوص کامل شنیده می‌شود.

## فیلتر نویز فعال بدون افت سیگنال
سیستم‌های حذف نویز مدرن با تکیه بر میکروفون‌های دوگانه فیدبک و فیدفوروارد، فرکانس‌های مزاحم محیط اداری را وارونه کرده و از بین می‌برند بدون آنکه به دینامیک اصلی صدا لطمه‌ای وارد شود.`
    },
    {
      id: 'art-oled-04',
      title: 'دقت رنگ و استانداردهای نمایش تصویر برای طراحان واسط کاربر',
      excerpt: 'تحلیل تفاوت‌های عمق رنگ ۱۰ بیتی، استانداردهای DCI-P3 و کالیبراسیون سخت‌افزاری در پنل‌های OLED نسل جدید.',
      tags: ['نمایشگر', 'طراحی', 'رنگ'],
      author: 'نیلوفر کامران',
      createdAt: '2026-07-14T09:45:00.000Z',
      readTimeMinutes: 4,
      relatedProductIds: ['prod-display-04', 'prod-laptop-01'],
      body: `## کالیبراسیون کارخانه‌ای و ضریب خطای Delta-E
برای یک طراح محصول یا ادیتور ویدیو، دیدن رنگ واقعی با خطای Delta-E کمتر از ۲ حیاتی است. رنگی که روی مانیتور معمولی خاکستری روشن است، ممکن است روی پنل‌های مصرف‌کنندگان آبی کدر دیده شود.

## مزیت کنتراست بی‌نهایت OLED
از آنجا که هر پیکسل در پنل‌های OLED به صورت مستقل نور تولید می‌کند، رنگ مشکی با خاموش شدن کامل پیکسل ایجاد می‌شود. این کنتراست بی‌نهایت، خوانایی تایپوگرافی‌های ریز و کنترل سایه‌های محو در تم‌های تیره (Dark Mode) را به سطحی کاملاً نو می‌رساند.`
    }
  ],
  orders: [
    {
      id: 'ord-88321045',
      userId: 'usr-cust-02',
      items: [
        {
          productId: 'prod-desk-03',
          name: 'صفحه‌کلید مکانیکی ارگونومیک بی‌سیم آلومینیومی',
          qty: 1,
          price: 8648000
        },
        {
          productId: 'prod-desk-07',
          name: 'ماوس عمودی بی‌سیم ارگونومیک با سنسور لیزری',
          qty: 1,
          price: 4800000
        }
      ],
      subtotal: 13448000,
      discount: 1344800,
      total: 12103200,
      status: 'delivered',
      createdAt: '2026-09-18T14:22:00.000Z',
      trackingCode: '88321045',
      address: 'تهران، خیابان ولیعصر، برج فناوری پارک، طبقه ۷',
      phone: '09123456789'
    },
    {
      id: 'ord-99410287',
      userId: 'usr-cust-02',
      items: [
        {
          productId: 'prod-audio-02',
          name: 'هدفون مانیتورینگ Hi-Res استودیو پرو',
          qty: 1,
          price: 14280000
        }
      ],
      subtotal: 14280000,
      discount: 0,
      total: 14280000,
      status: 'shipped',
      createdAt: '2026-10-02T18:40:00.000Z',
      trackingCode: '99410287',
      address: 'تهران، سعادت‌آباد، میدان کاج، کوچه پنجم، پلاک ۱۲',
      phone: '09123456789'
    }
  ],
  feedback: [
    {
      id: 'fb-001',
      name: 'آرش مقدسی',
      category: 'پیشنهاد',
      rating: 5,
      message: 'پیشنهاد می‌کنم بخش مقایسه مشخصات فنی بین دو محصول مشابه در پنجره مشاهده سریع افزوده شود.',
      createdAt: '2026-10-05T11:20:00.000Z',
      status: 'reviewed'
    },
    {
      id: 'fb-002',
      name: 'مریم فلاحی',
      category: 'انتقاد',
      rating: 4,
      message: 'سرعت تحویل سفارش قبلی عالی بود، اما بسته‌بندی می‌توانست محافظ ضربه‌گیر محکم‌تری داشته باشد.',
      createdAt: '2026-10-10T16:45:00.000Z',
      status: 'unread'
    },
    {
      id: 'fb-003',
      name: 'امیرحسین تهرانی',
      category: 'شکایت',
      rating: 3,
      message: 'استند آلومینیومی در سبد خریدم بود اما قبل از تکمیل تسویه‌حساب ناموجود شد. لطفاً موجودی را شارژ کنید.',
      createdAt: '2026-10-12T09:15:00.000Z',
      status: 'unread'
    }
  ],
  cart: [
    {
      productId: 'prod-audio-02',
      qty: 1
    }
  ]
};
