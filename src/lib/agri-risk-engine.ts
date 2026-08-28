/**
 * WeatherGPT — Advanced Agriculture Risk Engine
 *
 * A rule-based risk analysis system that combines real weather data
 * with crop-specific agronomic knowledge to produce actionable advisories.
 *
 * Sources: ICAR, IMD Agromet, State Agricultural Universities
 * Weather data: Open-Meteo API (free, no key required)
 */

import type { WeatherData } from "@/convex/weather";

// ─── Types ─────────────────────────────────────────────────────────────────

export type Season = "kharif" | "rabi" | "zaid" | "unknown";

export type GrowthStage =
  | "land_preparation"
  | "sowing"
  | "germination"
  | "seedling"
  | "vegetative"
  | "flowering"
  | "fruiting"
  | "grain_filling"
  | "maturity"
  | "harvest_ready"
  | "post_harvest"
  | "unknown";

export type SoilType = "clay" | "sandy" | "loam" | "silt" | "peaty" | "unknown";

export type IrrigationType = "irrigated" | "rainfed" | "sprinkler" | "drip" | "unknown";

export type RiskLevel = "low" | "moderate" | "high" | "severe";

export interface FarmerProfile {
  location: {
    state: string;
    district: string;
    taluka?: string;
    village?: string;
    latitude?: number;
    longitude?: number;
  };
  crop: {
    name: string;
    variety?: string;
    season: Season;
    sowingDate?: string; // YYYY-MM-DD
    growthStage: GrowthStage;
    irrigationType: IrrigationType;
    soilType: SoilType;
    farmArea?: string; // e.g. "2 hectares"
  };
}

export interface Risk {
  id: string;
  level: RiskLevel;
  category: "rainfall" | "heat" | "cold" | "wind" | "humidity" | "drought" | "storm";
  title: string;
  description: string;
  why: string;
  cropImpact: string;
  recommendation: string;
  weatherFactor: string;
}

export interface DailyOutlook {
  date: string;
  dayLabel: string;
  weather: string;
  tempMax: number;
  tempMin: number;
  rainProb: number;
  rainfall: number;
  windMax: number;
  agriImpact: string;
  recommendedAction: string;
}

export interface Advisory {
  location: {
    state: string;
    district: string;
    country: string;
  };
  crop: {
    name: string;
    variety?: string;
    growthStage: GrowthStage;
    season: Season;
    irrigationType: IrrigationType;
  };
  advisoryDate: string;
  currentConditions: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    rainProb: number;
    rainfall: number;
    condition: string;
    uvIndex: number;
  };
  overallRisk: RiskLevel;
  riskScore: number; // 0-100
  risks: Risk[];
  cropImpact: string;
  todaysActions: string[];
  irrigationAdvisory: string;
  irrigationReason: string;
  irrigationNeed: "not_needed" | "may_need" | "needed" | "skip";
  dailyOutlook: DailyOutlook[];
  pestDiseaseRisk: {
    level: RiskLevel;
    why: string;
    whatToMonitor: string[];
    action: string;
  };
  farmOperationWindow: {
    sowing: { suitable: boolean; note: string };
    irrigation: { suitable: boolean; note: string };
    spraying: { suitable: boolean; note: string };
    harvesting: { suitable: boolean; note: string };
    fertilizing: { suitable: boolean; note: string };
    fieldWork: { suitable: boolean; note: string };
  };
  weatherAlerts: Array<{
    level: RiskLevel;
    type: string;
    message: string;
  }>;
  confidence: {
    level: "high" | "medium" | "low";
    reason: string;
  };
  sources: {
    weather: string[];
    agricultural: string[];
    official: string[];
  };
}

// ─── Crop Database ─────────────────────────────────────────────────────────

interface CropInfo {
  name: string;
  stages: GrowthStage[];
  optimalTempRange: [number, number]; // min, max in °C
  criticalTempHigh: number;
  criticalTempLow: number;
  humiditySensitiveStages: GrowthStage[];
  rainSensitiveStages: GrowthStage[];
  windSensitiveStages: GrowthStage[];
  irrigationDependence: "high" | "medium" | "low";
  waterloggingTolerance: "low" | "medium" | "high";
  commonDiseases: string[];
  seasonPreference: Season[];
}

