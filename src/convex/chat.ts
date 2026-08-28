import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// ─── WMO Weather Code descriptions ──────────────────────────────────────────

const WMO_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Foggy", icon: "🌫️" },
  48: { description: "Depositing rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌦️" },
  55: { description: "Dense drizzle", icon: "🌧️" },
  56: { description: "Freezing drizzle", icon: "🌧️" },
  57: { description: "Dense freezing drizzle", icon: "🌧️" },
  61: { description: "Slight rain", icon: "🌧️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Freezing rain", icon: "🌧️" },
  67: { description: "Heavy freezing rain", icon: "🌧️" },
  71: { description: "Slight snow", icon: "❄️" },
  73: { description: "Moderate snow", icon: "❄️" },
  75: { description: "Heavy snow", icon: "❄️" },
  77: { description: "Snow grains", icon: "❄️" },
  80: { description: "Slight rain showers", icon: "🌦️" },
  81: { description: "Moderate rain showers", icon: "🌧️" },
  82: { description: "Violent rain showers", icon: "⛈️" },
  85: { description: "Slight snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "🌨️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with hail", icon: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️" },
};

function getWeatherDescription(code: number): string {
  return WMO_CODES[code]?.description ?? `Code ${code}`;
}

function getWeatherIcon(code: number): string {
  return WMO_CODES[code]?.icon ?? "🌡️";
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getUVLevel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

// ─── Query parsing ──────────────────────────────────────────────────────────

interface ParsedQuery {
  location: string | null;
  intent: "current" | "forecast" | "comparison" | "general" | "travel" | "advisory";
  dateRange?: number;
  isWeatherQuery: boolean;
  isGeneralQuery: boolean;
  isTravelQuery?: boolean;
  isAdvisoryQuery?: boolean;
}

// Extensive Indian locations — cities, towns, villages, landmarks
const INDIAN_LOCATIONS = [
  // Major cities
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad",
  "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam",
  "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
  "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Allahabad",
  "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur",
  "Madurai", "Raipur", "Kochi", "Chandigarh", "Thiruvananthapuram", "Dehradun",
  // Tier 2 cities
  "Mysore", "Udaipur", "Shimla", "Manali", "Goa", "Pondicherry", "Ooty", "Kodaikanal",
  "Mount Abu", "Darjeeling", "Gangtok", "Shillong", "Imphal", "Aizawl", "Kohima",
  "Itanagar", "Agartala", "Panaji", "Dispur", "Bhubaneswar", "Cuttack", "Rourkela",
  "Siliguri", "Durgapur", "Asansol", "Bilaspur", "Jammu", "Leh", "Ladakh", "Dwarka",
  "Haridwar", "Rishikesh", "Pushkar", "Ajmer", "Jaisalmer", "Jalore", "Bundi",
  "Chittorgarh", "Kota", "Alwar", "Bikaner", "Sikar", "Nagaur", "Barmer",
  "Mathura", "Vrindavan", "Ayodhya", "Prayagraj", "Bodhgaya", "Sarnath", "Kushinagar",
  "Hampi", "Badami", "Bijapur", "Gulbarga", "Belgaum", "Hubli", "Dharwad", "Mangalore",
  "Manipal", "Udupi", "Karwar", "Gokarna", "Hospet", "Bellary", "Tumkur",
  "Erode", "Salem", "Tiruchirappalli", "Tirunelveli", "Thanjavur", "Kanchipuram",
  "Vellore", "Chidambaram", "Rameswaram", "Kanyakumari", "Nagercoil",
  "Warangal", "Karimnagar", "Nizamabad", "Khammam", "Mahbubnagar", "Adilabad",
  "Guntur", "Nellore", "Kurnool", "Anantapur", "Kadapa", "Tirupati",
  // Small towns and villages
  "Cherrapunji", "Mawsynram", "Tawang", "Ziro", "Dirang", "Bomdila",
  "Kalpa", "Sangla", "Reckong Peo", "Uttarkashi", "Gangotri", "Kedarnath",
  "Badrinath", "Hemkund", "Valley of Flowers", "Nainital", "Mussoorie",
  "Almora", "Chamoli", "Pithoragarh", "Bageshwar", "Champawat", "Udham Singh Nagar",
  "Pithauragarh", "Munsiari", "Chakulia", "Jhargram", "Bankura", "Purulia",
  "Medinipur", "Birbhum", "Malda", "Murshidabad", "Nadia", "South 24 Parganas",
  "North 24 Parganas", "Burdwan", "Hooghly", "Barrackpur", "Kamarhati",
  "Dindigul", "Theni", "Dharapuram", "Pollachi", "Udumalpet", "Palakkad",
  "Thrissur", "Kottayam", "Alappuzha", "Kollam", "Pathanamthitta", "Idukki",
  "Wayanad", "Kannur", "Kasargod", "Malappuram", "Guruvayur",
  // Tourist/pilgrimage sites
  "Amer Fort", "Hawa Mahal", "City Palace Jaipur", "Gateway of India", "Marine Drive",
  "Victoria Memorial", "Howrah Bridge", "India Gate", "Red Fort", "Taj Mahal",
  "Qutub Minar", "Charminar", "Meenakshi Temple", "Golden Temple",
  // South Asia
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta",
  "Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi",
  "Colombo", "Kandy", "Galle", "Jaffna",
  "Kathmandu", "Pokhara", "Lalitpur",
  "Thimphu", "Paro",
  "Male",
  // International
  "New York", "London", "Tokyo", "Paris", "Sydney", "Dubai", "Singapore", "Berlin",
  "Toronto", "Los Angeles", "Chicago", "San Francisco", "Washington DC", "Moscow",
  "Beijing", "Seoul", "Bangkok", "Istanbul", "Cairo", "Nairobi", "Lagos",
  "Rio de Janeiro", "Buenos Aires", "Mexico City", "Lima", "Bogota", "Santiago",
  "Johannesburg", "Cape Town", "Rome", "Barcelona", "Amsterdam", "Vienna",
  "Prague", "Zurich", "Geneva", "Stockholm", "Oslo", "Helsinki", "Copenhagen",
  "Warsaw", "Budapest", "Athens", "Lisbon", "Madrid",
  // Countries
  "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Bhutan", "Maldives",
  "Afghanistan", "Myanmar", "China", "Japan", "Thailand", "Vietnam",
  "Indonesia", "Philippines", "Malaysia",
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Italy", "Spain", "Russia", "Brazil", "Mexico",
  "South Africa", "Egypt", "Turkey", "Saudi Arabia", "UAE", "Nigeria",
  "Kenya", "Ethiopia", "Morocco", "Algeria",
  "Argentina", "Chile", "Colombia", "Peru",
];

// Weather-related keywords
const WEATHER_KEYWORDS = [
  "weather", "temperature", "temp", "forecast", "rain", "raining", "rainy", "snow", "snowing",
  "storm", "thunder", "lightning", "wind", "windy", "humidity", "cloud", "cloudy", "fog",
  "foggy", "sunny", "sun", "sunshine", "uv", "heat", "cold", "warm", "hot", "freeze",
  "freezing", "frost", "dew", "precipitation", "barometer", "pressure", "visibility",
  "sunrise", "sunset", "moonrise", "moonset", "air quality", "aqi", "pollution",
  "monsoon", "cyclone", "typhoon", "hurricane", "tornado", "flooding", "flood",
  "drought", "hail", "sleet", "drizzle", "shower", "overcast", "partly cloudy",
  "clear sky", "mist", "haze", "smog", "thunderstorm", "blizzard",
  "climate", "climate change", "global warming", "greenhouse", "el nino", "la nina",
  "extreme weather", "critical climate", "weather condition",
  "mausam", "tapman", "barish", "garmi", "thandi", "hawa", "dhund", "badal",
  "chhaon", "dhoop", "toofan", "chakravat", "sukha", "bajrapat",
];

// General question patterns (non-weather)
const GENERAL_PATTERNS = [
  /^(who|what|when|where|why|how|which|can|could|would|should|do|does|did|is|are|was|were|will)\s/i,
  /^(tell me|explain|describe|define|name|list|give me|show me|help me)/i,
  /^(joke|funny|laugh|humor|riddle)/i,
  /^(thank|thanks|thx|please|sorry|hello|hi|hey|bye|goodbye)/i,
  /^(what's the (meaning|definition|difference|capital|population|currency|language|history))/i,
  /^(write|create|make|generate|translate|convert|calculate|solve)/i,
  /^(recommend|suggest|best|top|worst|compare|difference between)/i,
  /^(programming|code|javascript|python|react|database|api)/i,
  /^(recipe|cook|food|restaurant|travel|hotel|flight|book)/i,
  /^(movie|book|music|song|game|sport|cricket|football)/i,
  /^(history|science|math|geography|biology|physics|chemistry)/i,
  /^(business|startup|marketing|finance|investment|stock)/i,
  /^(health|medical|diet|exercise|yoga|mental health)/i,
];

function isWeatherIntent(msg: string): boolean {
  const lower = msg.toLowerCase();
  for (const kw of WEATHER_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }
  return false;
}

function isGeneralIntent(msg: string): boolean {
  const lower = msg.toLowerCase();
  for (const pattern of GENERAL_PATTERNS) {
    if (pattern.test(lower)) return true;
  }
  return false;
}

// ─── Agriculture conversation context extraction ──────────────────────────

interface AgriContext {
  location: string | null;
  state: string | null;
  crop: string | null;
  cropStage: string | null;
  soilType: string | null;
  irrigationType: string | null;
  lastAssistantAskedFor: string | null;
  weatherData: import("./weather").WeatherData | null;
}

const CROP_NAMES = [
  "rice", "wheat", "soybean", "soyabean", "cotton", "maize", "corn",
  "sugarcane", "tomato", "potato", "groundnut", "chickpea", "mustard",
  "onion", "chilli", "turmeric", "banana", "mango", "grape", "tea",
  "coffee", "coconut", "pulses", "lentil", "pea", "bean", "barley",
  "jowar", "bajra", "ragi", "millet", "sunflower", "castor", "jute",
  "sesame", "linseed", "rapeseed", "cumin", "coriander", "ginger",
  "garlic", "cabbage", "cauliflower", "brinjal", "okra", "bottle gourd",
  "bitter gourd", "pumpkin", "cucumber", "watermelon", "muskmelon",
  "grapes", "pomegranate", "guava", "papaya", "pineapple", "orange",
  "lemon", "lime", "apple", "peach", "plum", "cherry",
];

const CROP_STAGES = [
  "land preparation", "sowing", "germination", "seedling", "vegetative",
  "flowering", "fruiting", "grain filling", "maturity", "harvest ready",
  "harvesting", "post harvest", "transplanting", "tillering", "booting",
  "heading", "ripening", "boll development", "pod development",
  "tasseling", "silking", "nursery", "vegetative growth",
];

const INDIAN_STATES = [
  "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh",
  "goa", "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka",
  "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
  "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu",
  "telangana", "tripura", "uttar pradesh", "uttarakhand", "west bengal",
  "delhi", "chandigarh", "puducherry",
];

const IRRIGATION_TYPES = ["irrigated", "rainfed", "sprinkler", "drip"];
const SOIL_TYPES = ["clay", "sandy", "loam", "silt", "peaty"];

const YES_ANSWERS = /^(yes|yeah|yep|yup|sure|ok|okay|y|haan|ha|ji|please|do it|go ahead|sure|definitely|absolutely)$/i;
const NO_ANSWERS = /^(no|nah|nope|nahi|n|never|skip)$/i;

// Check if a short message could be a follow-up answer to a previous question
function isFollowUpAnswer(msg: string): boolean {
  const trimmed = msg.trim();
  if (trimmed.length > 50) return false;
  if (YES_ANSWERS.test(trimmed) || NO_ANSWERS.test(trimmed)) return true;
  if (/^(haan|ha|ji|nahi|nah|theek|acha|ok|done|sahi|galat|pune|delhi|mumbai)$/i.test(trimmed.toLowerCase())) return true;
  const words = trimmed.split(/\s+/);
  if (words.length > 4) return false;
  const lower = trimmed.toLowerCase();
  if (CROP_NAMES.some(c => lower.includes(c))) return true;
  if (CROP_STAGES.some(s => lower.includes(s))) return true;
  if (IRRIGATION_TYPES.some(t => lower.includes(t))) return true;
  if (SOIL_TYPES.some(t => lower.includes(t))) return true;
  if (words.length <= 3 && /^[A-Z]/.test(trimmed)) return true;
  if (/^(today|tomorrow|this week|next week|daily|weekly|7.day|month)$/i.test(lower)) return true;
  return false;
}

function extractAgriContext(messages: Array<{ role: string; content: string; metadata?: { location?: string; weatherData?: import("./weather").WeatherData } }>): AgriContext {
  const ctx: AgriContext = {
    location: null,
    state: null,
    crop: null,
    cropStage: null,
    soilType: null,
    irrigationType: null,
    lastAssistantAskedFor: null,
    weatherData: null,
  };

  for (const msg of messages) {
    const content = msg.content.toLowerCase();
    const fullContent = msg.content;

    // Only set location from metadata if agriculture context doesn't already have one
    // This prevents weather responses from overwriting established agriculture location
    if (msg.metadata?.location && !ctx.location) {
      ctx.location = msg.metadata.location;
    }
    if (msg.metadata?.weatherData) {
      ctx.weatherData = msg.metadata.weatherData;
    }

    if (msg.role === "user") {
      for (const crop of CROP_NAMES) {
        if (content.includes(crop)) {
          ctx.crop = crop.charAt(0).toUpperCase() + crop.slice(1);
          break;
        }
      }
      for (const stage of CROP_STAGES) {
        if (content.includes(stage)) {
          ctx.cropStage = stage.charAt(0).toUpperCase() + stage.slice(1);
          break;
        }
      }
      if (content.includes("general") || content.includes("overall") || content.includes("any crop")) {
        ctx.crop = "General";
      }
      for (const soil of SOIL_TYPES) {
        if (content.includes(soil)) {
          ctx.soilType = soil.charAt(0).toUpperCase() + soil.slice(1);
          break;
        }
      }
      for (const irr of IRRIGATION_TYPES) {
        if (content.includes(irr)) {
          ctx.irrigationType = irr.charAt(0).toUpperCase() + irr.slice(1);
          break;
        }
      }
      for (const state of INDIAN_STATES) {
        if (content.includes(state)) {
          ctx.state = state.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          break;
        }
      }
      if (!ctx.location) {
        const locMatch = /(?:in|at|from|near|of|for)\s+([A-Za-z\s,.'-]+)/i.exec(fullContent);
        if (locMatch) {
          const candidate = locMatch[1].replace(/[?.!,;:]+$/, "").trim().split(/\s+/).slice(0, 3).join(" ");
          if (candidate.length >= 2) {
            ctx.location = candidate;
          }
        }
      }
    }

    if (msg.role === "assistant") {
      if (/district.*state|state.*district|location|where.*located|which.*city|which.*district/i.test(content)) {
        ctx.lastAssistantAskedFor = "location";
      } else if (/which crop|what crop|crop.*grow|which crop/i.test(content)) {
        ctx.lastAssistantAskedFor = "crop";
      } else if (/growth stage|crop stage|what.*stage|current.*stage/i.test(content)) {
        ctx.lastAssistantAskedFor = "cropStage";
      } else if (/soil type|what.*soil/i.test(content)) {
        ctx.lastAssistantAskedFor = "soilType";
      } else if (/irrigation type|how.*irrigat/i.test(content)) {
        ctx.lastAssistantAskedFor = "irrigationType";
      } else if (/should.*irrigat|can.*spray|should.*harvest|advisory|advice/i.test(content)) {
        ctx.lastAssistantAskedFor = null;
      }
    }
  }

  return ctx;
}

// ─── General conversation context extraction ─────────────────────────────

interface GeneralContext {
  lastLocation: string | null;
  lastWeatherData: import("./weather").WeatherData | null;
  lastIntent: string | null;
  lastResponseTimestamp: number;
}

function extractGeneralContext(messages: Array<{ role: string; content: string; metadata?: { location?: string; country?: string; weatherData?: import("./weather").WeatherData }; timestamp?: number }>): GeneralContext {
  const ctx: GeneralContext = {
    lastLocation: null,
    lastWeatherData: null,
    lastIntent: null,
    lastResponseTimestamp: 0,
  };

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant" && msg.metadata?.weatherData) {
      ctx.lastWeatherData = msg.metadata.weatherData;
      ctx.lastLocation = msg.metadata.location || null;
      ctx.lastResponseTimestamp = msg.timestamp || 0;
      break;
    }
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "assistant") {
      if (/forecast|7.day|week ahead/i.test(msg.content)) ctx.lastIntent = "forecast";
      else if (/alert|severe|danger|warning/i.test(msg.content)) ctx.lastIntent = "alert";
      else if (/climate|trend|historical/i.test(msg.content)) ctx.lastIntent = "climate";
      else if (/temperature|conditions|current/i.test(msg.content)) ctx.lastIntent = "current";
      else if (/travel|visit|trip/i.test(msg.content)) ctx.lastIntent = "travel";
      else if (/agri|crop|farm|irrigat/i.test(msg.content)) ctx.lastIntent = "agriculture";
      break;
    }
  }

  return ctx;
}

// Time expression parser
interface TimeRange {
  startDate: string;
  endDate: string;
  label: string;
  days: number;
}

function parseTimeExpression(msg: string): TimeRange | null {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  
  if (/tonight|this evening|aaj raat/i.test(msg)) {
    return { startDate: today, endDate: today, label: "tonight", days: 1 };
  }
  if (/tomorrow morning|kal subah/i.test(msg)) {
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
    return { startDate: tomorrow, endDate: tomorrow, label: "tomorrow morning", days: 1 };
  }
  if (/tomorrow evening|kal sham/i.test(msg)) {
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
    return { startDate: tomorrow, endDate: tomorrow, label: "tomorrow evening", days: 1 };
  }
  if (/tomorrow|kal/i.test(msg)) {
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().split("T")[0];
    return { startDate: tomorrow, endDate: tomorrow, label: "tomorrow", days: 1 };
  }
  if (/this weekend|is weekend|weekend/i.test(msg)) {
    const dayOfWeek = now.getDay();
    const daysToSat = (6 - dayOfWeek + 7) % 7 || 7;
    const saturday = new Date(now.getTime() + daysToSat * 86400000);
    const sunday = new Date(saturday.getTime() + 86400000);
    return { startDate: saturday.toISOString().split("T")[0], endDate: sunday.toISOString().split("T")[0], label: "this weekend", days: 2 };
  }
  if (/next week|agli week/i.test(msg)) {
    const nextWeekStart = new Date(now.getTime() + 7 * 86400000);
    const nextWeekEnd = new Date(now.getTime() + 13 * 86400000);
    return { startDate: nextWeekStart.toISOString().split("T")[0], endDate: nextWeekEnd.toISOString().split("T")[0], label: "next week", days: 7 };
  }
  if (/next (\d+) days?|\b(\d+)\s*day/i.test(msg)) {
    const match = msg.match(/next (\d+) days?|\b(\d+)\s*day/i);
    const days = parseInt(match?.[1] || match?.[2] || "3");
    const end = new Date(now.getTime() + days * 86400000);
    return { startDate: today, endDate: end.toISOString().split("T")[0], label: `next ${days} days`, days };
  }
  if (/today|aaj/i.test(msg)) {
    return { startDate: today, endDate: today, label: "today", days: 1 };
  }
  return null;
}

// ─── Query parsing ──────────────────────────────────────────────────────────

function parseQuery(userMessage: string): ParsedQuery {
  const msg = userMessage.toLowerCase().trim();
  let location: string | null = null;
  let intent: ParsedQuery["intent"] = "current";
  let dateRange: number | undefined;
  let isWeatherQuery = false;
  let isGeneralQuery = false;

  const hasNonLatinChars = /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0B00-\u0B7F\u0C00-\u0C7F\u0D00-\u0D7F\u0B80-\u0BFF]/.test(userMessage);
  if (hasNonLatinChars && msg.length > 2) {
    isGeneralQuery = true;
  }

  isWeatherQuery = isWeatherIntent(msg);
  if (!isGeneralQuery) isGeneralQuery = isGeneralIntent(msg);

  const hasQuestionWord = /^(what|where|how|why|which|who|when|explain|tell me|describe)/i.test(msg);
  const hasWeatherPreposition = /\b(?:weather|temperature|temp|forecast|rain|raining|snow|storm|wind|humidity|sunrise|sunset)\s+(?:in|at|for|near|of)\b/i.test(msg) ||
    /\b(?:in|at|for|near)\s+(?:[A-Z][a-z]+|my)\b/.test(userMessage);
  const isKnowledgeQuestion = hasQuestionWord && !hasWeatherPreposition && isGeneralQuery;

  if (!isKnowledgeQuestion) {
    for (const city of INDIAN_LOCATIONS) {
      if (msg.includes(city.toLowerCase())) {
        location = city;
        break;
      }
    }
  }

  if (!location && !isKnowledgeQuestion) {
    const prepositionMatch = /(?:in|at|near|around|from|to|of|for|visit|going to|travel to|staying in)\s+([A-Za-z\s,.'-]+)/i.exec(userMessage);
    if (prepositionMatch) {
      let candidate = prepositionMatch[1].trim();
      candidate = candidate.replace(/[?.!,;:]+$/, "").trim();
      const words = candidate.split(/\s+/).slice(0, 4).join(" ");
      if (words.length >= 2) {
        location = words;
      }
    }
  }

  if (!location && isWeatherQuery) {
    const matches = userMessage.match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/g);
    if (matches) {
      const commonWords = new Set(["Weather", "What", "Where", "When", "How", "Why", "Which", "Current", "Today", "Tomorrow", "This", "That", "There", "Here", "I", "Want", "To", "Is", "The", "My", "And", "But", "With", "For", "About", "Like"]);
      for (let i = matches.length - 1; i >= 0; i--) {
        if (!commonWords.has(matches[i])) {
          location = matches[i];
          break;
        }
      }
    }
  }

  const isTravelQuery = /visit|travel|trip|tour|vacation|holiday|plan.*go|going.*to|should.*go|can.*go|best.*time.*visit|is.*good.*time|worth.*visit|explore|sightseeing|adventure|backpack|itinerary|destination/i.test(msg);
  const isAdvisoryQuery = /should.*i|is.*it.*safe|advice|recommend|suggest|tip|precaution|pack|carry|bring|prepare|clothes|clothing|hotel|stay|accommodation|food.*to.*eat|restaurant|things.*to.*do|attraction|place.*to.*visit|local.*food|nightlife|market/i.test(msg);

  if (isTravelQuery || isAdvisoryQuery) {
    intent = "travel";
  } else if (msg.includes("forecast") || msg.includes("week") || msg.includes("7 day") || msg.includes("7-day") || msg.includes("coming days")) {
    intent = "forecast";
  }
  if (msg.includes("tomorrow")) {
    intent = "forecast";
    dateRange = 2;
  }
  if (msg.includes("compare") || msg.includes("difference") || msg.includes("vs") || msg.includes("versus")) {
    intent = "comparison";
  }
  if (msg.includes("today") || msg.includes("now") || msg.includes("current")) {
    intent = "current";
  }

  if (isKnowledgeQuestion && !isWeatherQuery) {
    location = null;
  }
  if (location) {
    isWeatherQuery = true;
  }

  return { location, intent, dateRange, isWeatherQuery, isGeneralQuery, isTravelQuery, isAdvisoryQuery };
}

// ─── Response generation ────────────────────────────────────────────────────

function generateConversationalGreeting(data: import("./weather").WeatherData, userQuery: string): string {
  const { location, current, daily } = data;
  const condition = getWeatherDescription(current.weatherCode);
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const lowerQuery = userQuery.toLowerCase();
  
  const isTravel = /visit|travel|trip|tour|vacation|holiday|plan.*go|going.*to|should.*go|can.*go|best.*time|worth.*visit|explore|sightseeing/i.test(lowerQuery);
  const isAdvisory = /should.*i|is.*it.*safe|advice|recommend|tip|precaution|pack|carry|prepare|clothes|hotel|stay|food|things.*to.*do|attraction|place.*to.*visit/i.test(lowerQuery);
  
  let intro = "";
  
  if (isTravel || isAdvisory) {
    const travelIntros = [
      `Great thinking! Let me give you a complete picture of ${location.name} so you can plan smartly.`,
      `Awesome choice! Here's everything you need to know about visiting ${location.name} right now.`,
      `Let me break down ${location.name} for you \u2014 weather, conditions, and travel tips all in one!`,
      `Smart question! Here's my full assessment of ${location.name} for your trip.`,
    ];
    intro = travelIntros[Math.floor(Math.random() * travelIntros.length)];
  } else {
    const greetings = [
      `Good ${timeOfDay}! I just checked the weather in ${location.name} for you.`,
      `Here's what's happening in ${location.name} right now!`,
      `Great question! Let me tell you about the weather in ${location.name}.`,
      `I pulled up the latest conditions for ${location.name}.`,
    ];
    intro = greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (current.temperature >= 35) {
    intro += ` It's quite hot out there \u2014 ${Math.round(current.temperature)}\u00b0C and ${condition.toLowerCase()}. ${isTravel ? "This isn't peak season for most hill stations \u2014 but if you're visiting coastal areas, mornings and evenings are pleasant." : "You might want to stay hydrated if you're heading out!"}`;
  } else if (current.temperature <= 10) {
    intro += ` It's chilly at ${Math.round(current.temperature)}\u00b0C with ${condition.toLowerCase()}. ${isTravel ? "Pack warm layers \u2014 woolens, jackets, and thermals are essential!" : "Might want to grab a jacket!"}`;
  } else if (current.weatherCode >= 61 && current.weatherCode <= 65) {
    intro += ` Heads up \u2014 it's raining in ${location.name} right now. ${current.precipitation > 0 ? `We're getting ${current.precipitation}mm of rain.` : "You'll want to bring an umbrella!"} ${isTravel ? "Carry rain gear and waterproof footwear." : ""}`;
  } else if (current.weatherCode >= 95) {
    intro += ` \u26a0\ufe0f There's a thunderstorm in ${location.name} right now. ${isTravel ? "I'd recommend delaying outdoor plans. Stay safe and explore indoor attractions instead!" : "Please stay safe and avoid outdoor activities!"}`;
  } else if (current.uvIndex >= 8) {
    intro += ` Just a heads up \u2014 the UV index is very high at ${current.uvIndex}. ${isTravel ? "Carry sunscreen, sunglasses, and a hat if you're exploring outdoors!" : "If you're going outside, sunscreen is a must!"}`;
  } else if (current.weatherCode <= 1) {
    intro += ` It's a beautiful ${condition.toLowerCase()} day there \u2014 ${isTravel ? "perfect conditions for sightseeing and outdoor activities!" : "perfect weather to be outside!"}`;
  } else {
    intro += ` The conditions are ${condition.toLowerCase()} with temperatures around ${Math.round(current.temperature)}\u00b0C.`;
  }
  
  if (isTravel && daily && daily.length >= 3) {
    const avgHigh = daily.slice(0, 7).reduce((sum, d) => sum + d.temperatureMax, 0) / Math.min(daily.length, 7);
    const avgLow = daily.slice(0, 7).reduce((sum, d) => sum + d.temperatureMin, 0) / Math.min(daily.length, 7);
    const rainyDays = daily.slice(0, 7).filter(d => d.precipitationSum > 1).length;
    intro += `\n\n\u{1f4ca} **Week ahead:** Average high ${avgHigh.toFixed(0)}\u00b0C / low ${avgLow.toFixed(0)}\u00b0C`;
    if (rainyDays > 0) intro += `, with ${rainyDays} rainy day${rainyDays > 1 ? 's' : ''} expected`;
    intro += `. `;
  }
  
  return intro;
}

function generateAgriAdvisory(data: import("./weather").WeatherData): string {
  const { current, daily } = data;
  const today = daily[0];
  let text = `\n\n\ud83c\udf3e **Agriculture Advisory:**\n`;
  
  if (current.temperature >= 35) {
    text += `\u2022 Heat stress risk for crops \u2014 ensure adequate irrigation\n`;
    text += `\u2022 Best time for field work is early morning or late evening\n`;
  } else if (current.temperature <= 10) {
    text += `\u2022 Frost risk for sensitive crops \u2014 consider protective measures\n`;
    text += `\u2022 Delay planting until temperatures rise\n`;
  } else {
    text += `\u2022 Good conditions for most agricultural activities\n`;
  }
  
  if (today && today.precipitationProbabilityMax > 50) {
    text += `\u2022 Delay pesticide/fertilizer application \u2014 rain expected\n`;
    text += `\u2022 Good time for rain-fed crop irrigation\n`;
  } else if (today && today.precipitationProbabilityMax < 20) {
    text += `\u2022 Dry conditions \u2014 ensure adequate irrigation for crops\n`;
  }
  
  if (current.windSpeed > 25) {
    text += `\u2022 Strong winds \u2014 avoid spraying operations\n`;
    text += `\u2022 Secure greenhouses and protective structures\n`;
  }
  
  if (current.humidity > 80) {
    text += `\u2022 High humidity \u2014 watch for fungal diseases in crops\n`;
    text += `\u2022 Ensure proper ventilation in storage areas\n`;
  } else if (current.humidity < 30) {
    text += `\u2022 Low humidity \u2014 increase irrigation frequency\n`;
  }
  
  return text;
}

function generateCurrentResponse(
  data: import("./weather").WeatherData,
  userQuery: string
): { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } } {
  const { location, current, daily } = data;
  const today = daily[0];
  const condition = getWeatherDescription(current.weatherCode);
  const windDir = getWindDirection(current.windDirection);
  const uvLevel = getUVLevel(current.uvIndex);

  let text = generateConversationalGreeting(data, userQuery);
  
  text += `\n\nHere are the details:\n`;
  text += `\u2022 **Temperature:** ${current.temperature}\u00b0C (feels like ${current.apparentTemperature}\u00b0C)\n`;
  text += `\u2022 **Conditions:** ${condition}\n`;
  text += `\u2022 **Humidity:** ${current.humidity}%\n`;
  text += `\u2022 **Wind:** ${current.windSpeed} km/h ${windDir}\n`;
  
  if (current.precipitation > 0) {
    text += `\u2022 **Precipitation:** ${current.precipitation} mm\n`;
  }
  
  text += `\u2022 **UV Index:** ${current.uvIndex} (${uvLevel})\n`;
  
  if (today) {
    text += `\n**Today's forecast:**\n`;
    text += `\u2022 High of ${today.temperatureMax}\u00b0C, low of ${today.temperatureMin}\u00b0C\n`;
    if (today.precipitationProbabilityMax > 0) {
      text += `\u2022 ${today.precipitationProbabilityMax}% chance of rain\n`;
    }
    if (today.sunrise && today.sunset) {
      const sunrise = new Date(today.sunrise).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const sunset = new Date(today.sunset).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      text += `\u2022 Sunrise at ${sunrise}, sunset at ${sunset}\n`;
    }
  }
  
  text += `\n`;
  if (current.temperature >= 35) {
    text += `\ud83d\udca1 **Tip:** Stay hydrated and try to stay in shaded areas during peak hours.`;
  } else if (current.temperature <= 5) {
    text += `\ud83d\udca1 **Tip:** Dress in layers and keep warm! Hot drinks will be your friend today.`;
  } else if (current.weatherCode >= 61 && current.weatherCode <= 65) {
    text += `\ud83d\udca1 **Tip:** Don't forget your umbrella or raincoat if you're heading out.`;
  } else if (current.uvIndex >= 6) {
    text += `\ud83d\udca1 **Tip:** Apply sunscreen SPF 30+ and wear sunglasses.`;
  } else {
    text += `\ud83d\udca1 **Tip:** Great conditions to be outdoors! Enjoy the weather.`;
  }
  
  if (current.temperature >= 40) {
    text += `\n\n\u26a0\ufe0f **Heat advisory:** Extremely high temperature. Stay hydrated and avoid prolonged outdoor exposure.`;
  } else if (current.temperature <= 0) {
    text += `\n\n\u26a0\ufe0f **Cold advisory:** Freezing conditions. Take precautions against frostbite.`;
  }
  
  if (current.windSpeed >= 50) {
    text += `\n\u26a0\ufe0f **Wind advisory:** Strong winds detected. Secure loose objects and avoid outdoor activities.`;
  }
  
  if (current.weatherCode >= 95) {
    text += `\n\u26a0\ufe0f **Severe weather alert:** Thunderstorm activity in the area. Seek shelter indoors immediately.`;
  }

  const query = userQuery.toLowerCase();
  
  if (query.includes("farm") || query.includes("crop") || query.includes("agri") || query.includes("soil") || query.includes("irrigation") || query.includes("harvest")) {
    text += generateAgriAdvisory(data);
  }
  
  if (/visit|travel|trip|tour|vacation|holiday|plan.*go|should.*go|explore|sightseeing|adventure|itinerary|destination|best.*time/i.test(query)) {
    text += `\n\n---\n\n`;
    text += `**\ud83e\uddec Travel Advisory for ${location.name}:**\n\n`;
    
    if (current.temperature >= 15 && current.temperature <= 30 && current.weatherCode <= 3) {
      text += `\u2705 **Weather Rating: Excellent** \u2014 Ideal weather for sightseeing and outdoor activities!\n\n`;
    } else if (current.temperature >= 10 && current.temperature <= 35) {
      text += `\ud83d\udc4d **Weather Rating: Good** \u2014 Comfortable for most activities with minor precautions.\n\n`;
    } else if (current.temperature > 35) {
      text += `\u26a0\ufe0f **Weather Rating: Hot** \u2014 Plan outdoor activities for early morning or evening. Carry water and sunscreen.\n\n`;
    } else if (current.temperature < 10) {
      text += `\ud83e\udde5 **Weather Rating: Cold** \u2014 Pack warm clothes! Layer up with thermals, jackets, and woolens.\n\n`;
    }
    
    text += `**\ud83c\udf92 What to pack:**\n`;
    if (current.temperature < 15) text += `\u2022 Warm layers, jacket, thermals, scarf, gloves\n`;
    if (current.temperature >= 15 && current.temperature <= 30) text += `\u2022 Light cotton clothes, sunglasses, comfortable walking shoes\n`;
    if (current.temperature > 30) text += `\u2022 Light breathable clothes, hat, sunscreen SPF 50+, water bottle\n`;
    if (current.uvIndex >= 6) text += `\u2022 Sunscreen SPF 30+, sunglasses, hat\n`;
    if (current.weatherCode >= 51 && current.weatherCode <= 67) text += `\u2022 Umbrella, rain jacket, waterproof bag\n`;
    if (current.humidity > 75) text += `\u2022 Moisture-wicking clothes, insect repellent\n`;
    text += `\u2022 Camera, power bank, valid ID proof\n\n`;
    
    if (daily && daily.length >= 7) {
      const bestDays = daily.filter((d, i) => i < 7 && d.temperatureMax <= 30 && d.temperatureMax >= 15 && d.weatherCode < 61);
      if (bestDays.length >= 3) {
        text += `**\ud83d\udcc5 This week:** ${bestDays.length} out of 7 days look great for outdoor activities!\n`;
      } else {
        text += `**\ud83d\udcc5 This week:** Weather is a bit ${current.temperature > 30 ? 'hot' : current.temperature < 10 ? 'cold' : 'unpredictable'} \u2014 plan indoor activities as backup.\n`;
      }
    }
    
    text += `\n**\ud83d\udee1\ufe0f Safety tips:**\n`;
    text += `\u2022 Keep emergency contacts handy (Police: 100, Ambulance: 108)\n`;
    text += `\u2022 Share your live location with family/friends\n`;
    if (current.weatherCode >= 95) text += `\u2022 Avoid open areas during thunderstorms\n`;
    if (current.windSpeed >= 40) text += `\u2022 Be cautious near loose structures in strong winds\n`;
    text += `\u2022 Carry basic medicines and stay hydrated\n\n`;
    
    text += `**\ud83d\udca1 Want more details?** Ask me about:\n`;
    text += `\u2022 "Best places to visit in ${location.name}"\n`;
    text += `\u2022 "7-day forecast for ${location.name}"\n`;
    text += `\u2022 "Food and culture of ${location.name}"\n`;
  }

  if (/should.*i|is.*it.*safe|is.*it.*worth|can.*i.*go/i.test(query) && !/visit|travel|trip/i.test(query)) {
    text += `\n\n**\ud83d\udccb My recommendation:**\n`;
    if (current.temperature >= 15 && current.temperature <= 30 && current.weatherCode < 61) {
      text += `Yes, absolutely! The weather is pleasant right now \u2014 great time to go out.`;
    } else if (current.temperature > 35) {
      text += `It's quite hot. If you must go out, carry water, wear light clothes, and avoid peak sun hours (11am-3pm).`;
    } else if (current.temperature < 10) {
      text += `It's cold \u2014 bundle up properly. Carry warm drinks and limit outdoor exposure.`;
    } else if (current.weatherCode >= 61) {
      text += `Rainy conditions \u2014 carry an umbrella and waterproof gear. Roads might be slippery.`;
    } else {
      text += `Conditions are decent. Standard precautions apply \u2014 stay aware and enjoy!`;
    }
  }

  // Source attribution
  const now = new Date();
  const updateTimestamp = now.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  text += `\n\n---\n`;
  text += `\ud83d\udcda **Data Source:** [Open-Meteo Weather API](https://open-meteo.com) | Updated: ${updateTimestamp}\n`;
  text += `*WeatherGPT interpretation based on real-time meteorological data. For official warnings, check [IMD](https://mausam.imd.gov.in).*`;

  return {
    text,
    metadata: {
      location: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      weatherData: data,
    },
  };
}

function generateForecastResponse(data: import("./weather").WeatherData, userQuery: string): { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } } {
  const { location, daily } = data;
  
  const intros = [
    `Here's what the next week looks like in ${location.name}!`,
    `Let me walk you through the forecast for ${location.name}.`,
    `Planning ahead? Here's the 7-day outlook for ${location.name}.`,
  ];
  let text = intros[Math.floor(Math.random() * intros.length)] + "\n\n";
  
  daily.forEach((day, i) => {
    const condition = getWeatherDescription(day.weatherCode);
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatDate(day.date);

    text += `**${label}:** ${condition}, ${day.temperatureMin}\u00b0C \u2013 ${day.temperatureMax}\u00b0C`;
    if (day.precipitationProbabilityMax > 0) {
      text += `, ${day.precipitationProbabilityMax}% chance of rain`;
    }
    text += `\n`;
  });

  const maxTemp = Math.max(...daily.map((d) => d.temperatureMax));
  const minTemp = Math.min(...daily.map((d) => d.temperatureMin));
  const rainyDays = daily.filter((d) => d.precipitationProbabilityMax > 50).length;
  
  text += `\n**Week at a glance:**\n`;
  text += `\u2022 Temperatures will range from ${minTemp}\u00b0C to ${maxTemp}\u00b0C\n`;
  if (rainyDays > 0) {
    text += `\u2022 Expect ${rainyDays} rainy day${rainyDays !== 1 ? "s" : ""} this week\n`;
  } else {
    text += `\u2022 Looks like a mostly dry week ahead!\n`;
  }
  
  text += `\n`;
  if (rainyDays >= 4) {
    text += `\u2602\ufe0f **Week outlook:** Quite a wet week ahead \u2014 keep that umbrella handy!`;
  } else if (maxTemp >= 35) {
    text += `\ud83d\udd25 **Week outlook:** Hot week coming up \u2014 plan outdoor activities for cooler parts of the day.`;
  } else if (minTemp <= 0) {
    text += `\u2744\ufe0f **Week outlook:** Cold week ahead \u2014 dress warm and watch for possible frost.`;
  } else {
    text += `\ud83c\udf24\ufe0f **Week outlook:** Pretty pleasant conditions overall \u2014 great week to be outdoors!`;
  }

  const query = userQuery.toLowerCase();
  if (query.includes("farm") || query.includes("crop") || query.includes("agri") || query.includes("soil") || query.includes("irrigation") || query.includes("harvest")) {
    text += generateAgriAdvisory(data);
  }

  // Source attribution
  const now = new Date();
  const updateTimestamp = now.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  text += `\n\n---\n`;
  text += `\ud83d\udcda **Data Source:** [Open-Meteo Weather API](https://open-meteo.com) | Updated: ${updateTimestamp}\n`;
  text += `*WeatherGPT interpretation based on real-time meteorological data. For official warnings, check [IMD](https://mausam.imd.gov.in).*`;

  return {
    text,
    metadata: {
      location: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      weatherData: data,
    },
  };
}

