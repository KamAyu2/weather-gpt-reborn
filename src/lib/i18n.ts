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

// Language name in English — used by AI to know which language to respond in
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English", hi: "Hindi", ta: "Tamil", bn: "Bengali", te: "Telugu",
  mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
};

// ─── Translations ──────────────────────────────────────────────────────────

const EN: Record<string, string> = {
  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.newChat": "New Chat",
  "nav.compareCities": "Compare Cities",
  "nav.savedMessages": "Saved Messages",
  "nav.darkMode": "Dark Mode",
  "nav.lightMode": "Light Mode",
  "nav.signOut": "Sign Out",
  "nav.chats": "Chats",

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
  "dashboard.myLocation": "My Location",
  "dashboard.clickToLoad": "Click to load live weather",
  "dashboard.realTimeData": "Real-time conditions from Open-Meteo",
  "dashboard.loadingWeather": "Loading weather data...",

  // Chat
  "chat.placeholder": "Ask about the weather…",
  "chat.typing": "Thinking…",
  "chat.welcome": "Ask about the weather",
  "chat.welcomeSubtitle": "Get current conditions, forecasts, and alerts for any location worldwide.",
  "chat.voiceInput": "Voice Input",
  "chat.listening": "Listening…",
  "chat.chat": "Chat",
  "chat.dashboard": "Dashboard",

  // Compare
  "compare.title": "Compare Cities",
  "compare.subtitle": "Side-by-side weather comparison for up to 4 cities.",

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

  // Agriculture
  "agri.title": "Agriculture Advisory",
  "agri.irrigation": "Irrigation Advisory",
  "agri.sowing": "Sowing Advisory",
  "agri.pest": "Pest Alert",
  "agri.harvest": "Harvest Advisory",
  "agri.heatStress": "Heat stress risk for crops — ensure adequate irrigation",
  "agri.frostRisk": "Frost risk for sensitive crops — consider protective measures",
  "agri.delayPesticide": "Delay pesticide/fertilizer application — rain expected",
  "agri.highHumidity": "High humidity — watch for fungal diseases in crops",
  "agri.strongWinds": "Strong winds — avoid spraying operations",
  "agri.goodConditions": "Good conditions for agricultural activities",

  // Disasters
  "disaster.title": "Disaster Alert Status",
  "disaster.flood": "Flood Warning",
  "disaster.cyclone": "Cyclone Alert",
  "disaster.heatwave": "Heatwave Warning",
  "disaster.coldwave": "Cold Wave Alert",
  "disaster.extremeHeat": "Extreme heatwave — avoid outdoor activities",
  "disaster.heatAdvisory": "Heatwave advisory — take precautions",
  "disaster.severeCold": "Severe cold wave — risk of hypothermia",
  "disaster.thunderstorm": "Thunderstorm active — seek shelter",
  "disaster.severeWind": "Severe winds — stay indoors",
  "disaster.allClear": "All clear — no severe weather alerts",

  // Suggestion chips
  "suggestion.weather": "What's the weather in Mumbai?",
  "suggestion.forecast": "7-day forecast for Delhi",
  "suggestion.village": "Weather in my village in Punjab",
  "suggestion.irrigate": "Should I irrigate crops in Pune?",
  "suggestion.cyclone": "Any cyclone alerts for Chennai?",
  "suggestion.joke": "Tell me a joke",
  "suggestion.capital": "What's the capital of France?",
  "suggestion.uv": "UV index in Shimla today",
  "suggestion.chai": "How do I make chai?",
  "suggestion.srinagar": "Weather in Srinagar this week",
  "suggestion.historical": "What was the weather in Delhi last month?",
  "suggestion.nwp": "GFS forecast for Mumbai",
  "suggestion.climate": "Climate trend in Chennai last year",

  // Mobile nav
  "mobile.home": "Home",
  "mobile.compare": "Compare",
  "mobile.saved": "Saved",

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
  "common.refresh": "Refresh",
  "common.saved": "Saved Messages",
  "common.noSavedMessages": "No saved messages yet.",
  "common.starToSave": "Star any weather response in a conversation to save it here.",
  "common.compareHint": "Side-by-side weather comparison for up to 4 cities.",
  "common.weatherByOpenMeteo": "Weather data by Open-Meteo · Not for aviation or safety-critical use",
  "common.removeFromSaved": "Remove from saved",
  "common.saveThisMessage": "Save this message",

  // Auth page
  "auth.welcome": "Welcome to Weather GPT",
  "auth.enterEmail": "Enter your email to get started, or continue as a guest",
  "auth.sendCode": "Send verification code",
  "auth.continueAsGuest": "Continue as Guest",
  "auth.or": "or",
  "auth.checkEmail": "Check your email",
  "auth.codeSentTo": "We've sent a 6-digit code to",
  "auth.didntReceive": "Didn't receive a code?",
  "auth.verifyContinue": "Verify & continue",
  "auth.useDifferentEmail": "Use different email",
  "auth.weatherBy": "Weather data by",
  "auth.builtBy": "Built by",

  // Landing page
  "landing.aiBadge": "AI-Powered Weather",
  "landing.headline": "Weather intelligence your team can act on.",
  "landing.subheadline": "Ask any weather question in plain language. Get real-time conditions, forecasts, agriculture advisories, and disaster alerts.",
  "landing.startButton": "Start using Weather GPT",
  "landing.noCreditCard": "No credit card required",
  "landing.whyTitle": "Built for teams that need answers",
  "landing.whySubtitle": "From daily operations to long-range planning — get precise weather data when and where you need it.",
  "landing.readyTitle": "Ready to get started?",
  "landing.readySubtitle": "Ask about any location and receive instant, accurate weather data.",
  "landing.openWeatherGPT": "Open Weather GPT",
  "landing.dataBy": "Weather data by Open-Meteo",
  "landing.madeBy": "Made with ❤️ by Team Craxzy",
  "landing.feature1Title": "Real-Time Conditions",
  "landing.feature1Desc": "Current temperature, humidity, wind speed, UV index, and atmospheric pressure — updated continuously from global weather stations.",
  "landing.feature2Title": "7-Day Forecasts",
  "landing.feature2Desc": "Daily breakdowns with precipitation probability, temperature ranges, and wind forecasts to plan with confidence.",
  "landing.feature3Title": "Agriculture Advisory",
  "landing.feature3Desc": "Crop-specific weather advice for farmers — irrigation timing, sowing conditions, pest alerts, and harvest windows.",
  "landing.feature4Title": "Disaster Alerts",
  "landing.feature4Desc": "Real-time severe weather monitoring — cyclones, floods, heatwaves, cold waves, and thunderstorm warnings.",
  "landing.feature5Title": "Voice Input",
  "landing.feature5Desc": "Speak your weather query naturally. Designed for rural accessibility where typing may be difficult.",
  "landing.feature6Title": "10 Indian Languages",
  "landing.feature6Desc": "Full multilingual support — English, Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, Kannada, Malayalam, and Punjabi.",
  "landing.feature7Title": "AI-Powered Chat",
  "landing.feature7Desc": "Ask anything — weather questions, general knowledge, or just chat. Our AI handles all conversations naturally.",
  "landing.feature8Title": "Global Coverage",
  "landing.feature8Desc": "Meteorological data for every region on Earth. From local conditions to international forecasts.",

  // Weather card
  "weather.clearSky": "Clear sky",
  "weather.mainlyClear": "Mainly clear",
  "weather.partlyCloudy": "Partly cloudy",
  "weather.overcast": "Overcast",
  "weather.foggy": "Foggy",
  "weather.lightDrizzle": "Light drizzle",
  "weather.moderateRain": "Moderate rain",
  "weather.heavyRain": "Heavy rain",
  "weather.slightSnow": "Slight snow",
  "weather.moderateSnow": "Moderate snow",
  "weather.heavySnow": "Heavy snow",
  "weather.rainShowers": "Rain showers",
  "weather.thunderstorm": "Thunderstorm",
  "weather.severeThunderstorm": "Severe thunderstorm",
  "weather.todayLabel": "Today",
  "weather.tmrwLabel": "Tmrw",
  "weather.highLabel": "High",
  "weather.lowLabel": "Low",
  "weather.rainChanceLabel": "rain",
  "weather.sunriseLabel": "Sunrise",
  "weather.sunsetLabel": "Sunset",
  "weather.notForAviation": "Data from Open-Meteo · Not for aviation or safety-critical use",
  "weather.heatAdvisory": "Heat advisory: Extremely high temperature. Stay hydrated and avoid prolonged outdoor exposure.",
  "weather.coldAdvisory": "Cold advisory: Freezing conditions. Take precautions against frostbite and hypothermia.",
  "weather.windAdvisory": "Wind advisory: Strong winds detected. Secure loose objects and avoid outdoor activities.",
  "weather.uvAlert": "UV alert: Very high UV exposure. Use SPF 30+ sunscreen and wear protective clothing.",
  "weather.stormAlert": "Severe weather alert: Thunderstorm activity in the area. Seek shelter indoors immediately.",

  // Chat input
  "chat.disclaimer": "Weather data by Open-Meteo · Not for aviation or safety-critical use",

  // Dashboard sections
  "dashboard.severeWeather": "Severe Weather Monitor",
  "dashboard.compareCities": "Compare Cities",
  "dashboard.addCities": "Add cities to compare their weather side by side",
  "dashboard.tryCities": "Try Mumbai vs Delhi or any cities you like",
  "dashboard.addCity": "Add a city...",

  // Chat messages
  "chat.saveMessage": "Save this message",
  "chat.removeFromSaved": "Remove from saved",

  // Voice input
  "voice.startListening": "Start voice input",
  "voice.stopListening": "Stop listening",
};