const CROP_DATABASE: Record<string, CropInfo> = {
  rice: {
    name: "Rice (Paddy)",
    stages: ["land_preparation", "sowing", "germination", "seedling", "vegetative", "flowering", "grain_filling", "maturity", "harvest_ready"],
    optimalTempRange: [22, 35],
    criticalTempHigh: 40,
    criticalTempLow: 15,
    humiditySensitiveStages: ["flowering", "grain_filling"],
    rainSensitiveStages: ["harvest_ready", "maturity"],
    windSensitiveStages: ["flowering", "grain_filling"],
    irrigationDependence: "high",
    waterloggingTolerance: "high",
    commonDiseases: ["blast", "bacterial leaf blight", "brown spot", "sheath blight"],
    seasonPreference: ["kharif"],
  },
  wheat: {
    name: "Wheat",
    stages: ["sowing", "germination", "seedling", "vegetative", "flowering", "grain_filling", "maturity", "harvest_ready"],
    optimalTempRange: [10, 25],
    criticalTempHigh: 35,
    criticalTempLow: 5,
    humiditySensitiveStages: ["flowering", "grain_filling"],
    rainSensitiveStages: ["harvest_ready", "maturity"],
    windSensitiveStages: ["maturity", "harvest_ready"],
    irrigationDependence: "medium",
    waterloggingTolerance: "low",
    commonDiseases: ["rust", "powdery mildew", "karnal bunt", "loose smut"],
    seasonPreference: ["rabi"],
  },
  soybean: {
    name: "Soybean",
    stages: ["sowing", "germination", "vegetative", "flowering", "fruiting", "grain_filling", "maturity", "harvest_ready"],
    optimalTempRange: [25, 33],
    criticalTempHigh: 38,
    criticalTempLow: 15,
    humiditySensitiveStages: ["flowering", "fruiting"],
    rainSensitiveStages: ["flowering", "harvest_ready"],
    windSensitiveStages: ["flowering", "fruiting"],
    irrigationDependence: "medium",
    waterloggingTolerance: "low",
    commonDiseases: ["root rot", "leaf rust", "purple seed stain", "downy mildew"],
    seasonPreference: ["kharif"],
  },
  cotton: {
    name: "Cotton",
    stages: ["sowing", "germination", "vegetative", "flowering", "fruiting", "maturity", "harvest_ready"],
    optimalTempRange: [25, 35],
    criticalTempHigh: 40,
    criticalTempLow: 15,
    humiditySensitiveStages: ["flowering", "fruiting"],
    rainSensitiveStages: ["harvest_ready"],
    windSensitiveStages: ["flowering", "fruiting", "harvest_ready"],
    irrigationDependence: "medium",
    waterloggingTolerance: "low",
    commonDiseases: ["bollworm", "aphid", "whitefly", "fusarium wilt"],
    seasonPreference: ["kharif"],
  },
  maize: {
    name: "Maize (Corn)",
    stages: ["sowing", "germination", "vegetative", "flowering", "fruiting", "grain_filling", "maturity", "harvest_ready"],
    optimalTempRange: [22, 32],
    criticalTempHigh: 38,
    criticalTempLow: 12,
    humiditySensitiveStages: ["flowering", "grain_filling"],
    rainSensitiveStages: ["harvest_ready", "maturity"],
    windSensitiveStages: ["flowering", "grain_filling", "maturity"],
    irrigationDependence: "medium",
    waterloggingTolerance: "medium",
    commonDiseases: ["downy mildew", "turcicum leaf blight", "common rust"],
    seasonPreference: ["kharif"],
  },
  sugarcane: {
    name: "Sugarcane",
    stages: ["sowing", "germination", "vegetative", "maturity", "harvest_ready"],
    optimalTempRange: [25, 38],
    criticalTempHigh: 42,
    criticalTempLow: 10,
    humiditySensitiveStages: ["vegetative"],
    rainSensitiveStages: ["harvest_ready"],
    windSensitiveStages: ["vegetative"],
    irrigationDependence: "high",
    waterloggingTolerance: "medium",
    commonDiseases: ["red rot", "smut", "sett rot"],
    seasonPreference: ["kharif"],
  },
  tomato: {
    name: "Tomato",
    stages: ["sowing", "seedling", "vegetative", "flowering", "fruiting", "harvest_ready"],
    optimalTempRange: [20, 30],
    criticalTempHigh: 38,
    criticalTempLow: 10,
    humiditySensitiveStages: ["flowering", "fruiting"],
    rainSensitiveStages: ["flowering", "fruiting", "harvest_ready"],
    windSensitiveStages: ["flowering", "fruiting"],
    irrigationDependence: "high",
    waterloggingTolerance: "low",
    commonDiseases: ["late blight", "early blight", "bacterial wilt", "fruit crack"],
    seasonPreference: ["kharif", "rabi"],
  },
  potato: {
    name: "Potato",
    stages: ["sowing", "germination", "vegetative", "flowering", "fruiting", "maturity", "harvest_ready"],
    optimalTempRange: [15, 25],
    criticalTempHigh: 32,
    criticalTempLow: 5,
    humiditySensitiveStages: ["flowering"],
    rainSensitiveStages: ["harvest_ready"],
    windSensitiveStages: [],
    irrigationDependence: "medium",
    waterloggingTolerance: "low",
    commonDiseases: ["late blight", "early blight", "black scurf"],
    seasonPreference: ["rabi"],
  },
  groundnut: {
    name: "Groundnut",
    stages: ["sowing", "germination", "vegetative", "flowering", "fruiting", "maturity", "harvest_ready"],
    optimalTempRange: [25, 33],
    criticalTempHigh: 40,
    criticalTempLow: 15,
    humiditySensitiveStages: ["flowering", "fruiting"],
    rainSensitiveStages: ["flowering", "harvest_ready"],
    windSensitiveStages: [],
    irrigationDependence: "medium",
    waterloggingTolerance: "low",
    commonDiseases: ["rust", "leaf spot", "collar rot"],
    seasonPreference: ["kharif"],
  },
  pulses: {
    name: "Pulses (Generic)",
    stages: ["sowing", "germination", "vegetative", "flowering", "fruiting", "maturity", "harvest_ready"],
    optimalTempRange: [20, 33],
    criticalTempHigh: 40,
    criticalTempLow: 10,
    humiditySensitiveStages: ["flowering"],
    rainSensitiveStages: ["flowering", "harvest_ready"],
    windSensitiveStages: [],
    irrigationDependence: "low",
    waterloggingTolerance: "low",
    commonDiseases: ["wilt", "root rot", "powdery mildew"],
    seasonPreference: ["kharif", "rabi"],
  },
};

// ─── Helper: WMO Weather Code to Description ───────────────────────────────

function weatherCodeToDescription(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Dense freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Heavy freezing rain",
    71: "Slight snowfall", 73: "Moderate snowfall", 75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail",
  };
  return map[code] || "Unknown";
}