function generateErrorResponse(error: string): string {
  if (error.includes("not found")) {
    return `I couldn't find that location. Could you try:\n\n\u2022 A different spelling of the city name\n\u2022 A nearby major city\n\u2022 Adding the state name (e.g., "Warangal, Telangana")\n\nI support **any location in India and worldwide** \u2014 from major cities to small villages. Just tell me the place name!`;
  }
  return `I'm sorry, I encountered an issue getting weather data. Please try again in a moment, or try a different location.`;
}

function generateHelpResponse(): string {
  return `Here's everything I can help you with:\n\n**\ud83c\udf24\ufe0f Weather Information**\n\u2022 "What's the weather in Mumbai?"\n\u2022 "Temperature in my village right now"\n\u2022 "Is it raining in London?"\n\n**\ud83d\udcc5 Forecasts**\n\u2022 "7-day forecast for Tokyo"\n\u2022 "Will it rain tomorrow in Pune?"\n\u2022 "Weather this week in Shimla"\n\n**\ud83c\udf3e Agriculture Advisory**\n\u2022 "Give me an agriculture advisory" \u2192 guided location + crop + stage\n\u2022 "Should I irrigate my soybean?" \u2192 weather-aware irrigation advice\n\u2022 "Best time to sow wheat in UP?" \u2192 crop-specific timing\n\n**\u26a0\ufe0f Alerts**\n\u2022 "Any cyclone alerts for Chennai?"\n\u2022 "Is it safe to fly tomorrow?"\n\u2022 "Heatwave warning in Rajasthan?"\n\n**\ud83c\udf0d Climate & History**\n\u2022 "Climate trend in Pune last year"\n\u2022 "Historical weather in Delhi last month"\n\u2022 "Has Chennai become warmer over the years?"\n\n**\ud83e\udde0 General Knowledge**\n\u2022 Ask me anything \u2014 math, science, history, cooking, travel, technology, sports!\n\u2022 "Tell me a joke"\n\u2022 "What's the capital of France?"\n\n**\ud83d\udca1 Follow-up Questions**\n\u2022 "What about tomorrow?" (uses same location)\n\u2022 "Will it rain?" (context-aware)\n\u2022 "Should I go out?" (weather-based advice)\n\n**\ud83d\udd0d Explain Recommendations**\n\u2022 "Why am I seeing this?" (explains the data behind advice)\n\n**\ud83d\udde3\ufe0f Voice Input**\n\u2022 Tap the mic button and speak your question\n\nJust type your question and I'll do my best to help!`;
}

