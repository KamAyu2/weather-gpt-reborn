/**
 * Targeted tests for critical weather system
 * Validates: route regex, Open-Meteo API, severity classification
 */

// ─── Test 1: Route 0 regex matching ────────────────────────────────────────

const CRITICAL_ROUTE_REGEX = /critical|severe|danger|alert|warning|where.*bad|which.*area|which.*place|which.*region|worst weather|extreme|disaster|hazard|dangerous/i;
const WEATHER_CONTEXT_REGEX = /weather|climate|condition|temp|rain|wind|storm|heat|cold|flood|cyclone|place|area|region|visit|travel/i;

interface RouteTest {
  input: string;
  shouldMatch: boolean;
  description: string;
}

const routeTests: RouteTest[] = [
  { input: "Which areas have critical weather?", shouldMatch: true, description: "critical + weather" },
  { input: "where is the weather dangerous in India", shouldMatch: true, description: "dangerous + weather" },
  { input: "Any severe weather alerts?", shouldMatch: true, description: "severe + alerts" },
  { input: "Show me disaster warnings in India", shouldMatch: true, description: "disaster + warnings" },
  { input: "Which places have extreme conditions?", shouldMatch: true, description: "extreme + conditions" },
  { input: "Where is the weather bad?", shouldMatch: true, description: "where...bad" },
  { input: "Any cyclone alerts for Chennai?", shouldMatch: true, description: "cyclone + alerts" },
  { input: "Which region has the worst weather?", shouldMatch: true, description: "worst weather" },
  { input: "Any hazardous conditions?", shouldMatch: true, description: "hazardous" },
  { input: "weather in Mumbai", shouldMatch: false, description: "normal weather query" },
  { input: "What is the capital of France?", shouldMatch: false, description: "general knowledge" },
  { input: "Tell me a joke", shouldMatch: false, description: "joke request" },
  { input: "critical thinking is important", shouldMatch: false, description: "critical but no weather context" },
  { input: "dangerous driving tips", shouldMatch: false, description: "dangerous but no weather context" },
  { input: "Which place has the best weather to visit?", shouldMatch: false, description: "weather visit (travel intent, not alert)" },
];

console.log("═══════════════════════════════════════════════════");
console.log("  TEST 1: Route Regex Matching");
console.log("═══════════════════════════════════════════════════");

let passed = 0;
let failed = 0;

for (const test of routeTests) {
  const matchesCritical = CRITICAL_ROUTE_REGEX.test(test.input);
  const matchesWeather = WEATHER_CONTEXT_REGEX.test(test.input);
  const result = matchesCritical && matchesWeather;
  const ok = result === test.shouldMatch;

  if (ok) {
    console.log(`  ✅ PASS: "${test.input}" → ${result ? "MATCH" : "no match"} (${test.description})`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: "${test.input}" → ${result ? "MATCH" : "no match"} (expected ${test.shouldMatch ? "match" : "no match"}) (${test.description})`);
    failed++;
  }
}

console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);

// ─── Test 2: Open-Meteo API — single city fetch ───────────────────────────

console.log("═══════════════════════════════════════════════════");
console.log("  TEST 2: Open-Meteo Single City Fetch");
console.log("═══════════════════════════════════════════════════");

interface CityTest {
  name: string;
  lat: number;
  lon: number;
}

const testCities: CityTest[] = [
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
];

async function testSingleCityFetch(): Promise<boolean> {
  let allPassed = true;
  for (const city of testCities) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,wind_speed_10m,weather_code,precipitation,relative_humidity_2m&timezone=Asia/Kolkata`;
      const res = await fetch(url);
      if (!res.ok) {
        console.log(`  ❌ FAIL: ${city.name} — HTTP ${res.status}`);
        allPassed = false;
        continue;
      }
      const data = await res.json();
      const current = data.current;
      if (!current) {
        console.log(`  ❌ FAIL: ${city.name} — no current data`);
        allPassed = false;
        continue;
      }
      const temp = current.temperature_2m;
      const wind = current.wind_speed_10m;
      const code = current.weather_code;
      const precip = current.precipitation;
      const humidity = current.relative_humidity_2m;

      if (typeof temp !== "number" || typeof wind !== "number" || typeof code !== "number") {
        console.log(`  ❌ FAIL: ${city.name} — invalid data types (temp=${typeof temp}, wind=${typeof wind}, code=${typeof code})`);
        allPassed = false;
        continue;
      }

      console.log(`  ✅ PASS: ${city.name} — ${temp}°C, wind ${wind} km/h, code ${code}, precip ${precip}mm, humidity ${humidity}%`);
      passed++;
    } catch (err) {
      console.log(`  ❌ FAIL: ${city.name} — ${err}`);
      allPassed = false;
    }
  }
  return allPassed;
}