function getSeasonLabel(s: Season): string {
  return { kharif: "Kharif (Monsoon)", rabi: "Rabi (Winter)", zaid: "Zaid (Summer)", unknown: "Unknown" }[s];
}

function getStageLabel(s: GrowthStage): string {
  const labels: Record<GrowthStage, string> = {
    land_preparation: "Land Preparation", sowing: "Sowing", germination: "Germination",
    seedling: "Seedling", vegetative: "Vegetative", flowering: "Flowering",
    fruiting: "Fruiting", grain_filling: "Grain Filling", maturity: "Maturity",
    harvest_ready: "Harvest Ready", post_harvest: "Post-Harvest", unknown: "Unknown",
  };
  return labels[s];
}

function riskLevelToNumber(level: RiskLevel): number {
  return { low: 1, moderate: 2, high: 3, severe: 4 }[level];
}

function numberToRiskLevel(n: number): RiskLevel {
  if (n <= 1) return "low";
  if (n <= 2) return "moderate";
  if (n <= 3) return "high";
  return "severe";
}

// ─── Risk Analysis Functions ───────────────────────────────────────────────

function analyzeRainfallRisk(
  weather: WeatherData,
  crop: CropInfo,
  profile: FarmerProfile
): Risk | null {
  const today = weather.daily[0];
  if (!today) return null;

  const rainProb = today.precipitationProbabilityMax;
  const rainfall = today.precipitationSum;
  const isRainStage = crop.rainSensitiveStages.includes(profile.crop.growthStage);

  if (rainfall >= 64.5 || (rainProb >= 90 && rainfall >= 20)) {
    return {
      id: "heavy_rain",
      level: "severe",
      category: "rainfall",
      title: "Heavy Rainfall Alert",
      description: `${Math.round(rainfall)}mm rainfall expected with ${rainProb}% probability. This is classified as very heavy rainfall.`,
      why: `Precipitation of ${Math.round(rainfall)}mm in 24 hours poses significant waterlogging and crop damage risk.`,
      cropImpact: isRainStage
        ? `${crop.name} is in the ${getStageLabel(profile.crop.growthStage)} stage, which is particularly sensitive to heavy rain. Risk of crop lodging, quality deterioration, and yield loss.`
        : `While ${crop.name} can tolerate moderate rain, heavy rainfall may cause waterlogging stress. Waterlogging tolerance: ${crop.waterloggingTolerance}.`,
      recommendation: crop.waterloggingTolerance === "low"
        ? "Ensure field drainage channels are clear. Avoid any field operations. If standing water persists beyond 6 hours, take emergency drainage measures. Protect harvested produce and stored grain from moisture."
        : "Monitor field water levels. Ensure drainage outlets are functional. Avoid unnecessary field operations during rainfall.",
      weatherFactor: `Rainfall: ${Math.round(rainfall)}mm | Probability: ${rainProb}%`,
    };
  }

  if (rainProb >= 60 || rainfall >= 6.5) {
    return {
      id: "moderate_rain",
      level: isRainStage ? "high" : "moderate",
      category: "rainfall",
      title: "Moderate Rainfall Expected",
      description: `${Math.round(rainfall)}mm rainfall expected with ${rainProb}% probability.`,
      why: `Moderate rainfall can benefit crops during vegetative growth but poses risks during sensitive stages.`,
      cropImpact: isRainStage
        ? `${crop.name} in ${getStageLabel(profile.crop.growthStage)} stage is rain-sensitive. Monitor for disease development after rain.`
        : `Moderate rain may reduce irrigation needs. Beneficial for soil moisture.`,
      recommendation: isRainStage
        ? "Post-rain monitoring recommended. Check for signs of disease after conditions dry. Avoid spraying pesticides/fertilizers until rain stops."
        : "Good opportunity to reduce irrigation. Monitor drainage if water accumulates.",
      weatherFactor: `Rainfall: ${Math.round(rainfall)}mm | Probability: ${rainProb}%`,
    };
  }

  return null;
}

function analyzeHeatRisk(
  weather: WeatherData,
  crop: CropInfo,
  profile: FarmerProfile
): Risk | null {
  const { temperature, humidity } = weather.current;
  const today = weather.daily[0];
  const maxTemp = today?.temperatureMax ?? temperature;
  const isFlowering = ["flowering", "fruiting", "grain_filling"].includes(profile.crop.growthStage);

  if (maxTemp >= crop.criticalTempHigh) {
    return {
      id: "extreme_heat",
      level: "severe",
      category: "heat",
      title: "Extreme Heat Alert",
      description: `Temperature expected to reach ${Math.round(maxTemp)}°C, exceeding ${crop.name}'s critical threshold of ${crop.criticalTempHigh}°C.`,
      why: `Temperatures above ${crop.criticalTempHigh}°C can cause severe heat stress, flower/fruit drop, and reduced pollination in ${crop.name}.`,
      cropImpact: isFlowering
        ? `CRITICAL: ${crop.name} in ${getStageLabel(profile.crop.growthStage)} stage is extremely heat-sensitive. Expect flower abortion, poor pollination, and fruit drop. Yield loss likely.`
        : `${crop.name} experiences severe heat stress above ${crop.criticalTempHigh}°C. Growth will slow. Increased water demand.`,
      recommendation: "Irrigate during early morning or late evening (not midday). Provide shade protection for nursery seedlings if possible. Avoid all field operations between 11 AM and 4 PM. Increase irrigation frequency.",
      weatherFactor: `Max temperature: ${Math.round(maxTemp)}°C | Crop threshold: ${crop.criticalTempHigh}°C`,
    };
  }

  if (maxTemp >= crop.criticalTempHigh - 5) {
    const heatIndex = temperature + (humidity > 40 ? (humidity - 40) * 0.1 : 0);
    return {
      id: "heat_stress",
      level: heatIndex > crop.criticalTempHigh ? "high" : "moderate",
      category: "heat",
      title: "Heat Stress Warning",
      description: `Temperature expected near ${Math.round(maxTemp)}°C with ${humidity}% humidity. Heat stress conditions developing.`,
      why: `High temperature combined with humidity creates heat stress conditions. Heat index approximately ${Math.round(heatIndex)}°C.`,
      cropImpact: isFlowering
        ? `${crop.name} in ${getStageLabel(profile.crop.growthStage)} stage may experience reduced pollination and flower/fruit drop.`
        : `Growth may slow. Increased evapotranspiration. Monitor soil moisture.`,
      recommendation: "Ensure adequate soil moisture. Irrigate in early morning. Monitor crop for wilting during afternoon. Apply mulch if available to reduce soil temperature.",
      weatherFactor: `Temperature: ${Math.round(temperature)}°C | Humidity: ${humidity}% | Max: ${Math.round(maxTemp)}°C`,
    };
  }

  return null;
}

