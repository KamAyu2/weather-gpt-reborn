const o="https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";function s(){return localStorage.getItem("gemini_api_key")||""}function u(t){localStorage.setItem("gemini_api_key",t)}function l(t){return`You are Weather GPT — an intelligent, versatile AI assistant. You answer anything accurately and thoroughly.

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

LANGUAGE: Respond entirely in ${{en:"English",hi:"Hindi",ta:"Tamil",bn:"Bengali",te:"Telugu",mr:"Marathi",gu:"Gujarati",kn:"Kannada",ml:"Malayalam",pa:"Punjabi"}[t]||"English"}. Keep technical terms in English.`}async function m(t,n="en",a){const i=a||s();if(!i)return null;try{const e=await fetch(`${o}?key=${i}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:t}]}],systemInstruction:{parts:[{text:l(n)}]},generationConfig:{temperature:.8,topP:.95,topK:50,maxOutputTokens:4096}})});if(!e.ok){const r=await e.text().catch(()=>"unknown");return console.error("Gemini client API error:",e.status,r),null}return(await e.json()).candidates?.[0]?.content?.parts?.[0]?.text||null}catch(e){return console.error("Gemini client error:",e),null}}export{m as callGeminiFromClient,s as getGeminiApiKey,u as setGeminiApiKey};
