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
  intent: "current" | "forecast" | "comparison" | "general";
  dateRange?: number;
  isWeatherQuery: boolean;
  isGeneralQuery: boolean;
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
  // International (kept for global queries)
  "New York", "London", "Tokyo", "Paris", "Sydney", "Dubai", "Singapore", "Berlin",
  "Toronto", "Los Angeles", "Chicago", "San Francisco", "Washington DC", "Moscow",
  "Beijing", "Seoul", "Bangkok", "Istanbul", "Cairo", "Nairobi", "Lagos",
  "Rio de Janeiro", "Buenos Aires", "Mexico City", "Lima", "Bogota", "Santiago",
  "Johannesburg", "Cape Town", "Rome", "Barcelona", "Amsterdam", "Vienna",
  "Prague", "Zurich", "Geneva", "Stockholm", "Oslo", "Helsinki", "Copenhagen",
  "Warsaw", "Budapest", "Athens", "Lisbon", "Madrid", "Mumbai", "Delhi",
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
  // Hindi weather words
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
  // Check if any weather keyword is present
  for (const kw of WEATHER_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }
  // Check if a location is mentioned (weather intent by default if location is present)
  return false;
}

function isGeneralIntent(msg: string): boolean {
  const lower = msg.toLowerCase();
  for (const pattern of GENERAL_PATTERNS) {
    if (pattern.test(lower)) return true;
  }
  return false;
}