const HI: Record<string, string> = {
  "nav.dashboard": "डैशबोर्ड",
  "nav.newChat": "नई चैट",
  "nav.compareCities": "शहरों की तुलना",
  "nav.savedMessages": "सहेजे गए संदेश",
  "nav.darkMode": "डार्क मोड",
  "nav.lightMode": "लाइट मोड",
  "nav.signOut": "साइन आउट",
  "nav.chats": "चैट",
  "dashboard.title": "डैशबोर्ड",
  "dashboard.subtitle": "मौसम अवलोकन और आपकी सहेजी गई जानकारी।",
  "dashboard.liveWeather": "लाइव मौसम",
  "dashboard.askQuestion": "प्रश्न पूछें",
  "dashboard.conversations": "वार्ताएँ",
  "dashboard.savedMessages": "सहेजे गए संदेश",
  "dashboard.locationsQueried": "खोजे गए स्थान",
  "dashboard.dataPoints": "डेटा पॉइंट्स",
  "dashboard.recentConversations": "हाल की वार्ताएँ",
  "dashboard.noSavedMessages": "अभी तक कोई सहेजा गया संदेश नहीं।",
  "dashboard.myLocation": "मेरा स्थान",
  "dashboard.clickToLoad": "लाइव मौसम लोड करने के लिए क्लिक करें",
  "dashboard.realTimeData": "Open-Meteo से रीयल-टाइम डेटा",
  "dashboard.loadingWeather": "मौसम डेटा लोड हो रहा है...",
  "chat.placeholder": "मौसम के बारे में पूछें…",
  "chat.typing": "सोच रहा है…",
  "chat.welcome": "मौसम के बारे में पूछें",
  "chat.welcomeSubtitle": "किसी भी स्थान के लिए वर्तमान स्थितियाँ, पूर्वानुमान और अलर्ट प्राप्त करें।",
  "chat.voiceInput": "वॉयस इनपुट",
  "chat.listening": "सुन रहा है…",
  "chat.chat": "चैट",
  "chat.dashboard": "डैशबोर्ड",
  "compare.title": "शहरों की तुलना",
  "compare.subtitle": "4 शहरों के लिए साइड-बाय-साइड मौसम तुलना।",
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
  "agri.title": "कृषि सलाह",
  "agri.heatStress": "फसलों में गर्मी तनाव का खतरा — पर्याप्त सिंचाई सुनिश्चित करें",
  "agri.frostRisk": "संवेदनशील फसलों में पाले का खतरा — सुरक्षात्मक उपाय करें",
  "agri.delayPesticide": "कीटनाशक/उर्वरक का प्रयोग स्थगित करें — बारिश की संभावना",
  "agri.highHumidity": "अधिक आर्द्रता — फसलों में कवक रोगों पर नजर रखें",
  "agri.strongWinds": "तेज हवाएं — छिड़काव अभियानों से बचें",
  "agri.goodConditions": "कृषि गतिविधियों के लिए अच्छी स्थितियां",
  "disaster.title": "आपदा अलर्ट",
  "disaster.extremeHeat": "अत्यधिक गर्मी की लहर — बाहरी गतिविधियों से बचें",
  "disaster.heatAdvisory": "गर्मी की लहर सलाह — सावधानी बरतें",
  "disaster.severeCold": "गंभीर शीत लहर — शरीर में पानी की कमी का खतरा",
  "disaster.thunderstorm": "बिजली कड़कना जारी — आश्रय लें",
  "disaster.severeWind": "तेज हवाएं — घर के अंदर रहें",
  "disaster.allClear": "सब साफ — कोई गंभीर मौसम अलर्ट नहीं",
  "suggestion.weather": "मुंबई में मौसम कैसा है?",
  "suggestion.forecast": "दिल्ली का 7-दिन का पूर्वानुमान",
  "suggestion.village": "पंजाब में मेरे गांव का मौसम",
  "suggestion.irrigate": "पुणे में फसलों की सिंचाई करनी चाहिए?",
  "suggestion.cyclone": "चेन्नई में चक्रवात अलर्ट?",
  "suggestion.joke": "मुझे एक चुटकुला सुनाओ",
  "suggestion.capital": "फ्रांस की राजधानी क्या है?",
  "suggestion.uv": "आज शिमला में UV इंडेक्स",
  "suggestion.chai": "चाय कैसे बनाएं?",
  "suggestion.srinagar": "इस हफ्ते श्रीनगर का मौसम",
  "mobile.home": "होम",
  "mobile.compare": "तुलना",
  "mobile.saved": "सहेजा",
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
  "common.refresh": "रिफ्रेश",
  "common.saved": "सहेजे गए संदेश",
  "common.noSavedMessages": "अभी तक कोई सहेजा गया संदेश नहीं।",
  "common.starToSave": "इसे यहाँ सहेजने के लिए किसी भी मौसम प्रतिक्रिया पर स्टार करें।",
  "common.compareHint": "4 शहरों के लिए साइड-बाय-साइड मौसम तुलना।",
  "common.weatherByOpenMeteo": "मौसम डेटा Open-Meteo द्वारा · विमानन या सुरक्षा-महत्वपूर्ण उपयोग के लिए नहीं",
  "common.removeFromSaved": "सहेजे गए से हटाएं",
  "common.saveThisMessage": "यह संदेश सहेजें",
};

