// ============================================
// HeatShield — Landing page translations
// ============================================
// Self-contained copy dictionary for the public landing page only (no
// external i18n library). Every visible string on the landing page has a
// real, human-quality translation per language — this is a working
// language switcher, not a decorative one. Brand/technical terms (SOS,
// GPS, AI, SMS, WhatsApp, HeatShield, SDG 13) are kept in Latin script,
// matching standard convention in Indian-language tech UIs.

export type LanguageCode = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'mr' | 'bn';

export interface LanguageMeta {
  code: LanguageCode;
  native: string;
  english: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
];

export interface LandingCopy {
  nav: { home: string; features: string; how: string; impact: string; contact: string };
  actions: { login: string; getStarted: string; watchDemo: string; viewDashboard: string; subscribe: string };
  hero: {
    badge: string;
    titlePrefix: string;
    titleHighlight: string;
    subtitle: string;
    liveInProduction: string;
    multiSiteReady: string;
  };
  mockup: {
    cluster: string;
    live: string;
    liveHeatIndex: string;
    dangerStopWork: string;
    onSite: string;
    airTemp: string;
    humidity: string;
    responseReady: string;
    sosDelivered: string;
    supervisorSec: string;
    aiForecast: string;
    peakRisk: string;
  };
  trust: { eyebrow: string; items: [string, string, string, string, string] };
  features: {
    eyebrow: string;
    titlePrefix: string;
    titleHighlight: string;
    items: { title: string; points: [string, string, string] }[];
  };
  how: { eyebrow: string; title: string; step: string; items: { title: string; desc: string }[] };
  why: { items: { eyebrow: string; title: string; body: string }[] };
  preview: { eyebrow: string; title: string; subtitle: string; live: string; cards: { k: string; sub: string }[] };
  impact: { items: [string, string, string, string] };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  cta: { title: string; subtitle: string };
  footer: {
    tagline: string;
    emailLabel: string;
    emailPlaceholder: string;
    subscribed: string;
    columns: { product: string; company: string; legal: string };
    links: {
      features: string; howItWorks: string; liveDashboard: string; impact: string;
      contact: string; signIn: string; privacy: string; terms: string; github: string;
    };
    madeWith: string;
  };
  languageLabel: string;
}