function parseQuery(userMessage: string): ParsedQuery {
  const msg = userMessage.toLowerCase().trim();
  let location: string | null = null;
  let intent: ParsedQuery["intent"] = "current";
  let dateRange: number | undefined;
  let isWeatherQuery = false;
  let isGeneralQuery = false;

  // Check weather keywords
  isWeatherQuery = isWeatherIntent(msg);
  isGeneralQuery = isGeneralIntent(msg);

  // Strategy 1: Check for known city names in the message (most reliable)
  for (const city of INDIAN_LOCATIONS) {
    if (msg.includes(city.toLowerCase())) {
      location = city;
      break;
    }
  }

  // Strategy 2: Look for prepositions and extract the text after them
  if (!location) {
    const prepositionMatch = /(?:in|at|for|of|near|around|from|to)\s+(.+)/i.exec(userMessage);
    if (prepositionMatch) {
      let candidate = prepositionMatch[1].trim();
      candidate = candidate.replace(/[?.!,;:]+$/, "").trim();
      const words = candidate.split(/\s+/).slice(0, 4).join(" ");
      if (words.length >= 2) {
        location = words;
      }
    }
  }

  // Detect intent
  if (msg.includes("forecast") || msg.includes("week") || msg.includes("7 day") || msg.includes("7-day") || msg.includes("coming days")) {
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

  // If we have a location, it's a weather query regardless of keywords
  if (location) {
    isWeatherQuery = true;
  }

  return { location, intent, dateRange, isWeatherQuery, isGeneralQuery };
}

// ─── Response generation ────────────────────────────────────────────────────

function generateConversationalGreeting(data: import("./weather").WeatherData, userQuery: string): string {
  const { location, current } = data;
  const condition = getWeatherDescription(current.weatherCode);
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  
  const greetings = [
    `Good ${timeOfDay}! I just checked the weather in ${location.name} for you.`,
    `Here's what's happening in ${location.name} right now!`,
    `Great question! Let me tell you about the weather in ${location.name}.`,
    `I pulled up the latest conditions for ${location.name}.`,
  ];
  
  let intro = greetings[Math.floor(Math.random() * greetings.length)];
  
  if (current.temperature >= 35) {
    intro += ` It's quite hot out there — ${Math.round(current.temperature)}°C and ${condition.toLowerCase()}. You might want to stay hydrated if you're heading out!`;
  } else if (current.temperature <= 10) {
    intro += ` It's chilly at ${Math.round(current.temperature)}°C with ${condition.toLowerCase()}. Might want to grab a jacket!`;
  } else if (current.weatherCode >= 61 && current.weatherCode <= 65) {
    intro += ` Heads up — it's raining in ${location.name} right now. ${current.precipitation > 0 ? `We're getting ${current.precipitation}mm of rain.` : "You'll want to bring an umbrella!"}`;
  } else if (current.weatherCode >= 95) {
    intro += ` ⚠️ There's a thunderstorm in ${location.name} right now. Please stay safe and avoid outdoor activities!`;
  } else if (current.uvIndex >= 8) {
    intro += ` Just a heads up — the UV index is very high at ${current.uvIndex}. If you're going outside, sunscreen is a must!`;
  } else if (current.weatherCode <= 1) {
    intro += ` It's a beautiful ${condition.toLowerCase()} day there — perfect weather to be outside!`;
  } else {
    intro += ` The conditions are ${condition.toLowerCase()} with temperatures around ${Math.round(current.temperature)}°C.`;
  }
  
  return intro;
}

function generateAgriAdvisory(data: import("./weather").WeatherData): string {
  const { current, daily } = data;
  const today = daily[0];
  let text = `\n\n🌾 **Agriculture Advisory:**\n`;
  
  if (current.temperature >= 35) {
    text += `• Heat stress risk for crops — ensure adequate irrigation\n`;
    text += `• Best time for field work is early morning or late evening\n`;
  } else if (current.temperature <= 10) {
    text += `• Frost risk for sensitive crops — consider protective measures\n`;
    text += `• Delay planting until temperatures rise\n`;
  } else {
    text += `• Good conditions for most agricultural activities\n`;
  }
  
  if (today && today.precipitationProbabilityMax > 50) {
    text += `• Delay pesticide/fertilizer application — rain expected\n`;
    text += `• Good time for rain-fed crop irrigation\n`;
  } else if (today && today.precipitationProbabilityMax < 20) {
    text += `• Dry conditions — ensure adequate irrigation for crops\n`;
  }
  
  if (current.windSpeed > 25) {
    text += `• Strong winds — avoid spraying operations\n`;
    text += `• Secure greenhouses and protective structures\n`;
  }
  
  if (current.humidity > 80) {
    text += `• High humidity — watch for fungal diseases in crops\n`;
    text += `• Ensure proper ventilation in storage areas\n`;
  } else if (current.humidity < 30) {
    text += `• Low humidity — increase irrigation frequency\n`;
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
  text += `• **Temperature:** ${current.temperature}°C (feels like ${current.apparentTemperature}°C)\n`;
  text += `• **Conditions:** ${condition}\n`;
  text += `• **Humidity:** ${current.humidity}%\n`;
  text += `• **Wind:** ${current.windSpeed} km/h ${windDir}\n`;
  
  if (current.precipitation > 0) {
    text += `• **Precipitation:** ${current.precipitation} mm\n`;
  }
  
  text += `• **UV Index:** ${current.uvIndex} (${uvLevel})\n`;
  
  if (today) {
    text += `\n**Today's forecast:**\n`;
    text += `• High of ${today.temperatureMax}°C, low of ${today.temperatureMin}°C\n`;
    if (today.precipitationProbabilityMax > 0) {
      text += `• ${today.precipitationProbabilityMax}% chance of rain\n`;
    }
    if (today.sunrise && today.sunset) {
      const sunrise = new Date(today.sunrise).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const sunset = new Date(today.sunset).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      text += `• Sunrise at ${sunrise}, sunset at ${sunset}\n`;
    }
  }
  
  text += `\n`;
  if (current.temperature >= 35) {
    text += `💡 **Tip:** Stay hydrated and try to stay in shaded areas during peak hours.`;
  } else if (current.temperature <= 5) {
    text += `💡 **Tip:** Dress in layers and keep warm! Hot drinks will be your friend today.`;
  } else if (current.weatherCode >= 61 && current.weatherCode <= 65) {
    text += `💡 **Tip:** Don't forget your umbrella or raincoat if you're heading out.`;
  } else if (current.uvIndex >= 6) {
    text += `💡 **Tip:** Apply sunscreen SPF 30+ and wear sunglasses.`;
  } else {
    text += `💡 **Tip:** Great conditions to be outdoors! Enjoy the weather.`;
  }
  
  if (current.temperature >= 40) {
    text += `\n\n⚠️ **Heat advisory:** Extremely high temperature. Stay hydrated and avoid prolonged outdoor exposure.`;
  } else if (current.temperature <= 0) {
    text += `\n\n⚠️ **Cold advisory:** Freezing conditions. Take precautions against frostbite.`;
  }
  
  if (current.windSpeed >= 50) {
    text += `\n⚠️ **Wind advisory:** Strong winds detected. Secure loose objects and avoid outdoor activities.`;
  }
  
  if (current.weatherCode >= 95) {
    text += `\n⚠️ **Severe weather alert:** Thunderstorm activity in the area. Seek shelter indoors immediately.`;
  }

  const query = userQuery.toLowerCase();
  if (query.includes("farm") || query.includes("crop") || query.includes("agri") || query.includes("soil") || query.includes("irrigation") || query.includes("harvest")) {
    text += generateAgriAdvisory(data);
  }

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

    text += `**${label}:** ${condition}, ${day.temperatureMin}°C – ${day.temperatureMax}°C`;
    if (day.precipitationProbabilityMax > 0) {
      text += `, ${day.precipitationProbabilityMax}% chance of rain`;
    }
    text += `\n`;
  });

  const maxTemp = Math.max(...daily.map((d) => d.temperatureMax));
  const minTemp = Math.min(...daily.map((d) => d.temperatureMin));
  const rainyDays = daily.filter((d) => d.precipitationProbabilityMax > 50).length;
  
  text += `\n**Week at a glance:**\n`;
  text += `• Temperatures will range from ${minTemp}°C to ${maxTemp}°C\n`;
  if (rainyDays > 0) {
    text += `• Expect ${rainyDays} rainy day${rainyDays !== 1 ? "s" : ""} this week\n`;
  } else {
    text += `• Looks like a mostly dry week ahead!\n`;
  }
  
  text += `\n`;
  if (rainyDays >= 4) {
    text += `☔ **Week outlook:** Quite a wet week ahead — keep that umbrella handy!`;
  } else if (maxTemp >= 35) {
    text += `🔥 **Week outlook:** Hot week coming up — plan outdoor activities for cooler parts of the day.`;
  } else if (minTemp <= 0) {
    text += `❄️ **Week outlook:** Cold week ahead — dress warm and watch for possible frost.`;
  } else {
    text += `🌤️ **Week outlook:** Pretty pleasant conditions overall — great week to be outdoors!`;
  }

  const query = userQuery.toLowerCase();
  if (query.includes("farm") || query.includes("crop") || query.includes("agri") || query.includes("soil") || query.includes("irrigation") || query.includes("harvest")) {
    text += generateAgriAdvisory(data);
  }

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
    return `I couldn't find that location. Could you try:\n\n• A different spelling of the city name\n• A nearby major city\n• Adding the state name (e.g., "Warangal, Telangana")\n\nI support **any location in India and worldwide** — from major cities to small villages. Just tell me the place name!`;
  }
  return `I'm sorry, I encountered an issue getting weather data. Please try again in a moment, or try a different location.`;
}