function analyzeColdRisk(
  weather: WeatherData,
  crop: CropInfo,
  profile: FarmerProfile
): Risk | null {
  const minTemp = weather.daily[0]?.temperatureMin ?? weather.current.temperature;

  if (minTemp <= crop.criticalTempLow) {
    return {
      id: "extreme_cold",
      level: "severe",
      category: "cold",
      title: "Severe Cold/Frost Alert",
      description: `Temperature expected to drop to ${Math.round(minTemp)}°C, below ${crop.name}'s critical threshold of ${crop.criticalTempLow}°C.`,
      why: `Temperatures at or below ${crop.criticalTempLow}°C can cause frost damage, cell membrane rupture, and plant death in ${crop.name}.`,
      cropImpact: `Frost damage likely for ${crop.name} at this temperature. Young seedlings and flowering crops are most vulnerable. Leaf burn, stem damage, and potential crop loss.`,
      recommendation: "Apply light irrigation before nightfall to protect from frost (wet soil radiates more heat). Cover sensitive seedlings. Use smoke screens if frost is confirmed. Avoid walking on frosted crops.",
      weatherFactor: `Min temperature: ${Math.round(minTemp)}°C | Crop threshold: ${crop.criticalTempLow}°C`,
    };
  }

  if (minTemp <= crop.criticalTempLow + 5) {
    return {
      id: "cold_stress",
      level: "moderate",
      category: "cold",
      title: "Cold Conditions Warning",
      description: `Temperature expected to drop to ${Math.round(minTemp)}°C. Cold stress possible for ${crop.name}.`,
      why: `Temperatures approaching the lower tolerance limit for ${crop.name}. Growth may slow significantly.`,
      cropImpact: `Reduced metabolic activity in ${crop.name}. Growth rate may decrease. Sensitive stages (seedling, flowering) at higher risk.`,
      recommendation: "Monitor temperature overnight. Consider protective measures for sensitive crops. Delay irrigation until temperature rises. Avoid nitrogen fertilizer application during cold periods.",
      weatherFactor: `Min temperature: ${Math.round(minTemp)}°C | Crop lower limit: ${crop.criticalTempLow}°C`,
    };
  }

  return null;
}

function analyzeWindRisk(
  weather: WeatherData,
  crop: CropInfo,
  profile: FarmerProfile
): Risk | null {
  const windSpeed = weather.current.windSpeed;
  const today = weather.daily[0];
  const maxWind = today?.windSpeedMax ?? windSpeed;
  const isWindSensitive = crop.windSensitiveStages.includes(profile.crop.growthStage);

  if (maxWind >= 60) {
    return {
      id: "severe_wind",
      level: "severe",
      category: "wind",
      title: "Severe Wind Alert",
      description: `Wind speeds up to ${Math.round(maxWind)} km/h expected. Dangerous conditions.`,
      why: `Wind speeds above 60 km/h can cause physical damage to crops, uproot trees, and destroy farm infrastructure.`,
      cropImpact: isWindSensitive
        ? `CRITICAL: ${crop.name} in ${getStageLabel(profile.crop.growthStage)} stage is highly vulnerable to wind damage. Expect lodging, stem breakage, and fruit/flower loss.`
        : `${crop.name} may experience lodging (falling over) at these wind speeds.`,
      recommendation: "Secure any loose farm equipment. Avoid spraying operations. Check structural supports for tall crops. Post-harvest produce should be stored securely.",
      weatherFactor: `Max wind: ${Math.round(maxWind)} km/h`,
    };
  }

  if (maxWind >= 40 || (isWindSensitive && maxWind >= 30)) {
    return {
      id: "strong_wind",
      level: isWindSensitive ? "high" : "moderate",
      category: "wind",
      title: "Strong Winds Expected",
      description: `Wind speeds up to ${Math.round(maxWind)} km/h expected.`,
      why: `Strong winds increase evapotranspiration, can cause physical damage to sensitive crops, and affect spraying operations.`,
      cropImpact: isWindSensitive
        ? `${crop.name} in ${getStageLabel(profile.crop.growthStage)} stage may experience wind damage. Monitor for lodging and physical injury.`
        : `Wind will increase water demand. May affect plant posture in tall varieties.`,
      recommendation: "Avoid spraying (pesticides, fertilizers) — wind will cause drift and reduce effectiveness. Check windbreaks. Increase irrigation if prolonged dry windy conditions continue.",
      weatherFactor: `Max wind: ${Math.round(maxWind)} km/h`,
    };
  }

  return null;
}