const TA: Record<string, string> = {
  "nav.dashboard": "டாஷ்போர்டு", "nav.newChat": "புதிய அரட்டை", "nav.compareCities": "நகரங்களை ஒப்பிடு", "nav.savedMessages": "சேமிக்கப்பட்ட செய்திகள்", "nav.darkMode": "இருண்ட பயன்முறை", "nav.lightMode": "ஒளி பயன்முறை", "nav.signOut": "வெளியேறு", "nav.chats": "அரட்டை", "dashboard.title": "டாஷ்போர்டு", "dashboard.subtitle": "வானிலை மேலோட்டம் மற்றும் உங்கள் சேமிக்கப்பட்ட நுண்ணறிவுகள்.", "dashboard.liveWeather": "நேரடி வானிலை", "dashboard.askQuestion": "ஒரு கேள்வி கேளுங்கள்", "dashboard.myLocation": "என் இடம்", "dashboard.clickToLoad": "நேரடி வானிலை ஏற்ற கிளிக் செய்யுங்கள்", "dashboard.loadingWeather": "வானிலை தரவு ஏற்றப்படுகிறது...", "chat.placeholder": "வானிலை பற்றி கேளுங்கள்…", "chat.typing": "யோசிக்கிறது…", "chat.welcome": "வானிலை பற்றி கேளுங்கள்", "chat.welcomeSubtitle": "உலகின் எந்த இடத்திற்கும் நிகழ்கால நிலைமைகள், முன்னறிவிப்புகள் மற்றும் எச்சரிக்கைகளைப் பெறுங்கள்.", "chat.chat": "அரட்டை", "chat.dashboard": "டாஷ்போர்டு", "compare.title": "நகரங்களை ஒப்பிடு", "compare.subtitle": "4 நகரங்களுக்கு ஒப்பீட்டு வானிலை.", "weather.current": "இப்போது", "weather.temperature": "வெப்பநிலை", "weather.feelsLike": "உணர்வு", "weather.humidity": "ஈரப்பதம்", "weather.wind": "காற்று", "agri.title": "வேளாண் ஆலோசனை", "agri.heatStress": "பயிர்களுக்கு வெப்ப அழுத்த அபாயம்", "disaster.title": "பேரிடர் எச்சரிக்கை", "disaster.allClear": "அனைத்தும் தெளிவு — கடுமையான வானிலை எச்சரிக்கை இல்லை", "suggestion.weather": "சென்னையில் வானிலை எப்படி இருக்கிறது?", "suggestion.forecast": "டெல்லியில் 7 நாள் முன்னறிவிப்பு", "suggestion.joke": "ஒரு நகைச்சுவை சொல்லுங்கள்", "suggestion.capital": "பிரான்ஸின் தலைநகரம் என்ன?", "mobile.home": "முகப்பு", "mobile.compare": "ஒப்பிடு", "mobile.saved": "சேமி", "common.loading": "ஏற்றுகிறது…", "common.error": "ஏதோ தவறு நடந்தது", "common.retry": "மீண்டும் முயற்சிக்கவும்", "common.save": "சேமி", "common.cancel": "ரத்துசெய்", "common.delete": "நீக்கு", "common.close": "மூடு", "common.refresh": "புதுப்பி", "common.saved": "சேமிக்கப்பட்ட செய்திகள்", "common.noSavedMessages": "இன்னும் சேமிக்கப்பட்ட செய்திகள் இல்லை.", "common.starToSave": "இதை இங்கே சேமிக்க எந்த வானிலை பதிலையும் நட்சத்திரமிடுங்கள்.", "common.weatherByOpenMeteo": "வானிலை தரவு Open-Meteo மூலம்", "common.removeFromSaved": "சேமிப்பிலிருந்து நீக்கு", "common.saveThisMessage": "இந்த செய்தியை சேமி",
};

