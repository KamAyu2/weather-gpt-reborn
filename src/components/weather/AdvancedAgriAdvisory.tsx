import { useState, useMemo } from "react";
import {
  Sprout, Droplets, Bug, Scissors, AlertTriangle, CheckCircle,
  Thermometer, Wind, Cloud, Sun, ChevronDown, ChevronUp, Info,
  MapPin, Calendar, Droplet, Leaf, TrendingUp, Shield, BookOpen,
  X, Loader2,
} from "lucide-react";
import type { WeatherData } from "@/convex/weather";
import {
  generateAdvisory,
  type FarmerProfile,
  type Advisory,
  type GrowthStage,
  type Season,
  type SoilType,
  type IrrigationType,
  type RiskLevel,
} from "@/lib/agri-risk-engine";
import { useLanguage } from "@/lib/i18n";

interface AdvancedAgriAdvisoryProps {
  weatherData: WeatherData;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Puducherry",
];

const COMMON_CROPS = [
  "Rice", "Wheat", "Soybean", "Cotton", "Maize", "Sugarcane",
  "Tomato", "Potato", "Groundnut", "Pulses", "Chickpea", "Mustard",
  "Onion", "Chilli", "Turmeric", "Ginger", "Banana", "Mango",
  "Grapes", "Pomegranate", "Citrus", "Tea", "Coffee", "Coconut",
];

const GROWTH_STAGES: { value: GrowthStage; label: string }[] = [
  { value: "land_preparation", label: "Land Preparation" },
  { value: "sowing", label: "Sowing" },
  { value: "germination", label: "Germination" },
  { value: "seedling", label: "Seedling" },
  { value: "vegetative", label: "Vegetative" },
  { value: "flowering", label: "Flowering" },
  { value: "fruiting", label: "Fruiting" },
  { value: "grain_filling", label: "Grain Filling" },
  { value: "maturity", label: "Maturity" },
  { value: "harvest_ready", label: "Harvest Ready" },
  { value: "post_harvest", label: "Post-Harvest" },
  { value: "unknown", label: "Not sure" },
];

const SEASONS: { value: Season; label: string }[] = [
  { value: "kharif", label: "Kharif (Monsoon, Jun-Oct)" },
  { value: "rabi", label: "Rabi (Winter, Nov-Mar)" },
  { value: "zaid", label: "Zaid (Summer, Mar-Jun)" },
  { value: "unknown", label: "Not sure" },
];

const SOIL_TYPES: { value: SoilType; label: string }[] = [
  { value: "clay", label: "Clay" },
  { value: "sandy", label: "Sandy" },
  { value: "loam", label: "Loam" },
  { value: "silt", label: "Silt" },
  { value: "peaty", label: "Peaty" },
  { value: "unknown", label: "Not sure" },
];

const IRRIGATION_TYPES: { value: IrrigationType; label: string }[] = [
  { value: "irrigated", label: "Irrigated (Canal/Borewell)" },
  { value: "rainfed", label: "Rainfed (No irrigation)" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "drip", label: "Drip" },
  { value: "unknown", label: "Not sure" },
];

function riskColor(level: RiskLevel): string {
  switch (level) {
    case "low": return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800";
    case "moderate": return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800";
    case "high": return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800";
    case "severe": return "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800";
  }
}

function riskEmoji(level: RiskLevel): string {
  switch (level) {
    case "low": return "🟢";
    case "moderate": return "🟡";
    case "high": return "🟠";
    case "severe": return "🔴";
  }
}

function riskBadge(level: RiskLevel): string {
  switch (level) {
    case "low": return "Low Risk";
    case "moderate": return "Moderate Risk";
    case "high": return "High Risk";
    case "severe": return "Severe Risk";
  }
}

function irrigationEmoji(need: string): string {
  switch (need) {
    case "needed": return "💧 Irrigation Recommended";
    case "may_need": return "💧 May Need Irrigation";
    case "skip": return "🌧 Rain Expected — Skip Irrigation";
    default: return "✅ Irrigation Not Needed Now";
  }
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-border/30">{children}</div>}
    </div>
  );
}