function analyzeHumidityDiseaseRisk(
  weather: WeatherData,
  crop: CropInfo,
  profile: FarmerProfile
): Risk | null {
  const { humidity, temperature } = weather.current;
  const isHumidStage = crop.humiditySensitiveStages.includes(profile.crop.growthStage);

  // Fungal disease conditions: high humidity + moderate warm temp
  if (humidity >= 85 && temperature >= 20 && temperature <= 32) {
    return {
      id: "disease_risk_high",
      level: isHumidStage ? "high" : "moderate",
      category: "humidity",
      title: "Disease-Favorable Conditions",
      description: `High humidity (${humidity}%) combined with moderate temperature (${Math.round(temperature)}°C) creates conditions favorable for fungal and bacterial diseases.`,
      why: `Most crop diseases thrive at 80-100% humidity and 20-32°C. Current conditions are within this range for extended periods.`,
      cropImpact: isHumidStage
        ? `${crop.name} in ${getStageLabel(profile.crop.growthStage)} stage is particularly susceptible. Common diseases in ${crop.name}: ${crop.commonDiseases.join(", ")}. Weather conditions may favor disease development.`
        : `While current stage is less vulnerable, monitor for early signs of ${crop.commonDiseases.slice(0, 2).join(" and ")}.`,
      recommendation: "Scout crops for early disease signs: unusual spots, discoloration, wilting, or mold. Ensure good air circulation between plants. Avoid overhead irrigation. Apply preventive fungicide if crop is in a critical stage and conditions persist for 2+ days.",
      weatherFactor: `Humidity: ${humidity}% | Temperature: ${Math.round(temperature)}°C | Duration: Extended`,
    };
  }

  if (humidity >= 75 && temperature >= 25 && temperature <= 35) {
    return {
      id: "disease_risk_moderate",
      level: "moderate",
      category: "humidity",
      title: "Moderate Disease Risk",
      description: `Humidity at ${humidity}% with ${Math.round(temperature)}°C temperature may support some disease development.`,
      why: `Humidity above 75% combined with warm temperatures can support fungal spore germination and bacterial growth.`,
      cropImpact: `Monitor ${crop.name} for early signs of ${crop.commonDiseases[0]} and ${crop.commonDiseases[1] || "leaf diseases"}.`,
      recommendation: "Regular crop scouting recommended. Check lower leaves and stem bases for disease signs. Maintain field hygiene.",
      weatherFactor: `Humidity: ${humidity}% | Temperature: ${Math.round(temperature)}°C`,
    };
  }

  return null;
}

function analyzeDroughtRisk(
  weather: WeatherData,
  crop: CropInfo,
  profile: FarmerProfile
): Risk | null {
  // Check for consecutive dry days
  let dryDays = 0;
  for (const day of weather.daily) {
    if (day.precipitationSum < 1 && day.precipitationProbabilityMax < 20) {
      dryDays++;
    } else break;
  }

  if (dryDays >= 5 && crop.irrigationDependence !== "low") {
    return {
      id: "dry_spell",
      level: dryDays >= 7 ? "high" : "moderate",
      category: "drought",
      title: "Extended Dry Spell",
      description: `${dryDays} consecutive dry days forecast with no significant rainfall expected.`,
      why: `Extended dry periods deplete soil moisture. ${crop.name} (irrigation dependence: ${crop.irrigationDependence}) requires regular moisture, especially during ${getStageLabel(profile.crop.growthStage)} stage.`,
      cropImpact: `${crop.name} in ${getStageLabel(profile.crop.growthStage)} stage needs consistent soil moisture. Prolonged dry conditions may cause moisture stress, wilting, and yield reduction.`,
      recommendation: profile.crop.irrigationType === "rainfed"
        ? "Rainfed crop at risk. Monitor soil moisture visually (check for cracking). If available, consider supplemental irrigation. Mulching can help retain soil moisture."
        : "Schedule irrigation based on soil moisture status. Priority: flowering and grain-filling stages. Use drip/sprinkler for water efficiency if available.",
      weatherFactor: `Dry days: ${dryDays} | Rainfall probability: ${weather.daily[0]?.precipitationProbabilityMax ?? 0}%`,
    };
  }

  return null;
}

// ─── Generate Irrigation Advisory ──────────────────────────────────────────

function generateIrrigationAdvisory(
  weather: WeatherData,
  crop: CropInfo,
  profile: FarmerProfile
): { text: string; reason: string; need: "not_needed" | "may_need" | "needed" | "skip" } {
  const { humidity, temperature } = weather.current;
  const today = weather.daily[0];
  const rainProb = today?.precipitationProbabilityMax ?? 0;
  const rainfall = today?.precipitationSum ?? 0;
  const isHighDemandStage = ["flowering", "fruiting", "grain_filling", "vegetative"].includes(profile.crop.growthStage);

  // Rain expected → skip irrigation
  if (rainProb >= 50 && rainfall >= 2.5) {
    return {
      text: `Rain is expected with ${rainProb}% probability (${Math.round(rainfall)}mm). Irrigation can likely be postponed until after the rain event. Monitor actual rainfall and field moisture conditions.`,
      reason: `Forecast rainfall of ${Math.round(rainfall)}mm with ${rainProb}% probability should adequately supplement soil moisture.`,
      need: "skip",
    };
  }

  // High temperature + low humidity + no rain → irrigation needed
  if (temperature >= 30 && humidity < 50 && rainProb < 20 && isHighDemandStage) {
    return {
      text: `Irrigation should be considered. Current conditions: ${Math.round(temperature)}°C, ${humidity}% humidity, no rain expected. ${crop.name} in ${getStageLabel(profile.crop.growthStage)} stage has high water demand.`,
      reason: `High evapotranspiration rate (temperature ${Math.round(temperature)}°C + low humidity ${humidity}%) combined with no expected rainfall creates moisture deficit risk.`,
      need: "needed",
    };
  }

  // Moderate conditions → may need
  if ((temperature >= 28 || humidity < 60) && rainProb < 30 && isHighDemandStage) {
    return {
      text: `Irrigation may be needed in the next 1-2 days if no rain occurs. Current conditions suggest moderate soil moisture depletion. Check soil moisture before deciding.`,
      reason: `Temperature ${Math.round(temperature)}°C and ${humidity}% humidity with ${rainProb}% rain probability suggests moderate evapotranspiration.`,
      need: "may_need",
    };
  }

  // Adequate moisture
  return {
    text: `Irrigation likely not needed immediately. Current humidity at ${humidity}% and temperature ${Math.round(temperature)}°C suggests adequate moisture conditions. Monitor soil moisture before next irrigation cycle.`,
    reason: `Current weather conditions do not suggest urgent irrigation need.`,
    need: "not_needed",
  };
}

