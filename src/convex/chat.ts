import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

const WMO_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "\u2600\ufe0f" },
  1: { description: "Mainly clear", icon: "\U0001f324\ufe0f" },
  2: { description: "Partly cloudy", icon: "\u26c5" },
  3: { description: "Overcast", icon: "\u2601\ufe0f" },
  45: { description: "Foggy", icon: "\U0001f32b\ufe0f" },
  48: { description: "Depositing rime fog", icon: "\U0001f32b\ufe0f" },
  51: { description: "Light drizzle", icon: "\U0001f326\ufe0f" },
  53: { description: "Moderate drizzle", icon: "\U0001f326\ufe0f" },
  55: { description: "Dense drizzle", icon: "\U0001f327\ufe0f" },
  61: { description: "Slight rain", icon: "\U0001f327\ufe0f" },
  63: { description: "Moderate rain", icon: "\U0001f327\ufe0f" },
  65: { description: "Heavy rain", icon: "\U0001f327\ufe0f" },
  71: { description: "Slight snow", icon: "\u2744\ufe0f" },
  73: { description: "Moderate snow", icon: "\u2744\ufe0f" },
  75: { description: "Heavy snow", icon: "\u2744\ufe0f" },
  80: { description: "Slight rain showers", icon: "\U0001f326\ufe0f" },
  81: { description: "Moderate rain showers", icon: "\U0001f327\ufe0f" },
  82: { description: "Violent rain showers", icon: "\u26c8\ufe0f" },
  95: { description: "Thunderstorm", icon: "\u26c8\ufe0f" },
  96: { description: "Thunderstorm with hail", icon: "\u26c8\ufe0f" },
  99: { description: "Thunderstorm with heavy hail", icon: "\u26c8\ufe0f" },
};

function getWeatherDescription(code: number): string {
  return WMO_CODES[code]?.description ?? "Unknown";
}

function getWindDirection(degrees: number): string {
  const d = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return d[Math.round(degrees / 22.5) % 16];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getUVLevel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

// ─── Agriculture context types ──────────────────────────────────────────────

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
  "rice","wheat","soybean","soyabean","cotton","maize","corn","sugarcane","tomato","potato",
  "groundnut","chickpea","mustard","onion","chilli","turmeric","banana","mango","grape","tea",
  "coffee","coconut","pulses","lentil","pea","bean","barley","jowar","bajra","ragi","millet",
  "sunflower","castor","jute","sesame","cumin","coriander","ginger","garlic","cabbage",
  "cauliflower","brinjal","okra","pumpkin","cucumber","watermelon","papaya","pineapple",
];

const CROP_STAGES = [
  "land preparation","sowing","germination","seedling","vegetative","flowering","fruiting",
  "grain filling","maturity","harvest ready","harvesting","post harvest","transplanting",
  "tillering","booting","heading","ripening","boll development","pod development","tasseling","silking","nursery",
];

const INDIAN_STATES = [
  "andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa","gujarat",
  "haryana","himachal pradesh","jharkhand","karnataka","kerala","madhya pradesh","maharashtra",
  "manipur","meghalaya","mizoram","nagaland","odisha","punjab","rajasthan","sikkim",
  "tamil nadu","telangana","tripura","uttar pradesh","uttarakhand","west bengal","delhi",
];

const IRRIGATION_TYPES = ["irrigated","rainfed","sprinkler","drip"];
const SOIL_TYPES = ["clay","sandy","loam","silt","peaty"];
const YES_ANSWERS = /^(yes|yeah|yep|yup|sure|ok|okay|y|haan|ha|ji|please|do it|go ahead|definitely|absolutely)$/i;
const NO_ANSWERS = /^(no|nah|nope|nahi|n|never|skip)$/i;

function isFollowUpAnswer(msg: string): boolean {
  const t = msg.trim();
  if (t.length > 50) return false;
  if (YES_ANSWERS.test(t) || NO_ANSWERS.test(t)) return true;
  const words = t.split(/\s+/);
  if (words.length > 4) return false;
  const l = t.toLowerCase();
  if (CROP_NAMES.some(c => l.includes(c))) return true;
  if (CROP_STAGES.some(s => l.includes(s))) return true;
  if (IRRIGATION_TYPES.some(t2 => l.includes(t2))) return true;
  if (SOIL_TYPES.some(t2 => l.includes(t2))) return true;
  if (words.length <= 3 && /^[A-Z]/.test(t)) return true;
  if (/^(today|tomorrow|this week|next week|daily|weekly)$/i.test(l)) return true;
  return false;
}

function extractAgriContext(messages: Array<{ role: string; content: string; metadata?: { location?: string; weatherData?: import("./weather").WeatherData } }>): AgriContext {
  const ctx: AgriContext = { location: null, state: null, crop: null, cropStage: null, soilType: null, irrigationType: null, lastAssistantAskedFor: null, weatherData: null };
  for (const msg of messages) {
    const c = msg.content.toLowerCase();
    const fc = msg.content;
    if (msg.metadata?.location && !ctx.location) ctx.location = msg.metadata.location;
    if (msg.metadata?.weatherData) ctx.weatherData = msg.metadata.weatherData;
    if (msg.role === "user") {
      for (const crop of CROP_NAMES) { if (c.includes(crop)) { ctx.crop = crop.charAt(0).toUpperCase() + crop.slice(1); break; } }
      for (const stage of CROP_STAGES) { if (c.includes(stage)) { ctx.cropStage = stage.charAt(0).toUpperCase() + stage.slice(1); break; } }
      if (c.includes("general") || c.includes("overall")) ctx.crop = "General";
      for (const soil of SOIL_TYPES) { if (c.includes(soil)) { ctx.soilType = soil.charAt(0).toUpperCase() + soil.slice(1); break; } }
      for (const irr of IRRIGATION_TYPES) { if (c.includes(irr)) { ctx.irrigationType = irr.charAt(0).toUpperCase() + irr.slice(1); break; } }
      for (const state of INDIAN_STATES) { if (c.includes(state)) { ctx.state = state.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "); break; } }
      if (!ctx.location) {
        const m = /(?:in|at|from|near|of|for)\s+([A-Za-z\s,.'-]+)/i.exec(fc);
        if (m) { const cand = m[1].replace(/[?.!,;:]+$/, "").trim().split(/\s+/).slice(0, 3).join(" "); if (cand.length >= 2) ctx.location = cand; }
      }
    }
    if (msg.role === "assistant") {
      if (/district|location|where|which city|which district/i.test(c)) ctx.lastAssistantAskedFor = "location";
      else if (/which crop|what crop|crop.*grow/i.test(c)) ctx.lastAssistantAskedFor = "crop";
      else if (/growth stage|crop stage|what.*stage|current.*stage/i.test(c)) ctx.lastAssistantAskedFor = "cropStage";
    }
  }
  return ctx;
}

// ─── General context ────────────────────────────────────────────────────────

interface GeneralContext { lastLocation: string | null; lastWeatherData: import("./weather").WeatherData | null; lastIntent: string | null; }

function extractGeneralContext(messages: Array<{ role: string; content: string; metadata?: { location?: string; country?: string; weatherData?: import("./weather").WeatherData }; timestamp?: number }>): GeneralContext {
  const ctx: GeneralContext = { lastLocation: null, lastWeatherData: null, lastIntent: null };
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "assistant" && m.metadata?.weatherData) { ctx.lastWeatherData = m.metadata.weatherData; ctx.lastLocation = m.metadata.location || null; break; }
  }
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "assistant") {
      if (/forecast|7.day/i.test(m.content)) ctx.lastIntent = "forecast";
      else if (/alert|severe/i.test(m.content)) ctx.lastIntent = "alert";
      else if (/climate|trend/i.test(m.content)) ctx.lastIntent = "climate";
      else if (/temperature|conditions|current/i.test(m.content)) ctx.lastIntent = "current";
      else if (/agri|crop|farm|irrigat/i.test(m.content)) ctx.lastIntent = "agriculture";
      break;
    }
  }
  return ctx;
}