function generateHelpResponse(): string {
  return `Here's what I can help you with:\n\n**🌤️ Weather Information**\n• "What's the weather in Mumbai?"\n• "Temperature in my village right now"\n• "Is it raining in London?"\n\n**📅 Forecasts**\n• "7-day forecast for Tokyo"\n• "Will it rain tomorrow in Pune?"\n• "Weather this week in Shimla"\n\n**🌾 Agriculture**\n• "Should I irrigate crops in Nagpur?"\n• "Farming conditions in Punjab"\n• "Best time to sow wheat in UP?"\n\n**⚠️ Alerts**\n• "Any cyclone alerts for Chennai?"\n• "Is it safe to fly tomorrow?"\n• "Heatwave warning in Rajasthan?"\n\n**💬 General Knowledge**\n• Ask me anything — math, science, history, cooking, travel, technology, and more!\n• "Tell me a joke"\n• "What's the capital of France?"\n• "How do I make chai?"\n\n**🗣️ Voice Input**\n• Tap the mic button and speak your question\n\nJust type your question and I'll do my best to help!`;
}

// ─── LLM Integration ──────────────────────────────────────────────────────

async function callLLM(userMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackResponse(userMessage);
  }

  const systemPrompt = `You are Weather GPT — an intelligent, friendly AI assistant created by Team Craxzy for the Smart India Hackathon.

YOUR CORE IDENTITY:
- You are a weather intelligence platform with general knowledge capabilities
- You were built to serve Indian users across all 28 states and 8 union territories
- You support 10 Indian languages and are designed for rural accessibility

WEATHER CAPABILITIES (your primary focus):
- Real-time weather for ANY location in India (cities, villages, towns, districts)
- 7-day forecasts with hourly breakdowns
- Agriculture-specific advisories (irrigation, sowing, harvest, pest alerts)
- Disaster alerts (cyclones, floods, heatwaves, cold waves, thunderstorms)
- UV index, air quality, visibility, and atmospheric data
- Compare weather between multiple cities

GENERAL KNOWLEDGE CAPABILITIES:
- Answer ANY question the user asks — science, history, math, geography, technology, cooking, travel, sports, health, business, etc.
- Be helpful with everyday questions like "how do I make chai?" or "what's the best time to visit Goa?"
- Explain concepts in simple language, especially for users who may not be tech-savvy
- Provide practical advice when asked

COMMUNICATION STYLE:
- Always be warm, friendly, and conversational
- Use simple English that anyone can understand
- Use emojis naturally to make responses engaging (🌤️ ☀️ 🌧️ ⛈️ ❄️ 💡 🌾 ⚠️)
- Format responses with markdown for readability (bullet points, bold text)
- If asked about weather, always provide actionable advice
- If you don't know something, say so honestly and suggest where they might find the answer

IMPORTANT RULES:
1. For weather questions — always provide specific, actionable information
2. For general questions — be as helpful as possible with your knowledge
3. Never make up weather data — if you don't have real-time data, say so
4. Be especially helpful for farmers and rural users
5. If the user seems confused, gently guide them`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      return getFallbackResponse(userMessage);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(userMessage);
  } catch (error) {
    return getFallbackResponse(userMessage);
  }
}

function getFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();
  
  // Greetings
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|namaskar|howdy|greetings)/i.test(msg)) {
    const greetings = [
      "Hello! 👋 I'm Weather GPT, your intelligent weather assistant. I can help you with:\n\n• **Weather conditions** for any location in India or worldwide\n• **7-day forecasts** with detailed breakdowns\n• **Agriculture advisories** for farmers\n• **Disaster alerts** — cyclones, floods, heatwaves\n• **General knowledge** — ask me anything!\n\nWhat would you like to know?",
      "Namaste! 🙏 I'm Weather GPT. Ask me about the weather anywhere — from Mumbai to a small village — or just chat about anything!\n\nTry asking:\n• \"Weather in my city\"\n• \"Should I irrigate crops today?\"\n• \"Tell me a joke\"",
      "Hey there! ☀️ I'm Weather GPT, built by Team Craxzy. I know the weather for every location and can answer almost any question. What's on your mind?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // How are you
  if (/how\s*(are\s*you|r\s*u)/i.test(msg)) {
    return "I'm doing great, thanks for asking! ☀️ I'm always ready to help you with weather information or answer any question you have. What would you like to know?";
  }
  
  // Thank you
  if (/thank|thanks|thx|shukriya|dhanyavaad/i.test(msg)) {
    return "You're welcome! 😊 Is there anything else you'd like to know about the weather or anything else?";
  }
  
  // Goodbye
  if (/bye|goodbye|see\s*ya|later|cya|alvida/i.test(msg)) {
    return "Goodbye! 👋 Stay weather-aware, and feel free to come back anytime you need weather information or just want to chat!";
  }
  
  // Jokes
  if (/joke|funny|laugh|humor|hasi|mazaak/i.test(msg)) {
    const jokes = [
      "Why don't weather forecasters win awards? Because they always say it's partly cloudy! ⛅",
      "What do you call a cold dog sitting on a rabbit? A chili dog on a bunny! 🐕",
      "Why did the weather vane win the race? Because it was always pointing in the right direction! 🌬️",
      "What's a meteorologist's favorite type of story? A thunder-thriller! ⛈️",
      "Why was the weather report so expensive? Because it cost a pretty penny for the forecast! 💰",
      "What did the weatherman say to the mountain? \"I've got my eye on you — you look a little peaky today!\" 🏔️",
      "Why did the sun go to school? To get a little brighter! ☀️",
      "What did one raindrop say to the other? Two's company, three's a cloud! 🌧️",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // Time/date
  if (/what\s*(time|date|day)/i.test(msg)) {
    const now = new Date();
    return `It's currently ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} on ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}. Would you like to know the weather for this time?`;
  }
  
  // Weather-related but no location
  if (/weather|rain|snow|temperature|forecast|wind|sun|cloud|storm|mausam|barish|garmi|thandi/i.test(msg)) {
    return "I'd love to help with weather information! Could you tell me which city or location you'd like to know about?\n\nFor example:\n• \"Weather in Mumbai\"\n• \"Forecast for my village in Punjab\"\n• \"Is it raining in London?\"\n\nI can find weather for **any location** — just tell me the name!";
  }
  
  // Help/capabilities
  if (/help|what\s*can\s*you|capabilities|features|commands/i.test(msg)) {
    return generateHelpResponse();
  }
  
  // Identity questions
  if (/who\s*(made|created|built|are\s*you)|your\s*(name|creator|maker|team)/i.test(msg)) {
    return "I'm **Weather GPT** 🌤️ — an intelligent weather assistant built by **Team Craxzy** for the Smart India Hackathon.\n\nI can help you with:\n• Real-time weather for any location\n• 7-day forecasts\n• Agriculture advisories for farmers\n• Disaster alerts\n• General knowledge questions\n\nAsk me anything!";
  }
  
  // Math
  if (/\d+\s*[+\-*/^%]\s*\d+/i.test(msg) || /calculate|math|solve/i.test(msg)) {
    return "I'd be happy to help with math! However, without the Gemini AI API key set up, I can only provide weather-related answers. Please add a **GEMINI_API_KEY** to enable full AI capabilities, or ask me about the weather! 🌤️";
  }
  
  // Default — encourage weather or general questions
  return "I'm Weather GPT, your all-in-one weather and knowledge assistant! 🌤️\n\nI can help with:\n• **Weather** — ask about any city, village, or location\n• **Forecasts** — 7-day predictions with details\n• **Agriculture** — crop-specific weather advice\n• **Alerts** — cyclone, flood, heatwave warnings\n• **General questions** — ask me anything!\n\nWhat would you like to know?";
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
  },
  handler: async (ctx, args) => {
    const content = args.content.trim();

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

    // ── Route 1: Has a location → fetch weather ──
    if (parsed.location) {
      try {
        const results = await ctx.runAction(api.weather.geocodeLocation, {
          query: parsed.location,
        });

        if (!results || results.length === 0) {
          // Location not found — try LLM for general response
          const text = await callLLM(content);
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

    // ── Route 2: No location → general knowledge via LLM ──
    const text = await callLLM(content);
    await ctx.runMutation(api.chat.saveAssistantMessage, {
      conversationId: args.conversationId,
      content: text,
    });
    return { text, metadata: null };
  },
});

// Import the api reference
import { api } from "./_generated/api";
