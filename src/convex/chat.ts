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
  dateRange?: number; // days ahead for forecast
}

const LOCATIONS = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad",
  "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam",
  "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
  "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Allahabad",
  "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur",
  "Madurai", "Raipur", "Kochi", "Chandigarh", "Thiruvananthapuram", "Dehradun",
  "New York", "London", "Tokyo", "Paris", "Sydney", "Dubai", "Singapore", "Berlin",
  "Toronto", "Los Angeles", "Chicago", "San Francisco", "Washington DC", "Moscow",
  "Beijing", "Seoul", "Bangkok", "Istanbul", "Cairo", "Nairobi", "Lagos", "Rio de Janeiro",
  "Buenos Aires", "Mexico City", "Lima", "Bogota", "Santiago", "Johannesburg", "Cape Town",
];

function parseQuery(userMessage: string): ParsedQuery {
  const msg = userMessage.toLowerCase().trim();
  let location: string | null = null;
  let intent: ParsedQuery["intent"] = "current";
  let dateRange: number | undefined;

  // Strategy 1: Check for known city names in the message (most reliable)
  for (const city of LOCATIONS) {
    if (msg.includes(city.toLowerCase())) {
      location = city;
      break;
    }
  }

  // Strategy 2: Look for prepositions and extract the text after them
  if (!location) {
    const prepositionMatch = /(?:in|at|for|of|near|around)\s+(.+)/i.exec(userMessage);
    if (prepositionMatch) {
      let candidate = prepositionMatch[1].trim();
      // Remove trailing punctuation
      candidate = candidate.replace(/[?.!,;:]+$/, "").trim();
      // Take at most 4 words (covers multi-word city names like "New York")
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

  return { location, intent, dateRange };
}

// ─── Response generation ────────────────────────────────────────────────────

function generateConversationalGreeting(data: import("./weather").WeatherData, userQuery: string): string {
  const { location, current } = data;
  const condition = getWeatherDescription(current.weatherCode);
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  
  // Generate a conversational intro based on conditions
  const greetings = [
    `Good ${timeOfDay}! I just checked the weather in ${location.name} for you.`,
    `Here's what's happening in ${location.name} right now!`,
    `Great question! Let me tell you about the weather in ${location.name}.`,
    `I pulled up the latest conditions for ${location.name}.`,
  ];
  
  let intro = greetings[Math.floor(Math.random() * greetings.length)];
  
  // Add context based on weather conditions
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
  
  // Temperature-based advice
  if (current.temperature >= 35) {
    text += `• Heat stress risk for crops — ensure adequate irrigation\n`;
    text += `• Best time for field work is early morning or late evening\n`;
  } else if (current.temperature <= 10) {
    text += `• Frost risk for sensitive crops — consider protective measures\n`;
    text += `• Delay planting until temperatures rise\n`;
  } else {
    text += `• Good conditions for most agricultural activities\n`;
  }
  
  // Rain-based advice
  if (today && today.precipitationProbabilityMax > 50) {
    text += `• Delay pesticide/fertilizer application — rain expected\n`;
    text += `• Good time for rain-fed crop irrigation\n`;
  } else if (today && today.precipitationProbabilityMax < 20) {
    text += `• Dry conditions — ensure adequate irrigation for crops\n`;
  }
  
  // Wind-based advice
  if (current.windSpeed > 25) {
    text += `• Strong winds — avoid spraying operations\n`;
    text += `• Secure greenhouses and protective structures\n`;
  }
  
  // Humidity-based advice
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

  // Build conversational response
  let text = generateConversationalGreeting(data, userQuery);
  
  // Add key highlights conversationally
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
  
  // Add conversational advice
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
  
  // Add alerts for extreme conditions
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

  // Add agriculture advisory if user mentions farming/agriculture
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
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  
  // Conversational intro
  const intros = [
    `Here's what the next week looks like in ${location.name}!`,
    `Let me walk you through the forecast for ${location.name}.`,
    `Planning ahead? Here's the 7-day outlook for ${location.name}.`,
  ];
  let text = intros[Math.floor(Math.random() * intros.length)] + "\n\n";
  
  // Day-by-day with conversational context
  daily.forEach((day, i) => {
    const condition = getWeatherDescription(day.weatherCode);
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatDate(day.date);

    text += `**${label}:** ${condition}, ${day.temperatureMin}°C – ${day.temperatureMax}°C`;
    if (day.precipitationProbabilityMax > 0) {
      text += `, ${day.precipitationProbabilityMax}% chance of rain`;
    }
    text += `\n`;
  });

  // Summary insights conversationally
  const maxTemp = Math.max(...daily.map((d) => d.temperatureMax));
  const minTemp = Math.min(...daily.map((d) => d.temperatureMin));
  const totalRain = daily.reduce((sum, d) => sum + d.precipitationSum, 0);
  const rainyDays = daily.filter((d) => d.precipitationProbabilityMax > 50).length;
  
  text += `\n**Week at a glance:**\n`;
  text += `• Temperatures will range from ${minTemp}°C to ${maxTemp}°C\n`;
  if (rainyDays > 0) {
    text += `• Expect ${rainyDays} rainy day${rainyDays !== 1 ? "s" : ""} this week\n`;
  } else {
    text += `• Looks like a mostly dry week ahead!\n`;
  }
  
  // Conversational advice
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

  // Add agriculture advisory if user mentions farming/agriculture
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
    return `I couldn't find that location. Could you try:\n\n• A different spelling of the city name\n• A nearby major city\n• Adding the country name (e.g., "Mumbai, India")\n\nI support locations worldwide — just ask about any city or place.`;
  }
  return `I'm sorry, I encountered an issue getting weather data. Please try again in a moment, or try a different location.`;
}

function generateHelpResponse(): string {
  return `Here's what I can help you with:\n\n**Current Weather**\n• "What's the weather in Mumbai?"\n• "Temperature in Delhi right now"\n• "Is it raining in London?"\n\n**Forecasts**\n• "7-day forecast for Tokyo"\n• "Will it rain tomorrow in Paris?"\n• "Weather this week in Sydney"\n\n**General**\n• Ask about any city worldwide\n• Get temperature, humidity, wind, UV, and precipitation data\n• Receive severe weather alerts when conditions are extreme\n\nJust type your weather question and I'll provide the latest data.`;
}

// ─── LLM Integration ──────────────────────────────────────────────────────

async function callLLM(userMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackResponse(userMessage);
  }

  const systemPrompt = `You are Weather GPT, an intelligent AI assistant built for weather intelligence and general conversation.

Your capabilities:
- Provide real-time weather conditions for any location worldwide
- Deliver 7-day forecasts with detailed breakdowns
- Issue severe weather alerts and warnings
- Answer questions about climate, meteorology, and geography
- Have friendly, helpful conversations on any topic
- Answer general knowledge questions
- Help with math, science, history, and other educational topics

When users ask about weather:
- Provide accurate, helpful information
- Include relevant details like temperature, humidity, wind, UV index
- Suggest relevant follow-up questions

When users ask general questions:
- Be helpful, friendly, and informative
- Keep responses concise but thorough
- Maintain a warm, professional tone
- Use markdown formatting for clarity

Always respond in a helpful, conversational tone.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
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
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|greetings)/i.test(msg)) {
    return "Hello! 👋 I'm Weather GPT, your intelligent weather assistant. I can help you with:\n\n• **Weather conditions** for any location\n• **7-day forecasts** with detailed breakdowns\n• **Severe weather alerts** and warnings\n• **Climate information** and trends\n\nJust ask about the weather in any city, or try one of the suggestion chips below!";
  }
  
  // How are you
  if (/how\s*(are\s*you|r\s*u)/i.test(msg)) {
    return "I'm doing great, thanks for asking! ☀️ I'm always ready to help you with weather information. What would you like to know?";
  }
  
  // Thank you
  if (/thank|thanks|thx/i.test(msg)) {
    return "You're welcome! 😊 Is there anything else you'd like to know about the weather?";
  }
  
  // Goodbye
  if (/bye|goodbye|see\s*ya|later|cya/i.test(msg)) {
    return "Goodbye! 👋 Stay weather-aware, and feel free to come back anytime you need weather information!";
  }
  
  // Jokes
  if (/joke|funny|laugh/i.test(msg)) {
    const jokes = [
      "Why don't weather forecasters win awards? Because they always say it's partly cloudy! ⛅",
      "What do you call a cold dog sitting on a rabbit? A chili dog on a bunny! 🐕",
      "Why did the weather vane win the race? Because it was always pointing in the right direction! 🌬️",
      "What's a meteorologist's favorite type of story? A thunder-thriller! ⛈️",
      "Why was the weather report so expensive? Because it cost a pretty penny for the forecast! 💰",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  
  // Time/date
  if (/what\s*(time|date|day)/i.test(msg)) {
    const now = new Date();
    return `It's currently ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} on ${now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}. Would you like to know the weather for this time?`;
  }
  
  // Weather-related but no location
  if (/weather|rain|snow|temperature|forecast|wind|sun|cloud|storm/i.test(msg)) {
    return "I'd love to help with weather information! Could you tell me which city or location you'd like to know about?\n\nFor example:\n• \"Weather in Mumbai\"\n• \"Forecast for Tokyo\"\n• \"Is it raining in London?\"";
  }
  
  // Help/capabilities
  if (/help|what\s*can\s*you|capabilities|features/i.test(msg)) {
    return generateHelpResponse();
  }
  
  // Default
  return "I'm Weather GPT, focused on providing weather intelligence! While I specialize in weather data, forecasts, and alerts, I'm always happy to chat. 🌤️\n\nTry asking me about:\n• Weather in any city\n• 7-day forecasts\n• UV index and conditions\n• Weather alerts\n\nWhat would you like to know?";
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

    if (!parsed.location) {
      // Call LLM for non-weather queries
      const text = await callLLM(content);
      await ctx.runMutation(api.chat.saveAssistantMessage, {
        conversationId: args.conversationId,
        content: text,
      });
      return { text, metadata: null };
    }

    try {
      // Geocode the location
      const results = await ctx.runAction(api.weather.geocodeLocation, {
        query: parsed.location,
      });

      if (!results || results.length === 0) {
        const text = generateErrorResponse(`Location "${parsed.location}" not found`);
        await ctx.runMutation(api.chat.saveAssistantMessage, {
          conversationId: args.conversationId,
          content: text,
        });
        return { text, metadata: null };
      }

      const best = results[0];

      // Fetch weather data
      const weatherData = await ctx.runAction(api.weather.fetchWeather, {
        latitude: best.latitude,
        longitude: best.longitude,
        locationName: best.name,
        country: best.country,
        timezone: best.timezone || "auto",
      });

      // Generate response based on intent
      let response: { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } };

      if (parsed.intent === "forecast") {
        response = generateForecastResponse(weatherData, content);
      } else {
        response = generateCurrentResponse(weatherData, content);
      }

      // Save assistant response
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
  },
});

// Import the api reference
import { api } from "./_generated/api";
