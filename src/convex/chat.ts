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

  // Extract location: look for "in/at [city]" patterns
  const inPattern = /(?:in|at|for|of|near|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|this|next|weather|forecast|temperature|how|what|will|is|the|$))/gi;
  const inMatch = inPattern.exec(userMessage);
  if (inMatch) {
    location = inMatch[1].trim();
  }

  // Also check for city names mentioned directly
  if (!location) {
    for (const city of LOCATIONS) {
      if (msg.includes(city.toLowerCase())) {
        location = city;
        break;
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

function generateCurrentResponse(
  data: import("./weather").WeatherData,
  userQuery: string
): { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } } {
  const { location, current, daily } = data;
  const today = daily[0];
  const icon = getWeatherIcon(current.weatherCode);
  const condition = getWeatherDescription(current.weatherCode);
  const windDir = getWindDirection(current.windDirection);
  const uvLevel = getUVLevel(current.uvIndex);

  let text = `${icon} **Weather in ${location.name}, ${location.country}**\n\n`;
  text += `**Now:** ${condition}\n`;
  text += `**Temperature:** ${current.temperature}°C (feels like ${current.apparentTemperature}°C)\n`;
  text += `**Humidity:** ${current.humidity}%\n`;
  text += `**Wind:** ${current.windSpeed} km/h ${windDir}\n`;

  if (current.precipitation > 0) {
    text += `**Precipitation:** ${current.precipitation} mm\n`;
  }

  text += `**Cloud Cover:** ${current.cloudCover}%\n`;
  text += `**Pressure:** ${current.pressure} hPa\n`;
  text += `**UV Index:** ${current.uvIndex} (${uvLevel})\n`;

  if (today) {
    text += `\n**Today's Range:** ${today.temperatureMin}°C – ${today.temperatureMax}°C\n`;
    text += `**Rain Probability:** ${today.precipitationProbabilityMax}%\n`;

    if (today.sunrise && today.sunset) {
      const sunrise = new Date(today.sunrise).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const sunset = new Date(today.sunset).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      text += `**Sunrise:** ${sunrise} · **Sunset:** ${sunset}\n`;
    }
  }

  // Add alerts for extreme conditions
  if (current.temperature >= 40) {
    text += `\n⚠️ **Heat advisory:** Extremely high temperature. Stay hydrated and avoid prolonged outdoor exposure.`;
  } else if (current.temperature <= 0) {
    text += `\n⚠️ **Cold advisory:** Freezing conditions. Take precautions against frostbite.`;
  }

  if (current.windSpeed >= 50) {
    text += `\n⚠️ **Wind advisory:** Strong winds detected. Secure loose objects and avoid outdoor activities.`;
  }

  if (current.uvIndex >= 8) {
    text += `\n⚠️ **UV alert:** Very high UV exposure. Use SPF 30+ sunscreen and wear protective clothing.`;
  }

  if (current.weatherCode >= 95) {
    text += `\n⚠️ **Severe weather alert:** Thunderstorm activity in the area. Seek shelter indoors.`;
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

function generateForecastResponse(data: import("./weather").WeatherData): { text: string; metadata: { location: string; country: string; latitude: number; longitude: number; weatherData: import("./weather").WeatherData } } {
  const { location, daily } = data;

  let text = `📅 **7-Day Forecast for ${location.name}, ${location.country}**\n\n`;

  daily.forEach((day, i) => {
    const icon = getWeatherIcon(day.weatherCode);
    const condition = getWeatherDescription(day.weatherCode);
    const label = i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatDate(day.date);

    text += `${icon} **${label}**\n`;
    text += `   ${condition} · ${day.temperatureMin}°C – ${day.temperatureMax}°C`;
    if (day.precipitationProbabilityMax > 0) {
      text += ` · ${day.precipitationProbabilityMax}% rain`;
    }
    if (day.precipitationSum > 0) {
      text += ` · ${day.precipitationSum}mm`;
    }
    text += `\n`;
    if (day.windSpeedMax >= 40) {
      text += `   ⚠️ Strong winds up to ${day.windSpeedMax} km/h\n`;
    }
    text += `\n`;
  });

  // Summary insights
  const maxTemp = Math.max(...daily.map((d) => d.temperatureMax));
  const minTemp = Math.min(...daily.map((d) => d.temperatureMin));
  const totalRain = daily.reduce((sum, d) => sum + d.precipitationSum, 0);
  const rainyDays = daily.filter((d) => d.precipitationProbabilityMax > 50).length;

  text += `📊 **Week Summary:**`;
  text += ` ${minTemp}°C – ${maxTemp}°C`;
  if (totalRain > 0) text += ` · ${rainyDays} rainy day${rainyDays !== 1 ? "s" : ""} expected`;
  text += ` · Total precip: ${totalRain.toFixed(1)}mm\n`;

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
      // If no location detected, provide help
      const text = generateHelpResponse();
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
        response = generateForecastResponse(weatherData);
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