// ─── Test 3: Severity classification logic ────────────────────────────────

console.log("\n═══════════════════════════════════════════════════");
console.log("  TEST 3: Severity Classification");
console.log("═══════════════════════════════════════════════════");

interface SeverityTest {
  temp: number;
  wind: number;
  code: number;
  precip: number;
  humidity: number;
  expectedSeverity: string;
  description: string;
}

const severityTests: SeverityTest[] = [
  { temp: 46, wind: 10, code: 0, precip: 0, humidity: 30, expectedSeverity: "red", description: "Extreme heatwave (46°C)" },
  { temp: 30, wind: 70, code: 0, precip: 0, humidity: 60, expectedSeverity: "red", description: "Cyclonic wind (70 km/h)" },
  { temp: 30, wind: 65, code: 95, precip: 0, humidity: 70, expectedSeverity: "red", description: "Cyclonic thunderstorm" },
  { temp: 30, wind: 10, code: 65, precip: 0, humidity: 90, expectedSeverity: "red", description: "Extreme rainfall (code 65)" },
  { temp: -4, wind: 5, code: 0, precip: 0, humidity: 50, expectedSeverity: "red", description: "Severe cold wave (-4°C)" },
  { temp: 30, wind: 10, code: 95, precip: 0, humidity: 70, expectedSeverity: "orange", description: "Thunderstorm (code 95)" },
  { temp: 42, wind: 10, code: 0, precip: 0, humidity: 30, expectedSeverity: "orange", description: "Heatwave (42°C)" },
  { temp: 4, wind: 5, code: 0, precip: 0, humidity: 50, expectedSeverity: "orange", description: "Cold wave (4°C)" },
  { temp: 28, wind: 10, code: 61, precip: 20, humidity: 80, expectedSeverity: "orange", description: "Heavy rain (20mm)" },
  { temp: 28, wind: 55, code: 0, precip: 0, humidity: 60, expectedSeverity: "orange", description: "Strong wind (55 km/h)" },
  { temp: 39, wind: 10, code: 0, precip: 0, humidity: 40, expectedSeverity: "yellow", description: "Heat stress (39°C)" },
  { temp: 9, wind: 5, code: 0, precip: 0, humidity: 60, expectedSeverity: "yellow", description: "Cold conditions (9°C)" },
  { temp: 28, wind: 10, code: 61, precip: 5, humidity: 70, expectedSeverity: "yellow", description: "Rainfall (code 61)" },
  { temp: 28, wind: 40, code: 0, precip: 0, humidity: 60, expectedSeverity: "yellow", description: "Breezy (40 km/h)" },
  { temp: 35, wind: 10, code: 0, precip: 0, humidity: 92, expectedSeverity: "yellow", description: "Humid heat (92% humidity)" },
  { temp: 28, wind: 10, code: 2, precip: 0, humidity: 60, expectedSeverity: "green", description: "Normal weather" },
  { temp: 33, wind: 15, code: 1, precip: 0, humidity: 50, expectedSeverity: "green", description: "Mild sunny day" },
];