const BN: Record<string, string> = {
  "nav.dashboard": "ড্যাশবোর্ড", "nav.newChat": "নতুন চ্যাট", "nav.compareCities": "শহরের তুলনা", "nav.savedMessages": "সংরক্ষিত বার্তা", "nav.darkMode": "ডার্ক মোড", "nav.lightMode": "লাইট মোড", "nav.signOut": "সাইন আউট", "nav.chats": "চ্যাট", "dashboard.title": "ড্যাশবোর্ড", "dashboard.subtitle": "আবহাওয়া ওভারভিউ এবং আপনার সংরক্ষিত অন্তর্দৃষ্টি।", "dashboard.liveWeather": "লাইভ আবহাওয়া", "dashboard.askQuestion": "একটি প্রশ্ন জিজ্ঞাসা করুন", "dashboard.myLocation": "আমার অবস্থান", "dashboard.loadingWeather": "আবহাওয়ার তথ্য লোড হচ্ছে...", "chat.placeholder": "আবহাওয়া সম্পর্কে জিজ্ঞাসা করুন…", "chat.welcome": "আবহাওয়া সম্পর্কে জিজ্ঞাসা করুন", "chat.welcomeSubtitle": "যেকোনো স্থানের জন্য বর্তমান অবস্থা, পূর্বাভাস এবং সতর্কতা পান।", "chat.chat": "চ্যাট", "chat.dashboard": "ড্যাশবোর্ড", "compare.title": "শহরের তুলনা", "compare.subtitle": "৪টি শহরের জন্য পাশাপাশি আবহাওয়া তুলনা।", "weather.current": "এখন", "weather.temperature": "তাপমাত্রা", "weather.humidity": "আর্দ্রতা", "weather.wind": "বাতাস", "agri.title": "কৃষি পরামর্শ", "disaster.title": "বিপদ সতর্কতা", "disaster.allClear": "সব পরিষ্কার — কোনো তীব্র আবহাওয়া সতর্কতা নেই", "suggestion.weather": "মুম্বাইয়ে আবহাওয়া কেমন?", "suggestion.forecast": "দিল্লির ৭-দিনের পূর্বাভাস", "suggestion.joke": "আমাকে একটি রসিকতা বলুন", "suggestion.capital": "ফ্রান্সের রাজধানী কী?", "mobile.home": "হোম", "mobile.compare": "তুলনা", "mobile.saved": "সংরক্ষিত", "common.loading": "লোড হচ্ছে…", "common.error": "কিছু ভুল হয়েছে", "common.retry": "আবার চেষ্টা করুন", "common.save": "সংরক্ষণ করুন", "common.cancel": "বাতিল করুন", "common.delete": "মুছুন", "common.close": "বন্ধ করুন", "common.refresh": "রিফ্রেশ", "common.saved": "সংরক্ষিত বার্তা", "common.noSavedMessages": "এখনো কোনো সংরক্ষিত বার্তা নেই.", "common.starToSave": "এটি এখানে সংরক্ষণ করতে যেকোনো আবহাওয়া উত্তরে তারা দিন.", "common.weatherByOpenMeteo": "আবহাওয়া তথ্য Open-Meteo থেকে", "common.removeFromSaved": "সংরক্ষণ থেকে মুছুন", "common.saveThisMessage": "এই বার্তা সংরক্ষণ করুন",
};