// ─── Query parsing ──────────────────────────────────────────────────────────

interface ParsedQuery { location: string | null; intent: "current"|"forecast"|"comparison"|"general"|"travel"|"advisory"; dateRange?: number; isWeatherQuery: boolean; isGeneralQuery: boolean; isTravelQuery?: boolean; isAdvisoryQuery?: boolean; }

const WEATHER_KEYWORDS = [
  "weather","temperature","temp","forecast","rain","raining","rainy","snow","storm","thunder","lightning",
  "wind","windy","humidity","cloud","cloudy","fog","foggy","sunny","sun","uv","heat","cold","warm","hot",
  "freeze","freezing","frost","dew","precipitation","barometer","pressure","visibility","sunrise","sunset",
  "monsoon","cyclone","typhoon","hurricane","tornado","flooding","flood","drought","hail","drizzle","shower",
  "overcast","clear sky","mist","haze","thunderstorm","climate","extreme weather","critical climate",
  // Analytical/global intent keywords
  "critical","severe","danger","hazard","risk","alert","warning","dangerous",
  "areas","regions","locations","monitored","worst","best","highest","lowest","most",
  "compare","comparison","vs","versus","overall","summary","summary of",
  "across","nationwide","everywhere","all locations","all areas",
];

const GENERAL_PATTERNS = [
  /^(who|what|when|where|why|how|which|can|could|would|should|do|does|did|is|are|was|were|will)\s/i,
  /^(tell me|explain|describe|define|name|list|give me|show me|help me)/i,
  /^(joke|funny|laugh|humor|riddle)/i,
  /^(thank|thanks|thx|please|sorry|hello|hi|hey|bye|goodbye)/i,
  /^(write|create|make|generate|translate|convert|calculate|solve)/i,
  /^(recommend|suggest|best|top|worst|compare|difference between)/i,
];

function isWeatherIntent(msg: string): boolean {
  return WEATHER_KEYWORDS.some(kw => msg.includes(kw));
}

function isGeneralIntent(msg: string): boolean {
  return GENERAL_PATTERNS.some(p => p.test(msg));
}