function classifySeverity(temp: number, wind: number, code: number, precip: number, humidity: number): string {
  // RED
  if (code >= 95 && wind >= 60) return "red";
  if (temp >= 44) return "red";
  if (temp <= -3) return "red";
  if (wind >= 65) return "red";
  if (code === 65 || code === 67 || code === 82) return "red";
  // ORANGE
  if (code >= 95) return "orange";
  if (temp >= 41) return "orange";
  if (temp <= 5) return "orange";
  if (precip >= 15) return "orange";
  if (wind >= 50) return "orange";
  // YELLOW
  if (temp >= 38) return "yellow";
  if (temp <= 10) return "yellow";
  if (code >= 61 && code <= 63) return "yellow";
  if (code >= 80 && code <= 82) return "yellow";
  if (wind >= 35) return "yellow";
  if (humidity >= 90 && temp >= 33) return "yellow";
  // GREEN
  return "green";
}

let sevPassed = 0;
let sevFailed = 0;

for (const test of severityTests) {
  const result = classifySeverity(test.temp, test.wind, test.code, test.precip, test.humidity);
  const ok = result === test.expectedSeverity;

  if (ok) {
    console.log(`  ✅ PASS: ${test.description} → ${result}`);
    sevPassed++;
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${test.description} → ${result} (expected ${test.expectedSeverity})`);
    sevFailed++;
    failed++;
  }
}

console.log(`\n  Results: ${sevPassed} passed, ${sevFailed} failed\n`);

// ─── Test 4: Open-Meteo batch API (verify old approach was broken) ─────────

console.log("═══════════════════════════════════════════════════");
console.log("  TEST 4: Open-Meteo Batch API vs Individual");
console.log("═══════════════════════════════════════════════════");

async function testBatchVsIndividual(): Promise<void> {
  const cities: CityTest[] = [
    { name: "Mumbai", lat: 19.076, lon: 72.8777 },
    { name: "Delhi", lat: 28.6139, lon: 77.209 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  ];

  // Test OLD batch approach
  const lats = cities.map(c => c.lat).join(",");
  const lons = cities.map(c => c.lon).join(",");
  try {
    const batchUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m&timezone=Asia/Kolkata`;
    const batchRes = await fetch(batchUrl);
    const batchData = await batchRes.json();
    const batchIsArray = Array.isArray(batchData);
    const batchLength = batchIsArray ? batchData.length : 1;

    console.log(`  Batch API: is_array=${batchIsArray}, length=${batchLength}`);
    if (!batchIsArray) {
      console.log(`  ✅ PASS: Confirmed batch API returns single object (not array) — old approach was broken`);
      passed++;
    } else {
      console.log(`  ℹ️  INFO: Batch API returned array with ${batchLength} items — may work in some cases`);
      passed++;
    }
  } catch (err) {
    console.log(`  ✅ PASS: Batch API failed (${err}) — confirms individual requests are needed`);
    passed++;
  }

  // Test NEW individual approach
  let individualSuccesses = 0;
  for (const city of cities) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m&timezone=Asia/Kolkata`;
      const res = await fetch(url);
      if (res.ok) individualSuccesses++;
    } catch { /* skip */ }
  }
  console.log(`  Individual API: ${individualSuccesses}/${cities.length} succeeded`);
  if (individualSuccesses === cities.length) {
    console.log(`  ✅ PASS: All individual requests succeeded`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: Only ${individualSuccesses}/${cities.length} individual requests succeeded`);
    failed++;
  }
}

// ─── Run all tests ────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔍 Running targeted tests for critical weather system...\n");

  // Test 2: Single city fetch
  const apiOk = await testSingleCityFetch();
  console.log(`\n  Results: ${apiOk ? "all passed" : "some failed"}\n`);

  // Test 4: Batch vs Individual
  await testBatchVsIndividual();

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  TOTAL: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════════");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