const TE: Record<string, string> = {
  "nav.dashboard": "డాష్‌బోర్డ్", "nav.newChat": "కొత్త చాట్", "nav.compareCities": "నగరాలను పోల్చండి", "nav.savedMessages": "సేవ్ చేసిన సందేశాలు", "nav.darkMode": "డార్క్ మోడ్", "nav.lightMode": "లైట్ మోడ్", "nav.signOut": "సైన్ అవుట్", "nav.chats": "చాట్‌లు", "dashboard.title": "డాష్‌బోర్డ్", "dashboard.subtitle": "వాతావరణ అవలోకనం మరియు మీ సేవ్ చేసిన అంతర్దృష్టులు.", "dashboard.liveWeather": "లైవ్ వాతావరణం", "dashboard.askQuestion": "ప్రశ్న అడగండి", "dashboard.myLocation": "నా ప్రదేశం", "dashboard.loadingWeather": "వాతావరణ డేటా లోడ్ అవుతోంది...", "chat.placeholder": "వాతావరణం గురించి అడగండి…", "chat.welcome": "వాతావరణం గురించి అడగండి", "chat.welcomeSubtitle": "ప్రపంచంలో ఏ ప్రదేశానికైనా ప్రస్తుత పరిస్థితులు, ముందస్తు అంచనాలు మరియు హెచ్చరికలు పొందండి.", "chat.chat": "చాట్", "chat.dashboard": "డాష్‌బోర్డ్", "compare.title": "నగరాలను పోల్చండి", "compare.subtitle": "4 నగరాల కోసం పక్కపక్కన వాతావరణ పోలిక.", "weather.current": "ఇప్పుడు", "weather.temperature": "ఉష్ణోగ్రత", "weather.humidity": "తేమ", "weather.wind": "గాలి", "agri.title": "వ్యవసాయ సలహా", "disaster.title": "విపత్తు హెచ్చరిక", "disaster.allClear": "అన్నీ స్పష్టం — తీవ్రమైన వాతావరణ హెచ్చరికలు లేవు", "suggestion.weather": "హైదరాబాద్‌లో వాతావరణం ఎలా ఉంది?", "suggestion.forecast": "�ిల్లీ 7-రోజుల ముందస్తు అంచనా", "suggestion.joke": "నాకు ఒక జోక్ చెప్పండి", "suggestion.capital": "ఫ్రాన్స్ రాజధాని ఏమిటి?", "mobile.home": "హోమ్", "mobile.compare": "పోల్చండి", "mobile.saved": "సేవ్ చేశాం", "common.loading": "లోడ్ అవుతోంది…", "common.error": "ఏదో తప్పు జరిగింది", "common.retry": "మళ్ళీ ప్రయత్నించండి", "common.save": "సేవ్ చేయండి", "common.cancel": "రద్దు", "common.delete": "తొలగించు", "common.close": "మూసివేయి", "common.refresh": "రిఫ్రెష్", "common.saved": "సేవ్ చేసిన సందేశాలు", "common.noSavedMessages": "ఇంకా సేవ్ చేసిన సందేశాలు లేవు.", "common.starToSave": "దీన్ని ఇక్కడ సేవ్ చేయడానికి ఏదైనా వాతావరణ ప్రతిస్పందనను స్టార్ చేయండి.", "common.weatherByOpenMeteo": "వాతావరణ డేటా Open-Meteo నుండి", "common.removeFromSaved": "సేవ్ నుండి తీసివేయి", "common.saveThisMessage": "ఈ సందేశాన్ని సేవ్ చేయండి",
};

const MR: Record<string, string> = {
  "nav.dashboard": "डॅशबोर्ड", "nav.newChat": "नवीन चॅट", "nav.compareCities": "शहरांची तुलना", "nav.savedMessages": "सेव्ह केलेले संदेश", "nav.darkMode": "डार्क मोड", "nav.lightMode": "लाइट मोड", "nav.signOut": "साइन आउट", "nav.chats": "चॅट", "dashboard.title": "डॅशबोर्ड", "dashboard.subtitle": "हवामान अवलोकन आणि तुमचे सेव्ह केलेले अंतर्दृष्टी.", "dashboard.liveWeather": "लाइव्ह हवामान", "dashboard.askQuestion": "प्रश्न विचारा", "dashboard.myLocation": "माझे स्थान", "dashboard.loadingWeather": "हवामान डेटा लोड होत आहे...", "chat.placeholder": "हवामानाबद्दल विचारा…", "chat.welcome": "हवामानाबद्दल विचारा", "chat.welcomeSubtitle": "कोणत्याही स्थानासाठी सध्याच्या स्थिती, अंदाज आणि सूचना मिळवा.", "chat.chat": "चॅट", "chat.dashboard": "डॅशबोर्ड", "compare.title": "शहरांची तुलना", "compare.subtitle": "4 शहरांसाठी शहर-शहर हवामान तुलना.", "weather.current": "आता", "weather.temperature": "तापमान", "weather.humidity": "दमटपणा", "weather.wind": "वारा", "agri.title": "शेती सल्ला", "disaster.title": "आपत्ती सूचना", "disaster.allClear": "सगळं स्पष्ट — कोणतीही गंभीर हवामान सूचना नाही", "suggestion.weather": "पुण्यात हवामान कसं आहे?", "suggestion.forecast": "दिल्लीत 7-दिवसांचा अंदाज", "suggestion.joke": "मला एक विनोद सांगा", "suggestion.capital": "फ्रान्सची राजधानी काय आहे?", "mobile.home": "होम", "mobile.compare": "तुलना", "mobile.saved": "सेव्ह", "common.loading": "लोड होत आहे…", "common.error": "काहीतरी चूक झाली", "common.retry": "पुन्हा प्रयत्न करा", "common.save": "सेव्ह", "common.cancel": "रद्द", "common.delete": "हटवा", "common.close": "बंद", "common.refresh": "रिफ्रेश", "common.saved": "सेव्ह केलेले संदेश", "common.noSavedMessages": "अजून कोणतेही सेव्ह केलेले संदेश नाहीत.", "common.starToSave": "येथे सेव्ह करण्यासाठी कोणत्याही हवामान प्रतिसादावर स्टार करा.", "common.weatherByOpenMeteo": "हवामान डेटा Open-Meteo द्वारे", "common.removeFromSaved": "सेव्ह केलेल्यातून काढा", "common.saveThisMessage": "हा संदेश सेव्ह करा",
};