function parseQuery(userMessage: string): ParsedQuery {
  const msg = userMessage.toLowerCase().trim();
  let location: string | null = null;
  let intent: ParsedQuery["intent"] = "current";
  let dateRange: number | undefined;
  let isWeatherQuery = false;
  let isGeneralQuery = false;

  const hasNonLatin = /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0B00-\u0B7F\u0C00-\u0C7F\u0D00-\u0D7F]/.test(userMessage);
  if (hasNonLatin && msg.length > 2) isGeneralQuery = true;

  isWeatherQuery = isWeatherIntent(msg);
  if (!isGeneralQuery) isGeneralQuery = isGeneralIntent(msg);

  const hasQuestionWord = /^(what|where|how|why|which|who|when|explain|tell me|describe)/i.test(msg);
  const hasWeatherPreposition = /\b(?:weather|temperature|temp|forecast|rain|raining|snow|storm|wind|humidity|sunrise|sunset)\s+(?:in|at|for|near|of)\b/i.test(msg) ||
    /\b(?:in|at|for|near)\s+(?:[A-Z][a-z]+|my)\b/.test(userMessage);
  const isKnowledgeQuestion = hasQuestionWord && !hasWeatherPreposition && isGeneralQuery;

  // Strategy 0: "what about X", "how about X" — explicit location change
  if (!location && !isKnowledgeQuestion) {
    const changeMatch = /(?:what\s+about|how\s+about|and)\s+([A-Za-z\s,.'-]+)/i.exec(userMessage);
    if (changeMatch) {
      const cand = changeMatch[1].replace(/[?.!,;:]+$/, "").trim().split(/\s+/).slice(0, 3).join(" ");
      if (cand.length >= 2) { location = cand; isWeatherQuery = true; }
    }
  }

  // Strategy 1: Known city names
  if (!location && !isKnowledgeQuestion) {
    for (const city of INDIAN_LOCATIONS) { if (msg.includes(city.toLowerCase())) { location = city; break; } }
  }

  // Strategy 2: Prepositions
  if (!location && !isKnowledgeQuestion) {
    const preMatch = /(?:in|at|near|around|from|to|of|for|visit|going to|travel to|staying in|weather of|weather in|weather for)\s+([A-Za-z\s,.'-]+)/i.exec(userMessage);
    if (preMatch) { const cand = preMatch[1].replace(/[?.!,;:]+$/, "").trim().split(/\s+/).slice(0, 4).join(" "); if (cand.length >= 2) location = cand; }
  }

  // Strategy 3: Last proper noun
  if (!location && isWeatherQuery) {
    const matches = userMessage.match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/g);
    if (matches) {
      const common = new Set(["Weather","What","Where","When","How","Why","Which","Current","Today","Tomorrow","This","That","There","Here","I","Want","To","Is","The","My","And","But","With","For","About","Like"]);
      for (let i = matches.length - 1; i >= 0; i--) { if (!common.has(matches[i])) { location = matches[i]; break; } }
    }
  }

  const isTravelQuery = /visit|travel|trip|tour|vacation|holiday|plan.*go|going.*to|should.*go|can.*go|best.*time/i.test(msg);
  const isAdvisoryQuery = /should.*i|is.*it.*safe|advice|recommend|suggest|tip|pack|carry/i.test(msg);

  if (isTravelQuery || isAdvisoryQuery) intent = "travel";
  else if (msg.includes("forecast") || msg.includes("week") || msg.includes("7 day") || msg.includes("coming days")) intent = "forecast";
  if (msg.includes("tomorrow")) { intent = "forecast"; dateRange = 2; }
  if (msg.includes("compare") || msg.includes("difference") || msg.includes("vs")) intent = "comparison";
  if (msg.includes("today") || msg.includes("now") || msg.includes("current")) intent = "current";

  if (isKnowledgeQuestion && !isWeatherQuery) location = null;
  if (location) isWeatherQuery = true;

  return { location, intent, dateRange, isWeatherQuery, isGeneralQuery, isTravelQuery, isAdvisoryQuery };
}

const INDIAN_LOCATIONS = [
  "Mumbai","Delhi","Bangalore","Chennai","Kolkata","Hyderabad","Pune","Ahmedabad","Jaipur","Lucknow","Goa","Panaji",
  "Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam","Patna","Vadodara","Ghaziabad","Ludhiana",
  "Agra","Nashik","Faridabad","Meerut","Rajkot","Varanasi","Srinagar","Aurangabad","Dhanbad","Amritsar",
  "Ranchi","Howrah","Coimbatore","Jabalpur","Gwalior","Vijayawada","Jodhpur","Madurai","Raipur","Kochi",
  "Chandigarh","Thiruvananthapuram","Dehradun","Mysore","Udaipur","Shimla","Manali","Goa","Ooty",
  "Kodaikanal","Darjeeling","Gangtok","Shillong","Imphal","Bhubaneswar","Cuttack","Siliguri","Jammu","Leh",
  "Haridwar","Rishikesh","Pushkar","Ajmer","Jaisalmer","Kota","Bikaner","Mathura","Prayagraj","Hampi",
  "Mangalore","Erode","Salem","Tiruchirappalli","Tirunelveli","Thanjavur","Vellore","Rameswaram","Kanyakumari",
  "Warangal","Guntur","Nellore","Tirupati","New York","London","Tokyo","Paris","Sydney","Dubai","Singapore",
  "Berlin","Toronto","Los Angeles","Chicago","Seoul","Bangkok","Istanbul","Cairo","Nairobi","Lagos",
  "Rio de Janeiro","Buenos Aires","Mexico City","Lima","Bogota","Santiago","Johannesburg","Cape Town",
  "Rome","Barcelona","Amsterdam","Vienna","Prague","Zurich","Stockholm","Oslo","Madrid","Lisbon",
  "Pakistan","Bangladesh","Sri Lanka","Nepal","Bhutan","Maldives","Afghanistan","Myanmar","China","Japan",
  "Thailand","Vietnam","Indonesia","Philippines","Malaysia","United States","United Kingdom","Canada","Australia",
  "Germany","France","Italy","Spain","Russia","Brazil","Mexico","South Africa","Egypt","Turkey","Saudi Arabia","UAE",
];

// ─── Response generation ────────────────────────────────────────────────────

function generateConversationalGreeting(data: import("./weather").WeatherData, userQuery: string): string {
  const { location, current } = data;
  const condition = getWeatherDescription(current.weatherCode);
  const hour = new Date().getHours();
  const tod = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const lq = userQuery.toLowerCase();
  const isTravel = /visit|travel|trip|tour|vacation|holiday|plan.*go|should.*go|best.*time|worth.*visit|explore/i.test(lq);

  let intro = "";
  if (isTravel) {
    intro = ["Great thinking! Let me give you a complete picture of " + location.name + ".","Awesome choice! Here's everything about visiting " + location.name + " right now.","Let me break down " + location.name + " for you \u2014 weather, conditions, and tips!"][Math.floor(Math.random() * 3)];
  } else {
    intro = ["Good " + tod + "! I just checked the weather in " + location.name + " for you.","Here's what's happening in " + location.name + " right now!","Great question! Let me tell you about the weather in " + location.name + ".","I pulled up the latest conditions for " + location.name + "."][Math.floor(Math.random() * 4)];
  }
  if (current.temperature >= 35) intro += " It's quite hot \u2014 " + Math.round(current.temperature) + "\u00b0C and " + condition.toLowerCase() + ".";
  else if (current.temperature <= 10) intro += " It's chilly at " + Math.round(current.temperature) + "\u00b0C with " + condition.toLowerCase() + ".";
  else if (current.weatherCode >= 61 && current.weatherCode <= 65) intro += " Heads up \u2014 it's raining in " + location.name + " right now.";
  else if (current.weatherCode >= 95) intro += " There's a thunderstorm in " + location.name + " right now. Please stay safe!";
  else if (current.weatherCode <= 1) intro += " Beautiful " + condition.toLowerCase() + " day there!";
  else intro += " The conditions are " + condition.toLowerCase() + " around " + Math.round(current.temperature) + "\u00b0C.";
  return intro;
}

function generateAgriAdvisory(data: import("./weather").WeatherData): string {
  const { current, daily } = data;
  const today = daily[0];
  let t = "\n\nAgriculture Advisory:\n";
  if (current.temperature >= 35) t += "\u2022 Heat stress risk \u2014 ensure adequate irrigation\n";
  else if (current.temperature <= 10) t += "\u2022 Frost risk \u2014 consider protective measures\n";
  else t += "\u2022 Good conditions for most agricultural activities\n";
  if (today && today.precipitationProbabilityMax > 50) t += "\u2022 Delay pesticide/fertilizer \u2014 rain expected\n";
  else if (today && today.precipitationProbabilityMax < 20) t += "\u2022 Dry conditions \u2014 ensure adequate irrigation\n";
  if (current.windSpeed > 25) t += "\u2022 Strong winds \u2014 avoid spraying\n";
  if (current.humidity > 80) t += "\u2022 High humidity \u2014 watch for fungal diseases\n";
  return t;
}

function generateCurrentResponse(data: import("./weather").WeatherData, userQuery: string): { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } } {
  const { location, current, daily } = data;
  const today = daily[0];
  const condition = getWeatherDescription(current.weatherCode);
  const windDir = getWindDirection(current.windDirection);
  let text = generateConversationalGreeting(data, userQuery);
  text += "\n\nHere are the details:\n";
  text += "\u2022 **Temperature:** " + current.temperature + "\u00b0C (feels like " + current.apparentTemperature + "\u00b0C)\n";
  text += "\u2022 **Conditions:** " + condition + "\n";
  text += "\u2022 **Humidity:** " + current.humidity + "%\n";
  text += "\u2022 **Wind:** " + current.windSpeed + " km/h " + windDir + "\n";
  if (current.precipitation > 0) text += "\u2022 **Precipitation:** " + current.precipitation + " mm\n";
  text += "\u2022 **UV Index:** " + current.uvIndex + "\n";
  if (today) {
    text += "\n**Today's forecast:**\n";
    text += "\u2022 High of " + today.temperatureMax + "\u00b0C, low of " + today.temperatureMin + "\u00b0C\n";
    if (today.precipitationProbabilityMax > 0) text += "\u2022 " + today.precipitationProbabilityMax + "% chance of rain\n";
  }
  if (current.temperature >= 35) text += "\n\u2757 Stay hydrated and avoid peak sun hours.";
  else if (current.weatherCode >= 61 && current.weatherCode <= 65) text += "\n\u2757 Don't forget your umbrella!";
  else text += "\n\u2757 Great conditions to be outdoors!";
  if (current.weatherCode >= 95) text += "\n\u26a0\ufe0f Thunderstorm alert \u2014 seek shelter indoors!";
  const query = userQuery.toLowerCase();
  if (/farm|crop|agri|irrigat|harvest/i.test(query)) text += generateAgriAdvisory(data);
  if (/visit|travel|trip|tour/i.test(query)) text += "\n\n**Travel Advisory:**\n\u2022 Pack " + (current.temperature < 15 ? "warm layers" : "light clothes") + "\n\u2022 " + (current.uvIndex >= 6 ? "Bring sunscreen!" : "Good for outdoor activities!") + "\n";
  const now = new Date();
  text += "\n\n---\n**Source:** Open-Meteo Weather API | Updated: " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + "\n*WeatherGPT interpretation. For official warnings, check [IMD](https://mausam.imd.gov.in).*";
  return { text, metadata: { location: location.name, country: location.country, latitude: location.latitude, longitude: location.longitude, weatherData: data } };
}

function generateForecastResponse(data: import("./weather").WeatherData, userQuery: string): { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } } {
  const { location, daily } = data;
  let text = ["Here's the next week in " + location.name + "!","Let me walk you through the forecast for " + location.name + ".","Planning ahead? Here's the 7-day outlook for " + location.name + "."][Math.floor(Math.random() * 3)] + "\n\n";
  daily.forEach((day, i) => {
    const condition = getWeatherDescription(day.weatherCode);
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatDate(day.date);
    text += "**" + label + ":** " + condition + ", " + day.temperatureMin + "\u00b0C \u2013 " + day.temperatureMax + "\u00b0C";
    if (day.precipitationProbabilityMax > 0) text += ", " + day.precipitationProbabilityMax + "% rain";
    text += "\n";
  });
  const maxT = Math.max(...daily.map(d => d.temperatureMax));
  const minT = Math.min(...daily.map(d => d.temperatureMin));
  const rainyDays = daily.filter(d => d.precipitationProbabilityMax > 50).length;
  text += "\n**Week at a glance:**\n";
  text += "\u2022 Range: " + minT + "\u00b0C to " + maxT + "\u00b0C\n";
  if (rainyDays > 0) text += "\u2022 " + rainyDays + " rainy day" + (rainyDays !== 1 ? "s" : "") + " expected\n";
  else text += "\u2022 Mostly dry week ahead!\n";
  if (rainyDays >= 4) text += "\nWet week \u2014 keep that umbrella handy!";
  else if (maxT >= 35) text += "\nHot week \u2014 plan outdoor activities for cooler hours.";
  else text += "\nPleasant conditions \u2014 great week to be outdoors!";
  const query = userQuery.toLowerCase();
  if (/farm|crop|agri|irrigat|harvest/i.test(query)) text += generateAgriAdvisory(data);
  const now = new Date();
  text += "\n\n---\n**Source:** Open-Meteo Weather API | Updated: " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + "\n*WeatherGPT interpretation. For official warnings, check [IMD](https://mausam.imd.gov.in).*";
  return { text, metadata: { location: location.name, country: location.country, latitude: location.latitude, longitude: location.longitude, weatherData: data } };
}