// ─── Generate Farm Operation Window ────────────────────────────────────────

function generateOperationWindows(
  weather: WeatherData,
  crop: CropInfo,
  profile: FarmerProfile
) {
  const today = weather.daily[0];
  const rainProb = today?.precipitationProbabilityMax ?? 0;
  const rainfall = today?.precipitationSum ?? 0;
  const windSpeed = weather.current.windSpeed;
  const { humidity, temperature } = weather.current;

  const isDry = rainProb < 20 && rainfall < 1;
  const isWindy = windSpeed > 20;
  const isModerateTemp = temperature >= 15 && temperature <= 35;

  return {
    sowing: {
      suitable: isDry && isModerateTemp && humidity >= 40 && humidity <= 80,
      note: isDry && isModerateTemp
        ? "Good conditions for sowing — dry weather, moderate temperature, adequate humidity."
        : rainProb >= 50
        ? "Delay sowing — rain expected within 24 hours."
        : !isModerateTemp
        ? "Temperature not ideal for sowing — ${temperature < 15 ? 'too cold' : 'too hot'}."
        : "Marginal conditions — check soil moisture and local conditions.",
    },
    irrigation: {
      suitable: rainProb < 30 && !isWindy,
      note: isWindy
        ? "Wind may affect sprinkler/drip efficiency. Consider irrigating during calmer periods."
        : rainProb < 30
        ? "Good conditions for irrigation."
        : "Rain likely — postpone irrigation.",
    },
    spraying: {
      suitable: isDry && !isWindy && humidity < 80,
      note: !isWindy && isDry
        ? "Good window for spraying — calm, dry conditions. Spray in early morning or late evening for best results."
        : isWindy
        ? "Not suitable for spraying — wind will cause spray drift and reduce effectiveness."
        : "Rain expected — spraying will be washed off. Delay application.",
    },
    harvesting: {
      suitable: isDry && humidity < 70 && windSpeed < 30,
      note: isDry && humidity < 70
        ? "Good harvesting conditions — dry weather with low humidity."
        : rainProb >= 50
        ? "Rain expected — delay harvesting. Moisture in harvested produce will cause spoilage."
        : "High humidity may delay crop drying. Monitor grain moisture if harvesting.",
    },
    fertilizing: {
      suitable: isDry && humidity >= 40 && humidity <= 70 && !isWindy,
      note: isDry && !isWindy
        ? "Good conditions for fertilizer application."
        : isWindy
        ? "Wind may reduce granular fertilizer distribution accuracy."
        : "Rain expected — fertilizer may be washed away. Apply after rain stops.",
    },
    fieldWork: {
      suitable: isDry && rainfall < 5,
      note: isDry
        ? "Good conditions for general field operations."
        : "Wet conditions — avoid field operations to prevent soil compaction and damage.",
    },
  };
}

// ─── Generate Pest & Disease Risk ──────────────────────────────────────────

function generatePestDiseaseRisk(
  weather: WeatherData,
  crop: CropInfo,
  profile: FarmerProfile
): Advisory["pestDiseaseRisk"] {
  const { humidity, temperature } = weather.current;
  const isVulnerableStage = crop.humiditySensitiveStages.includes(profile.crop.growthStage);

  // Check consecutive humid days
  let humidDays = 0;
  for (const day of weather.daily.slice(0, 3)) {
    if (day.precipitationProbabilityMax > 40 || day.precipitationSum > 1) humidDays++;
  }

  if (humidity >= 85 && temperature >= 22 && temperature <= 30 && isVulnerableStage) {
    return {
      level: "high",
      why: `High humidity (${humidity}%) + warm temperature (${Math.round(temperature)}°C) for ${humidDays}+ days creates strong disease-favorable conditions. ${profile.crop.growthStage} stage is particularly vulnerable for ${crop.name}.`,
      whatToMonitor: [
        `Unusual spots or discoloration on leaves (signs of ${crop.commonDiseases[0]})`,
        `White/grey powdery growth on leaf surfaces`,
        `Wilting or stem rot near the soil line`,
        `Any foul smell or slimy texture on stems`,
        `Insect activity: aphids, mites, or caterpillars`,
      ],
      action: `Weather conditions may be favorable for: ${crop.commonDiseases.join(", ")}. Scout the crop every 1-2 days. If disease signs appear, consult local agricultural officer for specific product recommendations. Do NOT apply chemicals without confirmed diagnosis.`,
    };
  }

  if (humidity >= 70 && temperature >= 20 && temperature <= 33) {
    return {
      level: "moderate",
      why: `Moderate humidity (${humidity}%) and temperature (${Math.round(temperature)}°C) may support some disease development over the coming days.`,
      whatToMonitor: [
        "Early signs of leaf spots or discoloration",
        "Insect activity on leaf undersides",
        "Any unusual wilting or stunted growth",
      ],
      action: `Regular scouting recommended for ${crop.name}. Check crop every 2-3 days. Maintain field hygiene and remove any infected plant material if found.`,
    };
  }

  return {
    level: "low",
    why: `Current weather conditions (humidity: ${humidity}%, temp: ${Math.round(temperature)}°C) are not highly favorable for major disease outbreaks.`,
    whatToMonitor: [
      "Periodic crop inspection (weekly)",
      "General insect activity",
    ],
    action: "Continue routine crop monitoring. No immediate disease-favorable conditions detected.",
  };
}