const GU: Record<string, string> = {
  "nav.dashboard": "ડેશબોર્ડ", "nav.newChat": "નવી ચેટ", "nav.compareCities": "શહેરોની તુલના", "nav.savedMessages": "સાચવેલા સંદેશા", "nav.darkMode": "ડાર્ક મોડ", "nav.lightMode": "લાઈટ મોડ", "nav.signOut": "સાઈન આઉટ", "nav.chats": "ચેટ", "dashboard.title": "ડેશબોર્ડ", "dashboard.subtitle": "હવામાન ઓવરવ્યૂ અને તમારી સાચવેલી ઈન્સાઈટ્સ.", "dashboard.liveWeather": "લાઈવ હવામાન", "dashboard.askQuestion": "પ્રશ્ન પૂછો", "dashboard.myLocation": "મારું સ્થાન", "dashboard.loadingWeather": "હવામાન ડેટા લોડ થઈ રહ્યું છે...", "chat.placeholder": "હવામાન વિશે પૂછો…", "chat.welcome": "હવામાન વિશે પૂછો", "chat.welcomeSubtitle": "કોઈ પણ સ્થાન માટે વર્તમાન સ્થિતિ, આગાહી અને ચેતવણીઓ મેળવો.", "chat.chat": "ચેટ", "chat.dashboard": "ડેશબોર્ડ", "compare.title": "શહેરોની તુલના", "compare.subtitle": "4 શહેરો માટે સાઈડ-બાય-સાઈડ હવામાન તુલના.", "weather.current": "હમણાં", "weather.temperature": "તાપમાન", "weather.humidity": "ભેજ", "weather.wind": "પવન", "agri.title": "કૃષિ સલાહ", "disaster.title": "આફત ચેતવણી", "disaster.allClear": "બધું સ્પષ્ટ — કોઈ ગંભીર હવામાન ચેતવણી નથી", "suggestion.weather": "અમદાવાદમાં હવામાન કેવું છે?", "suggestion.forecast": "દિલ્હી 7-દિવસની આગાહી", "suggestion.joke": "મને એક જોક સંભળાવો", "suggestion.capital": "ફ્રાન્સની રાજધાની શું છે?", "mobile.home": "હોમ", "mobile.compare": "તુલના", "mobile.saved": "સાચવ્યું", "common.loading": "લોડ થઈ રહ્યું છે…", "common.error": "કંઈક ખોટું થયું", "common.retry": "ફરી પ્રયાસ કરો", "common.save": "સાચવો", "common.cancel": "રદ કરો", "common.delete": "કાઢી નાખો", "common.close": "બંધ કરો", "common.refresh": "રિફ્રેશ", "common.saved": "સાચવેલા સંદેશા", "common.noSavedMessages": "હજુ કોઈ સાચવેલા સંદેશા નથી.", "common.starToSave": "અહીં સાચવવા માટે કોઈ પણ હવામાન જવાબને સ્ટાર કરો.", "common.weatherByOpenMeteo": "હવામાન ડેટા Open-Meteo દ્વારા", "common.removeFromSaved": "સાચવેલામાંથી દૂર કરો", "common.saveThisMessage": "આ સંદેશ સાચવો",
};

const KN: Record<string, string> = {
  "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "nav.newChat": "ಹೊಸ ಚಾಟ್", "nav.compareCities": "ನಗರಗಳನ್ನು ಹೋಲಿಸಿ", "nav.savedMessages": "ಉಳಿಸಿದ ಸಂದೇಶಗಳು", "nav.darkMode": "ಡಾರ್ಕ್ ಮೋಡ್", "nav.lightMode": "ಲೈಟ್ ಮೋಡ್", "nav.signOut": "ಸೈನ್ ಔಟ್", "nav.chats": "ಚಾಟ್‌ಗಳು", "dashboard.title": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "dashboard.subtitle": "ಹವಾಮಾನ ಅವಲೋಕನ ಮತ್ತು ನಿಮ್ಮ ಉಳಿಸಿದ ಒಳನೋಟಗಳು.", "dashboard.liveWeather": "ಲೈವ್ ಹವಾಮಾನ", "dashboard.askQuestion": "ಪ್ರಶ್ನೆ ಕೇಳಿ", "dashboard.myLocation": "ನನ್ನ ಸ್ಥಳ", "dashboard.loadingWeather": "ಹವಾಮಾನ ಡೇಟಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ...", "chat.placeholder": "ಹವಾಮಾನದ ಬಗ್ಗೆ ಕೇಳಿ…", "chat.welcome": "ಹವಾಮಾನದ ಬಗ್ಗೆ ಕೇಳಿ", "chat.welcomeSubtitle": "ಯಾವುದೇ ಸ್ಥಳಕ್ಕೆ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ, ಮುನ್ಸೂಚನೆ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಿರಿ.", "chat.chat": "ಚಾಟ್", "chat.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "compare.title": "ನಗರಗಳನ್ನು ಹೋಲಿಸಿ", "compare.subtitle": "4 ನಗರಗಳಿಗೆ ಹೋಲಿಕೆ ಹವಾಮಾನ.", "weather.current": "ಈಗ", "weather.temperature": "ತಾಪಮಾನ", "weather.humidity": "ತೇವ", "weather.wind": "ಗಾಳಿ", "agri.title": "ಕೃಷಿ ಸಲಹೆ", "disaster.title": "ಅಪಾಯ ಎಚ್ಚರಿಕೆ", "disaster.allClear": "ಎಲ್ಲಾ ಸ್ಪಷ್ಟ — ಯಾವುದೇ ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ", "suggestion.weather": "ಬೆಂಗಳೂರಲ್ಲಿ ಹವಾಮಾನ ಹೇಗಿದೆ?", "suggestion.forecast": "ದೆಹಲಿ 7-ದಿನ ಮುನ್ಸೂಚನೆ", "suggestion.joke": "ನನಗೆ ಒಂದು ಜೋಕ್ ಹೇಳಿ", "suggestion.capital": "ಫ್ರಾನ್ಸ್ ರಾಜಧಾನಿ ಯಾವುದು?", "mobile.home": "ಹೋಮ್", "mobile.compare": "ಹೋಲಿಸಿ", "mobile.saved": "ಉಳಿಸಿದ", "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ…", "common.error": "ಏನೋ ತಪ್ಪಾಗಿದೆ", "common.retry": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", "common.save": "ಉಳಿಸಿ", "common.cancel": "ರದ್ದು", "common.delete": "ಅಳಿಸಿ", "common.close": "ಮುಚ್ಚಿ", "common.refresh": "ರಿಫ್ರೆಶ್", "common.saved": "ಉಳಿಸಿದ ಸಂದೇಶಗಳು", "common.noSavedMessages": "ಇನ್ನೂ ಉಳಿಸಿದ ಸಂದೇಶಗಳಿಲ್ಲ.", "common.starToSave": "ಇದನ್ನು ಇಲ್ಲಿ ಉಳಿಸಲು ಯಾವುದೇ ಹವಾಮಾನ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸ್ಟಾರ್ ಮಾಡಿ.", "common.weatherByOpenMeteo": "ಹವಾಮಾನ ಡೇಟಾ Open-Meteo ನಿಂದ", "common.removeFromSaved": "ಉಳಿಸಿದಿಂದ ತೆಗೆದುಹಾಕಿ", "common.saveThisMessage": "ಈ ಸಂದೇಶವನ್ನು ಉಳಿಸಿ",
};