export function AdvancedAgriAdvisory({ weatherData }: AdvancedAgriAdvisoryProps) {
  const { translate } = useLanguage();
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<FarmerProfile>({
    location: { state: "", district: "", latitude: weatherData.location.latitude, longitude: weatherData.location.longitude },
    crop: { name: "", variety: "", season: "unknown", growthStage: "unknown", irrigationType: "unknown", soilType: "unknown" },
  });

  const advisory: Advisory | null = useMemo(() => {
    if (!profile.crop.name) return null;
    return generateAdvisory(weatherData, profile);
  }, [weatherData, profile]);

  const hasProfile = profile.crop.name.length > 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/20 dark:to-emerald-950/20 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600/10">
              <Sprout className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{translate("agri.advancedTitle")}</h3>
              <p className="text-[10px] text-muted-foreground">
                {translate("agri.advancedSubtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Sprout className="h-3 w-3" />
            {showProfile ? translate("agri.hideProfile") : hasProfile ? translate("agri.editProfile") : translate("agri.setFarmProfile")}
          </button>
        </div>
      </div>

      {/* Farmer Profile Form */}
      {showProfile && (
        <div className="p-5 border-b border-border/30 bg-muted/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> {translate("agri.location")}
              </h4>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">{translate("agri.state")}</label>
                <select
                  value={profile.location.state}
                  onChange={(e) => setProfile(p => ({ ...p, location: { ...p.location, state: e.target.value } }))}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">{translate("agri.district")}</label>
                <input
                  type="text"
                  value={profile.location.district}
                  onChange={(e) => setProfile(p => ({ ...p, location: { ...p.location, district: e.target.value } }))}
                  placeholder="e.g. Pune, Nashik"
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Crop */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Leaf className="h-3 w-3" /> {translate("agri.cropInfo")}
              </h4>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">{translate("agri.cropName")}</label>
                <select
                  value={profile.crop.name}
                  onChange={(e) => setProfile(p => ({ ...p, crop: { ...p.crop, name: e.target.value } }))}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="">Select Crop</option>
                  {COMMON_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">{translate("agri.variety")}</label>
                <input
                  type="text"
                  value={profile.crop.variety || ""}
                  onChange={(e) => setProfile(p => ({ ...p, crop: { ...p.crop, variety: e.target.value } }))}
                  placeholder="e.g. Basmati, Hybrid-1"
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">{translate("agri.growthStageLabel")}</label>
                <select
                  value={profile.crop.growthStage}
                  onChange={(e) => setProfile(p => ({ ...p, crop: { ...p.crop, growthStage: e.target.value as GrowthStage } }))}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {GROWTH_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Season & Farm */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> {translate("agri.seasonFarm")}
              </h4>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">{translate("agri.seasonLabel")}</label>
                <select
                  value={profile.crop.season}
                  onChange={(e) => setProfile(p => ({ ...p, crop: { ...p.crop, season: e.target.value as Season } }))}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">{translate("agri.irrigationTypeLabel")}</label>
                <select
                  value={profile.crop.irrigationType}
                  onChange={(e) => setProfile(p => ({ ...p, crop: { ...p.crop, irrigationType: e.target.value as IrrigationType } }))}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {IRRIGATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">{translate("agri.soilTypeLabel")}</label>
                <select
                  value={profile.crop.soilType}
                  onChange={(e) => setProfile(p => ({ ...p, crop: { ...p.crop, soilType: e.target.value as SoilType } }))}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowProfile(false)}
              disabled={!profile.crop.name}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {hasProfile ? translate("agri.generateAdvisory") : translate("agri.selectCropFirst")}
            </button>
          </div>
        </div>
      )}

      {/* Advisory Content */}
      {!hasProfile && !advisory && (
        <div className="p-8 text-center">
          <Sprout className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">{translate("agri.setProfilePrompt")}</p>
          <p className="mt-1.5 text-xs text-muted-foreground/60 max-w-xs mx-auto">
            {translate("agri.setProfileInstructions")}
          </p>
          <button
            onClick={() => setShowProfile(true)}
            className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            {translate("agri.setFarmProfile")}
          </button>
        </div>
      )}

      {advisory && (
        <div className="p-5 space-y-4">
          {/* ─── Advisory Header ─────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{advisory.location.district || advisory.location.state}, {advisory.location.state}</span>
            <span>•</span>
            <span>{advisory.crop.name}{advisory.crop.variety ? ` (${advisory.crop.variety})` : ""}</span>
            <span>•</span>
            <span>{getStageLabel(advisory.crop.growthStage)}</span>
            <span>•</span>
            <span>{advisory.advisoryDate}</span>
          </div>

          {/* ─── Overall Risk Badge ──────────────────────────────────── */}
          <div className={`flex items-center gap-3 rounded-xl border p-4 ${riskColor(advisory.overallRisk)}`}>
            <span className="text-xl">{riskEmoji(advisory.overallRisk)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Overall Risk: {riskBadge(advisory.overallRisk)}</span>
                <span className="text-[10px] opacity-70">Score: {advisory.riskScore}/100</span>
              </div>
              <p className="text-xs mt-0.5 opacity-80">{advisory.cropImpact}</p>
            </div>
          </div>

          {/* ─── Current Conditions ──────────────────────────────────── */}
          <CollapsibleSection title={translate("agri.currentConditions")} icon={Cloud} defaultOpen={true}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {[
                { label: translate("agri.temperatureLabel"), value: `${Math.round(advisory.currentConditions.temperature)}°C`, icon: Thermometer },
                { label: translate("agri.humidityLabel"), value: `${advisory.currentConditions.humidity}%`, icon: Droplets },
                { label: translate("agri.windLabel"), value: `${Math.round(advisory.currentConditions.windSpeed)} km/h`, icon: Wind },
                { label: translate("agri.rainProbLabel"), value: `${advisory.currentConditions.rainProb}%`, icon: Cloud },
                { label: translate("agri.rainfallLabel"), value: `${Math.round(advisory.currentConditions.rainfall)}mm`, icon: Droplet },
                { label: translate("agri.conditionLabel"), value: advisory.currentConditions.condition, icon: Sun },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-xs font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ─── Weather Alerts ──────────────────────────────────────── */}
          {advisory.weatherAlerts.length > 0 && (
            <CollapsibleSection title={translate("agri.weatherAlertsLabel")} icon={AlertTriangle} defaultOpen={true}>
              <div className="space-y-2 mt-3">
                {advisory.weatherAlerts.map((alert, i) => (
                  <div key={i} className={`flex items-start gap-2 rounded-lg border p-3 ${riskColor(alert.level)}`}>
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">{alert.type}</p>
                      <p className="text-xs mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* ─── Detailed Risks ──────────────────────────────────────── */}
          {advisory.risks.length > 0 && (
            <CollapsibleSection title={translate("agri.riskAnalysis")} icon={Shield} defaultOpen={true}>
              <div className="space-y-3 mt-3">
                {advisory.risks.map((risk) => (
                  <div key={risk.id} className="rounded-lg border border-border/40 bg-background/50 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{riskEmoji(risk.level)}</span>
                      <span className="text-xs font-semibold">{risk.title}</span>
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${riskColor(risk.level)}`}>
                        {risk.level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-[10px] text-muted-foreground mb-1">{translate("agri.whyItMatters")}</p>
                      <p className="text-xs">{risk.why}</p>
                    </div>
                    <div className="rounded-lg bg-primary/5 p-2">
                      <p className="text-[10px] text-primary/70 mb-1">{translate("agri.recommendationLabel")}</p>
                      <p className="text-xs">{risk.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* ─── Today's Actions ─────────────────────────────────────── */}
          <CollapsibleSection title={translate("agri.todayActions")} icon={CheckCircle} defaultOpen={true}>
            <ol className="mt-3 space-y-2">
              {advisory.todaysActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </CollapsibleSection>

          {/* ─── Irrigation Advisory ─────────────────────────────────── */}
          <CollapsibleSection title={translate("agri.irrigationAdvisoryLabel")} icon={Droplets}>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{irrigationEmoji(advisory.irrigationNeed)}</span>
              </div>
              <p className="text-xs leading-relaxed">{advisory.irrigationAdvisory}</p>
              <div className="rounded-lg bg-muted/30 p-2">
                <p className="text-[10px] text-muted-foreground mb-1">{translate("agri.reasoning")}</p>
                <p className="text-xs">{advisory.irrigationReason}</p>
              </div>
            </div>
          </CollapsibleSection>

          {/* ─── 3-7 Day Outlook ─────────────────────────────────────── */}
          <CollapsibleSection title={translate("agri.outlook37")} icon={TrendingUp}>
            <div className="mt-3 space-y-2">
              {advisory.dailyOutlook.map((day) => (
                <div key={day.date} className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-2.5 border border-border/30">
                  <div className="w-16 shrink-0">
                    <p className="text-[10px] font-semibold">{day.dayLabel}</p>
                    <p className="text-[9px] text-muted-foreground">{day.date}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate">{day.weather}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {Math.round(day.tempMin)}-{Math.round(day.tempMax)}°C · Rain: {day.rainProb}% · Wind: {Math.round(day.windMax)} km/h
                    </p>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[10px] text-muted-foreground">{day.agriImpact}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ─── Pest & Disease Risk ─────────────────────────────────── */}
          <CollapsibleSection title={translate("agri.pestDiseaseRisk")} icon={Bug}>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{riskEmoji(advisory.pestDiseaseRisk.level)}</span>
                <span className="text-xs font-semibold">Risk: {riskBadge(advisory.pestDiseaseRisk.level)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{advisory.pestDiseaseRisk.why}</p>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{translate("agri.whatToMonitor")}</p>
                <ul className="space-y-1">
                  {advisory.pestDiseaseRisk.whatToMonitor.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <span className="text-muted-foreground/50 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-primary/5 p-2">
                <p className="text-[10px] text-primary/70 mb-1">{translate("agri.actionLabel")}</p>
                <p className="text-xs">{advisory.pestDiseaseRisk.action}</p>
              </div>
            </div>
          </CollapsibleSection>

          {/* ─── Farm Operation Window ───────────────────────────────── */}
          <CollapsibleSection title={translate("agri.farmOperationWindow")} icon={Scissors}>
            <div className="mt-3 space-y-2">
              {Object.entries(advisory.farmOperationWindow).map(([key, op]) => (
                <div key={key} className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 border border-border/30">
                  <div className="flex items-center gap-2">
                    {op.suitable
                      ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      : <X className="h-3.5 w-3.5 text-red-500" />
                    }
                    <span className="text-xs font-medium capitalize">{key}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${op.suitable ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                    {op.suitable ? translate("agri.suitable") : translate("agri.notSuitable")}
                  </span>
                </div>
              ))}
              {/* Notes below each */}
              <div className="space-y-1.5 mt-2">
                {Object.entries(advisory.farmOperationWindow).map(([key, op]) => (
                  <p key={key} className="text-[10px] text-muted-foreground">
                    <span className="font-medium capitalize">{key}:</span> {op.note}
                  </p>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* ─── Advisory Confidence ─────────────────────────────────── */}
          <CollapsibleSection title={translate("agri.advisoryConfidence")} icon={Info}>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  advisory.confidence.level === "high" ? "bg-emerald-50 text-emerald-600" :
                  advisory.confidence.level === "medium" ? "bg-amber-50 text-amber-600" :
                  "bg-red-50 text-red-600"
                }`}>
                  {advisory.confidence.level.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{advisory.confidence.reason}</p>
            </div>
          </CollapsibleSection>

          {/* ─── Sources ─────────────────────────────────────────────── */}
          <CollapsibleSection title={translate("agri.sourcesTransparency")} icon={BookOpen}>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{translate("agri.weatherData")}</p>
                <ul className="space-y-1">
                  {advisory.sources.weather.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{translate("agri.agriKnowledge")}</p>
                <ul className="space-y-1">
                  {advisory.sources.agricultural.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{translate("agri.disclaimer")}</p>
                <ul className="space-y-1">
                  {advisory.sources.official.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

function getStageLabel(s: GrowthStage): string {
  const labels: Record<string, string> = {
    land_preparation: "Land Preparation", sowing: "Sowing", germination: "Germination",
    seedling: "Seedling", vegetative: "Vegetative", flowering: "Flowering",
    fruiting: "Fruiting", grain_filling: "Grain Filling", maturity: "Maturity",
    harvest_ready: "Harvest Ready", post_harvest: "Post-Harvest", unknown: "Not specified",
  };
  return labels[s] || s;
}