// ─── Main Advisory Generator ───────────────────────────────────────────────

export function generateAdvisory(
  weatherData: WeatherData,
  profile: FarmerProfile
): Advisory {
  const cropLower = profile.crop.name.toLowerCase();
  const cropInfo = CROP_DATABASE[cropLower] || {
    name: profile.crop.name,
    stages: ["sowing", "vegetative", "flowering", "fruiting", "harvest_ready"] as GrowthStage[],
    optimalTempRange: [18, 33] as [number, number],
    criticalTempHigh: 38,
    criticalTempLow: 8,
    humiditySensitiveStages: ["flowering", "fruiting"] as GrowthStage[],
    rainSensitiveStages: ["flowering", "harvest_ready"] as GrowthStage[],
    windSensitiveStages: ["flowering", "fruiting"] as GrowthStage[],
    irrigationDependence: "medium" as const,
    waterloggingTolerance: "medium" as const,
    commonDiseases: ["leaf diseases", "root rot", "powdery mildew"],
    seasonPreference: ["kharif", "rabi"] as Season[],
  };

  // Analyze all risks
  const risks: Risk[] = [];
  const rainRisk = analyzeRainfallRisk(weatherData, cropInfo, profile);
  const heatRisk = analyzeHeatRisk(weatherData, cropInfo, profile);
  const coldRisk = analyzeColdRisk(weatherData, cropInfo, profile);
  const windRisk = analyzeWindRisk(weatherData, cropInfo, profile);
  const humidRisk = analyzeHumidityDiseaseRisk(weatherData, cropInfo, profile);
  const droughtRisk = analyzeDroughtRisk(weatherData, cropInfo, profile);

  if (rainRisk) risks.push(rainRisk);
  if (heatRisk) risks.push(heatRisk);
  if (coldRisk) risks.push(coldRisk);
  if (windRisk) risks.push(windRisk);
  if (humidRisk) risks.push(humidRisk);
  if (droughtRisk) risks.push(droughtRisk);

  // Calculate overall risk
  let maxRiskNum = 0;
  let riskSum = 0;
  for (const r of risks) {
    const n = riskLevelToNumber(r.level);
    if (n > maxRiskNum) maxRiskNum = n;
    riskSum += n;
  }
  const riskScore = risks.length === 0 ? 5 : Math.min(100, Math.round((riskSum / (risks.length * 4)) * 100));
  const overallRisk = numberToRiskLevel(maxRiskNum || 0);

  // Generate today's actions
  const todaysActions: string[] = [];
  if (risks.some(r => r.id === "heavy_rain")) {
    todaysActions.push("Ensure all drainage channels are clear before expected rainfall.");
    todaysActions.push("Postpone any field operations until rain stops.");
  }
  if (risks.some(r => r.id === "extreme_heat" || r.id === "heat_stress")) {
    todaysActions.push("Irrigate early morning (before 7 AM) or late evening (after 5 PM).");
    todaysActions.push("Avoid field operations between 11 AM and 4 PM.");
  }
  if (risks.some(r => r.id === "extreme_cold" || r.id === "cold_stress")) {
    todaysActions.push("Apply protective measures before nightfall.");
  }
  if (risks.some(r => r.category === "humidity" && r.level !== "low")) {
    todaysActions.push("Scout crop for disease signs after checking weather conditions.");
  }
  if (risks.some(r => r.id === "dry_spell")) {
    todaysActions.push("Check soil moisture depth before deciding on irrigation.");
  }
  if (todaysActions.length === 0) {
    todaysActions.push("Monitor soil moisture and crop condition.");
    todaysActions.push("Review 3-day forecast for upcoming weather changes.");
  }
  todaysActions.push(`Verify current crop stage and update farm profile if conditions have changed.`);

  // Irrigation advisory
  const irrigation = generateIrrigationAdvisory(weatherData, cropInfo, profile);

  // Daily outlook
  const dayLabels = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  const dailyOutlook: DailyOutlook[] = weatherData.daily.slice(0, 7).map((day, i) => {
    const isDry = day.precipitationProbabilityMax < 20;
    const isWet = day.precipitationProbabilityMax >= 50;
    const isHot = day.temperatureMax >= cropInfo.criticalTempHigh - 3;
    const isCold = day.temperatureMin <= cropInfo.criticalTempLow + 3;

    let agriImpact = "Normal conditions for crop growth.";
    let recommendedAction = "Continue routine monitoring.";

    if (isWet) {
      agriImpact = "Rain expected — moisture levels will increase.";
      recommendedAction = cropInfo.rainSensitiveStages.includes(profile.crop.growthStage)
        ? "Monitor for disease. Protect mature produce."
        : "Good for soil moisture. Skip irrigation if rain is sufficient.";
    } else if (isHot) {
      agriImpact = "High temperatures may stress crops.";
      recommendedAction = "Increase irrigation. Avoid midday field work.";
    } else if (isCold) {
      agriImpact = "Cold conditions may slow crop growth.";
      recommendedAction = "Monitor for cold damage, especially seedlings.";
    } else if (isDry && day.windSpeedMax > 30) {
      agriImpact = "Dry and windy — increased water demand.";
      recommendedAction = "Check irrigation schedule. Avoid spraying.";
    }

    return {
      date: day.date,
      dayLabel: dayLabels[i] || `Day ${i + 1}`,
      weather: weatherCodeToDescription(day.weatherCode),
      tempMax: day.temperatureMax,
      tempMin: day.temperatureMin,
      rainProb: day.precipitationProbabilityMax,
      rainfall: day.precipitationSum,
      windMax: day.windSpeedMax,
      agriImpact,
      recommendedAction,
    };
  });

  // Weather alerts
  const weatherAlerts: Advisory["weatherAlerts"] = [];
  const today = weatherData.daily[0];
  if (today) {
    if (today.precipitationProbabilityMax >= 80 && today.precipitationSum >= 20) {
      weatherAlerts.push({ level: "high", type: "Heavy Rainfall", message: `Heavy rain expected: ${Math.round(today.precipitationSum)}mm with ${today.precipitationProbabilityMax}% probability.` });
    }
    if (today.temperatureMax >= cropInfo.criticalTempHigh) {
      weatherAlerts.push({ level: "severe", type: "Extreme Heat", message: `Temperature may reach ${Math.round(today.temperatureMax)}°C, above crop critical threshold.` });
    }
    if (today.windSpeedMax >= 50) {
      weatherAlerts.push({ level: "high", type: "Strong Wind", message: `Wind gusts up to ${Math.round(today.windSpeedMax)} km/h expected.` });
    }
    if (today.temperatureMin <= cropInfo.criticalTempLow) {
      weatherAlerts.push({ level: "severe", type: "Cold/Frost", message: `Temperature may drop to ${Math.round(today.temperatureMin)}°C, below crop tolerance.` });
    }
  }

  // Confidence
  const hasLocation = profile.location.latitude != null;
  const hasCropStage = profile.crop.growthStage !== "unknown";
  const hasSoil = profile.crop.soilType !== "unknown";
  const hasIrrigation = profile.crop.irrigationType !== "unknown";
  const confidencePoints = [hasLocation, hasCropStage, hasSoil, hasIrrigation].filter(Boolean).length;

  let confidenceLevel: "high" | "medium" | "low" = "low";
  let confidenceReason = "Limited farm profile data. Provide more details for better recommendations.";
  if (confidencePoints >= 3) {
    confidenceLevel = "high";
    confidenceReason = "Based on current weather observations and 7-day forecast with detailed farm profile.";
  } else if (confidencePoints >= 2) {
    confidenceLevel = "medium";
    confidenceReason = "Based on weather data with partial farm profile. Add more details (soil type, irrigation type) for higher confidence.";
  }

  // Overall crop impact summary
  let cropImpactSummary = `For ${cropInfo.name} at ${getStageLabel(profile.crop.growthStage)} stage: `;
  if (overallRisk === "severe") {
    cropImpactSummary += "SEVERE conditions detected. Immediate protective action required. Monitor crop closely and follow urgent recommendations.";
  } else if (overallRisk === "high") {
    cropImpactSummary += "High-risk conditions present. Active monitoring and protective measures recommended for the next 24-48 hours.";
  } else if (overallRisk === "moderate") {
    cropImpactSummary += "Moderate conditions. Some weather factors may affect crop performance. Routine monitoring with attention to specific risk areas.";
  } else {
    cropImpactSummary += "Favorable conditions. Continue standard crop management practices.";
  }

  // Build advisory
  return {
    location: {
      state: profile.location.state,
      district: profile.location.district,
      country: "India",
    },
    crop: {
      name: cropInfo.name,
      variety: profile.crop.variety,
      growthStage: profile.crop.growthStage,
      season: profile.crop.season,
      irrigationType: profile.crop.irrigationType,
    },
    advisoryDate: new Date().toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }),
    currentConditions: {
      temperature: weatherData.current.temperature,
      humidity: weatherData.current.humidity,
      windSpeed: weatherData.current.windSpeed,
      rainProb: today?.precipitationProbabilityMax ?? 0,
      rainfall: today?.precipitationSum ?? 0,
      condition: weatherCodeToDescription(weatherData.current.weatherCode),
      uvIndex: weatherData.current.uvIndex,
    },
    overallRisk,
    riskScore,
    risks,
    cropImpact: cropImpactSummary,
    todaysActions: todaysActions.slice(0, 6),
    irrigationAdvisory: irrigation.text,
    irrigationReason: irrigation.reason,
    irrigationNeed: irrigation.need,
    dailyOutlook,
    pestDiseaseRisk: generatePestDiseaseRisk(weatherData, cropInfo, profile),
    farmOperationWindow: generateOperationWindows(weatherData, cropInfo, profile),
    weatherAlerts,
    confidence: {
      level: confidenceLevel,
      reason: confidenceReason,
    },
    sources: {
      weather: ["Open-Meteo Weather API (open-meteo.com)", `Location: ${weatherData.location.name}, ${weatherData.location.country}`],
      agricultural: [
        "ICAR — Indian Council of Agricultural Research guidelines",
        "IMD Agromet Advisory Services (mausam.imd.gov.in)",
        "State Agricultural Universities crop management recommendations",
      ],
      official: [
        "WeatherGPT AI interpretation — not an official government advisory",
      ],
    },
  };
}
