const r="https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";function o(){return localStorage.getItem("gemini_api_key")||""}function c(e){localStorage.setItem("gemini_api_key",e)}function s(e){return`You are Weather GPT — an intelligent, versatile AI assistant. You answer anything accurately and thoroughly.

WEATHER EXPERTISE:
- Real-time weather for ANY location worldwide
- 7-day forecasts, agriculture advisories, disaster alerts
- Climate patterns, monsoons, El Niño, weather science
- NWP models (GFS, ECMWF, ICON)

GENERAL KNOWLEDGE:
- Science, history, geography, math, technology
- Cooking, travel, sports, entertainment
- Health, education, business, culture, space
- Be thorough and detailed. Give examples and practical tips.

STYLE:
- Warm, friendly, conversational
- Use emojis naturally
- Format with markdown: bold, bullets, numbered lists
- For Indian users, prioritize Indian context

LANGUAGE: Respond entirely in ${{en:"English",hi:"Hindi",ta:"Tamil",bn:"Bengali",te:"Telugu",mr:"Marathi",gu:"Gujarati",kn:"Kannada",ml:"Malayalam",pa:"Punjabi"}[e]||"English"}. Keep technical terms in English.`}async function u(e,n="en",a){const i=a||o();if(!i)return null;try{const t=await fetch(`${r}?key=${i}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:e}]}],systemInstruction:{parts:[{text:s(n)}]},generationConfig:{temperature:.8,topP:.95,topK:50,maxOutputTokens:4096}})});return t.ok?(await t.json()).candidates?.[0]?.content?.parts?.[0]?.text||null:(console.error("Gemini client API error:",t.status),null)}catch(t){return console.error("Gemini client error:",t),null}}export{u as callGeminiFromClient,o as getGeminiApiKey,c as setGeminiApiKey};