// ─── LLM Integration ────────────────────────────────────────────────────────

async function callLLM(userMessage: string, lang: string, apiKey?: string): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  if (!key) {
    return `**GEMINI_API_KEY not configured.**\n\nFor the best answers to general knowledge questions, please add a GEMINI_API_KEY to your environment variables.\n\nIn the meantime, I'm great at:\n\u2022 Weather for any location in India or worldwide\n\u2022 7-day forecasts with detailed breakdowns\n\u2022 Agriculture advisories for farmers\n\u2022 Disaster alerts \u2014 cyclones, floods, heatwaves\n\nWhat would you like to know?`;
  }

  const langNames: Record<string, string> = {
    en: "English", hi: "Hindi", ta: "Tamil", bn: "Bengali", te: "Telugu",
    mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
  };
  const langName = langNames[lang] || "English";

  const systemPrompt = `You are WeatherGPT, an intelligent weather assistant built for Smart India Hackathon 2026 by Team Craxzy. You help users with weather information, forecasts, agriculture advisories, climate analysis, travel planning, and general knowledge.

RULES:
- Respond in ${langName} unless the user writes in a different language.
- Be helpful, friendly, and informative.
- Use markdown formatting for readability.
- For weather questions, always ask for a specific location.
- For agriculture questions, ask for location, crop, and growth stage progressively.
- Never fabricate weather data, government warnings, or official advisories.
- Clearly label "WeatherGPT interpretation" vs official sources.
- Keep responses concise but thorough.
- Support Indian context (Indian cities, agriculture, monsoon, etc.)`;

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: key });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        topP: 0.95,
        topK: 50,
        maxOutputTokens: 4096,
      },
    });
    
    const text = response.text;
    return text || getFallbackResponse(userMessage);
  } catch (error) {
    console.error("Gemini callLLM exception:", error);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.8, topP: 0.95, maxOutputTokens: 4096 },
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch { /* fallback also failed */ }
    return `**Error:** ${(error as Error).message}\n\nPlease check your API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).`;
  }
}

function getFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();
  
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|namaskar|howdy|greetings)/i.test(msg)) {
    const greetings = [
      "Hello! \ud83d\udc4b I'm Weather GPT, your intelligent weather assistant. I can help you with:\n\n\u2022 **Weather conditions** for any location in India or worldwide\n\u2022 **7-day forecasts** with detailed breakdowns\n\u2022 **Agriculture advisories** for farmers\n\u2022 **Disaster alerts** \u2014 cyclones, floods, heatwaves\n\u2022 **General knowledge** \u2014 ask me anything!\n\nWhat would you like to know?",
      "Namaste! \ud83d\ude4f I'm Weather GPT. Ask me about the weather anywhere \u2014 from Mumbai to a small village \u2014 or just chat about anything!\n\nTry asking:\n\u2022 \"Weather in my city\"\n\u2022 \"Should I irrigate crops today?\"\n\u2022 \"Tell me a joke\"",
      "Hey there! \u2600\ufe0f I'm Weather GPT, built by Team Craxzy. I know the weather for every location and can answer almost any question. What's on your mind?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (/how\s*(are\s*you|r\s*u)/i.test(msg)) {
    return "I'm doing great, thanks for asking! \u2600\ufe0f I'm always ready to help you with weather information or answer any question you have. What would you like to know?";
  }
  
  if (/thank|thanks|thx|shukriya|dhanyavaad/i.test(msg)) {
    return "You're welcome! \ud83d\ude0a Is there anything else you'd like to know about the weather or anything else?";
  }
  
  if (/bye|goodbye|see\s*ya|later|cya|alvida/i.test(msg)) {
    return "Goodbye! \ud83d\udc4b Stay weather-aware, and feel free to come back anytime you need weather information or just want to chat!";
  }
  
  if (/joke|funny|laugh|humor|hasi|mazaak/i.test(msg)) {
    const jokes = [
      "Why don't weather forecasters win awards? Because they always say it's partly cloudy! \u26c5",
      "What do you call a cold dog sitting on a rabbit? A chili dog on a bunny! \ud83d\udc15",
      "Why did the weather vane win the race? Because it was always pointing in the right direction! \ud83c\udf2c\ufe0f",
      "What's a meteorologist's favorite type of story? A thunder-thriller! \u26c8\ufe0f",
      "Why was the weather report so expensive? Because it cost a pretty penny for the forecast! \ud83d\udcb0",
      "What did the weatherman say to the mountain? \"I've got my eye on you \u2014 you look a little peaky today!\" \ud83c\udfd4\ufe0f",
      "Why did the sun go to school? To get a little brighter! \u2600\ufe0f",
      "What did one raindrop say to the other? Two's company, three's a cloud! \ud83c\udf27\ufe0f",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  if (/what\s*(time|date|day)/i.test(msg)) {
    const now = new Date();
    return `It's currently ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} on ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}. Would you like to know the weather for this time?`;
  }

  // "Why" / Explain handler
  if (/^why|why is|why does|explain|reason for|because of/i.test(msg) && msg.length < 80) {
    return "I don't have enough context from our previous conversation to explain a specific recommendation. Could you ask me about the weather for a specific location first?\n\nFor example:\n\u2022 \"Weather in Pune\"\n\u2022 Then ask \"Why am I seeing this?\" for a detailed explanation.\n\nI'll show you the weather factors behind every recommendation!";
  }

  if (/weather|rain|snow|temperature|forecast|wind|sun|cloud|storm|mausam|barish|garmi|thandi/i.test(msg)) {
    if (/which|what|where|best|worst|top|most|least|recommend|suggest|good place|nice weather|pleasant|visit|travel|holiday|vacation|tour|explore|enjoy|relax/i.test(msg)) {
      const month = new Date().getMonth();
      let seasonalAdvice = "";
      if (month >= 2 && month <= 4) {
        seasonalAdvice = "**\ud83c\udf38 March-May (Summer):**\n\u2022 Hill stations are perfect (Shimla, Manali, Ooty, Darjeeling)\n\u2022 Beach destinations are hot \u2014 avoid midday\n\u2022 Ladakh opens up for road trips\n\u2022 Avoid central India plains \u2014 extreme heat (40\u00b0C+)\n";
      } else if (month >= 5 && month <= 8) {
        seasonalAdvice = "**\ud83c\udf27\ufe0f June-September (Monsoon):\n\u2022 Kerala and Western Ghats are stunning with lush greenery\n\u2022 Ladakh is at its best \u2014 clear skies, no rain\n\u2022 Avoid coastal areas \u2014 heavy rainfall and rough seas\n\u2022 Meghalaya (Cherrapunji) is magical in monsoon\n";
      } else if (month >= 9 && month <= 11) {
        seasonalAdvice = "**\ud83c\udf42 October-November (Post-Monsoon):\n\u2022 Best time for Rajasthan (Jaipur, Udaipur, Jaisalmer)\n\u2022 Goa beaches are perfect \u2014 less crowds\n\u2022 Northeast India is beautiful with autumn colors\n\u2022 Delhi, Agra, Varanasi have pleasant weather\n";
      } else {
        seasonalAdvice = "**\u2744\ufe0f December-February (Winter):\n\u2022 Perfect for South India (Goa, Kerala, Pondicherry)\n\u2022 Rajasthan desert camping under stars\n\u2022 Shimla and Manali for snow lovers\n\u2022 Avoid north India plains if you dislike cold and fog\n";
      }
      
      return `Great question! Here's my curated guide based on the current season:\n\n${seasonalAdvice}\n**\ud83c\udf0d Top picks worldwide this month:**\n\u2022 Bali, Indonesia \u2014 tropical paradise, warm and sunny\n\u2022 Canary Islands, Spain \u2014 mild winters, warm summers\n\u2022 Queenstown, New Zealand \u2014 adventure capital\n\u2022 Kyoto, Japan \u2014 cherry blossoms (March-April)\n\n**\ud83d\uddfa\ufe0f Quick tips:**\n\u2022 Want specific weather? Tell me a city name!\n\u2022 "Weather in Shimla" \u2192 real-time conditions\n\u2022 "Should I visit Goa this month?" \u2192 full travel advisory\n\u2022 "7-day forecast for Manali" \u2192 weekly outlook\n\nJust name a place and I'll give you the full picture!`;
    }
    return "I'd love to help with weather information! Could you tell me which city or location you'd like to know about?\n\nFor example:\n\u2022 \"Weather in Mumbai\"\n\u2022 \"Forecast for my village in Punjab\"\n\u2022 \"Should I visit Shimla this month?\" (gives full travel advice!)\n\u2022 \"Is it raining in London?\"\n\nI can find weather for **any location** \u2014 just tell me the name!";
  }
  
  if (/help|what\s*can\s*you|capabilities|features|commands/i.test(msg)) {
    return generateHelpResponse();
  }
  
  if (/who\s*(made|created|built|are\s*you)|your\s*(name|creator|maker|team)/i.test(msg)) {
    return "I'm **Weather GPT** \ud83c\udf24\ufe0f \u2014 an intelligent weather assistant built by **Team Craxzy** for the Smart India Hackathon.\n\nI can help you with:\n\u2022 Real-time weather for any location\n\u2022 7-day forecasts\n\u2022 Agriculture advisories for farmers\n\u2022 Disaster alerts\n\u2022 General knowledge questions\n\nAsk me anything!";
  }
  
  if (/\d+\s*[+\-*/^%]\s*\d+/i.test(msg) || /calculate|math|solve/i.test(msg)) {
    const mathMatch = msg.match(/(\d+)\s*([+\-*/^%])\s*(\d+)/);
    if (mathMatch) {
      const a = parseFloat(mathMatch[1]);
      const op = mathMatch[2];
      const b = parseFloat(mathMatch[3]);
      let result = 0;
      switch(op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = b !== 0 ? a / b : NaN; break;
        case '%': result = b !== 0 ? a % b : NaN; break;
        case '^': result = Math.pow(a, b); break;
      }
      return `\ud83e\uddee **${a} ${op} ${b} = ${isNaN(result) ? 'undefined (division by zero)' : result}**\n\nNeed help with anything else? I can also help with weather, travel planning, and more!`;
    }
    return "I'd be happy to help with math! I can solve basic calculations. Just type something like `25 + 37` or `100 / 4` and I'll calculate it for you! \ud83e\uddee";
  }

  if (/climate|monsoon|cyclone|flood|drought|heatwave|el.?ni|la.?ni|global.?warming|greenhouse/i.test(msg)) {
    return "Great question about climate! \ud83c\udf0d\n\nI can help you with:\n\n\u2022 **Real-time weather** for any location\n\u2022 **Forecasts** and conditions\n\u2022 **Agriculture advisories**\n\u2022 **Climate trends** and historical data\n\u2022 **Severe weather alerts** across India\n\nTry asking:\n\u2022 \"Weather in Mumbai\"\n\u2022 \"7-day forecast for Delhi\"\n\u2022 \"Climate trend in Chennai last year\"\n\u2022 \"Is the weather critical anywhere in India?\"\n\nJust tell me the location and what you'd like to know!";
  }

  if (/who|what|when|where|why|how|which|explain|tell me about|describe/i.test(msg)) {
    return "Great question! \ud83e\udde0\n\nI'm Weather GPT and I can help you with:\n\n\u2022 **Weather** \u2014 real-time conditions for any location\n\u2022 **Forecasts** \u2014 7-day predictions with details\n\u2022 **Travel planning** \u2014 should you visit? what to pack?\n\u2022 **Agriculture** \u2014 crop-specific weather advice\n\u2022 **Alerts** \u2014 cyclone, flood, heatwave warnings\n\u2022 **Climate** \u2014 trends and historical data\n\nJust tell me what you'd like to know and where!";
  }

  return "I'm Weather GPT, your all-in-one weather and knowledge assistant! \ud83c\udf24\ufe0f\n\nI can help with:\n\u2022 **Weather** \u2014 ask about any city, village, or location\n\u2022 **Forecasts** \u2014 7-day predictions with details\n\u2022 **Agriculture** \u2014 crop-specific weather advice\n\u2022 **Alerts** \u2014 cyclone, flood, heatwave warnings\n\u2022 **General questions** \u2014 ask me anything! (requires GEMINI_API_KEY)\n\u2022 **Climate knowledge** \u2014 explain climate patterns, monsoons, and weather science\n\nJust type your question and I'll do my best to help!";
}

// ─── Chat mutation ──────────────────────────────────────────────────────────

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "user",
      content: args.content,
      timestamp: now,
    });
    return now;
  },
});