const ML: Record<string, string> = {
  "nav.dashboard": "ഡാഷ്‌ബോർഡ്", "nav.newChat": "പുതിയ ചാറ്റ്", "nav.compareCities": "നഗരങ്ങളെ താരതമ്യം ചെയ്യുക", "nav.savedMessages": "സേവ് ചെയ്ത സന്ദേശങ്ങൾ", "nav.darkMode": "ഡാർക്ക് മോഡ്", "nav.lightMode": "ലൈറ്റ് മോഡ്", "nav.signOut": "സൈൻ ഔട്ട്", "nav.chats": "ചാറ്റുകൾ", "dashboard.title": "ഡാഷ്‌ബോർഡ്", "dashboard.subtitle": "കാലാവസ്ഥ ഓവർവ്യൂ നിങ്ങളുടെ സേവ് ചെയ്ത ഇൻസൈറ്റുകൾ.", "dashboard.liveWeather": "ലൈവ് കാലാവസ്ഥ", "dashboard.askQuestion": "ഒരു ചോദ്യം ചോദിക്കൂ", "dashboard.myLocation": "എന്റെ സ്ഥലം", "dashboard.loadingWeather": "കാലാവസ്ഥ ഡേറ്റ ലോഡ് ചെയ്യുന്നു...", "chat.placeholder": "കാലാവസ്ഥയെക്കുറിച്ച് ചോദിക്കൂ…", "chat.welcome": "കാലാവസ്ഥയെക്കുറിച്ച് ചോദിക്കൂ", "chat.welcomeSubtitle": "ലോകത്തെ ഏതൊരു സ്ഥലത്തെയും നിലവിലെ അവസ്ഥ, പ്രവചനം, മുന്നറിയിപ്പുകൾ നേടുക.", "chat.chat": "ചാറ്റ്", "chat.dashboard": "ഡാഷ്‌ബോർഡ്", "compare.title": "നഗരങ്ങളെ താരതമ്യം ചെയ്യുക", "compare.subtitle": "4 നഗരങ്ങൾക്ക് താരതമ്യ കാലാവസ്ഥ.", "weather.current": "ഇപ്പോൾ", "weather.temperature": "താപനില", "weather.humidity": "ആർദ്രത", "weather.wind": "കാറ്റ്", "agri.title": "കൃഷി ഉപദേശം", "disaster.title": "ദുരന്ത മുന്നറിയിപ്പ്", "disaster.allClear": "എല്ലാം വ്യക്തം — ഗുരുതരമായ കാലാവസ്ഥ മുന്നറിയിപ്പുകൾ ഇല്ല", "suggestion.weather": "കൊച്ചിയിൽ കാലാവസ്ഥ എങ്ങനെയുണ്ട്?", "suggestion.forecast": "ഡൽഹി 7 ദിവസ പ്രവചനം", "suggestion.joke": "എനിക്ക് ഒരു തമാശ പറയൂ", "suggestion.capital": "ഫ്രാൻസിന്റെ തലസ്ഥാനം എന്താണ്?", "mobile.home": "ഹോം", "mobile.compare": "താരതമ്യം", "mobile.saved": "സേവ് ചെയ്തു", "common.loading": "ലോഡ് ചെയ്യുന്നു…", "common.error": "എന്തോ തെറ്റ് സംഭവിച്ചു", "common.retry": "വീണ്ടും ശ്രമിക്കൂ", "common.save": "സേവ്", "common.cancel": "റദ്ദാക്കുക", "common.delete": "ഇല്ലാതാക്കുക", "common.close": "അടയ്ക്കുക", "common.refresh": "റീഫ്രഷ്", "common.saved": "സേവ് ചെയ്ത സന്ദേശങ്ങൾ", "common.noSavedMessages": "ഇതുവരെ സേവ് ചെയ്ത സന്ദേശങ്ങൾ ഇല്ല.", "common.starToSave": "ഇതിങ്ങെ സേവ് ചെയ്യാൻ ഏതെങ്കിലും കാലാവസ്ഥ പ്രതികരണത്തെ സ്റ്റാർ ചെയ്യുക.", "common.weatherByOpenMeteo": "കാലാവസ്ഥ ഡേറ്റ Open-Meteo മൂലം", "common.removeFromSaved": "സേവ് ചെയ്തതിൽ നിന്ന് നീക്കം ചെയ്യുക", "common.saveThisMessage": "ഈ സന്ദേശം സേവ് ചെയ്യുക",
};