function generateErrorResponse(error: string): string {
  if (error.includes("not found")) return "I couldn't find that location. Try a different spelling or add the state name.";
  return "I encountered an issue getting weather data. Please try again.";
}

function generateHelpResponse(): string {
  return "**WeatherGPT Help:**\n\n**Weather:** \"Weather in Mumbai\"\n**Forecast:** \"7-day forecast for Tokyo\"\n**Agriculture:** \"Should I irrigate crops?\"\n**Alerts:** \"Any cyclone alerts for Chennai?\"\n**Climate:** \"Climate trend in Pune last year\"\n**General:** Ask me anything!\n**Follow-up:** \"What about tomorrow?\" (uses same location)";
}

// ─── LLM Integration ────────────────────────────────────────────────────────

async function callLLM(userMessage: string, lang: string, apiKey?: string): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  if (!key) return "**GEMINI_API_KEY not configured.** For general knowledge, add a Gemini API key. I can still help with weather, forecasts, and agriculture!";
  const langNames: Record<string, string> = { en: "English", hi: "Hindi", ta: "Tamil", bn: "Bengali", te: "Telugu", mr: "Marathi", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi" };
  const langName = langNames[lang] || "English";
  const systemPrompt = "You are WeatherGPT, an intelligent weather assistant built for Smart India Hackathon 2026 by Team Craxzy. Respond in " + langName + ". Be helpful, concise, and use markdown. Never fabricate weather data or official warnings. Support Indian context.";
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: userMessage, config: { systemInstruction: systemPrompt, temperature: 0.8, topP: 0.95, maxOutputTokens: 4096 } });
    return response.text || "I couldn't generate a response. Please try asking about weather.";
  } catch (error) {
    console.error("Gemini error:", error);
    return "I'm having trouble with the AI service. Please ask me about weather \u2014 I can provide real-time weather data without the AI!";
  }
}

// ─── Chat mutations and queries ─────────────────────────────────────────────

export const sendMessage = mutation({
  args: { conversationId: v.id("conversations"), content: v.string() },
  handler: async (ctx, args) => { await ctx.db.insert("messages", { conversationId: args.conversationId, role: "user", content: args.content, timestamp: Date.now() }); return Date.now(); },
});

export const saveAssistantMessage = mutation({
  args: { conversationId: v.id("conversations"), content: v.string(), metadata: v.optional(v.object({ location: v.optional(v.string()), country: v.optional(v.string()), latitude: v.optional(v.number()), longitude: v.optional(v.number()), weatherData: v.optional(v.any()) })) },
  handler: async (ctx, args) => { await ctx.db.insert("messages", { conversationId: args.conversationId, role: "assistant", content: args.content, timestamp: Date.now(), metadata: args.metadata }); },
});

export const createConversation = mutation({
  args: { title: v.optional(v.string()) },
  handler: async (ctx, args) => { const userId = (await ctx.auth.getUserIdentity())?.subject ?? "anonymous"; return await ctx.db.insert("conversations", { userId, title: args.title }); },
});

export const toggleStar = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => { const msg = await ctx.db.get(args.messageId); if (!msg) throw new Error("Not found"); await ctx.db.patch(args.messageId, { starred: !msg.starred }); },
});

export const getConversations = query({
  args: {},
  handler: async (ctx) => { const userId = (await ctx.auth.getUserIdentity())?.subject; if (!userId) return []; return await ctx.db.query("conversations").withIndex("by_user", (q) => q.eq("userId", userId)).order("desc").take(20); },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => { return await ctx.db.query("messages").withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId)).order("asc").collect(); },
});

export const getGeminiKey = query({
  args: {},
  handler: async (ctx) => { return process.env.GEMINI_API_KEY || ""; },
});