export const LANDING_TRANSLATIONS: Record<LanguageCode, LandingCopy> = {
  // ══════════════════════════ ENGLISH ══════════════════════════
  en: {
    nav: { home: 'Home', features: 'Features', how: 'How It Works', impact: 'Impact', contact: 'Contact' },
    actions: { login: 'Login', getStarted: 'Get Started', watchDemo: 'Watch Demo', viewDashboard: 'View Dashboard', subscribe: 'Subscribe' },
    hero: {
      badge: 'UN SDG 13 · Climate Action',
      titlePrefix: 'Protecting brick kiln workers from',
      titleHighlight: 'extreme heat',
      subtitle: "AI-powered heat monitoring, hydration management, real-time emergency response, and predictive analytics — helping save lives in the world's most hazardous working environments.",
      liveInProduction: 'Live in production',
      multiSiteReady: 'Multi-site ready',
    },
    mockup: {
      cluster: 'HeatShield · Anekal Cluster', live: 'Live', liveHeatIndex: 'Live Heat Index',
      dangerStopWork: 'Danger · Stop work', onSite: 'on site', airTemp: 'Air temp', humidity: 'Humidity',
      responseReady: 'Response ready', sosDelivered: 'SOS delivered', supervisorSec: 'Supervisor · 3s',
      aiForecast: 'AI forecast', peakRisk: 'Peak risk 2:40 PM',
    },
    trust: { eyebrow: 'Built for Climate Action', items: ['UN SDG 13', 'Worker Safety', 'Real-Time Monitoring', 'Emergency Response', 'AI Powered'] },
    features: {
      eyebrow: 'Platform features', titlePrefix: 'Everything a site needs to', titleHighlight: 'stay safe',
      items: [
        { title: 'Real-Time Heat Monitoring', points: ['Live heat index', 'Temperature', 'Humidity'] },
        { title: 'Hydration Management', points: ['Automatic reminders', 'Water tracking', 'Shift safety'] },
        { title: 'Emergency SOS', points: ['One-click SOS', 'Supervisor notification', 'Incident tracking'] },
        { title: 'Analytics Dashboard', points: ['Heat trends', 'Compliance', 'Risk analysis'] },
        { title: 'AI Insights', points: ['Predictive alerts', 'Heat-risk forecasting', 'Safety recommendations'] },
        { title: 'Compliance Management', points: ['Safety reports', 'Government compliance', 'Audit readiness'] },
      ],
    },
    how: {
      eyebrow: 'How it works', title: 'From first shift to safe return', step: 'STEP',
      items: [
        { title: 'Worker Starts Shift', desc: 'Check-in at the kiosk begins live protection.' },
        { title: 'Sensors Monitor Heat', desc: 'Heat index computed continuously per site.' },
        { title: 'Hydration Reminders', desc: 'Timed water breaks adapt to conditions.' },
        { title: 'SOS Detection', desc: 'A tap — or a threshold breach — raises the alarm.' },
        { title: 'Supervisor Alert', desc: 'SMS, WhatsApp & email dispatched in seconds.' },
        { title: 'Worker Safety', desc: 'Response coordinated, incident fully logged.' },
      ],
    },
    why: {
      items: [
        { eyebrow: 'The challenge', title: 'Heatwaves are getting deadlier', body: 'Kiln surfaces exceed 50°C and workers labour for hours with little shade. Heat stress is silent, cumulative, and often fatal before anyone notices.' },
        { eyebrow: 'The protection', title: 'A safety net around every worker', body: 'Per-site heat thresholds trigger mandated rest, hydration, and shift limits — turning raw weather data into concrete, life-saving action.' },
        { eyebrow: 'The intelligence', title: 'AI that sees danger coming', body: 'Predictive models flag rising heat-risk before it peaks, so supervisors act early instead of reacting to an emergency already underway.' },
        { eyebrow: 'The response', title: 'Rescue in minutes, not hours', body: 'One SOS fans out across SMS, WhatsApp, and email with GPS attached, and a full response timeline tracks trigger-to-rescue for accountability.' },
      ],
    },
    preview: {
      eyebrow: 'Live dashboard', title: 'The control room for worker safety',
      subtitle: 'Every site, every worker, every incident — monitored in real time and logged for compliance.', live: 'Live',
      cards: [
        { k: 'Peak Heat Index', sub: 'Danger threshold breached' },
        { k: 'Active SOS', sub: 'All workers safe' },
        { k: 'Compliance', sub: 'Audit-ready this month' },
      ],
    },
    impact: { items: ['Workers protected', 'Emergency notification success', 'Heat monitoring', 'Kiln sites connected'] },
    faq: {
      eyebrow: 'FAQ', title: 'Questions, answered',
      items: [
        { q: 'How does the SOS work?', a: "A worker taps the SOS button on the on-site kiosk (or triggers it anonymously). The incident is logged instantly and the assigned supervisor is alerted across SMS, WhatsApp, and email with the worker's GPS location and medical details attached." },
        { q: 'How are supervisors notified?', a: 'Notifications fan out through multiple channels simultaneously — Twilio SMS/WhatsApp and email — so an alert never depends on a single point of failure. Delivery status is recorded on the incident timeline.' },
        { q: 'How is the Heat Index calculated?', a: 'Live temperature and humidity per site are fed into the NOAA/NWS Rothfusz regression to produce a real-feel heat index, which maps to risk levels that drive automated rest, hydration, and shift rules.' },
        { q: 'Can it be deployed at multiple kiln sites?', a: 'Yes. HeatShield is multi-site from day one — each kiln runs its own live monitoring, roster, hydration cadence, and supervisor, all visible from a single admin console.' },
      ],
    },
    cta: { title: 'Ready to protect your workforce?', subtitle: 'Start using HeatShield today and bring enterprise-grade heat safety to every kiln site.' },
    footer: {
      tagline: 'Enterprise climate-tech protecting brick-kiln workers from extreme heat. Real-time monitoring, instant response, full compliance.',
      emailLabel: 'Email address', emailPlaceholder: 'you@company.com', subscribed: "Thanks — you're on the list.",
      columns: { product: 'Product', company: 'Company', legal: 'Legal' },
      links: { features: 'Features', howItWorks: 'How it works', liveDashboard: 'Live dashboard', impact: 'Impact', contact: 'Contact', signIn: 'Sign in', privacy: 'Privacy Policy', terms: 'Terms', github: 'GitHub' },
      madeWith: 'Made with ♥ for SDG 13 · Climate Action',
    },
    languageLabel: 'Select language',
  },

  // ══════════════════════════ HINDI ══════════════════════════
  hi: {
    nav: { home: 'होम', features: 'विशेषताएं', how: 'यह कैसे काम करता है', impact: 'प्रभाव', contact: 'संपर्क करें' },
    actions: { login: 'लॉगिन', getStarted: 'शुरू करें', watchDemo: 'डेमो देखें', viewDashboard: 'डैशबोर्ड देखें', subscribe: 'सब्सक्राइब करें' },
    hero: {
      badge: 'UN SDG 13 · जलवायु कार्रवाई',
      titlePrefix: 'ईंट भट्ठा मज़दूरों की सुरक्षा',
      titleHighlight: 'अत्यधिक गर्मी से',
      subtitle: 'AI-आधारित हीट मॉनिटरिंग, हाइड्रेशन प्रबंधन, रीयल-टाइम आपातकालीन प्रतिक्रिया, और भविष्यसूचक विश्लेषण — दुनिया के सबसे जोखिम भरे कार्यस्थलों में जीवन बचाने में मदद करते हैं।',
      liveInProduction: 'उत्पादन में लाइव',
      multiSiteReady: 'मल्टी-साइट तैयार',
    },
    mockup: {
      cluster: 'HeatShield · अनेकल क्लस्टर', live: 'लाइव', liveHeatIndex: 'लाइव हीट इंडेक्स',
      dangerStopWork: 'खतरा · काम रोकें', onSite: 'साइट पर मौजूद', airTemp: 'हवा का तापमान', humidity: 'नमी',
      responseReady: 'प्रतिक्रिया तैयार', sosDelivered: 'SOS भेजा गया', supervisorSec: 'सुपरवाइज़र · 3 सेकंड',
      aiForecast: 'AI पूर्वानुमान', peakRisk: 'अधिकतम जोखिम दोपहर 2:40',
    },
    trust: { eyebrow: 'जलवायु कार्रवाई के लिए निर्मित', items: ['UN SDG 13', 'श्रमिक सुरक्षा', 'रीयल-टाइम निगरानी', 'आपातकालीन प्रतिक्रिया', 'AI संचालित'] },
    features: {
      eyebrow: 'प्लेटफ़ॉर्म सुविधाएं', titlePrefix: 'साइट को सुरक्षित रखने के लिए हर ज़रूरी चीज़', titleHighlight: 'एक ही जगह',
      items: [
        { title: 'रीयल-टाइम हीट मॉनिटरिंग', points: ['लाइव हीट इंडेक्स', 'तापमान', 'नमी'] },
        { title: 'हाइड्रेशन प्रबंधन', points: ['स्वचालित रिमाइंडर', 'पानी की ट्रैकिंग', 'शिफ्ट सुरक्षा'] },
        { title: 'आपातकालीन SOS', points: ['एक-क्लिक SOS', 'सुपरवाइज़र सूचना', 'घटना ट्रैकिंग'] },
        { title: 'एनालिटिक्स डैशबोर्ड', points: ['हीट ट्रेंड्स', 'अनुपालन', 'जोखिम विश्लेषण'] },
        { title: 'AI इनसाइट्स', points: ['भविष्यसूचक अलर्ट', 'हीट-जोखिम पूर्वानुमान', 'सुरक्षा सुझाव'] },
        { title: 'अनुपालन प्रबंधन', points: ['सुरक्षा रिपोर्ट', 'सरकारी अनुपालन', 'ऑडिट तैयारी'] },
      ],
    },
    how: {
      eyebrow: 'यह कैसे काम करता है', title: 'पहली शिफ्ट से सुरक्षित वापसी तक', step: 'चरण',
      items: [
        { title: 'श्रमिक शिफ्ट शुरू करता है', desc: 'कियोस्क पर चेक-इन से लाइव सुरक्षा शुरू होती है।' },
        { title: 'सेंसर गर्मी की निगरानी करते हैं', desc: 'हर साइट के लिए हीट इंडेक्स लगातार गणना की जाती है।' },
        { title: 'हाइड्रेशन रिमाइंडर', desc: 'समयबद्ध पानी ब्रेक स्थिति के अनुसार ढलते हैं।' },
        { title: 'SOS पहचान', desc: 'एक टैप — या सीमा उल्लंघन — अलार्म बजाता है।' },
        { title: 'सुपरवाइज़र अलर्ट', desc: 'SMS, WhatsApp और ईमेल सेकंडों में भेजे जाते हैं।' },
        { title: 'श्रमिक सुरक्षा', desc: 'प्रतिक्रिया समन्वित होती है, घटना पूरी तरह दर्ज होती है।' },
      ],
    },
    why: {
      items: [
        { eyebrow: 'चुनौती', title: 'हीटवेव अधिक घातक होती जा रही हैं', body: 'भट्ठे की सतह 50°C से ऊपर पहुंच जाती है और श्रमिक बिना छाया के घंटों काम करते हैं। हीट स्ट्रेस चुपचाप बढ़ता है और अक्सर किसी के ध्यान में आने से पहले ही जानलेवा हो जाता है।' },
        { eyebrow: 'सुरक्षा', title: 'हर श्रमिक के चारों ओर एक सुरक्षा घेरा', body: 'हर साइट के लिए तय हीट सीमा आराम, हाइड्रेशन और शिफ्ट सीमाओं को अनिवार्य करती है — कच्चे मौसम डेटा को ठोस, जीवन-रक्षक कार्रवाई में बदलती है।' },
        { eyebrow: 'बुद्धिमत्ता', title: 'AI जो खतरे को पहले से भांप लेता है', body: 'पूर्वानुमान मॉडल बढ़ते हीट-जोखिम को चरम पर पहुंचने से पहले ही चिन्हित कर देते हैं, ताकि सुपरवाइज़र आपातकाल शुरू होने का इंतज़ार किए बिना जल्दी कार्रवाई करें।' },
        { eyebrow: 'प्रतिक्रिया', title: 'मिनटों में बचाव, घंटों में नहीं', body: 'एक SOS, GPS स्थान के साथ SMS, WhatsApp और ईमेल पर एक साथ भेजा जाता है, और एक पूरी प्रतिक्रिया समयरेखा जवाबदेही के लिए ट्रिगर-से-बचाव तक हर कदम दर्ज करती है।' },
      ],
    },
    preview: {
      eyebrow: 'लाइव डैशबोर्ड', title: 'श्रमिक सुरक्षा का नियंत्रण कक्ष',
      subtitle: 'हर साइट, हर श्रमिक, हर घटना — रीयल टाइम में निगरानी और अनुपालन के लिए दर्ज।', live: 'लाइव',
      cards: [
        { k: 'अधिकतम हीट इंडेक्स', sub: 'खतरे की सीमा पार' },
        { k: 'सक्रिय SOS', sub: 'सभी श्रमिक सुरक्षित' },
        { k: 'अनुपालन', sub: 'इस महीने ऑडिट-तैयार' },
      ],
    },
    impact: { items: ['सुरक्षित श्रमिक', 'आपातकालीन सूचना सफलता', 'हीट निगरानी', 'जुड़े हुए भट्ठा स्थल'] },
    faq: {
      eyebrow: 'सामान्य प्रश्न', title: 'आपके सवालों के जवाब',
      items: [
        { q: 'SOS कैसे काम करता है?', a: 'श्रमिक साइट के कियोस्क पर SOS बटन दबाता है (या इसे गुमनाम रूप से ट्रिगर करता है)। घटना तुरंत दर्ज हो जाती है और नियुक्त सुपरवाइज़र को श्रमिक के GPS स्थान और चिकित्सा विवरण के साथ SMS, WhatsApp और ईमेल पर अलर्ट भेजा जाता है।' },
        { q: 'सुपरवाइज़र को कैसे सूचित किया जाता है?', a: 'सूचनाएं एक साथ कई चैनलों — Twilio SMS/WhatsApp और ईमेल — के ज़रिए भेजी जाती हैं, ताकि कोई भी अलर्ट किसी एक विफलता पर निर्भर न रहे। डिलीवरी स्थिति घटना की समयरेखा पर दर्ज होती है।' },
        { q: 'हीट इंडेक्स की गणना कैसे होती है?', a: 'हर साइट के लाइव तापमान और नमी को NOAA/NWS रॉथफ़ुज़ रिग्रेशन में डाला जाता है ताकि एक वास्तविक-अनुभव हीट इंडेक्स तैयार हो, जो जोखिम स्तरों से जुड़कर स्वचालित आराम, हाइड्रेशन और शिफ्ट नियमों को संचालित करता है।' },
        { q: 'क्या इसे कई भट्ठा स्थलों पर लागू किया जा सकता है?', a: 'हां। HeatShield शुरू से ही मल्टी-साइट है — हर भट्ठा अपनी खुद की लाइव निगरानी, रोस्टर, हाइड्रेशन शेड्यूल और सुपरवाइज़र चलाता है, जो सभी एक ही एडमिन कंसोल से दिखाई देते हैं।' },
      ],
    },
    cta: { title: 'अपने कार्यबल की सुरक्षा के लिए तैयार हैं?', subtitle: 'आज ही HeatShield का उपयोग शुरू करें और हर भट्ठा स्थल पर एंटरप्राइज़-ग्रेड हीट सुरक्षा लाएं।' },
    footer: {
      tagline: 'अत्यधिक गर्मी से ईंट-भट्ठा श्रमिकों की रक्षा करने वाली एंटरप्राइज़ क्लाइमेट-टेक। रीयल-टाइम निगरानी, तुरंत प्रतिक्रिया, पूर्ण अनुपालन।',
      emailLabel: 'ईमेल पता', emailPlaceholder: 'you@company.com', subscribed: 'धन्यवाद — आप सूची में शामिल हो गए हैं।',
      columns: { product: 'उत्पाद', company: 'कंपनी', legal: 'कानूनी' },
      links: { features: 'विशेषताएं', howItWorks: 'यह कैसे काम करता है', liveDashboard: 'लाइव डैशबोर्ड', impact: 'प्रभाव', contact: 'संपर्क करें', signIn: 'साइन इन करें', privacy: 'गोपनीयता नीति', terms: 'नियम व शर्तें', github: 'GitHub' },
      madeWith: 'SDG 13 · जलवायु कार्रवाई के लिए ♥ से बनाया गया',
    },
    languageLabel: 'भाषा चुनें',
  },

  // ══════════════════════════ KANNADA ══════════════════════════
  kn: {
    nav: { home: 'ಮುಖಪುಟ', features: 'ವೈಶಿಷ್ಟ್ಯಗಳು', how: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ', impact: 'ಪರಿಣಾಮ', contact: 'ಸಂಪರ್ಕಿಸಿ' },
    actions: { login: 'ಲಾಗಿನ್', getStarted: 'ಪ್ರಾರಂಭಿಸಿ', watchDemo: 'ಡೆಮೊ ವೀಕ್ಷಿಸಿ', viewDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ', subscribe: 'ಚಂದಾದಾರರಾಗಿ' },
    hero: {
      badge: 'UN SDG 13 · ಹವಾಮಾನ ಕ್ರಿಯೆ',
      titlePrefix: 'ಇಟ್ಟಿಗೆ ಗೂಡು ಕಾರ್ಮಿಕರ ರಕ್ಷಣೆ',
      titleHighlight: 'ತೀವ್ರ ಶಾಖದಿಂದ',
      subtitle: 'AI-ಚಾಲಿತ ಶಾಖ ಮೇಲ್ವಿಚಾರಣೆ, ಜಲಸಂಚಯನ ನಿರ್ವಹಣೆ, ರಿಯಲ್-ಟೈಮ್ ತುರ್ತು ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ಭವಿಷ್ಯಸೂಚಕ ವಿಶ್ಲೇಷಣೆ — ಜಗತ್ತಿನ ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ ಕೆಲಸದ ಸ್ಥಳಗಳಲ್ಲಿ ಜೀವಗಳನ್ನು ಉಳಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
      liveInProduction: 'ಬಳಕೆಯಲ್ಲಿ ಸಕ್ರಿಯ',
      multiSiteReady: 'ಬಹು-ಸೈಟ್ ಸಿದ್ಧ',
    },
    mockup: {
      cluster: 'HeatShield · ಆನೇಕಲ್ ಕ್ಲಸ್ಟರ್', live: 'ಲೈವ್', liveHeatIndex: 'ಲೈವ್ ಹೀಟ್ ಇಂಡೆಕ್ಸ್',
      dangerStopWork: 'ಅಪಾಯ · ಕೆಲಸ ನಿಲ್ಲಿಸಿ', onSite: 'ಸೈಟ್‌ನಲ್ಲಿ', airTemp: 'ಗಾಳಿಯ ಉಷ್ಣತೆ', humidity: 'ಆರ್ದ್ರತೆ',
      responseReady: 'ಪ್ರತಿಕ್ರಿಯೆ ಸಿದ್ಧ', sosDelivered: 'SOS ತಲುಪಿಸಲಾಗಿದೆ', supervisorSec: 'ಸೂಪರ್‌ವೈಸರ್ · 3 ಸೆ',
      aiForecast: 'AI ಮುನ್ಸೂಚನೆ', peakRisk: 'ಗರಿಷ್ಠ ಅಪಾಯ 2:40 PM',
    },
    trust: { eyebrow: 'ಹವಾಮಾನ ಕ್ರಿಯೆಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ', items: ['UN SDG 13', 'ಕಾರ್ಮಿಕರ ಸುರಕ್ಷತೆ', 'ರಿಯಲ್-ಟೈಮ್ ಮೇಲ್ವಿಚಾರಣೆ', 'ತುರ್ತು ಪ್ರತಿಕ್ರಿಯೆ', 'AI ಚಾಲಿತ'] },
    features: {
      eyebrow: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ವೈಶಿಷ್ಟ್ಯಗಳು', titlePrefix: 'ಸೈಟ್ ಸುರಕ್ಷಿತವಾಗಿರಲು ಬೇಕಾದ ಎಲ್ಲವೂ', titleHighlight: 'ಒಂದೇ ಕಡೆ',
      items: [
        { title: 'ರಿಯಲ್-ಟೈಮ್ ಶಾಖ ಮೇಲ್ವಿಚಾರಣೆ', points: ['ಲೈವ್ ಹೀಟ್ ಇಂಡೆಕ್ಸ್', 'ತಾಪಮಾನ', 'ಆರ್ದ್ರತೆ'] },
        { title: 'ಜಲಸಂಚಯನ ನಿರ್ವಹಣೆ', points: ['ಸ್ವಯಂಚಾಲಿತ ಜ್ಞಾಪನೆಗಳು', 'ನೀರಿನ ಟ್ರ್ಯಾಕಿಂಗ್', 'ಶಿಫ್ಟ್ ಸುರಕ್ಷತೆ'] },
        { title: 'ತುರ್ತು SOS', points: ['ಒಂದು ಕ್ಲಿಕ್ SOS', 'ಸೂಪರ್‌ವೈಸರ್ ಸೂಚನೆ', 'ಘಟನೆ ಟ್ರ್ಯಾಕಿಂಗ್'] },
        { title: 'ಅನಾಲಿಟಿಕ್ಸ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', points: ['ಶಾಖದ ಪ್ರವೃತ್ತಿಗಳು', 'ಅನುಸರಣೆ', 'ಅಪಾಯ ವಿಶ್ಲೇಷಣೆ'] },
        { title: 'AI ಒಳನೋಟಗಳು', points: ['ಭವಿಷ್ಯಸೂಚಕ ಎಚ್ಚರಿಕೆಗಳು', 'ಶಾಖ-ಅಪಾಯ ಮುನ್ಸೂಚನೆ', 'ಸುರಕ್ಷತಾ ಶಿಫಾರಸುಗಳು'] },
        { title: 'ಅನುಸರಣೆ ನಿರ್ವಹಣೆ', points: ['ಸುರಕ್ಷತಾ ವರದಿಗಳು', 'ಸರ್ಕಾರಿ ಅನುಸರಣೆ', 'ಆಡಿಟ್ ಸನ್ನದ್ಧತೆ'] },
      ],
    },
    how: {
      eyebrow: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ', title: 'ಮೊದಲ ಶಿಫ್ಟ್‌ನಿಂದ ಸುರಕ್ಷಿತ ಮರಳುವಿಕೆಯವರೆಗೆ', step: 'ಹಂತ',
      items: [
        { title: 'ಕಾರ್ಮಿಕ ಶಿಫ್ಟ್ ಪ್ರಾರಂಭಿಸುತ್ತಾರೆ', desc: 'ಕಿಯೋಸ್ಕ್‌ನಲ್ಲಿ ಚೆಕ್-ಇನ್ ಲೈವ್ ರಕ್ಷಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತದೆ.' },
        { title: 'ಸೆನ್ಸರ್‌ಗಳು ಶಾಖವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡುತ್ತವೆ', desc: 'ಪ್ರತಿ ಸೈಟ್‌ಗೆ ಹೀಟ್ ಇಂಡೆಕ್ಸ್ ನಿರಂತರವಾಗಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.' },
        { title: 'ಜಲಸಂಚಯನ ಜ್ಞಾಪನೆಗಳು', desc: 'ಸಮಯಬದ್ಧ ನೀರಿನ ವಿರಾಮಗಳು ಪರಿಸ್ಥಿತಿಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತವೆ.' },
        { title: 'SOS ಪತ್ತೆ', desc: 'ಒಂದು ಟ್ಯಾಪ್ — ಅಥವಾ ಮಿತಿ ಉಲ್ಲಂಘನೆ — ಎಚ್ಚರಿಕೆಯನ್ನು ಎಬ್ಬಿಸುತ್ತದೆ.' },
        { title: 'ಸೂಪರ್‌ವೈಸರ್ ಎಚ್ಚರಿಕೆ', desc: 'SMS, WhatsApp ಮತ್ತು ಇಮೇಲ್ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.' },
        { title: 'ಕಾರ್ಮಿಕರ ಸುರಕ್ಷತೆ', desc: 'ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸಂಘಟಿಸಲಾಗುತ್ತದೆ, ಘಟನೆಯನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ.' },
      ],
    },
    why: {
      items: [
        { eyebrow: 'ಸವಾಲು', title: 'ಶಾಖಅಲೆಗಳು ಹೆಚ್ಚು ಮಾರಕವಾಗುತ್ತಿವೆ', body: 'ಗೂಡಿನ ಮೇಲ್ಮೈ 50°C ಮೀರುತ್ತದೆ ಮತ್ತು ಕಾರ್ಮಿಕರು ಸ್ವಲ್ಪ ನೆರಳಿನಲ್ಲಿ ಗಂಟೆಗಟ್ಟಲೆ ದುಡಿಯುತ್ತಾರೆ. ಶಾಖ ಒತ್ತಡ ಮೌನವಾಗಿ, ಕ್ರಮೇಣ ಹೆಚ್ಚಾಗುತ್ತದೆ ಮತ್ತು ಯಾರಾದರೂ ಗಮನಿಸುವ ಮೊದಲೇ ಮಾರಕವಾಗಬಹುದು.' },
        { eyebrow: 'ರಕ್ಷಣೆ', title: 'ಪ್ರತಿ ಕಾರ್ಮಿಕನ ಸುತ್ತ ಸುರಕ್ಷತಾ ಜಾಲ', body: 'ಪ್ರತಿ ಸೈಟ್‌ಗೆ ನಿಗದಿತ ಶಾಖ ಮಿತಿಗಳು ಕಡ್ಡಾಯ ವಿಶ್ರಾಂತಿ, ಜಲಸಂಚಯನ ಮತ್ತು ಶಿಫ್ಟ್ ಮಿತಿಗಳನ್ನು ಪ್ರಚೋದಿಸುತ್ತವೆ — ಕಚ್ಚಾ ಹವಾಮಾನ ಡೇಟಾವನ್ನು ಜೀವ ಉಳಿಸುವ ನಿಖರ ಕ್ರಮವಾಗಿ ಪರಿವರ್ತಿಸುತ್ತವೆ.' },
        { eyebrow: 'ಬುದ್ಧಿಮತ್ತೆ', title: 'ಅಪಾಯವನ್ನು ಮೊದಲೇ ಗ್ರಹಿಸುವ AI', body: 'ಭವಿಷ್ಯಸೂಚಕ ಮಾದರಿಗಳು ಹೆಚ್ಚುತ್ತಿರುವ ಶಾಖ-ಅಪಾಯವನ್ನು ಅದು ಉತ್ತುಂಗಕ್ಕೇರುವ ಮೊದಲೇ ಗುರುತಿಸುತ್ತವೆ, ಇದರಿಂದ ಸೂಪರ್‌ವೈಸರ್‌ಗಳು ತುರ್ತುಸ್ಥಿತಿ ಈಗಾಗಲೇ ಶುರುವಾದ ಮೇಲೆ ಪ್ರತಿಕ್ರಿಯಿಸುವ ಬದಲು ಮೊದಲೇ ಕ್ರಮ ಕೈಗೊಳ್ಳುತ್ತಾರೆ.' },
        { eyebrow: 'ಪ್ರತಿಕ್ರಿಯೆ', title: 'ಗಂಟೆಗಳಲ್ಲಿ ಅಲ್ಲ, ನಿಮಿಷಗಳಲ್ಲಿ ರಕ್ಷಣೆ', body: 'ಒಂದು SOS, GPS ಸ್ಥಳದೊಂದಿಗೆ SMS, WhatsApp ಮತ್ತು ಇಮೇಲ್‌ಗೆ ಏಕಕಾಲದಲ್ಲಿ ರವಾನೆಯಾಗುತ್ತದೆ, ಮತ್ತು ಸಂಪೂರ್ಣ ಪ್ರತಿಕ್ರಿಯೆ ಟೈಮ್‌ಲೈನ್ ಹೊಣೆಗಾರಿಕೆಗಾಗಿ ಪ್ರಚೋದನೆಯಿಂದ ರಕ್ಷಣೆಯವರೆಗೆ ಎಲ್ಲವನ್ನೂ ಟ್ರ್ಯಾಕ್ ಮಾಡುತ್ತದೆ.' },
      ],
    },
    preview: {
      eyebrow: 'ಲೈವ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', title: 'ಕಾರ್ಮಿಕರ ಸುರಕ್ಷತೆಯ ನಿಯಂತ್ರಣ ಕೊಠಡಿ',
      subtitle: 'ಪ್ರತಿ ಸೈಟ್, ಪ್ರತಿ ಕಾರ್ಮಿಕ, ಪ್ರತಿ ಘಟನೆ — ರಿಯಲ್ ಟೈಮ್‌ನಲ್ಲಿ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಅನುಸರಣೆಗಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ.', live: 'ಲೈವ್',
      cards: [
        { k: 'ಗರಿಷ್ಠ ಹೀಟ್ ಇಂಡೆಕ್ಸ್', sub: 'ಅಪಾಯದ ಮಿತಿ ಮೀರಿದೆ' },
        { k: 'ಸಕ್ರಿಯ SOS', sub: 'ಎಲ್ಲಾ ಕಾರ್ಮಿಕರು ಸುರಕ್ಷಿತ' },
        { k: 'ಅನುಸರಣೆ', sub: 'ಈ ತಿಂಗಳು ಆಡಿಟ್-ಸಿದ್ಧ' },
      ],
    },
    impact: { items: ['ರಕ್ಷಿಸಲ್ಪಟ್ಟ ಕಾರ್ಮಿಕರು', 'ತುರ್ತು ಸೂಚನೆ ಯಶಸ್ಸು', 'ಶಾಖ ಮೇಲ್ವಿಚಾರಣೆ', 'ಸಂಪರ್ಕಿತ ಗೂಡುಗಳ ಸ್ಥಳಗಳು'] },
    faq: {
      eyebrow: 'ಪ್ರಶ್ನೋತ್ತರ', title: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ',
      items: [
        { q: 'SOS ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?', a: 'ಕಾರ್ಮಿಕರು ಸೈಟ್‌ನಲ್ಲಿರುವ ಕಿಯೋಸ್ಕ್‌ನಲ್ಲಿ SOS ಬಟನ್ ಒತ್ತುತ್ತಾರೆ (ಅಥವಾ ಅನಾಮಧೇಯವಾಗಿ ಪ್ರಚೋದಿಸುತ್ತಾರೆ). ಘಟನೆಯನ್ನು ತಕ್ಷಣ ದಾಖಲಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ನಿಯೋಜಿತ ಸೂಪರ್‌ವೈಸರ್‌ಗೆ ಕಾರ್ಮಿಕರ GPS ಸ್ಥಳ ಮತ್ತು ವೈದ್ಯಕೀಯ ವಿವರಗಳೊಂದಿಗೆ SMS, WhatsApp ಮತ್ತು ಇಮೇಲ್ ಮೂಲಕ ಎಚ್ಚರಿಸಲಾಗುತ್ತದೆ.' },
        { q: 'ಸೂಪರ್‌ವೈಸರ್‌ಗಳಿಗೆ ಹೇಗೆ ಸೂಚಿಸಲಾಗುತ್ತದೆ?', a: 'ಸೂಚನೆಗಳು ಏಕಕಾಲದಲ್ಲಿ ಬಹು ಚಾನೆಲ್‌ಗಳ ಮೂಲಕ ಹರಡುತ್ತವೆ — Twilio SMS/WhatsApp ಮತ್ತು ಇಮೇಲ್ — ಆದ್ದರಿಂದ ಎಚ್ಚರಿಕೆ ಒಂದೇ ವೈಫಲ್ಯದ ಬಿಂದುವನ್ನು ಅವಲಂಬಿಸುವುದಿಲ್ಲ. ವಿತರಣಾ ಸ್ಥಿತಿಯನ್ನು ಘಟನೆಯ ಟೈಮ್‌ಲೈನ್‌ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ.' },
        { q: 'ಹೀಟ್ ಇಂಡೆಕ್ಸ್ ಅನ್ನು ಹೇಗೆ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ?', a: 'ಪ್ರತಿ ಸೈಟ್‌ನ ಲೈವ್ ತಾಪಮಾನ ಮತ್ತು ಆರ್ದ್ರತೆಯನ್ನು NOAA/NWS ರಾತ್‌ಫ್ಯೂಸ್ಜ್ ರಿಗ್ರೆಶನ್‌ಗೆ ಒಳಪಡಿಸಿ ನೈಜ-ಅನುಭವ ಹೀಟ್ ಇಂಡೆಕ್ಸ್ ಅನ್ನು ರಚಿಸಲಾಗುತ್ತದೆ, ಇದು ಅಪಾಯದ ಮಟ್ಟಗಳಿಗೆ ಸಂಬಂಧಿಸಿ ಸ್ವಯಂಚಾಲಿತ ವಿಶ್ರಾಂತಿ, ಜಲಸಂಚಯನ ಮತ್ತು ಶಿಫ್ಟ್ ನಿಯಮಗಳನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.' },
        { q: 'ಇದನ್ನು ಬಹು ಗೂಡು ಸ್ಥಳಗಳಲ್ಲಿ ಅಳವಡಿಸಬಹುದೇ?', a: 'ಹೌದು. HeatShield ಆರಂಭದಿಂದಲೇ ಬಹು-ಸೈಟ್ ಆಗಿದೆ — ಪ್ರತಿ ಗೂಡು ತನ್ನದೇ ಆದ ಲೈವ್ ಮೇಲ್ವಿಚಾರಣೆ, ರೋಸ್ಟರ್, ಜಲಸಂಚಯನ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಸೂಪರ್‌ವೈಸರ್ ಅನ್ನು ನಡೆಸುತ್ತದೆ, ಎಲ್ಲವೂ ಒಂದೇ ಅಡ್ಮಿನ್ ಕನ್ಸೋಲ್‌ನಿಂದ ಗೋಚರಿಸುತ್ತವೆ.' },
      ],
    },
    cta: { title: 'ನಿಮ್ಮ ಕಾರ್ಮಿಕ ಪಡೆಯನ್ನು ರಕ್ಷಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?', subtitle: 'ಇಂದೇ HeatShield ಬಳಸಲು ಪ್ರಾರಂಭಿಸಿ ಮತ್ತು ಪ್ರತಿ ಗೂಡು ಸ್ಥಳಕ್ಕೆ ಎಂಟರ್‌ಪ್ರೈಸ್-ದರ್ಜೆಯ ಶಾಖ ಸುರಕ್ಷತೆಯನ್ನು ತನ್ನಿ.' },
    footer: {
      tagline: 'ಇಟ್ಟಿಗೆ ಗೂಡು ಕಾರ್ಮಿಕರನ್ನು ತೀವ್ರ ಶಾಖದಿಂದ ರಕ್ಷಿಸುವ ಎಂಟರ್‌ಪ್ರೈಸ್ ಕ್ಲೈಮೇಟ್-ಟೆಕ್. ರಿಯಲ್-ಟೈಮ್ ಮೇಲ್ವಿಚಾರಣೆ, ತ್ವರಿತ ಪ್ರತಿಕ್ರಿಯೆ, ಸಂಪೂರ್ಣ ಅನುಸರಣೆ.',
      emailLabel: 'ಇಮೇಲ್ ವಿಳಾಸ', emailPlaceholder: 'you@company.com', subscribed: 'ಧನ್ಯವಾದಗಳು — ನೀವು ಪಟ್ಟಿಯಲ್ಲಿದ್ದೀರಿ.',
      columns: { product: 'ಉತ್ಪನ್ನ', company: 'ಕಂಪನಿ', legal: 'ಕಾನೂನು' },
      links: { features: 'ವೈಶಿಷ್ಟ್ಯಗಳು', howItWorks: 'ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ', liveDashboard: 'ಲೈವ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', impact: 'ಪರಿಣಾಮ', contact: 'ಸಂಪರ್ಕಿಸಿ', signIn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ', privacy: 'ಗೌಪ್ಯತಾ ನೀತಿ', terms: 'ನಿಯಮಗಳು', github: 'GitHub' },
      madeWith: 'SDG 13 · ಹವಾಮಾನ ಕ್ರಿಯೆಗಾಗಿ ♥ ನಿಂದ ರಚಿಸಲಾಗಿದೆ',
    },
    languageLabel: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
  },

  // ══════════════════════════ TAMIL ══════════════════════════
  ta: {
    nav: { home: 'முகப்பு', features: 'அம்சங்கள்', how: 'இது எப்படி செயல்படுகிறது', impact: 'தாக்கம்', contact: 'தொடர்பு' },
    actions: { login: 'உள்நுழைவு', getStarted: 'தொடங்குங்கள்', watchDemo: 'டெமோவைப் பார்க்க', viewDashboard: 'டாஷ்போர்டைக் காண', subscribe: 'குழுசேர' },
    hero: {
      badge: 'UN SDG 13 · காலநிலை நடவடிக்கை',
      titlePrefix: 'செங்கல் சூளை தொழிலாளர்களின் பாதுகாப்பு',
      titleHighlight: 'கடுமையான வெப்பத்திலிருந்து',
      subtitle: 'AI-இயங்கும் வெப்ப கண்காணிப்பு, நீரேற்ற மேலாண்மை, நேரடி அவசர பதில் மற்றும் முன்கணிப்பு பகுப்பாய்வு — உலகின் மிக ஆபத்தான பணியிடங்களில் உயிர்களைக் காப்பாற்ற உதவுகிறது.',
      liveInProduction: 'நேரடியாகப் பயன்பாட்டில்',
      multiSiteReady: 'பல-தள தயார்',
    },
    mockup: {
      cluster: 'HeatShield · அனேகல் கிளஸ்டர்', live: 'நேரடி', liveHeatIndex: 'நேரடி ஹீட் இண்டெக்ஸ்',
      dangerStopWork: 'ஆபத்து · வேலையை நிறுத்துங்கள்', onSite: 'தளத்தில் உள்ளனர்', airTemp: 'காற்று வெப்பநிலை', humidity: 'ஈரப்பதம்',
      responseReady: 'பதில் தயார்', sosDelivered: 'SOS அனுப்பப்பட்டது', supervisorSec: 'மேற்பார்வையாளர் · 3 வி',
      aiForecast: 'AI முன்னறிவிப்பு', peakRisk: 'உச்ச ஆபத்து பிற்பகல் 2:40',
    },
    trust: { eyebrow: 'காலநிலை நடவடிக்கைக்காக உருவாக்கப்பட்டது', items: ['UN SDG 13', 'தொழிலாளர் பாதுகாப்பு', 'நேரடி கண்காணிப்பு', 'அவசர பதில்', 'AI இயங்கும்'] },
    features: {
      eyebrow: 'தள அம்சங்கள்', titlePrefix: 'ஒரு தளம் பாதுகாப்பாக இருக்க தேவையான அனைத்தும்', titleHighlight: 'ஒரே இடத்தில்',
      items: [
        { title: 'நேரடி வெப்ப கண்காணிப்பு', points: ['நேரடி ஹீட் இண்டெக்ஸ்', 'வெப்பநிலை', 'ஈரப்பதம்'] },
        { title: 'நீரேற்ற மேலாண்மை', points: ['தானியங்கு நினைவூட்டல்கள்', 'நீர் கண்காணிப்பு', 'ஷிஃப்ட் பாதுகாப்பு'] },
        { title: 'அவசர SOS', points: ['ஒரு-க்ளிக் SOS', 'மேற்பார்வையாளர் அறிவிப்பு', 'சம்பவ கண்காணிப்பு'] },
        { title: 'பகுப்பாய்வு டாஷ்போர்டு', points: ['வெப்ப போக்குகள்', 'இணக்கம்', 'ஆபத்து பகுப்பாய்வு'] },
        { title: 'AI நுண்ணறிவுகள்', points: ['முன்கணிப்பு எச்சரிக்கைகள்', 'வெப்ப-ஆபத்து முன்னறிவிப்பு', 'பாதுகாப்பு பரிந்துரைகள்'] },
        { title: 'இணக்க மேலாண்மை', points: ['பாதுகாப்பு அறிக்கைகள்', 'அரசு இணக்கம்', 'தணிக்கை தயார்நிலை'] },
      ],
    },
    how: {
      eyebrow: 'இது எப்படி செயல்படுகிறது', title: 'முதல் ஷிஃப்ட் முதல் பாதுகாப்பான திரும்புதல் வரை', step: 'படி',
      items: [
        { title: 'தொழிலாளி ஷிஃப்டைத் தொடங்குகிறார்', desc: 'கியோஸ்கில் செக்-இன் நேரடி பாதுகாப்பைத் தொடங்குகிறது.' },
        { title: 'சென்சார்கள் வெப்பத்தை கண்காணிக்கின்றன', desc: 'ஒவ்வொரு தளத்திற்கும் ஹீட் இண்டெக்ஸ் தொடர்ந்து கணக்கிடப்படுகிறது.' },
        { title: 'நீரேற்ற நினைவூட்டல்கள்', desc: 'நேர-குறிப்பிட்ட நீர் இடைவெளிகள் நிலைமைகளுக்கு ஏற்ப மாறுகின்றன.' },
        { title: 'SOS கண்டறிதல்', desc: 'ஒரு தட்டல் — அல்லது வரம்பு மீறல் — எச்சரிக்கையை எழுப்புகிறது.' },
        { title: 'மேற்பார்வையாளர் எச்சரிக்கை', desc: 'SMS, WhatsApp மற்றும் மின்னஞ்சல் நொடிகளில் அனுப்பப்படுகின்றன.' },
        { title: 'தொழிலாளர் பாதுகாப்பு', desc: 'பதில் ஒருங்கிணைக்கப்படுகிறது, சம்பவம் முழுமையாக பதிவு செய்யப்படுகிறது.' },
      ],
    },
    why: {
      items: [
        { eyebrow: 'சவால்', title: 'வெப்ப அலைகள் மேலும் கொடியதாகி வருகின்றன', body: 'சூளை மேற்பரப்பு 50°C-ஐ தாண்டுகிறது, தொழிலாளர்கள் சிறிதளவு நிழலில் மணிக்கணக்கில் உழைக்கிறார்கள். வெப்ப அழுத்தம் அமைதியாக, படிப்படியாக அதிகரித்து, யாரும் கவனிக்கும் முன்பே பெரும்பாலும் உயிரிழப்பை ஏற்படுத்துகிறது.' },
        { eyebrow: 'பாதுகாப்பு', title: 'ஒவ்வொரு தொழிலாளியையும் சுற்றியுள்ள பாதுகாப்பு வலை', body: 'ஒவ்வொரு தளத்திற்குமான வெப்ப வரம்புகள் கட்டாய ஓய்வு, நீரேற்றம் மற்றும் ஷிஃப்ட் வரம்புகளைத் தூண்டுகின்றன — மூல வானிலை தரவை உறுதியான, உயிர்காக்கும் நடவடிக்கையாக மாற்றுகின்றன.' },
        { eyebrow: 'நுண்ணறிவு', title: 'ஆபத்தை முன்கூட்டியே உணரும் AI', body: 'முன்கணிப்பு மாதிரிகள் அதிகரிக்கும் வெப்ப-ஆபத்தை அது உச்சம் அடையும் முன்பே கண்டறிகின்றன, இதனால் மேற்பார்வையாளர்கள் அவசரநிலை ஏற்கனவே தொடங்கியபின் எதிர்வினையாற்றுவதற்குப் பதிலாக முன்கூட்டியே செயல்படுகிறார்கள்.' },
        { eyebrow: 'பதில்', title: 'மணிநேரங்களில் அல்ல, நிமிடங்களில் மீட்பு', body: 'ஒரு SOS, GPS இருப்பிடத்துடன் SMS, WhatsApp மற்றும் மின்னஞ்சலில் ஒரே நேரத்தில் அனுப்பப்படுகிறது, மேலும் ஒரு முழுமையான பதில் காலவரிசை பொறுப்புக்காக தூண்டுதலிலிருந்து மீட்பு வரை கண்காணிக்கிறது.' },
      ],
    },
    preview: {
      eyebrow: 'நேரடி டாஷ்போர்டு', title: 'தொழிலாளர் பாதுகாப்பிற்கான கட்டுப்பாட்டு அறை',
      subtitle: 'ஒவ்வொரு தளம், ஒவ்வொரு தொழிலாளி, ஒவ்வொரு சம்பவம் — நேரடியாக கண்காணிக்கப்பட்டு இணக்கத்திற்காக பதிவு செய்யப்படுகிறது.', live: 'நேரடி',
      cards: [
        { k: 'உச்ச ஹீட் இண்டெக்ஸ்', sub: 'ஆபத்து வரம்பு மீறப்பட்டது' },
        { k: 'செயலில் உள்ள SOS', sub: 'அனைத்து தொழிலாளர்களும் பாதுகாப்பாக உள்ளனர்' },
        { k: 'இணக்கம்', sub: 'இந்த மாதம் தணிக்கைக்குத் தயார்' },
      ],
    },
    impact: { items: ['பாதுகாக்கப்பட்ட தொழிலாளர்கள்', 'அவசர அறிவிப்பு வெற்றி', 'வெப்ப கண்காணிப்பு', 'இணைக்கப்பட்ட சூளை தளங்கள்'] },
    faq: {
      eyebrow: 'அடிக்கடி கேட்கப்படும் கேள்விகள்', title: 'உங்கள் கேள்விகளுக்கான பதில்கள்',
      items: [
        { q: 'SOS எப்படி வேலை செய்கிறது?', a: 'ஒரு தொழிலாளி தளத்திலுள்ள கியோஸ்கில் SOS பொத்தானை அழுத்துகிறார் (அல்லது அதை அநாமதேயமாகத் தூண்டுகிறார்). சம்பவம் உடனடியாக பதிவு செய்யப்பட்டு, நியமிக்கப்பட்ட மேற்பார்வையாளருக்கு தொழிலாளியின் GPS இருப்பிடம் மற்றும் மருத்துவ விவரங்களுடன் SMS, WhatsApp மற்றும் மின்னஞ்சல் மூலம் எச்சரிக்கை அனுப்பப்படுகிறது.' },
        { q: 'மேற்பார்வையாளர்களுக்கு எப்படி அறிவிக்கப்படுகிறது?', a: 'அறிவிப்புகள் ஒரே நேரத்தில் பல சேனல்கள் மூலம் அனுப்பப்படுகின்றன — Twilio SMS/WhatsApp மற்றும் மின்னஞ்சல் — எனவே ஒரு எச்சரிக்கை ஒரு தோல்வி புள்ளியை மட்டும் சார்ந்திருக்காது. வழங்கல் நிலை சம்பவ காலவரிசையில் பதிவு செய்யப்படுகிறது.' },
        { q: 'ஹீட் இண்டெக்ஸ் எப்படி கணக்கிடப்படுகிறது?', a: 'ஒவ்வொரு தளத்தின் நேரடி வெப்பநிலை மற்றும் ஈரப்பதம் NOAA/NWS ரோத்ஃபுஸ் பின்னடைவில் உள்ளிடப்பட்டு, ஆபத்து நிலைகளுடன் தொடர்புடைய உண்மையான-உணர்வு ஹீட் இண்டெக்ஸை உருவாக்குகிறது, இது தானியங்கு ஓய்வு, நீரேற்றம் மற்றும் ஷிஃப்ட் விதிகளை இயக்குகிறது.' },
        { q: 'இதை பல சூளை தளங்களில் பயன்படுத்த முடியுமா?', a: 'ஆம். HeatShield தொடக்கத்திலிருந்தே பல-தளமாக உள்ளது — ஒவ்வொரு சூளையும் அதன் சொந்த நேரடி கண்காணிப்பு, பணியாளர் பட்டியல், நீரேற்ற அட்டவணை மற்றும் மேற்பார்வையாளரை இயக்குகிறது, அனைத்தும் ஒரே நிர்வாக கன்சோலில் தெரியும்.' },
      ],
    },
    cta: { title: 'உங்கள் பணியாளர்களைப் பாதுகாக்க தயாரா?', subtitle: 'இன்றே HeatShield-ஐப் பயன்படுத்தத் தொடங்குங்கள், ஒவ்வொரு சூளை தளத்திற்கும் நிறுவன-தர வெப்ப பாதுகாப்பைக் கொண்டு வாருங்கள்.' },
    footer: {
      tagline: 'செங்கல் சூளை தொழிலாளர்களை கடுமையான வெப்பத்திலிருந்து பாதுகாக்கும் நிறுவன காலநிலை-தொழில்நுட்பம். நேரடி கண்காணிப்பு, உடனடி பதில், முழு இணக்கம்.',
      emailLabel: 'மின்னஞ்சல் முகவரி', emailPlaceholder: 'you@company.com', subscribed: 'நன்றி — நீங்கள் பட்டியலில் சேர்க்கப்பட்டுள்ளீர்கள்.',
      columns: { product: 'தயாரிப்பு', company: 'நிறுவனம்', legal: 'சட்டப்பூர்வ' },
      links: { features: 'அம்சங்கள்', howItWorks: 'இது எப்படி செயல்படுகிறது', liveDashboard: 'நேரடி டாஷ்போர்டு', impact: 'தாக்கம்', contact: 'தொடர்பு', signIn: 'உள்நுழையவும்', privacy: 'தனியுரிமைக் கொள்கை', terms: 'விதிமுறைகள்', github: 'GitHub' },
      madeWith: 'SDG 13 · காலநிலை நடவடிக்கைக்காக ♥ உடன் உருவாக்கப்பட்டது',
    },
    languageLabel: 'மொழியைத் தேர்ந்தெடுக்கவும்',
  },

  // ══════════════════════════ TELUGU ══════════════════════════
  te: {
    nav: { home: 'హోమ్', features: 'లక్షణాలు', how: 'ఇది ఎలా పనిచేస్తుంది', impact: 'ప్రభావం', contact: 'సంప్రదించండి' },
    actions: { login: 'లాగిన్', getStarted: 'ప్రారంభించండి', watchDemo: 'డెమో చూడండి', viewDashboard: 'డాష్‌బోర్డ్ చూడండి', subscribe: 'సబ్‌స్క్రైబ్ చేయండి' },
    hero: {
      badge: 'UN SDG 13 · వాతావరణ చర్య',
      titlePrefix: 'ఇటుక బట్టీ కార్మికుల రక్షణ',
      titleHighlight: 'తీవ్రమైన వేడి నుండి',
      subtitle: 'AI-ఆధారిత హీట్ మానిటరింగ్, హైడ్రేషన్ నిర్వహణ, రియల్-టైమ్ అత్యవసర ప్రతిస్పందన మరియు ప్రిడిక్టివ్ అనలిటిక్స్ — ప్రపంచంలోని అత్యంత ప్రమాదకరమైన పని ప్రదేశాలలో ప్రాణాలను కాపాడటానికి సహాయపడతాయి.',
      liveInProduction: 'ప్రొడక్షన్‌లో లైవ్',
      multiSiteReady: 'మల్టీ-సైట్ సిద్ధం',
    },
    mockup: {
      cluster: 'HeatShield · అనేకల్ క్లస్టర్', live: 'లైవ్', liveHeatIndex: 'లైవ్ హీట్ ఇండెక్స్',
      dangerStopWork: 'ప్రమాదం · పని ఆపండి', onSite: 'సైట్‌లో ఉన్నవారు', airTemp: 'గాలి ఉష్ణోగ్రత', humidity: 'తేమ',
      responseReady: 'ప్రతిస్పందన సిద్ధం', sosDelivered: 'SOS పంపబడింది', supervisorSec: 'సూపర్‌వైజర్ · 3సె',
      aiForecast: 'AI అంచనా', peakRisk: 'గరిష్ట ప్రమాదం మధ్యాహ్నం 2:40',
    },
    trust: { eyebrow: 'వాతావరణ చర్య కోసం నిర్మించబడింది', items: ['UN SDG 13', 'కార్మికుల భద్రత', 'రియల్-టైమ్ పర్యవేక్షణ', 'అత్యవసర ప్రతిస్పందన', 'AI ఆధారితం'] },
    features: {
      eyebrow: 'ప్లాట్‌ఫారమ్ ఫీచర్లు', titlePrefix: 'సైట్ సురక్షితంగా ఉండటానికి అవసరమైన ప్రతిదీ', titleHighlight: 'ఒకే చోట',
      items: [
        { title: 'రియల్-టైమ్ హీట్ మానిటరింగ్', points: ['లైవ్ హీట్ ఇండెక్స్', 'ఉష్ణోగ్రత', 'తేమ'] },
        { title: 'హైడ్రేషన్ నిర్వహణ', points: ['ఆటోమేటిక్ రిమైండర్లు', 'నీటి ట్రాకింగ్', 'షిఫ్ట్ భద్రత'] },
        { title: 'అత్యవసర SOS', points: ['ఒక్క-క్లిక్ SOS', 'సూపర్‌వైజర్ నోటిఫికేషన్', 'సంఘటన ట్రాకింగ్'] },
        { title: 'అనలిటిక్స్ డాష్‌బోర్డ్', points: ['హీట్ ట్రెండ్‌లు', 'కంప్లయన్స్', 'రిస్క్ విశ్లేషణ'] },
        { title: 'AI ఇన్‌సైట్స్', points: ['ప్రిడిక్టివ్ అలర్ట్‌లు', 'హీట్-రిస్క్ అంచనా', 'భద్రతా సిఫార్సులు'] },
        { title: 'కంప్లయన్స్ నిర్వహణ', points: ['భద్రతా నివేదికలు', 'ప్రభుత్వ కంప్లయన్స్', 'ఆడిట్ సంసిద్ధత'] },
      ],
    },
    how: {
      eyebrow: 'ఇది ఎలా పనిచేస్తుంది', title: 'మొదటి షిఫ్ట్ నుండి సురక్షిత తిరుగు ప్రయాణం వరకు', step: 'దశ',
      items: [
        { title: 'కార్మికుడు షిఫ్ట్ ప్రారంభిస్తారు', desc: 'కియోస్క్ వద్ద చెక్-ఇన్ లైవ్ రక్షణను ప్రారంభిస్తుంది.' },
        { title: 'సెన్సార్లు వేడిని పర్యవేక్షిస్తాయి', desc: 'ప్రతి సైట్ కోసం హీట్ ఇండెక్స్ నిరంతరం లెక్కించబడుతుంది.' },
        { title: 'హైడ్రేషన్ రిమైండర్లు', desc: 'సమయానుసార నీటి విరామాలు పరిస్థితులకు అనుగుణంగా మారతాయి.' },
        { title: 'SOS గుర్తింపు', desc: 'ఒక ట్యాప్ — లేదా పరిమితి ఉల్లంఘన — అలారం మోగిస్తుంది.' },
        { title: 'సూపర్‌వైజర్ అలర్ట్', desc: 'SMS, WhatsApp & ఇమెయిల్ సెకన్లలో పంపబడతాయి.' },
        { title: 'కార్మికుల భద్రత', desc: 'ప్రతిస్పందన సమన్వయం చేయబడుతుంది, సంఘటన పూర్తిగా నమోదు చేయబడుతుంది.' },
      ],
    },
    why: {
      items: [
        { eyebrow: 'సవాలు', title: 'వడగాడ్పులు మరింత ప్రాణాంతకంగా మారుతున్నాయి', body: 'బట్టీ ఉపరితలం 50°C దాటుతుంది, కార్మికులు కొద్దిపాటి నీడలో గంటల తరబడి పనిచేస్తారు. హీట్ స్ట్రెస్ నిశ్శబ్దంగా, క్రమంగా పెరిగి, ఎవరైనా గమనించే లోపే తరచుగా ప్రాణాంతకంగా మారుతుంది.' },
        { eyebrow: 'రక్షణ', title: 'ప్రతి కార్మికుడి చుట్టూ భద్రతా వలయం', body: 'ప్రతి సైట్‌కు నిర్దేశించిన హీట్ పరిమితులు తప్పనిసరి విశ్రాంతి, హైడ్రేషన్ మరియు షిఫ్ట్ పరిమితులను ప్రేరేపిస్తాయి — ముడి వాతావరణ డేటాను నిర్దిష్టమైన, ప్రాణాలను కాపాడే చర్యగా మారుస్తాయి.' },
        { eyebrow: 'మేధస్సు', title: 'ప్రమాదాన్ని ముందుగానే గుర్తించే AI', body: 'ప్రిడిక్టివ్ మోడల్స్ పెరుగుతున్న హీట్-రిస్క్‌ను అది గరిష్ట స్థాయికి చేరుకునే ముందే గుర్తిస్తాయి, తద్వారా అత్యవసర పరిస్థితి ఇప్పటికే మొదలైన తర్వాత స్పందించే బదులు సూపర్‌వైజర్లు ముందుగానే చర్య తీసుకుంటారు.' },
        { eyebrow: 'ప్రతిస్పందన', title: 'గంటలలో కాదు, నిమిషాల్లో రక్షణ', body: 'ఒక SOS, GPS లొకేషన్‌తో పాటు SMS, WhatsApp మరియు ఇమెయిల్‌కు ఏకకాలంలో పంపబడుతుంది, మరియు పూర్తి ప్రతిస్పందన టైమ్‌లైన్ జవాబుదారీతనం కోసం ట్రిగ్గర్ నుండి రక్షణ వరకు ప్రతిదీ ట్రాక్ చేస్తుంది.' },
      ],
    },
    preview: {
      eyebrow: 'లైవ్ డాష్‌బోర్డ్', title: 'కార్మికుల భద్రత కోసం నియంత్రణ గది',
      subtitle: 'ప్రతి సైట్, ప్రతి కార్మికుడు, ప్రతి సంఘటన — రియల్ టైమ్‌లో పర్యవేక్షించబడి కంప్లయన్స్ కోసం నమోదు చేయబడుతుంది.', live: 'లైవ్',
      cards: [
        { k: 'గరిష్ట హీట్ ఇండెక్స్', sub: 'ప్రమాద పరిమితి దాటింది' },
        { k: 'క్రియాశీల SOS', sub: 'కార్మికులందరూ సురక్షితం' },
        { k: 'కంప్లయన్స్', sub: 'ఈ నెల ఆడిట్‌కు సిద్ధం' },
      ],
    },
    impact: { items: ['రక్షించబడిన కార్మికులు', 'అత్యవసర నోటిఫికేషన్ విజయం', 'హీట్ పర్యవేక్షణ', 'అనుసంధానించబడిన బట్టీ సైట్‌లు'] },
    faq: {
      eyebrow: 'తరచుగా అడిగే ప్రశ్నలు', title: 'మీ ప్రశ్నలకు సమాధానాలు',
      items: [
        { q: 'SOS ఎలా పనిచేస్తుంది?', a: 'ఒక కార్మికుడు సైట్‌లోని కియోస్క్‌లో SOS బటన్‌ను నొక్కుతారు (లేదా అనామకంగా ప్రేరేపిస్తారు). సంఘటన వెంటనే నమోదు చేయబడుతుంది మరియు నియమించబడిన సూపర్‌వైజర్‌కు కార్మికుడి GPS లొకేషన్ మరియు వైద్య వివరాలతో సహా SMS, WhatsApp మరియు ఇమెయిల్ ద్వారా అలర్ట్ పంపబడుతుంది.' },
        { q: 'సూపర్‌వైజర్లకు ఎలా తెలియజేయబడుతుంది?', a: 'నోటిఫికేషన్‌లు ఏకకాలంలో బహుళ ఛానెల్‌ల ద్వారా పంపబడతాయి — Twilio SMS/WhatsApp మరియు ఇమెయిల్ — కాబట్టి ఒక అలర్ట్ ఎప్పుడూ ఒకే వైఫల్య బిందువుపై ఆధారపడదు. డెలివరీ స్థితి సంఘటన టైమ్‌లైన్‌లో నమోదు చేయబడుతుంది.' },
        { q: 'హీట్ ఇండెక్స్ ఎలా లెక్కించబడుతుంది?', a: 'ప్రతి సైట్ యొక్క లైవ్ ఉష్ణోగ్రత మరియు తేమ NOAA/NWS రాత్‌ఫస్జ్ రిగ్రెషన్‌లోకి అందించబడి, రిస్క్ స్థాయిలకు అనుసంధానమైన వాస్తవిక-అనుభూతి హీట్ ఇండెక్స్‌ను రూపొందిస్తాయి, ఇది ఆటోమేటిక్ విశ్రాంతి, హైడ్రేషన్ మరియు షిఫ్ట్ నియమాలను నడిపిస్తుంది.' },
        { q: 'దీన్ని బహుళ బట్టీ సైట్‌లలో అమలు చేయవచ్చా?', a: 'అవును. HeatShield మొదటి రోజు నుండే మల్టీ-సైట్‌గా ఉంది — ప్రతి బట్టీ దాని స్వంత లైవ్ పర్యవేక్షణ, రోస్టర్, హైడ్రేషన్ షెడ్యూల్ మరియు సూపర్‌వైజర్‌ను నడుపుతుంది, అన్నీ ఒకే అడ్మిన్ కన్సోల్ నుండి కనిపిస్తాయి.' },
      ],
    },
    cta: { title: 'మీ శ్రామిక శక్తిని రక్షించడానికి సిద్ధంగా ఉన్నారా?', subtitle: 'ఈరోజే HeatShield ఉపయోగించడం ప్రారంభించండి మరియు ప్రతి బట్టీ సైట్‌కు ఎంటర్‌ప్రైజ్-గ్రేడ్ హీట్ భద్రతను తీసుకురండి.' },
    footer: {
      tagline: 'ఇటుక బట్టీ కార్మికులను తీవ్రమైన వేడి నుండి రక్షించే ఎంటర్‌ప్రైజ్ క్లైమేట్-టెక్. రియల్-టైమ్ పర్యవేక్షణ, తక్షణ ప్రతిస్పందన, పూర్తి కంప్లయన్స్.',
      emailLabel: 'ఇమెయిల్ చిరునామా', emailPlaceholder: 'you@company.com', subscribed: 'ధన్యవాదాలు — మీరు జాబితాలో ఉన్నారు.',
      columns: { product: 'ఉత్పత్తి', company: 'కంపెనీ', legal: 'చట్టపరమైన' },
      links: { features: 'లక్షణాలు', howItWorks: 'ఇది ఎలా పనిచేస్తుంది', liveDashboard: 'లైవ్ డాష్‌బోర్డ్', impact: 'ప్రభావం', contact: 'సంప్రదించండి', signIn: 'సైన్ ఇన్', privacy: 'గోప్యతా విధానం', terms: 'నిబంధనలు', github: 'GitHub' },
      madeWith: 'SDG 13 · వాతావరణ చర్య కోసం ♥ తో తయారు చేయబడింది',
    },
    languageLabel: 'భాషను ఎంచుకోండి',
  },

  // ══════════════════════════ MARATHI ══════════════════════════
  mr: {
    nav: { home: 'मुख्यपृष्ठ', features: 'वैशिष्ट्ये', how: 'हे कसे कार्य करते', impact: 'प्रभाव', contact: 'संपर्क' },
    actions: { login: 'लॉगिन', getStarted: 'सुरू करा', watchDemo: 'डेमो पहा', viewDashboard: 'डॅशबोर्ड पहा', subscribe: 'सदस्यता घ्या' },
    hero: {
      badge: 'UN SDG 13 · हवामान कृती',
      titlePrefix: 'वीट भट्टी कामगारांचे संरक्षण',
      titleHighlight: 'अति उष्णतेपासून',
      subtitle: 'AI-आधारित उष्णता निरीक्षण, हायड्रेशन व्यवस्थापन, रिअल-टाइम आपत्कालीन प्रतिसाद आणि भाकीत विश्लेषण — जगातील सर्वात धोकादायक कामाच्या ठिकाणी जीव वाचवण्यास मदत करते.',
      liveInProduction: 'उत्पादनात कार्यरत',
      multiSiteReady: 'मल्टी-साइट तयार',
    },
    mockup: {
      cluster: 'HeatShield · अनेकल क्लस्टर', live: 'लाइव्ह', liveHeatIndex: 'लाइव्ह हीट इंडेक्स',
      dangerStopWork: 'धोका · काम थांबवा', onSite: 'साइटवर उपस्थित', airTemp: 'हवेचे तापमान', humidity: 'आर्द्रता',
      responseReady: 'प्रतिसाद तयार', sosDelivered: 'SOS पाठवला', supervisorSec: 'सुपरवायझर · 3 सेकंद',
      aiForecast: 'AI अंदाज', peakRisk: 'सर्वाधिक धोका दुपारी 2:40',
    },
    trust: { eyebrow: 'हवामान कृतीसाठी तयार केले', items: ['UN SDG 13', 'कामगार सुरक्षा', 'रिअल-टाइम निरीक्षण', 'आपत्कालीन प्रतिसाद', 'AI चालित'] },
    features: {
      eyebrow: 'प्लॅटफॉर्म वैशिष्ट्ये', titlePrefix: 'साइट सुरक्षित ठेवण्यासाठी आवश्यक असलेले सर्व काही', titleHighlight: 'एकाच ठिकाणी',
      items: [
        { title: 'रिअल-टाइम उष्णता निरीक्षण', points: ['लाइव्ह हीट इंडेक्स', 'तापमान', 'आर्द्रता'] },
        { title: 'हायड्रेशन व्यवस्थापन', points: ['स्वयंचलित स्मरणपत्रे', 'पाणी ट्रॅकिंग', 'शिफ्ट सुरक्षा'] },
        { title: 'आपत्कालीन SOS', points: ['एक-क्लिक SOS', 'सुपरवायझर सूचना', 'घटना ट्रॅकिंग'] },
        { title: 'अॅनालिटिक्स डॅशबोर्ड', points: ['उष्णता ट्रेंड्स', 'अनुपालन', 'जोखीम विश्लेषण'] },
        { title: 'AI इनसाइट्स', points: ['भाकीत सूचना', 'उष्णता-जोखीम अंदाज', 'सुरक्षा शिफारसी'] },
        { title: 'अनुपालन व्यवस्थापन', points: ['सुरक्षा अहवाल', 'सरकारी अनुपालन', 'ऑडिट सज्जता'] },
      ],
    },
    how: {
      eyebrow: 'हे कसे कार्य करते', title: 'पहिल्या शिफ्टपासून सुरक्षित परतीपर्यंत', step: 'पायरी',
      items: [
        { title: 'कामगार शिफ्ट सुरू करतो', desc: 'किऑस्कवर चेक-इन केल्याने लाइव्ह संरक्षण सुरू होते.' },
        { title: 'सेन्सर उष्णतेचे निरीक्षण करतात', desc: 'प्रत्येक साइटसाठी हीट इंडेक्सची सतत गणना केली जाते.' },
        { title: 'हायड्रेशन स्मरणपत्रे', desc: 'वेळेनुसार पाण्याचे विश्रांती परिस्थितीनुसार बदलतात.' },
        { title: 'SOS ओळख', desc: 'एक टॅप — किंवा मर्यादा उल्लंघन — अलार्म वाजवते.' },
        { title: 'सुपरवायझर सूचना', desc: 'SMS, WhatsApp आणि ईमेल सेकंदात पाठवले जातात.' },
        { title: 'कामगार सुरक्षा', desc: 'प्रतिसाद समन्वित केला जातो, घटना पूर्णपणे नोंदवली जाते.' },
      ],
    },
    why: {
      items: [
        { eyebrow: 'आव्हान', title: 'उष्णतेच्या लाटा अधिक जीवघेण्या होत आहेत', body: 'भट्टीची पृष्ठभाग 50°C पेक्षा जास्त होते आणि कामगार थोड्याशा सावलीत तासनतास काम करतात. उष्णतेचा ताण शांतपणे, हळूहळू वाढतो आणि अनेकदा कोणाच्याही लक्षात येण्यापूर्वीच जीवघेणा ठरतो.' },
        { eyebrow: 'संरक्षण', title: 'प्रत्येक कामगाराभोवती सुरक्षा जाळे', body: 'प्रत्येक साइटसाठी निश्चित उष्णता मर्यादा अनिवार्य विश्रांती, हायड्रेशन आणि शिफ्ट मर्यादा सुरू करतात — कच्च्या हवामान डेटाला ठोस, जीव वाचवणाऱ्या कृतीत रूपांतरित करतात.' },
        { eyebrow: 'बुद्धिमत्ता', title: 'धोका आधीच ओळखणारी AI', body: 'भाकीत मॉडेल्स वाढता उष्णता-धोका तो शिखरावर पोहोचण्यापूर्वीच ओळखतात, त्यामुळे सुपरवायझर आणीबाणी आधीच सुरू झाल्यावर प्रतिक्रिया देण्याऐवजी लवकर कारवाई करतात.' },
        { eyebrow: 'प्रतिसाद', title: 'तासांत नाही, मिनिटांत बचाव', body: 'एक SOS, GPS स्थानासह SMS, WhatsApp आणि ईमेलवर एकाच वेळी पाठवला जातो, आणि एक संपूर्ण प्रतिसाद टाइमलाइन जबाबदारीसाठी ट्रिगरपासून बचावापर्यंत सर्व काही नोंदवते.' },
      ],
    },
    preview: {
      eyebrow: 'लाइव्ह डॅशबोर्ड', title: 'कामगार सुरक्षेसाठी नियंत्रण कक्ष',
      subtitle: 'प्रत्येक साइट, प्रत्येक कामगार, प्रत्येक घटना — रिअल टाइममध्ये निरीक्षण केले जाते आणि अनुपालनासाठी नोंदवले जाते.', live: 'लाइव्ह',
      cards: [
        { k: 'सर्वाधिक हीट इंडेक्स', sub: 'धोक्याची मर्यादा ओलांडली' },
        { k: 'सक्रिय SOS', sub: 'सर्व कामगार सुरक्षित' },
        { k: 'अनुपालन', sub: 'या महिन्यात ऑडिट-तयार' },
      ],
    },
    impact: { items: ['संरक्षित कामगार', 'आपत्कालीन सूचना यश', 'उष्णता निरीक्षण', 'जोडलेली भट्टी स्थळे'] },
    faq: {
      eyebrow: 'वारंवार विचारले जाणारे प्रश्न', title: 'तुमच्या प्रश्नांची उत्तरे',
      items: [
        { q: 'SOS कसे कार्य करते?', a: 'कामगार साइटवरील किऑस्कवर SOS बटण दाबतो (किंवा तो निनावीपणे सक्रिय करतो). घटना त्वरित नोंदवली जाते आणि नियुक्त सुपरवायझरला कामगाराच्या GPS स्थान आणि वैद्यकीय तपशीलांसह SMS, WhatsApp आणि ईमेलद्वारे सूचना पाठवली जाते.' },
        { q: 'सुपरवायझरना कसे कळवले जाते?', a: 'सूचना एकाच वेळी अनेक माध्यमांतून पाठवल्या जातात — Twilio SMS/WhatsApp आणि ईमेल — त्यामुळे एक सूचना कधीही एकाच अपयशाच्या बिंदूवर अवलंबून राहत नाही. वितरण स्थिती घटनेच्या टाइमलाइनवर नोंदवली जाते.' },
        { q: 'हीट इंडेक्सची गणना कशी केली जाते?', a: 'प्रत्येक साइटचे लाइव्ह तापमान आणि आर्द्रता NOAA/NWS रॉथफुझ रिग्रेशनमध्ये टाकले जाते, ज्यामुळे वास्तविक-अनुभव हीट इंडेक्स तयार होतो, जो जोखीम पातळीशी जोडला जाऊन स्वयंचलित विश्रांती, हायड्रेशन आणि शिफ्ट नियम चालवतो.' },
        { q: 'हे अनेक भट्टी स्थळांवर वापरता येते का?', a: 'होय. HeatShield सुरुवातीपासूनच मल्टी-साइट आहे — प्रत्येक भट्टी स्वतःचे लाइव्ह निरीक्षण, रोस्टर, हायड्रेशन वेळापत्रक आणि सुपरवायझर चालवते, हे सर्व एकाच अॅडमिन कन्सोलमधून दिसते.' },
      ],
    },
    cta: { title: 'तुमच्या कामगारांचे संरक्षण करण्यास तयार आहात?', subtitle: 'आजच HeatShield वापरण्यास सुरुवात करा आणि प्रत्येक भट्टी स्थळावर एंटरप्राइझ-दर्जाची उष्णता सुरक्षा आणा.' },
    footer: {
      tagline: 'वीट-भट्टी कामगारांना अति उष्णतेपासून वाचवणारे एंटरप्राइझ क्लायमेट-टेक. रिअल-टाइम निरीक्षण, त्वरित प्रतिसाद, संपूर्ण अनुपालन.',
      emailLabel: 'ईमेल पत्ता', emailPlaceholder: 'you@company.com', subscribed: 'धन्यवाद — तुम्ही यादीत सामील झाला आहात.',
      columns: { product: 'उत्पादन', company: 'कंपनी', legal: 'कायदेशीर' },
      links: { features: 'वैशिष्ट्ये', howItWorks: 'हे कसे कार्य करते', liveDashboard: 'लाइव्ह डॅशबोर्ड', impact: 'प्रभाव', contact: 'संपर्क', signIn: 'साइन इन करा', privacy: 'गोपनीयता धोरण', terms: 'अटी', github: 'GitHub' },
      madeWith: 'SDG 13 · हवामान कृतीसाठी ♥ ने तयार केले',
    },
    languageLabel: 'भाषा निवडा',
  },

  // ══════════════════════════ BENGALI ══════════════════════════
  bn: {
    nav: { home: 'হোম', features: 'বৈশিষ্ট্য', how: 'এটি কীভাবে কাজ করে', impact: 'প্রভাব', contact: 'যোগাযোগ' },
    actions: { login: 'লগইন', getStarted: 'শুরু করুন', watchDemo: 'ডেমো দেখুন', viewDashboard: 'ড্যাশবোর্ড দেখুন', subscribe: 'সাবস্ক্রাইব করুন' },
    hero: {
      badge: 'UN SDG 13 · জলবায়ু পদক্ষেপ',
      titlePrefix: 'ইট ভাটা শ্রমিকদের সুরক্ষা',
      titleHighlight: 'প্রচণ্ড গরম থেকে',
      subtitle: 'AI-চালিত তাপ পর্যবেক্ষণ, হাইড্রেশন ব্যবস্থাপনা, রিয়েল-টাইম জরুরি প্রতিক্রিয়া এবং ভবিষ্যদ্বাণীমূলক বিশ্লেষণ — বিশ্বের সবচেয়ে ঝুঁকিপূর্ণ কর্মক্ষেত্রে জীবন বাঁচাতে সাহায্য করে।',
      liveInProduction: 'প্রোডাকশনে লাইভ',
      multiSiteReady: 'মাল্টি-সাইট প্রস্তুত',
    },
    mockup: {
      cluster: 'HeatShield · আনেকল ক্লাস্টার', live: 'লাইভ', liveHeatIndex: 'লাইভ হিট ইনডেক্স',
      dangerStopWork: 'বিপদ · কাজ বন্ধ করুন', onSite: 'সাইটে উপস্থিত', airTemp: 'বাতাসের তাপমাত্রা', humidity: 'আর্দ্রতা',
      responseReady: 'প্রতিক্রিয়া প্রস্তুত', sosDelivered: 'SOS পাঠানো হয়েছে', supervisorSec: 'সুপারভাইজার · ৩ সেকেন্ড',
      aiForecast: 'AI পূর্বাভাস', peakRisk: 'সর্বোচ্চ ঝুঁকি দুপুর ২:৪০',
    },
    trust: { eyebrow: 'জলবায়ু পদক্ষেপের জন্য নির্মিত', items: ['UN SDG 13', 'শ্রমিক নিরাপত্তা', 'রিয়েল-টাইম পর্যবেক্ষণ', 'জরুরি প্রতিক্রিয়া', 'AI চালিত'] },
    features: {
      eyebrow: 'প্ল্যাটফর্ম বৈশিষ্ট্য', titlePrefix: 'একটি সাইট নিরাপদ রাখতে প্রয়োজনীয় সবকিছু', titleHighlight: 'এক জায়গায়',
      items: [
        { title: 'রিয়েল-টাইম তাপ পর্যবেক্ষণ', points: ['লাইভ হিট ইনডেক্স', 'তাপমাত্রা', 'আর্দ্রতা'] },
        { title: 'হাইড্রেশন ব্যবস্থাপনা', points: ['স্বয়ংক্রিয় রিমাইন্ডার', 'পানি ট্র্যাকিং', 'শিফট নিরাপত্তা'] },
        { title: 'জরুরি SOS', points: ['এক-ক্লিক SOS', 'সুপারভাইজার বিজ্ঞপ্তি', 'ঘটনা ট্র্যাকিং'] },
        { title: 'অ্যানালিটিক্স ড্যাশবোর্ড', points: ['তাপ প্রবণতা', 'কমপ্লায়েন্স', 'ঝুঁকি বিশ্লেষণ'] },
        { title: 'AI ইনসাইটস', points: ['ভবিষ্যদ্বাণীমূলক সতর্কতা', 'তাপ-ঝুঁকি পূর্বাভাস', 'নিরাপত্তা সুপারিশ'] },
        { title: 'কমপ্লায়েন্স ব্যবস্থাপনা', points: ['নিরাপত্তা প্রতিবেদন', 'সরকারি কমপ্লায়েন্স', 'অডিট প্রস্তুতি'] },
      ],
    },
    how: {
      eyebrow: 'এটি কীভাবে কাজ করে', title: 'প্রথম শিফট থেকে নিরাপদ প্রত্যাবর্তন পর্যন্ত', step: 'ধাপ',
      items: [
        { title: 'শ্রমিক শিফট শুরু করেন', desc: 'কিয়স্কে চেক-ইন লাইভ সুরক্ষা শুরু করে।' },
        { title: 'সেন্সর তাপ পর্যবেক্ষণ করে', desc: 'প্রতিটি সাইটের জন্য হিট ইনডেক্স ক্রমাগত গণনা করা হয়।' },
        { title: 'হাইড্রেশন রিমাইন্ডার', desc: 'সময়নির্ধারিত পানি বিরতি পরিস্থিতি অনুযায়ী পরিবর্তিত হয়।' },
        { title: 'SOS শনাক্তকরণ', desc: 'একটি ট্যাপ — বা সীমা লঙ্ঘন — অ্যালার্ম বাজায়।' },
        { title: 'সুপারভাইজার সতর্কতা', desc: 'SMS, WhatsApp ও ইমেইল সেকেন্ডের মধ্যে পাঠানো হয়।' },
        { title: 'শ্রমিক নিরাপত্তা', desc: 'প্রতিক্রিয়া সমন্বিত হয়, ঘটনা সম্পূর্ণরূপে নথিভুক্ত হয়।' },
      ],
    },
    why: {
      items: [
        { eyebrow: 'চ্যালেঞ্জ', title: 'তাপপ্রবাহ আরও প্রাণঘাতী হয়ে উঠছে', body: 'ভাটার পৃষ্ঠতল ৫০°C ছাড়িয়ে যায় এবং শ্রমিকরা সামান্য ছায়ায় ঘণ্টার পর ঘণ্টা কাজ করেন। তাপজনিত চাপ নীরবে, ক্রমান্বয়ে বাড়ে এবং প্রায়ই কেউ লক্ষ্য করার আগেই প্রাণঘাতী হয়ে ওঠে।' },
        { eyebrow: 'সুরক্ষা', title: 'প্রতিটি শ্রমিকের চারপাশে একটি নিরাপত্তা বলয়', body: 'প্রতিটি সাইটের নির্দিষ্ট তাপ সীমা বাধ্যতামূলক বিশ্রাম, হাইড্রেশন এবং শিফট সীমা চালু করে — কাঁচা আবহাওয়া তথ্যকে সুনির্দিষ্ট, জীবন রক্ষাকারী পদক্ষেপে রূপান্তরিত করে।' },
        { eyebrow: 'বুদ্ধিমত্তা', title: 'যে AI বিপদ আগেই বুঝতে পারে', body: 'ভবিষ্যদ্বাণীমূলক মডেলগুলি ক্রমবর্ধমান তাপ-ঝুঁকি তার শীর্ষে পৌঁছানোর আগেই চিহ্নিত করে, যাতে সুপারভাইজাররা জরুরি অবস্থা ইতিমধ্যে শুরু হওয়ার পর প্রতিক্রিয়া জানানোর পরিবর্তে আগেই ব্যবস্থা নিতে পারেন।' },
        { eyebrow: 'প্রতিক্রিয়া', title: 'ঘণ্টায় নয়, মিনিটে উদ্ধার', body: 'একটি SOS, GPS অবস্থানসহ SMS, WhatsApp এবং ইমেইলে একযোগে পাঠানো হয়, এবং একটি সম্পূর্ণ প্রতিক্রিয়া টাইমলাইন জবাবদিহিতার জন্য ট্রিগার থেকে উদ্ধার পর্যন্ত সবকিছু ট্র্যাক করে।' },
      ],
    },
    preview: {
      eyebrow: 'লাইভ ড্যাশবোর্ড', title: 'শ্রমিক নিরাপত্তার নিয়ন্ত্রণ কক্ষ',
      subtitle: 'প্রতিটি সাইট, প্রতিটি শ্রমিক, প্রতিটি ঘটনা — রিয়েল টাইমে পর্যবেক্ষণ করা হয় এবং কমপ্লায়েন্সের জন্য নথিভুক্ত করা হয়।', live: 'লাইভ',
      cards: [
        { k: 'সর্বোচ্চ হিট ইনডেক্স', sub: 'বিপদসীমা অতিক্রান্ত' },
        { k: 'সক্রিয় SOS', sub: 'সব শ্রমিক নিরাপদ' },
        { k: 'কমপ্লায়েন্স', sub: 'এই মাসে অডিট-প্রস্তুত' },
      ],
    },
    impact: { items: ['সুরক্ষিত শ্রমিক', 'জরুরি বিজ্ঞপ্তি সাফল্য', 'তাপ পর্যবেক্ষণ', 'সংযুক্ত ভাটা সাইট'] },
    faq: {
      eyebrow: 'সাধারণ জিজ্ঞাসা', title: 'আপনার প্রশ্নের উত্তর',
      items: [
        { q: 'SOS কীভাবে কাজ করে?', a: 'একজন শ্রমিক সাইটের কিয়স্কে SOS বোতাম চাপেন (অথবা এটি বেনামে সক্রিয় করেন)। ঘটনাটি তৎক্ষণাৎ নথিভুক্ত হয় এবং নিযুক্ত সুপারভাইজারকে শ্রমিকের GPS অবস্থান ও চিকিৎসা বিবরণসহ SMS, WhatsApp এবং ইমেইলের মাধ্যমে সতর্ক করা হয়।' },
        { q: 'সুপারভাইজারদের কীভাবে জানানো হয়?', a: 'বিজ্ঞপ্তিগুলি একযোগে একাধিক চ্যানেলের মাধ্যমে পাঠানো হয় — Twilio SMS/WhatsApp এবং ইমেইল — যাতে একটি সতর্কতা কখনও একটিমাত্র ব্যর্থতার বিন্দুর উপর নির্ভর না করে। ডেলিভারি স্ট্যাটাস ঘটনার টাইমলাইনে নথিভুক্ত থাকে।' },
        { q: 'হিট ইনডেক্স কীভাবে গণনা করা হয়?', a: 'প্রতিটি সাইটের লাইভ তাপমাত্রা ও আর্দ্রতা NOAA/NWS রথফুজ রিগ্রেশনে প্রয়োগ করে একটি বাস্তব-অনুভূতি হিট ইনডেক্স তৈরি করা হয়, যা ঝুঁকির মাত্রার সাথে যুক্ত হয়ে স্বয়ংক্রিয় বিশ্রাম, হাইড্রেশন ও শিফট নিয়ম পরিচালনা করে।' },
        { q: 'এটি কি একাধিক ভাটা সাইটে ব্যবহার করা যায়?', a: 'হ্যাঁ। HeatShield শুরু থেকেই মাল্টি-সাইট — প্রতিটি ভাটা নিজস্ব লাইভ পর্যবেক্ষণ, রোস্টার, হাইড্রেশন সময়সূচি এবং সুপারভাইজার পরিচালনা করে, যা সবই একটি একক অ্যাডমিন কনসোল থেকে দেখা যায়।' },
      ],
    },
    cta: { title: 'আপনার কর্মীবাহিনীকে রক্ষা করতে প্রস্তুত?', subtitle: 'আজই HeatShield ব্যবহার শুরু করুন এবং প্রতিটি ভাটা সাইটে এন্টারপ্রাইজ-গ্রেড তাপ নিরাপত্তা নিয়ে আসুন।' },
    footer: {
      tagline: 'ইট-ভাটা শ্রমিকদের প্রচণ্ড গরম থেকে রক্ষাকারী এন্টারপ্রাইজ ক্লাইমেট-টেক। রিয়েল-টাইম পর্যবেক্ষণ, তাৎক্ষণিক প্রতিক্রিয়া, সম্পূর্ণ কমপ্লায়েন্স।',
      emailLabel: 'ইমেইল ঠিকানা', emailPlaceholder: 'you@company.com', subscribed: 'ধন্যবাদ — আপনি তালিকায় যুক্ত হয়েছেন।',
      columns: { product: 'পণ্য', company: 'কোম্পানি', legal: 'আইনি' },
      links: { features: 'বৈশিষ্ট্য', howItWorks: 'এটি কীভাবে কাজ করে', liveDashboard: 'লাইভ ড্যাশবোর্ড', impact: 'প্রভাব', contact: 'যোগাযোগ', signIn: 'সাইন ইন', privacy: 'গোপনীয়তা নীতি', terms: 'শর্তাবলী', github: 'GitHub' },
      madeWith: 'SDG 13 · জলবায়ু পদক্ষেপের জন্য ♥ দিয়ে তৈরি',
    },
    languageLabel: 'ভাষা নির্বাচন করুন',
  },
};