const PA: Record<string, string> = {
  "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ", "nav.newChat": "ਨਵੀਂ ਚੈਟ", "nav.compareCities": "ਸ਼ਹਿਰਾਂ ਦੀ ਤੁਲਨਾ", "nav.savedMessages": "ਸੰਭਾਲੇ ਸੁਨੇਹੇ", "nav.darkMode": "ਡਾਰਕ ਮੋਡ", "nav.lightMode": "ਲਾਈਟ ਮੋਡ", "nav.signOut": "ਸਾਈਨ ਆਊਟ", "nav.chats": "ਚੈਟਾਂ", "dashboard.title": "ਡੈਸ਼ਬੋਰਡ", "dashboard.subtitle": "ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਅਤੇ ਤੁਹਾਡੀਆਂ ਸੰਭਾਲੀਆਂ ਜਾਣਕਾਰੀਆਂ।", "dashboard.liveWeather": "ਲਾਈਵ ਮੌਸਮ", "dashboard.askQuestion": "ਸਵਾਲ ਪੁੱਛੋ", "dashboard.myLocation": "ਮੇਰੀ ਥਾਂ", "dashboard.loadingWeather": "ਮੌਸਮ ਡੇਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", "chat.placeholder": "ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ…", "chat.welcome": "ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ", "chat.welcomeSubtitle": "ਕਿਸੇ ਵੀ ਥਾਂ ਦੀ ਮੌਜੂਦਾ ਹਾਲਤ, ਪੂਰਵ-ਅਨੁਮਾਨ ਅਤੇ ਸਾਵਧਾਨੀਆਂ ਪ੍ਰਾਪਤ ਕਰੋ।", "chat.chat": "ਚੈਟ", "chat.dashboard": "ਡੈਸ਼ਬੋਰਡ", "compare.title": "ਸ਼ਹਿਰਾਂ ਦੀ ਤੁਲਨਾ", "compare.subtitle": "4 ਸ਼ਹਿਰਾਂ ਲਈ ਮੁਕਾਬਲਤਨ ਮੌਸਮ।", "weather.current": "ਹੁਣ", "weather.temperature": "ਤਾਪਮਾਨ", "weather.humidity": "ਨਮੀ", "weather.wind": "ਹਵਾ", "agri.title": "ਖੇਤੀ ਸਲਾਹ", "disaster.title": "ਆਫ਼ਤ ਚੇਤਾਵਨੀ", "disaster.allClear": "ਸਭ ਕੁਝ ਸਾਫ਼ — ਕੋਈ ਗੰਭੀਰ ਮੌਸਮ ਚੇਤਾਵਨੀ ਨਹੀਂ", "suggestion.weather": "ਜਲੰਧਰ ਵਿੱਚ ਮੌਸਮ ਕਿਹੋ ਜਿਹਾ ਹੈ?", "suggestion.forecast": "ਦਿੱਲੀ 7-ਦਿਨ ਦਾ ਪੂਰਵ-ਅਨੁਮਾਨ", "suggestion.joke": "ਮੈਨੂੰ ਇੱਕ ਮਜ਼ਾਕ ਸੁਣਾਓ", "suggestion.capital": "ਫਰਾਂਸ ਦੀ ਰਾਜਧਾਨੀ ਕੀ ਹੈ?", "mobile.home": "ਹੋਮ", "mobile.compare": "ਤੁਲਨਾ", "mobile.saved": "ਸੰਭਾਲਿਆ", "common.loading": "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…", "common.error": "ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ", "common.retry": "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ", "common.save": "ਸੰਭਾਲੋ", "common.cancel": "ਰੱਦ", "common.delete": "ਮਿਟਾਓ", "common.close": "ਬੰਦ", "common.refresh": "ਰੀਫ੍ਰੈਸ਼", "common.saved": "ਸੰਭਾਲੇ ਸੁਨੇਹੇ", "common.noSavedMessages": "ਅਜੇ ਕੋਈ ਸੰਭਾਲੇ ਸੁਨੇਹੇ ਨਹੀਂ.", "common.starToSave": "ਇਹ ਇੱਥੇ ਸੰਭਾਲਣ ਲਈ ਕਿਸੇ ਵੀ ਮੌਸਮ ਜਵਾਬ ਨੂੰ ਸਟਾਰ ਕਰੋ.", "common.weatherByOpenMeteo": "ਮੌਸਮ ਡੇਟਾ Open-Meteo ਤੋਂ", "common.removeFromSaved": "ਸੰਭਾਲੇ ਵਿੱਚੋਂ ਹਟਾਓ", "common.saveThisMessage": "ਇਹ ਸੁਨੇਹਾ ਸੰਭਾਲੋ",
};

// ─── All translations keyed by language code ────────────────────────────────

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: EN, hi: HI, ta: TA, bn: BN, te: TE, mr: MR, gu: GU, kn: KN, ml: ML, pa: PA,
};

// ─── Translation Function ──────────────────────────────────────────────────

export function t(key: string, lang: Language = "en"): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
}

// ─── Language Context (shared state across all components) ─────────────────

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from "react";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
  languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("weather-chat-lang") as Language) || "en";
    }
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("weather-chat-lang", lang);
  }, []);

  const translate = useCallback((key: string) => t(key, language), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  // Fallback for components used outside the provider (e.g. in tests)
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("weather-chat-lang") as Language) || "en";
    }
    return "en";
  });
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("weather-chat-lang", lang);
  }, []);
  const translate = useCallback((key: string) => t(key, language), [language]);
  return { language, setLanguage, translate, languages: LANGUAGES };
}