export const getStarredMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) return [];
    const userConvs = await ctx.db.query("conversations").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
    const convIds = new Set(userConvs.map(c => c._id));
    const starred = await ctx.db.query("messages").withIndex("by_starred", (q) => q.eq("starred", true)).order("desc").take(50);
    return starred.filter(m => convIds.has(m.conversationId)).map(m => ({ ...m, conversationTitle: userConvs.find(c => c._id === m.conversationId)?.title ?? "Conversation" }));
  },
});

// ─── Main chat action ───────────────────────────────────────────────────────

export const processMessage = action({
  args: { conversationId: v.id("conversations"), content: v.string(), language: v.optional(v.string()), apiKey: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const content = args.content.trim();
    const lang = args.language || "en";

    // Help
    if (content.toLowerCase() === "help" || content.toLowerCase() === "/help") {
      const text = generateHelpResponse();
      await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
      return { text, metadata: null };
    }

    // Greeting Handler (deterministic, no LLM needed)
    const trimmedLower = content.trim().toLowerCase();
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|namaskar|howdy|greetings)$/i.test(trimmedLower)) {
      const hour = new Date().getHours();
      const tg = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
      const gs = [
        tg + "! I'm WeatherGPT, your intelligent weather assistant.",
        "Hello! I'm WeatherGPT, ready to help you with weather, forecasts, and agriculture.",
        "Namaskar! How can I help you today? Ask me about weather, forecasts, weather alerts, or agriculture.",
        "Hey there! I'm WeatherGPT. Ask me about the weather anywhere!",
      ];
      const text = gs[Math.floor(Math.random() * gs.length)] + "\n\n**Try asking:**\n- \"Weather in Mumbai\"\n- \"7-day forecast for Delhi\"\n- \"Any cyclone alerts for Chennai?\"\n- \"Should I irrigate crops today?\"";
      await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
      return { text, metadata: null };
    }

    // Thank you / Goodbye
    if (/^(thanks?|thank you|shukriya|dhanyavaad|bye|goodbye|see ya|alvida)/i.test(trimmedLower)) {
      const isThank = /thanks?|thank you|shukriya|dhanyavaad/i.test(trimmedLower);
      const text = isThank
        ? "You're welcome! Is there anything else you'd like to know about the weather or agriculture?"
        : "Goodbye! Stay weather-aware, and feel free to come back anytime!";
      await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
      return { text, metadata: null };
    }

    // Parse the query
    const parsed = parseQuery(content);

    // Extract agriculture context
    let agriCtx: AgriContext = { location: null, state: null, crop: null, cropStage: null, soilType: null, irrigationType: null, lastAssistantAskedFor: null, weatherData: null };
    let agriMessages: Array<{ role: string; content: string; metadata?: { location?: string; weatherData?: import("./weather").WeatherData } }> = [];
    try {
      const allMessages = await ctx.runQuery(api.chat.getMessages, { conversationId: args.conversationId });
      agriMessages = allMessages.slice(-20);
      agriCtx = extractAgriContext(agriMessages);
    } catch (err) { console.error("Context extraction failed:", err); }

    // Agriculture intent detection
    const hasAgricultureContext = !!(agriCtx.crop || agriCtx.location);
    const isAgricultureKeyword = /agri|crop|farm|irrigat|sow|sowing|harvest|pest|fertiliz|spray|advisory|disease|fungal|waterlog|grow|growing|cultivat|my crop|my farm|field|plant/i.test(content);
    const isAgricultureQuestion = /should\s+i|can\s+i|will\s+this|will\s+the|is\s+my|what\s+should|how\s+my|affect|impact|risk|damage|protect|irrigat|spray|harvest|fertiliz|my\s+crop|my\s+soybean|my\s+wheat|my\s+rice|my\s+cotton|what\s+do\s+for/i.test(content);
    const isAgricultureIntent = isAgricultureKeyword || (hasAgricultureContext && isAgricultureQuestion);

    // ── Analytical/Global Data Intent Detection ──
    // These questions ask about OVERALL weather across multiple locations,
    // NOT about a specific city. Must be detected BEFORE agriculture routing.
    // Analytical: questions asking about MULTIPLE locations or overall conditions
    // These are NOT location-specific even if a country/region name is in the message
    const isAnalyticalByPattern = /where.*critical|which.*area|which.*location|which.*region|which.*worst|which.*best|which.*highest|which.*lowest|which.*most|where.*risk|where.*danger|where.*severe|where.*bad|where.*heavy|critical.*condition|severe.*condition|areas.*at risk|locations.*monitor|weather.*across|weather.*nationwide|overall.*weather|weather.*summary|give.*me.*summary|any.*critical|any.*severe|any.*major|what.*major|what.*concern|where.*attention|where.*focus|compare.*weather|compare.*condition|compare.*all|which.*worse|which.*better|highest.*rain|highest.*temp|most.*rain|least.*rain|rain.*highest|rain.*most|temp.*highest|temp.*most|wind.*strongest|wind.*highest|all.*location|all.*area|monitored.*area|critical.*area|risk.*area|danger.*area|alert.*area/i.test(content);
    // If pattern matches, it is analytical EVEN if a location like 'india' was extracted
    // The location is the SCOPE of analysis, not a filter
    const isAnalyticalIntent = isAnalyticalByPattern;

    // Global Data Analysis Handler
    if (isAnalyticalIntent) {
      try {
        // Fetch weather for multiple major Indian cities
        const majorCities = ["Mumbai","Delhi","Chennai","Kolkata","Hyderabad","Pune","Bangalore","Ahmedabad","Jaipur","Lucknow","Nagpur","Bhopal"];
        const cityWeatherResults: Array<{name: string; state: string; temp: number; humidity: number; rainProb: number; rainSum: number; windSpeed: number; weatherCode: number; condition: string}> = [];
        
        for (const city of majorCities) {
          try {
            const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: city });
            if (results && results.length > 0) {
              const best = results[0];
              const wd: import("./weather").WeatherData = await ctx.runAction(api.weather.fetchWeather, { latitude: best.latitude, longitude: best.longitude, locationName: best.name, country: best.country, timezone: best.timezone || "auto" });
              const today = wd.daily[0];
              cityWeatherResults.push({
                name: best.name, state: best.country,
                temp: wd.current.temperature, humidity: wd.current.humidity,
                rainProb: today ? today.precipitationProbabilityMax : 0,
                rainSum: today ? today.precipitationSum : 0,
                windSpeed: wd.current.windSpeed,
                weatherCode: wd.current.weatherCode,
                condition: getWeatherDescription(wd.current.weatherCode),
              });
            }
          } catch { /* skip failed cities */ }
        }

        if (cityWeatherResults.length === 0) {
          const text = "I couldn't fetch weather data for the monitored locations. Please try again.";
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }

        // Analyze the data
        const sorted_by_rain = [...cityWeatherResults].sort((a, b) => b.rainProb - a.rainProb);
        const sorted_by_temp = [...cityWeatherResults].sort((a, b) => b.temp - a.temp);
        const sorted_by_wind = [...cityWeatherResults].sort((a, b) => b.windSpeed - a.windSpeed);
        const criticalCities = cityWeatherResults.filter(c => c.rainProb > 70 || c.weatherCode >= 61 || c.weatherCode >= 95 || c.windSpeed > 40);
        const severeCities = cityWeatherResults.filter(c => c.weatherCode >= 95 || c.windSpeed > 50 || c.rainProb > 90);

        // Build structured data for LLM
        const dataLines: string[] = [];
        dataLines.push("REAL-TIME WEATHER DATA FOR " + cityWeatherResults.length + " INDIAN CITIES:");
        dataLines.push("");
        for (const c of cityWeatherResults) {
          dataLines.push(c.name + ": " + c.temp + "C, " + c.humidity + "% humidity, " + c.rainProb + "% rain prob, " + c.rainSum + "mm rain, " + c.windSpeed + " km/h wind, " + c.condition);
        }
        dataLines.push("");
        dataLines.push("CRITICAL/CONCERN AREAS (rain prob > 70% OR active rain OR thunderstorm OR strong wind): " + criticalCities.map(c => c.name).join(", ") + (criticalCities.length === 0 ? "None" : ""));
        dataLines.push("SEVERE AREAS (thunderstorm OR wind > 50 km/h OR rain > 90%): " + severeCities.map(c => c.name).join(", ") + (severeCities.length === 0 ? "None" : ""));
        dataLines.push("HIGHEST RAIN PROBABILITY: " + sorted_by_rain[0].name + " (" + sorted_by_rain[0].rainProb + "%)");
        dataLines.push("HIGHEST TEMPERATURE: " + sorted_by_temp[0].name + " (" + sorted_by_temp[0].temp + "C)");
        dataLines.push("STRONGEST WIND: " + sorted_by_wind[0].name + " (" + sorted_by_wind[0].windSpeed + " km/h)");

        // Build the LLM prompt
        const llmPrompt = [
          "You are WeatherGPT analyzing weather data across Indian cities.",
          "",
          "USER QUESTION: \"" + content + "\"",
          "",
          ...dataLines,
          "",
          "INSTRUCTIONS:",
          "- Answer the user's question using ONLY the real data above.",
          "- Identify which locations are critical, at risk, or noteworthy.",
          "- Provide specific city names and actual weather values.",
          "- Do NOT invent locations or data not in the list above.",
          "- If no locations are critical, say so clearly.",
          "- Use markdown formatting.",
          "- End with: '*Data from Open-Meteo real-time weather API, scanning ' + cityWeatherResults.length + ' Indian cities. Not an official warning.*'",
        ].join("\n");

        const text = await callLLM(llmPrompt, lang, args.apiKey);
        if (text && !text.startsWith("**Error:**")) {
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }
      } catch (err) {
        console.error("Global analysis error:", err);
        const text = "I had trouble analyzing the weather data across locations. Please try again.";
        await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
        return { text, metadata: null };
      }
    }

    // Agriculture routing (highest priority for agriculture-specific questions)
    if (isAgricultureIntent || (hasAgricultureContext && isFollowUpAnswer(content))) {
      try {
        let resolvedLocation = parsed.location || agriCtx.location;
        let resolvedCrop = agriCtx.crop;
        let resolvedStage = agriCtx.cropStage;
        const msgLower = content.toLowerCase().trim();

        // Compound: "Pune, soybean, flowering"
        if (!resolvedLocation && !resolvedCrop && content.includes(",")) {
          const parts = content.split(",").map(p => p.trim());
          for (const part of parts) {
            const pl = part.toLowerCase();
            if (!resolvedLocation && !CROP_NAMES.some(c => pl.includes(c)) && !CROP_STAGES.some(s => pl.includes(s))) resolvedLocation = part;
            else if (!resolvedCrop) { const cm = CROP_NAMES.find(c => pl.includes(c)); if (cm) resolvedCrop = cm.charAt(0).toUpperCase() + cm.slice(1); }
            else if (!resolvedStage) { const sm = CROP_STAGES.find(s => pl.includes(s)); if (sm) resolvedStage = sm.charAt(0).toUpperCase() + sm.slice(1); }
          }
        }

        // Validate: is answer a crop/stage, not a location?
        const isAnswerCropOrStage = CROP_NAMES.some(c => msgLower.includes(c)) || CROP_STAGES.some(s => msgLower.includes(s));

        if (agriCtx.lastAssistantAskedFor === "location" && isFollowUpAnswer(content) && !parsed.location) {
          if (isAnswerCropOrStage) {
            const cm = CROP_NAMES.find(c => msgLower.includes(c)); if (cm) resolvedCrop = cm.charAt(0).toUpperCase() + cm.slice(1);
            const sm = CROP_STAGES.find(s => msgLower.includes(s)); if (sm) resolvedStage = sm.charAt(0).toUpperCase() + sm.slice(1);
          } else {
            resolvedLocation = content.trim();
            parsed.location = resolvedLocation;
          }
        }

        if (agriCtx.lastAssistantAskedFor === "crop" && isFollowUpAnswer(content)) {
          if (msgLower.includes("general")) resolvedCrop = "General";
          else { const cm = CROP_NAMES.find(c => msgLower.includes(c)); if (cm) resolvedCrop = cm.charAt(0).toUpperCase() + cm.slice(1); else resolvedCrop = content.trim().charAt(0).toUpperCase() + content.trim().slice(1); }
        }

        if (agriCtx.lastAssistantAskedFor === "cropStage" && isFollowUpAnswer(content)) {
          const sm = CROP_STAGES.find(s => msgLower.includes(s)); if (sm) resolvedStage = sm.charAt(0).toUpperCase() + sm.slice(1); else resolvedStage = content.trim().charAt(0).toUpperCase() + content.trim().slice(1);
        }

        if (YES_ANSWERS.test(msgLower) && agriCtx.lastAssistantAskedFor === "location" && !agriCtx.location) {
          const text = "Sure! Please tell me your district and state (e.g., Pune, Maharashtra).";
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }

        if (resolvedLocation && !parsed.location) parsed.location = resolvedLocation;

        // Route A: Have all info + agriculture question -> generate response
        if (resolvedLocation && resolvedCrop) {
          try {
            const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: resolvedLocation });
            if (results && results.length > 0) {
              const best = results[0];
              const weatherData: import("./weather").WeatherData = await ctx.runAction(api.weather.fetchWeather, { latitude: best.latitude, longitude: best.longitude, locationName: best.name, country: best.country, timezone: best.timezone || "auto" });
              const cp: string[] = [];
              cp.push("CONVERSATION CONTEXT:");
              cp.push("Location: " + best.name + ", " + best.country);
              cp.push("Crop: " + resolvedCrop);
              if (resolvedStage) cp.push("Growth Stage: " + resolvedStage);
              cp.push("");
              cp.push("CURRENT WEATHER in " + best.name + ":");
              cp.push("Temperature: " + weatherData.current.temperature + "C, Humidity: " + weatherData.current.humidity + "%, Wind: " + weatherData.current.windSpeed + " km/h");
              cp.push("Condition: " + getWeatherDescription(weatherData.current.weatherCode));
              cp.push("");
              cp.push("7-DAY FORECAST:");
              weatherData.daily.slice(0, 7).forEach((day: {date: string; temperatureMax: number; temperatureMin: number; weatherCode: number; precipitationProbabilityMax: number; precipitationSum: number; windSpeedMax: number}, i: number) => {
                const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : day.date;
                cp.push(label + ": " + day.temperatureMin + "-" + day.temperatureMax + "C, Rain: " + day.precipitationProbabilityMax + "%, " + day.precipitationSum + "mm");
              });
              cp.push("");
              cp.push("USER QUESTION: \"" + content + "\"");
              cp.push("");
              cp.push("You are WeatherGPT Agriculture Advisory for " + resolvedCrop + (resolvedStage ? " at " + resolvedStage + " stage" : "") + " in " + best.name + ".");
              cp.push("Using ONLY real weather data, provide actionable agriculture advisory covering:");
              cp.push("1. Weather Risk Assessment");
              cp.push("2. Direct answer to user's question");
              cp.push("3. Today's Recommended Actions (3-6)");
              cp.push("4. Irrigation Advisory");
              cp.push("5. 3-7 Day Outlook");
              cp.push("6. Pest & Disease Risk");
              cp.push("7. Farm Operation Windows");
              cp.push("8. Weather Alerts");
              cp.push("9. Confidence Level");
              cp.push("10. Sources");
              cp.push("");
              cp.push("RULES: Use ONLY real data. Never invent values. Label WeatherGPT interpretation vs official sources.");

              const enriched = cp.join("\n");
              const text = await callLLM(enriched, lang, args.apiKey);
              if (text && !text.startsWith("[DEBUG]") && !text.startsWith("**Error:**")) {
                await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text, metadata: { location: best.name, country: best.country, latitude: best.latitude, longitude: best.longitude, weatherData: weatherData as any } });
                return { text, metadata: { location: best.name, country: best.country, latitude: best.latitude, longitude: best.longitude, weatherData: weatherData as any } };
              }
            }
          } catch (err) { console.error("Agri weather fetch failed:", err); }
        }

        // Route B: Need location
        if (!resolvedLocation) {
          const text = agriCtx.lastAssistantAskedFor === "location"
            ? "Please tell me your district and state (e.g., Pune, Maharashtra)."
            : "Sure! I can provide a location-specific agriculture advisory. Please tell me your district and state (e.g., Pune, Maharashtra).";
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }

        // Route C: Need crop
        if (resolvedLocation && !resolvedCrop) {
          const text = "Got it \u2014 you're in **" + resolvedLocation + "**. Which **crop** are you growing?\n\nCommon: rice, wheat, soybean, cotton, maize, tomato, potato. Say \"general\" for crop-agnostic advice.";
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }

        // Route D: Need stage
        if (resolvedLocation && resolvedCrop && !resolvedStage) {
          const text = "You're growing **" + resolvedCrop + "** in **" + resolvedLocation + "**. What is the current **growth stage**?\n\nStages: land preparation, sowing, germination, seedling, vegetative, flowering, fruiting, maturity, harvest ready. Say \"unknown\" if unsure.";
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }
      } catch (err) { console.error("Agri routing error:", err); }
    }

    // General Context Follow-Up (non-agriculture short messages)
    const isShortFollowUp = content.length < 60 && (YES_ANSWERS.test(content) || NO_ANSWERS.test(content) || /what about|how about|tonight|tomorrow|this weekend|next week|today|daily|hourly/i.test(content));

    if (isShortFollowUp && !parsed.location && !isAgricultureIntent) {
      try {
        const genCtx = extractGeneralContext(agriMessages);
        if (genCtx.lastLocation && genCtx.lastWeatherData) {
          const locName = genCtx.lastLocation;
          try {
            const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: locName });
            if (results && results.length > 0) {
              const best = results[0];
              const fw: import("./weather").WeatherData = await ctx.runAction(api.weather.fetchWeather, { latitude: best.latitude, longitude: best.longitude, locationName: best.name, country: best.country, timezone: best.timezone || "auto" });
              const response = /tomorrow|week|7.day/i.test(content) ? generateForecastResponse(fw, content) : generateCurrentResponse(fw, content);
              await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: response.text, metadata: response.metadata as any });
              return response;
            }
          } catch (err) { console.error("Follow-up weather fetch failed:", err); }
        }
      } catch (err) { console.error("Context extraction failed:", err); }
    }

    // Explain This Recommendation
    if (/^why|why is|why does|explain|why am i seeing|reason for|because of/i.test(content) && content.length < 80) {
      try {
        const genCtx = extractGeneralContext(agriMessages);
        if (genCtx.lastWeatherData && genCtx.lastLocation) {
          const wd = genCtx.lastWeatherData;
          let text = "**Why am I seeing this?**\n\nBased on weather data for **" + genCtx.lastLocation + "**:\n\n**Weather Factors:**\n";
          text += "\u2022 Temperature: " + wd.current.temperature + "\u00b0C (feels " + wd.current.apparentTemperature + "\u00b0C)\n";
          text += "\u2022 Humidity: " + wd.current.humidity + "%\n";
          text += "\u2022 Wind: " + wd.current.windSpeed + " km/h\n";
          text += "\u2022 Condition: " + getWeatherDescription(wd.current.weatherCode) + "\n";
          text += "\n**Conclusion:** Recommendation based on real-time weather data from Open-Meteo.\n*For official advisories, check [IMD Agromet](https://mausam.imd.gov.in).*";
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }
      } catch (err) { console.error("Explain handler error:", err); }
    }

    // Route: Severe Weather
    if (/critical|severe|danger|alert|warning|where.*bad|which.*area|extreme|disaster|hazard/i.test(content) && /weather|climate|condition|rain|wind|storm|heat|cold|flood|cyclone/i.test(content)) {
      try {
        const spots: Array<{name: string; state: string; severity: string; warning: string; type: string}> = await ctx.runAction(api.weather.fetchCriticalWeatherSpots, {});
        let imd: Array<{district: string; state: string; warningMessage: string; colorCode: number}> = [];
        try { const d = await ctx.runAction(api.weather.fetchIMDWarnings, {}); if (d.warnings) imd = d.warnings; } catch {}
        const all: Array<{name: string; state: string; severity: string; warning: string; type: string}> = [];
        for (const w of imd) { if (w.colorCode >= 3 && w.district && w.warningMessage) all.push({ name: w.district, state: w.state, severity: w.colorCode === 4 ? "red" : "orange", warning: w.warningMessage, type: "IMD" }); }
        for (const s of spots) { if (s.name && s.warning && s.severity !== "green") all.push(s); }
        const seen = new Set<string>();
        const unique = all.filter(s => { if (seen.has(s.name)) return false; seen.add(s.name); return true; });

        let filtered = unique;
        if (parsed.location) { const ll = parsed.location.toLowerCase(); filtered = unique.filter(s => s.name.toLowerCase().includes(ll) || (s.state && s.state.toLowerCase().includes(ll))); }

        const red = filtered.filter(s => s.severity === "red");
        const orange = filtered.filter(s => s.severity === "orange");
        const yellow = filtered.filter(s => s.severity === "yellow");

        let text = parsed.location ? "**Weather Alerts for " + parsed.location.charAt(0).toUpperCase() + parsed.location.slice(1) + "**\n\n" : "**Real-Time Weather Status Across India**\n\n";
        const total = red.length + orange.length + yellow.length;
        if (total === 0) text += "No active severe weather alerts detected. Conditions are generally safe.\n\n";
        else {
          if (red.length > 0) { text += "**RED ALERT:**\n"; for (const s of red) text += "**" + s.name + "** (" + s.state + "): " + s.warning + "\n"; text += "\n"; }
          if (orange.length > 0) { text += "**ORANGE ALERT:**\n"; for (const s of orange) text += "**" + s.name + "** (" + s.state + "): " + s.warning + "\n"; text += "\n"; }
          if (yellow.length > 0) { text += "**YELLOW ALERT:**\n"; for (const s of yellow) text += "**" + s.name + "** (" + s.state + "): " + s.warning + "\n"; text += "\n"; }
        }
        text += "---\n*Source: Open-Meteo + IMD | For local warnings check [IMD](https://mausam.imd.gov.in) and [WMO](https://severeweather.wmo.int)*";
        await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
        return { text, metadata: null };
      } catch (error) {
        const text = "I had trouble fetching severe weather data. Please try again or ask about weather in a specific city.";
        await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
        return { text, metadata: null };
      }
    }

    // Route: NWP Model comparison
    if (/gfs|ecmwf|forecast model|weather model|nwp|numerical|model.*compare/i.test(content)) {
      try {
        let modelName = "gfs_seamless";
        if (/ecmwf/i.test(content)) modelName = "ecmwf_ifs025";
        let locName = parsed.location || "Mumbai";
        const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: locName });
        if (results && results.length > 0) {
          const best = results[0];
          const nwp: {model: string; daily: Array<{date: string; temperatureMax: number; temperatureMin: number; precipitationSum: number; weatherCode: number; windSpeedMax: number}>} = await ctx.runAction(api.weather.fetchNWPForecast, { latitude: best.latitude, longitude: best.longitude, locationName: best.name, model: modelName });
          let text = "**" + nwp.model + " Forecast for " + best.name + ":**\n\n";
          nwp.daily.forEach(d => { text += "**" + d.date + ":** " + d.temperatureMax + "\u00b0C / " + d.temperatureMin + "\u00b0C" + (d.precipitationSum > 0 ? ", " + d.precipitationSum + "mm rain" : ", dry") + "\n"; });
          text += "\nPowered by " + nwp.model + " via Open-Meteo.";
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }
      } catch (error) {
        const text = "I couldn't fetch NWP model data. Please try again.";
        await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
        return { text, metadata: null };
      }
    }

    // Route: Historical/Climate
    if (/histor|last year|last month|previous|past.*weather|climate.*trend|average.*temp|what was the weather/i.test(content)) {
      try {
        let locName = parsed.location || "Mumbai";
        const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: locName });
        if (results && results.length > 0) {
          const best = results[0];
          const now = new Date();
          let start = "", end = "", period = "the past 30 days";
          if (/last year|past year/i.test(content)) { const ly = now.getFullYear() - 1; start = ly + "-01-01"; end = ly + "-12-31"; period = "the year " + ly; }
          else if (/last month/i.test(content)) { const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1); const lme = new Date(now.getFullYear(), now.getMonth(), 0); start = lm.toISOString().split("T")[0]; end = lme.toISOString().split("T")[0]; period = "the last month"; }
          else { const td = new Date(now.getTime() - 30 * 86400000); start = td.toISOString().split("T")[0]; end = now.toISOString().split("T")[0]; }
          const hist = await ctx.runAction(api.weather.fetchHistoricalWeather, { latitude: best.latitude, longitude: best.longitude, locationName: best.name, country: best.country, startDate: start, endDate: end });
          let text = "**Climate Trend in " + best.name + " (" + period + "):**\n\n";
          if (hist.summary.totalDays > 0 && hist.summary.avgTempMax !== 0) {
            text += "Avg High: " + hist.summary.avgTempMax + "\u00b0C | Avg Low: " + hist.summary.avgTempMin + "\u00b0C\n";
            text += "Total Precipitation: " + hist.summary.totalPrecipitation + "mm | Rainy Days: " + hist.summary.rainyDays + "/" + hist.summary.totalDays + "\n";
            if (hist.summary.hottestDay.date && hist.summary.hottestDay.temp > -999) text += "Hottest: " + hist.summary.hottestDay.date + " (" + hist.summary.hottestDay.temp + "\u00b0C)\n";
          } else {
            text += "Limited historical data available. Based on known patterns:\n";
            if (best.country === "India" || (best.latitude > 8 && best.latitude < 37 && best.longitude > 68 && best.longitude < 98)) {
              text += "\u2022 Southwest monsoon (Jun-Sep) brings bulk of rainfall\n\u2022 Northeast monsoon (Oct-Dec) important for SE India\n";
            }
          }
          text += "\n*Data from Open-Meteo historical archive.*";
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }
      } catch (error) {
        const text = "I couldn't fetch historical data for that location.";
        await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
        return { text, metadata: null };
      }
    }

    // Route: Location -> Weather
    if (parsed.location) {
      try {
        const results: Array<{name: string; latitude: number; longitude: number; country: string; timezone: string}> = await ctx.runAction(api.weather.geocodeLocation, { query: parsed.location });
        if (!results || results.length === 0) {
          const text = await callLLM(content, lang, args.apiKey);
          await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
          return { text, metadata: null };
        }
        const best = results[0];
        const weatherData: import("./weather").WeatherData = await ctx.runAction(api.weather.fetchWeather, { latitude: best.latitude, longitude: best.longitude, locationName: best.name, country: best.country, timezone: best.timezone || "auto" });
        const response: { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } } = parsed.intent === "forecast" ? generateForecastResponse(weatherData, content) : generateCurrentResponse(weatherData, content);
        await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: response.text, metadata: response.metadata as any });
        return response;
      } catch (error) {
        const text = generateErrorResponse(error instanceof Error ? error.message : "Unknown error");
        await ctx.runMutation(api.chat.saveAssistantMessage, { conversationId: args.conversationId, content: text });
        return { text, metadata: null };
      }
    }

    // Fallback: signal client-side LLM for general questions
    return { text: null, metadata: null, useClientLLM: true };
  },
});

import { api } from "./_generated/api";