export const saveAssistantMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    metadata: v.optional(
      v.object({
        location: v.optional(v.string()),
        country: v.optional(v.string()),
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        weatherData: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: "assistant",
      content: args.content,
      timestamp: Date.now(),
      metadata: args.metadata,
    });
  },
});

export const createConversation = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject ?? "anonymous";
    return await ctx.db.insert("conversations", {
      userId,
      title: args.title,
    });
  },
});

export const toggleStar = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");
    await ctx.db.patch(args.messageId, {
      starred: !msg.starred,
    });
  },
});

// ─── Chat query ─────────────────────────────────────────────────────────────

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) return [];
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const getGeminiKey = query({
  args: {},
  handler: async (ctx) => {
    return process.env.GEMINI_API_KEY || "";
  },
});

export const getStarredMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) return [];

    const userConversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const convIds = new Set(userConversations.map((c) => c._id));

    const starred = await ctx.db
      .query("messages")
      .withIndex("by_starred", (q) => q.eq("starred", true))
      .order("desc")
      .take(50);

    return starred
      .filter((m) => convIds.has(m.conversationId))
      .map((m) => {
        const conv = userConversations.find((c) => c._id === m.conversationId);
        return { ...m, conversationTitle: conv?.title ?? "Conversation" };
      });
  },
});

// ─── Main chat action ───────────────────────────────────────────────────────

