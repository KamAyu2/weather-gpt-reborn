// ─── Language Configuration ────────────────────────────────────────────────

export type Language = "en" | "hi" | "ta" | "bn" | "te" | "mr" | "gu" | "kn" | "ml" | "pa";

export const LANGUAGES: Record<Language, { name: string; native: string; flag: string }> = {
  en: { name: "English", native: "English", flag: "🇬🇧" },
  hi: { name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  ta: { name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  bn: { name: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  te: { name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  mr: { name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  gu: { name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  kn: { name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  ml: { name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  pa: { name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
};

// ─── Translations ──────────────────────────────────────────────────────────

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.newChat": "New Chat",
    "nav.savedMessages": "Saved Messages",
    "nav.darkMode": "Dark Mode",
    "nav.lightMode": "Light Mode",
    "nav.signOut": "Sign Out",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Weather overview and your saved insights.",
    "dashboard.liveWeather": "Live Weather",
    "dashboard.askQuestion": "Ask a question",
    "dashboard.conversations": "Conversations",
    "dashboard.savedMessages": "Saved Messages",
    "dashboard.locationsQueried": "Locations Queried",
    "dashboard.dataPoints": "Data Points",
    "dashboard.recentConversations": "Recent Conversations",
    "dashboard.noSavedMessages": "No saved messages yet. Star any weather response to save it here.",
    
    // Chat
    "chat.placeholder": "Ask about the weather…",
    "chat.typing": "Thinking…",
    "chat.welcome": "Ask about the weather",
    "chat.welcomeSubtitle": "Get current conditions, forecasts, and alerts for any location worldwide.",
    "chat.voiceInput": "Voice Input",
    "chat.listening": "Listening…",
    
    // Weather
    "weather.current": "Now",
    "weather.temperature": "Temperature",
    "weather.feelsLike": "Feels like",
    "weather.humidity": "Humidity",
    "weather.wind": "Wind",
    "weather.uvIndex": "UV Index",
    "weather.pressure": "Pressure",
    "weather.cloudCover": "Cloud Cover",
    "weather.precipitation": "Precipitation",
    "weather.sunrise": "Sunrise",
    "weather.sunset": "Sunset",
    "weather.forecast7day": "7-Day Forecast",
    "weather.today": "Today",
    "weather.tomorrow": "Tomorrow",
    "weather.high": "High",
    "weather.low": "Low",
    "weather.rainChance": "Rain chance",
    "weather.weekSummary": "Week at a glance",
    
    // Alerts
    "alert.heat": "Heat advisory",
    "alert.cold": "Cold advisory",
    "alert.wind": "Wind advisory",
    "alert.uv": "UV alert",
    "alert.storm": "Severe weather alert",
    
    // Agriculture
    "agri.title": "Agriculture Advisory",
    "agri.irrigation": "Irrigation Advisory",
    "agri.sowing": "Sowing Advisory",
    "agri.pest": "Pest Alert",
    "agri.harvest": "Harvest Advisory",
    
    // Disasters
    "disaster.title": "Disaster Alerts",
    "disaster.flood": "Flood Warning",
    "disaster.cyclone": "Cyclone Alert",
    "disaster.heatwave": "Heatwave Warning",
    "disaster.coldwave": "Cold Wave Alert",
    
    // Suggestion chips
    "suggestion.weather": "What's the weather in Mumbai?",
    "suggestion.forecast": "7-day forecast for Delhi",
    "suggestion.rain": "Is it raining in London?",
    "suggestion.wind": "Wind conditions in Tokyo",
    "suggestion.joke": "Tell me a joke",
    "suggestion.capital": "What's the capital of France?",
    "suggestion.snow": "Snow forecast for Moscow",
    "suggestion.uv": "UV index in Sydney today",
    
    // Common
    "common.loading": "Loading…",
    "common.error": "Something went wrong",
    "common.retry": "Try again",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.search": "Search",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
  },
  
  hi: {
    // Navigation
    "nav.dashboard": "डैशबोर्ड",
    "nav.newChat": "नई चैट",
    "nav.savedMessages": "सहेजे गए संदेश",
    "nav.darkMode": "डार्क मोड",
    "nav.lightMode": "लाइट मोड",
    "nav.signOut": "साइन आउट",
    
    // Dashboard
    "dashboard.title": "डैशबोर्ड",
    "dashboard.subtitle": "मौसम अवलोकन और आपकी सहेजी गई जानकारी।",
    "dashboard.liveWeather": "लाइव मौसम",
    "dashboard.askQuestion": "प्रश्न पूछें",
    "dashboard.conversations": "वार्ताएँ",
    "dashboard.savedMessages": "सहेजे गए संदेश",
    "dashboard.locationsQueried": "खोजे गए स्थान",
    "dashboard.dataPoints": "डेटा पॉइंट्स",
    "dashboard.recentConversations": "हाल की वार्ताएँ",
    "dashboard.noSavedMessages": "अभी तक कोई सहेजा गया संदेश नहीं। इसे यहाँ सहेजने के लिए किसी भी मौसम प्रतिक्रिया पर स्टार करें।",
    
    // Chat
    "chat.placeholder": "मौसम के बारे में पूछें…",
    "chat.typing": "सोच रहा है…",
    "chat.welcome": "मौसम के बारे में पूछें",
    "chat.welcomeSubtitle": "किसी भी स्थान के लिए वर्तमान स्थितियाँ, पूर्वानुमान और अलर्ट प्राप्त करें।",
    "chat.voiceInput": "वॉयस इनपुट",
    "chat.listening": "सुन रहा है…",
    
    // Weather
    "weather.current": "अभी",
    "weather.temperature": "तापमान",
    "weather.feelsLike": "ऐसा लगता है",
    "weather.humidity": "आर्द्रता",
    "weather.wind": "हवा",
    "weather.uvIndex": "UV इंडेक्स",
    "weather.pressure": "दबाव",
    "weather.cloudCover": "बादल कवर",
    "weather.precipitation": "वर्षा",
    "weather.sunrise": "सूर्योदय",
    "weather.sunset": "सूर्यास्त",
    "weather.forecast7day": "7-दिन का पूर्वानुमान",
    "weather.today": "आज",
    "weather.tomorrow": "कल",
    "weather.high": "अधिकतम",
    "weather.low": "न्यूनतम",
    "weather.rainChance": "बारिश की संभावना",
    "weather.weekSummary": "सप्ताह का अवलोकन",
    
    // Agriculture
    "agri.title": "कृषि सलाह",
    "agri.irrigation": "सिंचाई सलाह",
    "agri.sowing": "बुवाई सलाह",
    "agri.pest": "कीट अलर्ट",
    "agri.harvest": "कटाई सलाह",
    
    // Disasters
    "disaster.title": "आपदा अलर्ट",
    "disaster.flood": "बाढ़ चेतावनी",
    "disaster.cyclone": "चक्रवात अलर्ट",
    "disaster.heatwave": "लू चेतावनी",
    "disaster.coldwave": "शीत लहर अलर्ट",
    
    // Common
    "common.loading": "लोड हो रहा है…",
    "common.error": "कुछ गलत हो गया",
    "common.retry": "पुनः प्रयास करें",
    "common.save": "सहेजें",
    "common.cancel": "रद्द करें",
    "common.delete": "हटाएँ",
    "common.search": "खोजें",
    "common.close": "बंद करें",
    "common.back": "वापस",
    "common.next": "अगला",
    "common.previous": "पिछला",
  },
  
  ta: {
    // Navigation
    "nav.dashboard": "டாஷ்போர்டு",
    "nav.newChat": "புதிய அரட்டை",
    "nav.savedMessages": "சேமிக்கப்பட்ட செய்திகள்",
    "nav.darkMode": "இருண்ட பயன்முறை",
    "nav.lightMode": "ஒளி பயன்முறை",
    "nav.signOut": "வெளியேறு",
    
    // Dashboard
    "dashboard.title": "டாஷ்போர்டு",
    "dashboard.subtitle": "வானிலை மேலோட்டம் மற்றும் உங்கள் சேமிக்கப்பட்ட நுண்ணறிவுகள்.",
    "dashboard.liveWeather": "நேரடி வானிலை",
    "dashboard.askQuestion": "ஒரு கேள்வி கேளுங்கள்",
    "dashboard.conversations": "உரையாடல்கள்",
    "dashboard.savedMessages": "சேமிக்கப்பட்ட செய்திகள்",
    "dashboard.locationsQueried": "தேடிய இடங்கள்",
    "dashboard.dataPoints": "தரவு புள்ளிகள்",
    "dashboard.recentConversations": "சமீபத்திய உரையாடல்கள்",
    "dashboard.noSavedMessages": "இன்னும் சேமிக்கப்பட்ட செய்திகள் இல்லை. இதை இங்கே சேமிக்க எந்த வானிலை பதிலையும் நட்சத்திரமிடுங்கள்.",
    
    // Chat
    "chat.placeholder": "வானிலை பற்றி கேளுங்கள்…",
    "chat.typing": "யோசிக்கிறது…",
    "chat.welcome": "வானிலை பற்றி கேளுங்கள்",
    "chat.welcomeSubtitle": "உலகின் எந்த இடத்திற்கும் நிகழ்கால நிலைமைகள், முன்னறிவிப்புகள் மற்றும் எச்சரிக்கைகளைப் பெறுங்கள்.",
    "chat.voiceInput": "குரல் உள்ளீடு",
    "chat.listening": "கேட்கிறது…",
    
    // Common
    "common.loading": "ஏற்றுகிறது…",
    "common.error": "ஏதோ தவறு நடந்தது",
    "common.retry": "மீண்டும் முயற்சிக்கவும்",
    "common.save": "சேமி",
    "common.cancel": "ரத்துசெய்",
    "common.delete": "நீக்கு",
    "common.search": "தேடு",
    "common.close": "மூடு",
    "common.back": "பின்",
    "common.next": "அடுத்து",
    "common.previous": "முந்தைய",
  },
  
  bn: {
    // Navigation
    "nav.dashboard": "ড্যাশবোর্ড",
    "nav.newChat": "নতুন চ্যাট",
    "nav.savedMessages": "সংরক্ষিত বার্তা",
    "nav.darkMode": "ডার্ক মোড",
    "nav.lightMode": "লাইট মোড",
    "nav.signOut": "সাইন আউট",
    
    // Dashboard
    "dashboard.title": "ড্যাশবোর্ড",
    "dashboard.subtitle": "আবহাওয়া ওভারভিউ এবং আপনার সংরক্ষিত অন্তর্দৃষ্টি।",
    "dashboard.liveWeather": "লাইভ আবহাওয়া",
    "dashboard.askQuestion": "একটি প্রশ্ন জিজ্ঞাসা করুন",
    "dashboard.conversations": "কথোপকথন",
    "dashboard.savedMessages": "সংরক্ষিত বার্তা",
    "dashboard.locationsQueried": "অনুসন্ধানকৃত স্থান",
    "dashboard.dataPoints": "ডেটা পয়েন্ট",
    "dashboard.recentConversations": "সাম্প্রতিক কথোপকথন",
    "dashboard.noSavedMessages": "এখনো কোনো সংরক্ষিত বার্তা নেই। এটি এখানে সংরক্ষণ করতে যেকোনো আবহাওয়া উত্তরে তারা দিন।",
    
    // Chat
    "chat.placeholder": "আবহাওয়া সম্পর্কে জিজ্ঞাসা করুন…",
    "chat.typing": "ভাবছে…",
    "chat.welcome": "আবহাওয়া সম্পর্কে জিজ্ঞাসা করুন",
    "chat.welcomeSubtitle": "যেকোনো স্থানের জন্য বর্তমান অবস্থা, পূর্বাভাস এবং সতর্কতা পান।",
    "chat.voiceInput": "ভয়েস ইনপুট",
    "chat.listening": "শুনছে…",
    
    // Common
    "common.loading": "লোড হচ্ছে…",
    "common.error": "কিছু ভুল হয়েছে",
    "common.retry": "আবার চেষ্টা করুন",
    "common.save": "সংরক্ষণ করুন",
    "common.cancel": "বাতিল করুন",
    "common.delete": "মুছুন",
    "common.search": "অনুসন্ধান করুন",
    "common.close": "বন্ধ করুন",
    "common.back": "পিছনে",
    "common.next": "পরবর্তী",
    "common.previous": "পূর্ববর্তী",
  },
  
  te: {
    "nav.dashboard": "డాష్‌బోర్డ్",
    "nav.newChat": "కొత్త చాట్",
    "nav.savedMessages": "సేవ్ చేసిన సందేశాలు",
    "nav.darkMode": "డార్క్ మోడ్",
    "nav.lightMode": "లైట్ మోడ్",
    "nav.signOut": "సైన్ అవుట్",
    "dashboard.title": "డాష్‌బోర్డ్",
    "dashboard.subtitle": "వాతావరణ అవలోకనం మరియు మీ సేవ్ చేసిన అంతర్దృష్టులు.",
    "dashboard.liveWeather": "లైవ్ వాతావరణం",
    "chat.placeholder": "వాతావరణం గురించి అడగండి…",
    "chat.welcome": "వాతావరణం గురించి అడగండి",
    "common.loading": "లోడ్ అవుతోంది…",
    "common.error": "ఏదో తప్పు జరిగింది",
  },
  
  mr: {
    "nav.dashboard": "डॅशबोर्ड",
    "nav.newChat": "नवीन चॅट",
    "nav.savedMessages": "सेव्ह केलेले संदेश",
    "nav.darkMode": "डार्क मोड",
    "nav.lightMode": "लाइट मोड",
    "nav.signOut": "साइन आउट",
    "dashboard.title": "डॅशबोर्ड",
    "dashboard.subtitle": "हवामान अवलोकन आणि तुमचे सेव्ह केलेले अंतर्दृष्टी.",
    "dashboard.liveWeather": "लाइव्ह हवामान",
    "chat.placeholder": "हवामानाबद्दल विचारा…",
    "chat.welcome": "हवामानाबद्दल विचारा",
    "common.loading": "लोड होत आहे…",
    "common.error": "काहीतरी चूक झाली",
  },
  
  gu: {
    "nav.dashboard": "ડેશબોર્ડ",
    "nav.newChat": "નવી ચેટ",
    "nav.savedMessages": "સાચવેલા સંદેશા",
    "nav.darkMode": "ડાર્ક મોડ",
    "nav.lightMode": "લાઈટ મોડ",
    "nav.signOut": "સાઈન આઉટ",
    "dashboard.title": "ડેશબોર્ડ",
    "dashboard.subtitle": "હવામાન ઓવરવ્યૂ અને તમારી સાચવેલી ઈન્સાઈટ્સ.",
    "dashboard.liveWeather": "લાઈવ હવામાન",
    "chat.placeholder": "હવામાન વિશે પૂછો…",
    "chat.welcome": "હવામાન વિશે પૂછો",
    "common.loading": "લોડ થઈ રહ્યું છે…",
    "common.error": "કંઈક ખોટું થયું",
  },
  
  kn: {
    "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "nav.newChat": "ಹೊಸ ಚಾಟ್",
    "nav.savedMessages": "ಉಳಿಸಿದ ಸಂದೇಶಗಳು",
    "nav.darkMode": "ಡಾರ್ಕ್ ಮೋಡ್",
    "nav.lightMode": "ಲೈಟ್ ಮೋಡ್",
    "nav.signOut": "ಸೈನ್ ಔಟ್",
    "dashboard.title": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "dashboard.subtitle": "ಹವಾಮಾನ ಅವಲೋಕನ ಮತ್ತು ನಿಮ್ಮ ಉಳಿಸಿದ ಒಳನೋಟಗಳು.",
    "dashboard.liveWeather": "ಲೈವ್ ಹವಾಮಾನ",
    "chat.placeholder": "ಹವಾಮಾನದ ಬಗ್ಗೆ ಕೇಳಿ…",
    "chat.welcome": "ಹವಾಮಾನದ ಬಗ್ಗೆ ಕೇಳಿ",
    "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    "common.error": "ಏನೋ ತಪ್ಪಾಗಿದೆ",
  },
  
  ml: {
    "nav.dashboard": "ഡാഷ്‌ബോർഡ്",
    "nav.newChat": "പുതിയ ചാറ്റ്",
    "nav.savedMessages": "സേവ് ചെയ്ത സന്ദേശങ്ങൾ",
    "nav.darkMode": "ഡാർക്ക് മോഡ്",
    "nav.lightMode": "ലൈറ്റ് മോഡ്",
    "nav.signOut": "സൈൻ ഔട്ട്",
    "dashboard.title": "ഡാഷ്‌ബോർഡ്",
    "dashboard.subtitle": "കാലാവസ്ഥ ഓവർവ്യൂ നിങ്ങളുടെ സേവ് ചെയ്ത ഇൻസൈറ്റുകൾ.",
    "dashboard.liveWeather": "ലൈവ് കാലാവസ്ഥ",
    "chat.placeholder": "കാലാവസ്ഥയെക്കുറിച്ച് ചോദിക്കൂ…",
    "chat.welcome": "കാലാവസ്ഥയെക്കുറിച്ച് ചോദിക്കൂ",
    "common.loading": "ലോഡ് ചെയ്യുന്നു…",
    "common.error": "എന്തോ തെറ്റ് സംഭവിച്ചു",
  },
  
  pa: {
    "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ",
    "nav.newChat": "ਨਵੀਂ ਚੈਟ",
    "nav.savedMessages": "ਸੰਭਾਲੇ ਸੁਨੇਹੇ",
    "nav.darkMode": "ਡਾਰਕ ਮੋਡ",
    "nav.lightMode": "ਲਾਈਟ ਮੋਡ",
    "nav.signOut": "ਸਾਈਨ ਆਊਟ",
    "dashboard.title": "ਡੈਸ਼ਬੋਰਡ",
    "dashboard.subtitle": "ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਅਤੇ ਤੁਹਾਡੀਆਂ ਸੰਭਾਲੀਆਂ ਜਾਣਕਾਰੀਆਂ।",
    "dashboard.liveWeather": "ਲਾਈਵ ਮੌਸਮ",
    "chat.placeholder": "ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ…",
    "chat.welcome": "ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ",
    "common.loading": "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
    "common.error": "ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ",
  },
};

// ─── Translation Function ──────────────────────────────────────────────────

export function t(key: string, lang: Language = "en"): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
}

// ─── Language Hook ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("weather-chat-lang") as Language) || "en";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("weather-chat-lang", language);
  }, [language]);

  const translate = (key: string) => t(key, language);

  return {
    language,
    setLanguage,
    translate,
    languages: LANGUAGES,
  };
}