export const processMessage = action({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    language: v.optional(v.string()),
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const content = args.content.trim();
    const lang = args.language || "en";

    // Handle help/commands
    if (content.toLowerCase() === "help" || content.toLowerCase() === "/help") {
      const text = generateHelpResponse();
      await ctx.runMutation(api.chat.saveAssistantMessage, {
        conversationId: args.conversationId,
        content: text,
      });
      return { text, metadata: null };
    }

    // Parse the query
    const parsed = parseQuery(content);

    // ── STEP 1: Extract agriculture context from conversation history ──
    // This runs ALWAYS, before any routing, so context is never lost
    let agriCtx: AgriContext = {
      location: null, state: null, crop: null, cropStage: null,
      soilType: null, irrigationType: null, lastAssistantAskedFor: null, weatherData: null,
    };
    let agriMessages: Array<{ role: string; content: string; metadata?: { location?: string; weatherData?: import("./weather").WeatherData } }> = [];
    
    try {
      const allMessages = await ctx.runQuery(api.chat.getMessages, { conversationId: args.conversationId });
      agriMessages = allMessages.slice(-20);
      agriCtx = extractAgriContext(agriMessages);
    } catch (err) {
      console.error("Failed to extract agriculture context:", err);
    }

    // ── STEP 2: Determine if this is an agriculture question ──
    const hasAgricultureContext = !!(agriCtx.crop || agriCtx.location);
    const isAgricultureKeyword = /agri|crop|farm|irrigat|sow|sowing|harvest|pest|fertiliz|spray|advisory|disease|fungal|waterlog|grow|growing|cultivat|my crop|my farm|field|plant/i.test(content);
    const isAgricultureQuestion = /should.*i|can.*i|will.*this|will.*the|is.*my|what.*should|how.*my|affect|impact|risk|damage|protect|irrigat|spray|harvest|fertiliz|good for|bad for|safe for|weather.*suitable|condition.*good|condition.*bad|rain.*affect|rain.*hurt|rain.*damage|my.*crop|my.*soybean|my.*wheat|my.*rice|my.*cotton|what.*do.*for/i.test(content);
    
    // Agriculture intent: either keywords match OR we have agriculture context and the question is agricultural
    const isAgricultureIntent = isAgricultureKeyword || (hasAgricultureContext && isAgricultureQuestion);

    // ── STEP 3: Agriculture context routing (HIGHEST PRIORITY) ──
    // When agriculture context exists and the message is agriculture-related,
    // ALWAYS route through agriculture handler — never fall through to weather
    if (isAgricultureIntent || (hasAgricultureContext && isFollowUpAnswer(content))) {
      try {
        // Resolve what the follow-up is answering
        let resolvedLocation = parsed.location || agriCtx.location;
        let resolvedCrop = agriCtx.crop;
        let resolvedStage = agriCtx.cropStage;
        
        const msgLower = content.toLowerCase().trim();

        // Handle comma-separated compound answers
        if (!resolvedLocation && !resolvedCrop && content.includes(",")) {
          const parts = content.split(",").map(p => p.trim());
          for (const part of parts) {
            const partLower = part.toLowerCase();
            if (!resolvedLocation && !CROP_NAMES.some(c => partLower.includes(c)) && !CROP_STAGES.some(s => partLower.includes(s))) {
              resolvedLocation = part;
            } else if (!resolvedCrop) {
              const cropMatch = CROP_NAMES.find(c => partLower.includes(c));
              if (cropMatch) resolvedCrop = cropMatch.charAt(0).toUpperCase() + cropMatch.slice(1);
            } else if (!resolvedStage) {
              const stageMatch = CROP_STAGES.find(s => partLower.includes(s));
              if (stageMatch) resolvedStage = stageMatch.charAt(0).toUpperCase() + stageMatch.slice(1);
            }
          }
        }

        // Handle space-separated compound: "soybean flowering" or "Pune soybean"
        if (!resolvedLocation && !resolvedCrop) {
          const words = msgLower.split(/\s+/);
          for (const word of words) {
            const cropMatch = CROP_NAMES.find(c => word.includes(c));
            if (cropMatch && !resolvedCrop) {
              resolvedCrop = cropMatch.charAt(0).toUpperCase() + cropMatch.slice(1);
            }
            const stageMatch = CROP_STAGES.find(s => word.includes(s));
            if (stageMatch && !resolvedStage) {
              resolvedStage = stageMatch.charAt(0).toUpperCase() + stageMatch.slice(1);
            }
          }
        }

        // Validate: is the user's short answer actually a crop/stage, not a location?
        const isAnswerCropOrStage = CROP_NAMES.some(c => msgLower.includes(c)) ||
          CROP_STAGES.some(s => msgLower.includes(s));

        // If assistant last asked for location and user sends a short answer
        if (agriCtx.lastAssistantAskedFor === "location" && isFollowUpAnswer(content) && !parsed.location) {
          if (isAnswerCropOrStage) {
            // User answered with a crop/stage instead of a location
            const cropMatch = CROP_NAMES.find(c => msgLower.includes(c));
            if (cropMatch) resolvedCrop = cropMatch.charAt(0).toUpperCase() + cropMatch.slice(1);
            const stageMatch = CROP_STAGES.find(s => msgLower.includes(s));
            if (stageMatch) resolvedStage = stageMatch.charAt(0).toUpperCase() + stageMatch.slice(1);
            // Do NOT set as location
          } else {
            resolvedLocation = content.trim();
            parsed.location = resolvedLocation;
          }
        }
        
        // If assistant last asked for crop
        if (agriCtx.lastAssistantAskedFor === "crop" && isFollowUpAnswer(content)) {
          if (msgLower.includes("general") || msgLower.includes("overall") || msgLower.includes("any crop")) {
            resolvedCrop = "General";
          } else {
            const cropMatch = CROP_NAMES.find(c => msgLower.includes(c));
            if (cropMatch) {
              resolvedCrop = cropMatch.charAt(0).toUpperCase() + cropMatch.slice(1);
            } else {
              resolvedCrop = content.trim().charAt(0).toUpperCase() + content.trim().slice(1);
            }
          }
        }
        
        // If assistant last asked for stage
        if (agriCtx.lastAssistantAskedFor === "cropStage" && isFollowUpAnswer(content)) {
          const stageMatch = CROP_STAGES.find(s => msgLower.includes(s));
          if (stageMatch) {
            resolvedStage = stageMatch.charAt(0).toUpperCase() + stageMatch.slice(1);
          } else {
            resolvedStage = content.trim().charAt(0).toUpperCase() + content.trim().slice(1);
          }
        }

        // Handle "yes do it" / agreement responses
        if (YES_ANSWERS.test(msgLower) && agriCtx.lastAssistantAskedFor) {
          if (agriCtx.lastAssistantAskedFor === "location" && !agriCtx.location) {
            const text = "Sure! Please tell me your **district and state** (for example, Pune, Maharashtra), and I'll prepare the advisory for you. \ud83c\udf3e";
            await ctx.runMutation(api.chat.saveAssistantMessage, {
              conversationId: args.conversationId,
              content: text,
            });
            return { text, metadata: null };
          }
        }

        // ── Route A: We have ALL info (location + crop) — generate agriculture response ──
        if (resolvedLocation && resolvedCrop) {
          try {
            const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: resolvedLocation });
            if (results && results.length > 0) {
              const best = results[0];
              const weatherData: import("./weather").WeatherData = await ctx.runAction(api.weather.fetchWeather, {
                latitude: best.latitude,
                longitude: best.longitude,
                locationName: best.name,
                country: best.country,
                timezone: best.timezone || "auto",
              });
              
              const contextParts = [];
              contextParts.push(`CONVERSATION CONTEXT:`);
              contextParts.push(`Location: ${best.name}, ${best.country}`);
              contextParts.push(`Crop: ${resolvedCrop}`);
              if (resolvedStage) contextParts.push(`Growth Stage: ${resolvedStage}`);
              if (agriCtx.soilType) contextParts.push(`Soil Type: ${agriCtx.soilType}`);
              if (agriCtx.irrigationType) contextParts.push(`Irrigation: ${agriCtx.irrigationType}`);
              contextParts.push(``);
              contextParts.push(`CURRENT WEATHER in ${best.name}:`);
              contextParts.push(`Temperature: ${weatherData.current.temperature}C (feels like ${weatherData.current.apparentTemperature}C)`);
              contextParts.push(`Humidity: ${weatherData.current.humidity}%`);
              contextParts.push(`Wind: ${weatherData.current.windSpeed} km/h`);
              contextParts.push(`Condition: ${getWeatherDescription(weatherData.current.weatherCode)}`);
              contextParts.push(`UV Index: ${weatherData.current.uvIndex}`);
              if (weatherData.current.precipitation > 0) {
                contextParts.push(`Current rainfall: ${weatherData.current.precipitation}mm`);
              }
              contextParts.push(``);
              contextParts.push(`7-DAY FORECAST (use actual values):`);
              weatherData.daily.slice(0, 7).forEach((day: {date: string; temperatureMax: number; temperatureMin: number; weatherCode: number; precipitationProbabilityMax: number; precipitationSum: number; windSpeedMax: number}, i: number) => {
                const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : day.date;
                contextParts.push(`${label}: ${day.temperatureMin}-${day.temperatureMax}C, Rain prob: ${day.precipitationProbabilityMax}%, Rain: ${day.precipitationSum}mm, Wind: ${day.windSpeedMax}km/h`);
              });
              contextParts.push(``);
              contextParts.push(`USER QUESTION: "${content}"`);
              contextParts.push(``);
              contextParts.push(`You are WeatherGPT Agriculture Advisory for ${best.name}, India. Using ONLY the real weather data above, provide a specific, actionable agriculture advisory.`);
              if (resolvedCrop && resolvedCrop !== "General") {
                contextParts.push(`Crop: ${resolvedCrop}`);
                if (resolvedStage) contextParts.push(`Growth Stage: ${resolvedStage}`);
              }
              contextParts.push(``);
              contextParts.push(`COVER THESE SECTIONS:`);
              if (resolvedCrop && resolvedCrop !== "General") {
                contextParts.push(`1. Weather Risk Assessment for ${resolvedCrop} at ${resolvedStage || "unknown"} stage`);
                contextParts.push(`2. Direct answer to the user's question using actual weather data`);
                contextParts.push(`3. Today's Recommended Actions (3-6 specific actions based on weather)`);
                contextParts.push(`4. Irrigation Advisory (based on rainfall forecast, humidity, and crop stage)`);
                contextParts.push(`5. 3-7 Day Agricultural Outlook`);
                contextParts.push(`6. Pest & Disease Weather Risk`);
                contextParts.push(`7. Farm Operation Windows`);
                contextParts.push(`8. Weather Alerts`);
                contextParts.push(`9. Confidence Level (High/Medium/Low)`);
                contextParts.push(`10. Sources`);
              } else {
                contextParts.push(`1. Overall Weather Risk Assessment`);
                contextParts.push(`2. General Agricultural Impact`);
                contextParts.push(`3. Irrigation Considerations`);
                contextParts.push(`4. 3-7 Day Outlook`);
                contextParts.push(`5. General Farm Advisory`);
                contextParts.push(`6. Weather Alerts`);
                contextParts.push(`7. Sources`);
              }
              contextParts.push(``);
              contextParts.push(`RULES: Use ONLY real weather data. Never invent values. Say "conditions may be favorable for..." for disease risk. Label "WeatherGPT interpretation" vs official sources. Answer the user's specific question FIRST, then provide broader advisory context.`);
              
              const enrichedMessage = contextParts.join("\n");
              const text = await callLLM(enrichedMessage, lang, args.apiKey);
              
              if (text && !text.startsWith("[DEBUG]") && !text.startsWith("**Error:**")) {
                await ctx.runMutation(api.chat.saveAssistantMessage, {
                  conversationId: args.conversationId,
                  content: text,
                  metadata: {
                    location: best.name,
                    country: best.country,
                    latitude: best.latitude,
                    longitude: best.longitude,
                    weatherData: weatherData as any,
                  },
                });
                return { text, metadata: { location: best.name, country: best.country, latitude: best.latitude, longitude: best.longitude, weatherData: weatherData as any } };
              }
            }
          } catch (err) {
            console.error("Agri context weather fetch failed:", err);
          }
        }
        
        // ── Route B: We need location ──
        if (!resolvedLocation) {
          if (agriCtx.lastAssistantAskedFor === "location") {
            const text = `I understand you're interested in an agriculture advisory. To give you location-specific advice, please tell me your **district and state** (for example, Pune, Maharashtra). \ud83c\udf3e`;
            await ctx.runMutation(api.chat.saveAssistantMessage, {
              conversationId: args.conversationId,
              content: text,
            });
            return { text, metadata: null };
          }
          // Haven't asked yet — start progressive questioning
          const text = `Sure! I can provide a location-specific agriculture advisory. Please tell me your **district and state** (for example, Pune, Maharashtra). \ud83c\udf3e`;
          await ctx.runMutation(api.chat.saveAssistantMessage, {
            conversationId: args.conversationId,
            content: text,
          });
          return { text, metadata: null };
        }

        // ── Route C: We have location but need crop ──
        if (resolvedLocation && !resolvedCrop) {
          let nextQ = `Got it \u2014 you're in **${resolvedLocation}**. To give you crop-specific advice, which **crop** are you growing?\n\nCommon crops: rice, wheat, soybean, cotton, maize, tomato, potato, sugarcane, groundnut, pulses, etc.\n\nYou can also say **"general"** for a crop-agnostic advisory.`;
          await ctx.runMutation(api.chat.saveAssistantMessage, {
            conversationId: args.conversationId,
            content: nextQ,
          });
          return { text: nextQ, metadata: null };
        }

        // ── Route D: We have location + crop but need stage ──
        if (resolvedLocation && resolvedCrop && !resolvedStage) {
          let nextQ = `You're growing **${resolvedCrop}** in **${resolvedLocation}**. What is the current **growth stage**?\n\nStages: land preparation, sowing, germination, seedling, vegetative, flowering, fruiting, grain filling, maturity, harvest ready.\n\nSay **"unknown"** if you're not sure.`;
          await ctx.runMutation(api.chat.saveAssistantMessage, {
            conversationId: args.conversationId,
            content: nextQ,
          });
          return { text: nextQ, metadata: null };
        }

      } catch (err) {
        console.error("Agriculture context routing error:", err);
        // Fall through to normal routing
      }
    }

    // ── General Context Follow-Up (for non-agriculture short messages) ──
    const isShortFollowUp = content.length < 60 && (
      YES_ANSWERS.test(content) || NO_ANSWERS.test(content) ||
      /what about|how about|tonight|tomorrow|this weekend|next week|today|daily|hourly/i.test(content)
    );

    if (isShortFollowUp && !parsed.location && !isAgricultureIntent) {
      try {
        const genCtx = extractGeneralContext(agriMessages);
        
        if (genCtx.lastLocation && genCtx.lastWeatherData) {
          const timeRange = parseTimeExpression(content);
          const locName = genCtx.lastLocation;
          
          if (timeRange && timeRange.days <= 7) {
            try {
              const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: locName });
              if (results && results.length > 0) {
                const best = results[0];
                const freshWeather: import("./weather").WeatherData = await ctx.runAction(api.weather.fetchWeather, {
                  latitude: best.latitude,
                  longitude: best.longitude,
                  locationName: best.name,
                  country: best.country,
                  timezone: best.timezone || "auto",
                });
                
                let response: { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } };
                if (timeRange.days > 1) {
                  response = generateForecastResponse(freshWeather, content);
                } else {
                  response = generateCurrentResponse(freshWeather, content);
                }
                
                await ctx.runMutation(api.chat.saveAssistantMessage, {
                  conversationId: args.conversationId,
                  content: response.text,
                  metadata: response.metadata,
                });
                return response;
              }
            } catch (err) {
              console.error("General context follow-up weather fetch failed:", err);
            }
          }
          
          if (YES_ANSWERS.test(content)) {
            if (genCtx.lastIntent === "forecast") {
              parsed.location = locName;
              parsed.intent = "forecast";
            } else {
              try {
                const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: locName });
                if (results && results.length > 0) {
                  const best = results[0];
                  const freshWeather: import("./weather").WeatherData = await ctx.runAction(api.weather.fetchWeather, {
                    latitude: best.latitude,
                    longitude: best.longitude,
                    locationName: best.name,
                    country: best.country,
                    timezone: best.timezone || "auto",
                  });
                  const response = generateCurrentResponse(freshWeather, content);
                  await ctx.runMutation(api.chat.saveAssistantMessage, {
                    conversationId: args.conversationId,
                    content: response.text,
                    metadata: response.metadata,
                  });
                  return response;
                }
              } catch (err) {
                console.error("General context follow-up weather fetch failed:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error("General context extraction failed:", err);
      }
    }

    // ── Explain This Recommendation ──
    if (/^why|why is|why does|explain|why am i seeing|why this|reason for|because of/i.test(content) && content.length < 80) {
      try {
        const genCtx = extractGeneralContext(agriMessages);
        
        if (genCtx.lastWeatherData && genCtx.lastLocation) {
          const wd = genCtx.lastWeatherData;
          let text = `**Why am I seeing this?**\n\n`;
          text += `Based on the weather data for **${genCtx.lastLocation}**:\n\n`;
          text += `**Weather Factors:**\n`;
          text += `\u2022 Temperature: ${wd.current.temperature}\u00b0C (feels like ${wd.current.apparentTemperature}\u00b0C)\n`;
          text += `\u2022 Humidity: ${wd.current.humidity}%\n`;
          text += `\u2022 Wind: ${wd.current.windSpeed} km/h\n`;
          text += `\u2022 Condition: ${getWeatherDescription(wd.current.weatherCode)}\n`;
          text += `\u2022 UV Index: ${wd.current.uvIndex}\n`;
          if (wd.current.precipitation > 0) {
            text += `\u2022 Current precipitation: ${wd.current.precipitation}mm\n`;
          }
          text += `\n**Reasoning:**\n`;
          
          const reasons: string[] = [];
          if (wd.current.temperature >= 35) reasons.push(`\u2022 High temperature (${wd.current.temperature}\u00b0C) triggers heat advisories`);
          if (wd.current.temperature <= 5) reasons.push(`\u2022 Low temperature (${wd.current.temperature}\u00b0C) triggers cold advisories`);
          if (wd.current.humidity > 80) reasons.push(`\u2022 High humidity (${wd.current.humidity}%) may promote fungal disease conditions`);
          if (wd.current.humidity < 30) reasons.push(`\u2022 Low humidity (${wd.current.humidity}%) increases water stress for crops`);
          if (wd.current.windSpeed > 25) reasons.push(`\u2022 Strong winds (${wd.current.windSpeed} km/h) affect spraying and crop stability`);
          if (wd.current.windSpeed > 50) reasons.push(`\u2022 Very strong winds (${wd.current.windSpeed} km/h) pose risk of crop lodging and structural damage`);
          if (wd.current.weatherCode >= 61 && wd.current.weatherCode <= 65) reasons.push(`\u2022 Active rainfall may cause waterlogging and delay field operations`);
          if (wd.current.weatherCode >= 95) reasons.push(`\u2022 Thunderstorm activity poses immediate safety risks`);
          if (wd.current.uvIndex >= 8) reasons.push(`\u2022 Very high UV (${wd.current.uvIndex}) can cause sun damage to exposed crops`);
          
          const today = wd.daily[0];
          if (today && today.precipitationProbabilityMax > 70) reasons.push(`\u2022 High rain probability (${today.precipitationProbabilityMax}%) in the forecast affects field planning`);
          if (today && today.precipitationSum > 20) reasons.push(`\u2022 Significant rainfall expected (${today.precipitationSum}mm) increases waterlogging risk`);
          
          if (reasons.length === 0) {
            reasons.push(`\u2022 Current conditions are within normal ranges`);
            reasons.push(`\u2022 Recommendations are based on standard weather-crop interaction guidelines`);
          }
          
          text += reasons.join("\n");
          text += `\n\n**Conclusion:**\nThe recommendation is based on real-time weather data from Open-Meteo, interpreted through standard meteorological and agricultural interaction rules.`;
          text += `\n\n*WeatherGPT interpretation based on actual weather data. For official advisories, check [IMD Agromet](https://mausam.imd.gov.in/responsive/agromet_adv_ser_district_level_wx_forecast.php).*`;
          
          await ctx.runMutation(api.chat.saveAssistantMessage, {
            conversationId: args.conversationId,
            content: text,
          });
          return { text, metadata: null };
        }
      } catch (err) {
        console.error("Explain handler error:", err);
      }
    }

    // ── Route 0: Severe Weather / Critical Areas (IMD + Open-Meteo real-time) ──
    if (/critical|severe|danger|alert|warning|where.*bad|which.*area|which.*region|worst weather|extreme|disaster|hazard|dangerous/i.test(content) && /weather|climate|condition|temp|rain|wind|storm|heat|cold|flood|cyclone|place|area|region|warning|alerts/i.test(content)) {
      try {
        const criticalSpots: Array<{name: string; state: string; severity: string; warning: string; type: string; temperature?: number; windSpeed?: number}> = await ctx.runAction(api.weather.fetchCriticalWeatherSpots, {});
        
        let imdWarnings: Array<{district: string; state: string; warningMessage: string; colorCode: number}> = [];
        try {
          const imdData = await ctx.runAction(api.weather.fetchIMDWarnings, {});
          if (imdData.warnings && imdData.warnings.length > 0) {
            imdWarnings = imdData.warnings;
          }
        } catch { /* IMD may not always be available */ }

        const allCritical: Array<{name: string; state: string; severity: string; warning: string; type: string}> = [];
        
        for (const w of imdWarnings) {
          if (w.colorCode >= 3 && w.district && w.warningMessage) {
            allCritical.push({
              name: w.district,
              state: w.state,
              severity: w.colorCode === 4 ? "red" : "orange",
              warning: w.warningMessage,
              type: "IMD Warning",
            });
          }
        }
        
        for (const spot of criticalSpots) {
          if (spot.name && spot.warning && spot.severity !== "green") {
            allCritical.push(spot);
          }
        }

        const seen = new Set<string>();
        const unique = allCritical.filter((s) => {
          if (seen.has(s.name)) return false;
          seen.add(s.name);
          return true;
        });

        let filteredSpots = unique;
        const queryLocation = parsed.location || null;
        if (queryLocation) {
          const locLower = queryLocation.toLowerCase();
          filteredSpots = unique.filter((s) => {
            const nameMatch = s.name.toLowerCase().includes(locLower);
            const stateMatch = s.state && s.state.toLowerCase().includes(locLower);
            return nameMatch || stateMatch;
          });
        }

        const redSpots = filteredSpots.filter((s) => s.severity === "red");
        const orangeSpots = filteredSpots.filter((s) => s.severity === "orange");
        const yellowSpots = filteredSpots.filter((s) => s.severity === "yellow");

        let text = "";
        if (queryLocation) {
          const locCap = queryLocation.charAt(0).toUpperCase() + queryLocation.slice(1);
          text += "**\u26a0\ufe0f Weather Alerts for " + locCap + "**\n\n";
        } else {
          text += "**\u26a0\ufe0f Real-Time Weather Status Across India**\n\n";
        }

        const totalAlerts = redSpots.length + orangeSpots.length + yellowSpots.length;
        if (queryLocation) {
          if (totalAlerts === 0) {
            const locCap = queryLocation.charAt(0).toUpperCase() + queryLocation.slice(1);
            text += "No active severe weather alerts found specifically for **" + locCap + "** right now.\n\n";
            const allRedSpots = unique.filter((s) => s.severity === "red");
            const allOrangeSpots = unique.filter((s) => s.severity === "orange");
            const allYellowSpots = unique.filter((s) => s.severity === "yellow");
            const allTotal = allRedSpots.length + allOrangeSpots.length + allYellowSpots.length;
            if (allTotal > 0) {
              text += "**However, here are active alerts across India that may be relevant:**\n\n";
              for (const s of [...allRedSpots, ...allOrangeSpots, ...allYellowSpots]) {
                const icon = s.severity === "red" ? "\ud83d\udd34" : s.severity === "orange" ? "\ud83d\udfe0" : "\ud83d\udfe1";
                text += icon + " **" + s.name + "** (" + s.state + "): " + s.warning + "\n";
              }
              text += "\n";
            }
          } else {
            if (redSpots.length > 0) text += "**RED: " + redSpots.length + " alert(s)** | ";
            if (orangeSpots.length > 0) text += "**ORANGE: " + orangeSpots.length + " alert(s)** | ";
            if (yellowSpots.length > 0) text += "**YELLOW: " + yellowSpots.length + " alert(s)** | ";
            text += "\n";
          }
        } else {
          if (redSpots.length > 0) text += "**RED: " + redSpots.length + " areas** | ";
          if (orangeSpots.length > 0) text += "**ORANGE: " + orangeSpots.length + " areas** | ";
          if (yellowSpots.length > 0) text += "**YELLOW: " + yellowSpots.length + " areas** | ";
          if (totalAlerts === 0) text += "**All Clear** | ";
          text += "Scanning 40+ cities across India\n\n";
        }

        if (redSpots.length > 0) {
          text += "**\ud83d\udd34 RED ALERT - Immediate Danger:**\n";
          for (const s of redSpots) {
            text += "**" + s.name + "** (" + s.state + "): " + s.warning + "\n";
          }
          text += "\n";
        }

        if (orangeSpots.length > 0) {
          text += "**\ud83d\udfe0 ORANGE ALERT - High Risk:**\n";
          for (const s of orangeSpots) {
            text += "**" + s.name + "** (" + s.state + "): " + s.warning + "\n";
          }
          text += "\n";
        }

        if (yellowSpots.length > 0) {
          text += "**\ud83d\udfe1 YELLOW ALERT - Moderate Risk:**\n";
          for (const s of yellowSpots) {
            text += "**" + s.name + "** (" + s.state + "): " + s.warning + "\n";
          }
          text += "\n";
        }

        if (!queryLocation && totalAlerts === 0) {
          text += "**Good news!** No critical weather conditions detected across major Indian cities right now.\n\n";
          text += "Conditions are generally safe for travel and outdoor activities across the country.\n\n";
        }

        text += "---\n";
        text += "*Data from Open-Meteo real-time weather API, scanning 40+ Indian cities. ";
        text += "For the most accurate local warnings, also check [IMD](https://mausam.imd.gov.in) and [WMO Severe Weather](https://severeweather.wmo.int). Stay safe!*";

        await ctx.runMutation(api.chat.saveAssistantMessage, {
          conversationId: args.conversationId,
          content: text,
        });
        return { text, metadata: null };
      } catch (error) {
        const text = "I had trouble fetching real-time severe weather data. This can happen due to network issues.\n\nPlease try again in a moment, or ask me about the weather in a specific city like \"Weather in Mumbai\" for detailed conditions.";
        await ctx.runMutation(api.chat.saveAssistantMessage, {
          conversationId: args.conversationId,
          content: text,
        });
        return { text, metadata: null };
      }
    }

    // ── Route 1: NWP Model comparison (Feature 3) ──
    if (/gfs|ecmwf|forecast model|weather model|nwp|numerical|model.*compare|compare.*model/i.test(content)) {
      try {
        let modelName = "gfs_seamless";
        if (/ecmwf/i.test(content)) modelName = "ecmwf_ifs025";
        else if (/icon|dwd/i.test(content)) modelName = "icon_global";
        else if (/meteo.?france/i.test(content)) modelName = "meteofrance_seamless";
        else if (/compare|all/i.test(content)) modelName = "gfs_seamless";

        let locationName = "Mumbai";
        if (parsed.location) {
          locationName = parsed.location;
        } else {
          const locMatch = /(?:in|at|for|near)\s+([A-Za-z\s,.'-]+)/i.exec(content);
          if (locMatch) locationName = locMatch[1].replace(/[?.!,;:]+$/, "").trim().split(/\s+/).slice(0, 3).join(" ");
        }

        const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: locationName });
        if (results && results.length > 0) {
          const best = results[0];
          
          if (/compare/i.test(content)) {
            const models: Array<{model: string; daily: Array<{date: string; temperatureMax: number; temperatureMin: number; precipitationSum: number; weatherCode: number; windSpeedMax: number}>}> = await ctx.runAction(api.weather.fetchMultiModelComparison, {
              latitude: best.latitude, longitude: best.longitude, locationName: best.name,
            });
            let text = `**NWP Model Comparison for ${best.name}:**\n\n`;
            models.forEach((m: typeof models[0]) => {
              text += `**${m.model}:**\n`;
              m.daily.slice(0, 3).forEach((d: typeof m.daily[0]) => {
                text += `  ${d.date}: ${d.temperatureMax}\u00b0C / ${d.temperatureMin}\u00b0C, `;
                if (d.precipitationSum > 0) text += `${d.precipitationSum}mm rain`;
                else text += `dry`;
                text += `\n`;
              });
              text += `\n`;
            });
            text += `These forecasts come from different Numerical Weather Prediction (NWP) models used by meteorological agencies worldwide.`;
            
            await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
            return { text, metadata: null };
          }

          const nwpData: {model: string; location: {name: string; latitude: number; longitude: number}; daily: Array<{date: string; temperatureMax: number; temperatureMin: number; precipitationSum: number; weatherCode: number; windSpeedMax: number}>} = await ctx.runAction(api.weather.fetchNWPForecast, {
            latitude: best.latitude, longitude: best.longitude, locationName: best.name, model: modelName,
          });
          
          let text = `**${nwpData.model} Forecast for ${best.name}:**\n\n`;
          nwpData.daily.forEach((d: typeof nwpData.daily[0]) => {
            const wmo: Record<number, string> = { 0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 51: "Drizzle", 61: "Rain", 63: "Mod rain", 65: "Heavy rain", 71: "Snow", 80: "Showers", 95: "Thunderstorm" };
            text += `**${d.date}:** ${wmo[d.weatherCode] || "Unknown"}, ${d.temperatureMax}\u00b0C / ${d.temperatureMin}\u00b0C`;
            if (d.precipitationSum > 0) text += `, ${d.precipitationSum}mm rain`;
            text += `\n`;
          });
          text += `\nPowered by ${nwpData.model} via Open-Meteo.`;
          
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }
      } catch (error) {
        const text = `I couldn't fetch the NWP model data. Please try again or ask about the weather directly.`;
        await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
        return { text, metadata: null };
      }
    }

    // ── Route 2: Historical/Climate trends (Feature 7) ──
    if (/histor|last year|last month|previous|past.*weather|climate.*trend|average.*temp|what was the weather|how was the weather|record/i.test(content)) {
      try {
        let locationName = "Mumbai";
        if (parsed.location) {
          locationName = parsed.location;
        } else {
          const locMatch = /(?:in|at|for|near)\s+([A-Za-z\s,.'-]+)/i.exec(content);
          if (locMatch) locationName = locMatch[1].replace(/[?.!,;:]+$/, "").trim().split(/\s+/).slice(0, 3).join(" ");
        }

        const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: locationName });
        if (results && results.length > 0) {
          const best = results[0];
          
          const now = new Date();
          let startDate = "";
          let endDate = "";
          let periodLabel = "the past 30 days";
          
          if (/last year|past year|previous year|annual/i.test(content)) {
            const lastYear = now.getFullYear() - 1;
            startDate = `${lastYear}-01-01`;
            endDate = `${lastYear}-12-31`;
            periodLabel = `the year ${lastYear}`;
          } else if (/last month|previous month/i.test(content)) {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            startDate = lastMonth.toISOString().split("T")[0];
            endDate = lastMonthEnd.toISOString().split("T")[0];
            periodLabel = `the last month`;
          } else if (/last week|previous week/i.test(content)) {
            const lastWeek = new Date(now.getTime() - 14 * 86400000);
            startDate = lastWeek.toISOString().split("T")[0];
            endDate = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
            periodLabel = `the previous week`;
          } else {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
            startDate = thirtyDaysAgo.toISOString().split("T")[0];
            endDate = now.toISOString().split("T")[0];
            periodLabel = `the past 30 days`;
          }

          const historical = await ctx.runAction(api.weather.fetchHistoricalWeather, {
            latitude: best.latitude,
            longitude: best.longitude,
            locationName: best.name,
            country: best.country,
            startDate,
            endDate,
          });

          const hasData = historical.summary.totalDays > 0 && historical.summary.avgTempMax !== 0;
          
          let text: string = `**Climate Trend in ${best.name} during ${periodLabel}:**\n\n`;
          
          if (hasData) {
          text += `**Summary:**\n`;
          text += `\u2022 Average High: ${historical.summary.avgTempMax}\u00b0C\n`;
          text += `\u2022 Average Low: ${historical.summary.avgTempMin}\u00b0C\n`;
          text += `\u2022 Temperature Range: ${historical.summary.avgTempMin}\u00b0C to ${historical.summary.avgTempMax}\u00b0C\n`;
          text += `\u2022 Total Precipitation: ${historical.summary.totalPrecipitation} mm\n`;
          text += `\u2022 Rainy Days: ${historical.summary.rainyDays} out of ${historical.summary.totalDays} days\n`;
          if (historical.summary.hottestDay.date && historical.summary.hottestDay.temp > -999) {
            text += `\u2022 Hottest Day: ${historical.summary.hottestDay.date} (${historical.summary.hottestDay.temp}\u00b0C)\n`;
          }
          if (historical.summary.coldestDay.date && historical.summary.coldestDay.temp < 999) {
            text += `\u2022 Coldest Day: ${historical.summary.coldestDay.date} (${historical.summary.coldestDay.temp}\u00b0C)\n`;
          }
          
          text += `\n**Monthly Trend:**\n`;
          const monthlyData: Record<string, { temps: number[]; precip: number[] }> = {};
          historical.daily.forEach((d: {date: string; temperatureMax: number | null; temperatureMin: number | null; temperatureMean: number | null; precipitationSum: number; weatherCode: number; windSpeedMax: number}) => {
            const month = d.date.slice(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { temps: [], precip: [] };
            if (d.temperatureMax != null && d.temperatureMax !== 0) monthlyData[month].temps.push(d.temperatureMax);
            monthlyData[month].precip.push(d.precipitationSum);
          });
          Object.entries(monthlyData).forEach(([month, data]) => {
            if (data.temps.length > 0) {
              const avgTemp = (data.temps.reduce((a, b) => a + b, 0) / data.temps.length).toFixed(1);
              const totalPrecip = data.precip.reduce((a, b) => a + b, 0).toFixed(1);
              text += `\u2022 ${month}: Avg ${avgTemp}\u00b0C, ${totalPrecip}mm rain\n`;
            } else {
              const totalPrecip = data.precip.reduce((a, b) => a + b, 0).toFixed(1);
              text += `\u2022 ${month}: ${totalPrecip}mm rain\n`;
            }
          });

          text += `\n**Climate Insights:**\n`;
          if (historical.summary.avgTempMax >= 35) {
            text += `\u2022 ${best.name} experienced significant heat during this period with average highs of ${historical.summary.avgTempMax}\u00b0C\n`;
          } else if (historical.summary.avgTempMin <= 15) {
            text += `\u2022 ${best.name} had cooler conditions with average lows of ${historical.summary.avgTempMin}\u00b0C\n`;
          }
          if (historical.summary.rainyDays > historical.summary.totalDays * 0.5) {
            text += `\u2022 Heavy rainfall activity \u2014 more than half the days had rain\n`;
          } else if (historical.summary.rainyDays < historical.summary.totalDays * 0.15) {
            text += `\u2022 Mostly dry conditions with very few rainy days\n`;
          }
          const avgPrecip = historical.summary.totalDays > 0 ? (historical.summary.totalPrecipitation / historical.summary.totalDays).toFixed(1) : 0;
          text += `\u2022 Average daily precipitation: ${avgPrecip}mm\n`;
          } else {
            text += `The historical archive doesn't have complete temperature data for this period yet.\n\n`;
            text += `Based on ${best.name}'s known climate patterns:\n`;
            if (best.country === "India" || (best.latitude > 8 && best.latitude < 37 && best.longitude > 68 && best.longitude < 98)) {
              text += `\u2022 ${best.name} has a tropical climate with distinct wet and dry seasons\n`;
              text += `\u2022 Southwest monsoon (Jun-Sep) brings the bulk of rainfall\n`;
              text += `\u2022 Northeast monsoon (Oct-Dec) is important for southeastern India\n`;
              text += `\u2022 Summer temperatures typically range 30-45\u00b0C depending on the region\n`;
              text += `\u2022 Winter temperatures range 15-30\u00b0C in most of India\n`;
            } else {
              text += `\u2022 For specific climate patterns, try asking about current weather conditions\n`;
            }
            text += `\nYou can ask about current weather or a different time period for real data.`;
          }
          
          text += `\n\n*Data from Open-Meteo's historical weather archive. For detailed climate trend analysis, ask about specific patterns like rainfall trends, temperature anomalies, or seasonal comparisons.*`;
          
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }
      } catch (error) {
        const text = `I couldn't fetch historical weather data for that location. Please try a different city or time period.`;
        await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
        return { text, metadata: null };
      }
    }

    // ── Route 3: Has a location → fetch weather ──
    if (parsed.location) {
      try {
        const results = await ctx.runAction(api.weather.geocodeLocation, {
          query: parsed.location,
        });

        if (!results || results.length === 0) {
          const text = await callLLM(content, lang, args.apiKey);
          await ctx.runMutation(api.chat.saveAssistantMessage, {
            conversationId: args.conversationId,
            content: text,
          });
          return { text, metadata: null };
        }

        const best = results[0];

        const weatherData = await ctx.runAction(api.weather.fetchWeather, {
          latitude: best.latitude,
          longitude: best.longitude,
          locationName: best.name,
          country: best.country,
          timezone: best.timezone || "auto",
        });

        let response: { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } };

        if (parsed.intent === "forecast") {
          response = generateForecastResponse(weatherData, content);
        } else {
          response = generateCurrentResponse(weatherData, content);
        }

        await ctx.runMutation(api.chat.saveAssistantMessage, {
          conversationId: args.conversationId,
          content: response.text,
          metadata: response.metadata,
        });

        return response;
      } catch (error) {
        const text = generateErrorResponse(
          error instanceof Error ? error.message : "Unknown error"
        );
        await ctx.runMutation(api.chat.saveAssistantMessage, {
          conversationId: args.conversationId,
          content: text,
        });
        return { text, metadata: null };
      }
    }

    // ── No location → signal frontend to call Gemini directly ──
    return { text: null, metadata: null, useClientLLM: true };
  },
});

// Import the api reference
import { api } from "./_generated/api";
