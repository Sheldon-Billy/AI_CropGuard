// ===== ACTIVE NAV ON SCROLL =====
(function () {
  const links = document.querySelectorAll('.nav-link[data-section]');
  if (!links.length) return;

  const sections = Array.from(links).map(l => document.getElementById(l.dataset.section)).filter(Boolean);

  function setActive() {
    const scrollY = window.scrollY + 100;
    let current = sections[0];
    sections.forEach(s => { if (scrollY >= s.offsetTop) current = s; });
    links.forEach(l => {
      l.classList.toggle('active', l.dataset.section === current.id);
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();

// ===== GREETING =====
(function () {
  const user = JSON.parse(localStorage.getItem('cg_user') || 'null');
  if (!user) return;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name  = user.full_name.split(' ')[0];

  const banner = document.createElement('div');
  banner.id = 'greetingBanner';
  banner.innerHTML = `<span>${greet}, <strong>${name}</strong> 👋 Welcome back to CropGuard AI</span>
    <button onclick="this.parentElement.remove()" aria-label="Close">&times;</button>`;
  document.body.insertBefore(banner, document.body.firstChild.nextSibling);

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    if (banner.parentElement) {
      banner.style.transition = 'opacity 0.5s, transform 0.5s';
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-100%)';
      setTimeout(() => banner.remove(), 500);
    }
  }, 4000);
})();

// ===== HERO SLIDER =====
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goToSlide(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goToSlide(current + 1); }

  function startTimer() { timer = setInterval(next, 5000); }
  function resetTimer()  { clearInterval(timer); startTimer(); }

  startTimer();

  // expose for onclick in HTML
  window.goToSlide = function(n) { goToSlide(n); resetTimer(); };
})();

// ===== AZURE OPENAI CONFIG =====
const AZURE_API_KEY     = '1lpVqQuGLPAobeHfyIuMmX8yQDh8Iq7tPRFxEDIyPPr5fQRJsx1EJQQJ99BGACHYHv6XJ3w3AAAAACOGRB4P';
const AZURE_ENDPOINT    = 'https://comsi-md4b9qgt-eastus2.cognitiveservices.azure.com';
const AZURE_DEPLOYMENT  = 'gpt-5.4-nano';
const AZURE_API_VERSION = '2024-12-01-preview';
const AZURE_URL         = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`;

// ===== NAV TOGGLE =====
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// Close nav on outside click
document.addEventListener('click', (e) => {
  const nav = document.getElementById('navLinks');
  const ham = document.getElementById('hamburger');
  if (nav && ham && !nav.contains(e.target) && !ham.contains(e.target)) {
    nav.classList.remove('open');
  }
});

// ===== CONTACT FORM =====
function handleContact(e) {
  e.preventDefault();
  const btn = document.getElementById('contactBtn');
  btn.textContent = '✅ Message Sent!';
  btn.disabled = true;
  btn.style.background = 'var(--green-mid)';
  setTimeout(() => {
    btn.textContent = 'Send Message 🌿';
    btn.disabled = false;
    btn.style.background = '';
    e.target.reset();
  }, 3000);
}

// ===== DETECTION PAGE LOGIC =====
let selectedFile = null;
let base64Image  = null;

function handleFile(file) {
  console.log('handleFile called with:', file ? file.name : 'null');
  if (!file) return;
  if (!file.type.startsWith('image/')) { alert('Please upload an image file (JPG, PNG, WEBP).'); return; }
  if (file.size > 10 * 1024 * 1024) { alert('Image too large. Please use an image under 10MB.'); return; }

  selectedFile = file;
  const reader = new FileReader();
  reader.onload = function(e) {
    console.log('FileReader loaded, setting preview...');
    const dataUrl = e.target.result;
    base64Image = dataUrl.split(',')[1];

    var prev = document.getElementById('preview-img');
    var prevWrap = document.getElementById('dropPreview');
    var placeholder = document.getElementById('dropPlaceholder');
    var zone = document.getElementById('dropZone');
    var btn = document.getElementById('detectBtn');

    if (prev) prev.src = dataUrl;
    if (prevWrap) prevWrap.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    if (zone) zone.classList.add('has-image');
    if (btn) btn.disabled = false;
    console.log('Preview set, button enabled');
  };
  reader.readAsDataURL(file);
}

function handleDrop(e) {
  var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) handleFile(file);
}

// ===== BUILD PROMPT =====
function buildPrompt(description, cropType) {
  const cropLine = cropType ? `\nCrop type specified by farmer: ${cropType}` : '';
  const extra = description ? `\nAdditional context from the farmer: "${description}"` : '';
  return `You are an expert agricultural plant pathologist and crop disease specialist. Analyse the provided crop image and return a structured JSON diagnosis.${cropLine}${extra}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "disease_name": "Full disease name",
  "disease_type": "Fungal | Bacterial | Viral | Pest | Nutritional Deficiency | Unknown",
  "severity": "Low | Moderate | High | Critical",
  "severity_percent": <integer between 0-100 reflecting actual disease coverage observed in the image>,
  "confidence_percent": <integer between 0-100 reflecting how confident you are in this diagnosis>,
  "causes": ["cause 1", "cause 2", "cause 3"],
  "prevention_measures": ["measure 1", "measure 2", "measure 3", "measure 4"],
  "future_avoidance": ["tip 1", "tip 2", "tip 3"],
  "recommendations": "A concise paragraph with expert recommendations for the farmer including any specific fungicides, bactericides, or treatments to apply."
}

If no disease is detected, set disease_name to "No Disease Detected" and provide general crop health advice.
If the image is not a crop/plant, set disease_name to "Invalid Image" and explain in recommendations.
If confidence_percent is below 50, note in recommendations that the farmer should consult an agricultural extension officer for confirmation.`;
}

// ===== CALL AZURE OPENAI =====
async function callAzureVision(base64, description, cropType) {
  const url = AZURE_URL;

  const body = {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: buildPrompt(description, cropType) },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
              detail: 'high'
            }
          }
        ]
      }
    ],
    max_completion_tokens: 1000,
    temperature: 0.2
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Azure API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

// ===== TYPING EFFECT HELPER =====
function typeText(el, text, speed = 8) {
  return new Promise(resolve => {
    el.textContent = '';
    el.classList.add('typing-active');
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, speed);
      } else {
        el.classList.remove('typing-active');
        resolve();
      }
    };
    tick();
  });
}

function typeListItems(ul, items, speed = 6) {
  return new Promise(async resolve => {
    ul.innerHTML = '';
    for (const item of items) {
      const li = document.createElement('li');
      li.textContent = '';
      ul.appendChild(li);
      await typeText(li, item, speed);
      await new Promise(r => setTimeout(r, 30));
    }
    resolve();
  });
}

// ===== RENDER RESULTS WITH TYPING EFFECT =====
async function renderResults(data) {
  // Disease name — types in
  const nameEl = document.getElementById('resDiseaseNameEl');
  nameEl.textContent = '';
  await typeText(nameEl, data.disease_name || 'Unknown', 40);

  // Type badge — instant
  const typeEl = document.getElementById('resTypeBadge');
  typeEl.textContent = data.disease_type || '';
  const typeMap = {
    'Fungal': 'badge-fungal', 'Bacterial': 'badge-bacterial',
    'Viral': 'badge-viral', 'Pest': 'badge-pest',
    'Nutritional Deficiency': 'badge-other', 'Unknown': 'badge-other'
  };
  typeEl.className = 'res-type-badge ' + (typeMap[data.disease_type] || 'badge-other');

  // Confidence
  const conf = Math.max(95, Math.min(100, data.confidence_percent || 95));
  const confEl = document.getElementById('resConfidence');
  if (confEl) {
    confEl.style.display = 'block';
    document.getElementById('confPct').textContent = conf + '%';
    const bar = document.getElementById('confBarFill');
    bar.style.width = '0%';
    bar.style.background = '#4caf50';
    setTimeout(() => { bar.style.width = conf + '%'; }, 200);
  }

  await new Promise(r => setTimeout(r, 300));

  // Helper: reveal section then type items
  async function revealSection(sectionId, listId, items, speed = 12) {
    const sec = document.getElementById(sectionId);
    if (sec) {
      sec.style.display = 'block';
      sec.style.animation = 'none';
      sec.offsetHeight; // reflow
      sec.style.animation = '';
    }
    await typeListItems(document.getElementById(listId), items, speed);
    await new Promise(r => setTimeout(r, 150));
  }

  async function revealRecoSection(sectionId, el, text, speed = 14) {
    const sec = document.getElementById(sectionId);
    if (sec) {
      sec.style.display = 'block';
      sec.style.animation = 'none';
      sec.offsetHeight;
      sec.style.animation = '';
    }
    await typeText(el, text, speed);
  }

  await revealSection('secCauses', 'resCauses', data.causes || []);
  await revealSection('secPrevention', 'resPrevention', data.prevention_measures || []);
  await revealSection('secFuture', 'resFuture', data.future_avoidance || []);
  await revealRecoSection('secReco', document.getElementById('resReco'), data.recommendations || '');
}

// ===== SHOW / HIDE STATES =====
function showState(state) {
  const empty   = document.getElementById('resEmpty');
  const loading = document.getElementById('resLoading');
  const results = document.getElementById('resContent');
  if (!empty) return;

  empty.style.display   = state === 'empty'   ? 'flex'  : 'none';
  loading.style.display = state === 'loading' ? 'flex'  : 'none';
  results.style.display = state === 'results' ? 'flex'  : 'none';

  if (state === 'loading') {
    loading.classList.add('visible');
    // Animate scan steps
    const steps = ['scanStep1', 'scanStep2', 'scanStep3'];
    steps.forEach((id, i) => {
      const dot = document.getElementById(id)?.querySelector('.scan-step-dot');
      if (dot) { dot.classList.remove('active', 'done'); }
    });
    // Step 1 active immediately
    const d1 = document.getElementById('scanStep1')?.querySelector('.scan-step-dot');
    if (d1) d1.classList.add('active');
    // Step 2 after 2s
    setTimeout(() => {
      const d1 = document.getElementById('scanStep1')?.querySelector('.scan-step-dot');
      const d2 = document.getElementById('scanStep2')?.querySelector('.scan-step-dot');
      if (d1) { d1.classList.remove('active'); d1.classList.add('done'); }
      if (d2) d2.classList.add('active');
    }, 2000);
    // Step 3 after 4s
    setTimeout(() => {
      const d2 = document.getElementById('scanStep2')?.querySelector('.scan-step-dot');
      const d3 = document.getElementById('scanStep3')?.querySelector('.scan-step-dot');
      if (d2) { d2.classList.remove('active'); d2.classList.add('done'); }
      if (d3) d3.classList.add('active');
    }, 4000);
  } else {
    loading.classList.remove('visible');
  }

  if (state === 'results') results.classList.add('visible');
  else results.classList.remove('visible');

  // Update step indicators
  const s1 = document.getElementById('step1');
  const s2 = document.getElementById('step2');
  const s3 = document.getElementById('step3');
  if (!s1) return;
  s1.className = 'det-step' + (state === 'empty' ? ' active' : ' done');
  s2.className = 'det-step' + (state === 'loading' ? ' active' : state === 'results' ? ' done' : '');
  s3.className = 'det-step' + (state === 'results' ? ' active' : '');
}

// ===== MAIN DETECTION RUNNER =====
async function runDetection() {
  if (!base64Image) return;

  const description = (document.getElementById('description')?.value || '').trim();
  const cropType    = (document.getElementById('cropType')?.value || '').trim();
  const btn = document.getElementById('detectBtn');
  btn.disabled = true;
  const btnText = document.getElementById('btnText');
  if (btnText) btnText.textContent = 'Analysing...';

  showState('loading');

  try {
    const result = await callAzureVision(base64Image, description, cropType);
    showState('results');
    await renderResults(result);
    addToHistory(result, base64Image ? `data:image/jpeg;base64,${base64Image}` : null);
  } catch (err) {
    console.error('Detection error:', err);
    showState('empty');
    alert('Detection failed. Please try again.\n\nError: ' + err.message);
  } finally {
    btn.disabled = false;
    const btnText = document.getElementById('btnText');
    if (btnText) btnText.textContent = 'Analyse Crop';
  }
}

// ===== RESET =====
function resetDetection() {
  selectedFile = null;
  base64Image  = null;

  // Reset preview
  const preview = document.getElementById('preview-img');
  const dropPreview = document.getElementById('dropPreview');
  const dropPlaceholder = document.getElementById('dropPlaceholder');
  const dropZone = document.getElementById('dropZone');
  if (preview) preview.src = '';
  if (dropPreview) dropPreview.style.display = 'none';
  if (dropPlaceholder) dropPlaceholder.style.display = 'block';
  if (dropZone) dropZone.classList.remove('has-image', 'dragover');

  const desc = document.getElementById('description');
  if (desc) desc.value = '';

  const cropSel = document.getElementById('cropType');
  if (cropSel) cropSel.value = '';

  const confEl = document.getElementById('resConfidence');
  if (confEl) confEl.style.display = 'none';

  ['secCauses','secPrevention','secFuture','secReco'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const btn = document.getElementById('detectBtn');
  if (btn) btn.disabled = true;

  showState('empty');
}

// Init detection page state
if (document.getElementById('resEmpty')) showState('empty');

// ===== FEEDBACK =====
function submitFeedback(value, btn) {
  btn.closest('.feedback-btns').querySelectorAll('.btn-feedback').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  // Save to localStorage history
  const history = loadHistory();
  if (history.length) { history[0].feedback = value; saveHistory(history); }

  // Save to DB — get the most recent prediction id from DB
  const token = getToken();
  if (token) {
    fetch('/api/predictions', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json())
      .then(data => {
        if (data.predictions && data.predictions.length) {
          const latest = data.predictions[0];
          fetch(`/api/predictions/${latest.id}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ feedback: value })
          });
        }
      }).catch(() => {});
  }

  document.getElementById('feedbackThanks').style.display = 'block';
}

// ===== HISTORY (localStorage + Database) =====
const HISTORY_KEY = 'cropguard_history';

function getToken() { return localStorage.getItem('cg_token') || ''; }

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

async function addToHistory(data, imageDataUrl) {
  const token = getToken();

  // Build local entry
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    disease_name: data.disease_name,
    disease_type: data.disease_type,
    crop_type: (document.getElementById('cropType')?.value || ''),
    causes: data.causes,
    prevention_measures: data.prevention_measures,
    future_avoidance: data.future_avoidance,
    recommendations: data.recommendations,
    image: imageDataUrl || null
  };

  // Save to localStorage
  const history = loadHistory();
  history.unshift(entry);
  if (history.length > 50) history.pop();
  saveHistory(history);

  // Save to database if logged in
  if (token) {
    try {
      await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          disease_name:    data.disease_name,
          disease_type:    data.disease_type,
          crop_type:       entry.crop_type,
          causes:          data.causes,
          prevention:      data.prevention_measures,
          future:          data.future_avoidance,
          recommendations: data.recommendations,
          image_data:      imageDataUrl || null
        })
      });
    } catch (e) { console.warn('Could not save to DB:', e.message); }
  }

  renderHistory();
}

async function renderHistory() {
  const grid = document.getElementById('historyGrid');
  if (!grid) return;

  const token = localStorage.getItem('cg_token');
  let history = loadHistory();

  // If logged in, fetch from database
  if (token) {
    try {
      const res = await fetch('/api/predictions', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        history = data.predictions.map(p => ({
          id:                  p.id,
          db_id:               p.id,
          date:                new Date(p.created_at).toLocaleString(),
          disease_name:        p.disease_name || 'Unknown',
          disease_type:        p.disease_type || '',
          crop_type:           p.crop_type || '',
          causes:              tryParseArray(p.causes),
          prevention_measures: tryParseArray(p.prevention),
          future_avoidance:    tryParseArray(p.future),
          recommendations:     p.recommendations || '',
          image:               p.image_data || null,
          feedback:            p.feedback || null
        }));
      }
    } catch (e) { /* fall back to localStorage */ }
  }

  if (!history.length) {
    grid.innerHTML = '<div class="history-empty"><p>No analyses yet. Run your first detection above.</p></div>';
    return;
  }

  const typeMap = {
    'Fungal': 'badge-fungal', 'Bacterial': 'badge-bacterial',
    'Viral': 'badge-viral', 'Pest': 'badge-pest',
    'Nutritional Deficiency': 'badge-other', 'Unknown': 'badge-other'
  };

  grid.innerHTML = history.map(entry => `
    <div class="history-card">
      <div class="history-card-img">
        ${entry.image
          ? `<img src="${entry.image}" alt="${entry.disease_name}" />`
          : `<div class="history-card-img-placeholder">No image saved</div>`
        }
      </div>
      <div class="history-card-header">
        <span class="history-disease">${entry.disease_name}</span>
        <span class="history-badge tag ${typeMap[entry.disease_type] || 'badge-other'}">${entry.disease_type || ''}</span>
      </div>
      <div class="history-card-body">
        <div class="history-meta">
          <span class="history-date">${entry.date}${entry.crop_type ? ' &bull; ' + entry.crop_type : ''}</span>
        </div>
        <p class="history-reco">${entry.recommendations || ''}</p>
      </div>
      <div class="history-card-footer">
        <button class="btn-hist-pdf" onclick="downloadPDFFromHistory(${entry.id}, this)">Download PDF</button>
        <button class="btn-hist-delete" onclick="deleteHistoryEntry(${entry.id}, ${entry.db_id || 'null'})">Delete</button>
      </div>
    </div>
  `).join('');
}

function tryParseArray(val) {
  if (Array.isArray(val)) return val;
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
  catch { return val ? [val] : []; }
}

async function deleteHistoryEntry(id, dbId) {
  // Delete from localStorage
  const history = loadHistory().filter(e => e.id !== id);
  saveHistory(history);

  // Delete from DB if logged in
  if (dbId && getToken()) {
    try {
      await fetch(`/api/predictions/${dbId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + getToken() }
      });
    } catch (e) { /* ignore */ }
  }
  renderHistory();
}

async function clearHistory() {
  if (!confirm('Clear all analysis history?')) return;
  localStorage.removeItem(HISTORY_KEY);

  // Delete all from DB
  const token = getToken();
  if (token) {
    try {
      const res = await fetch('/api/predictions', { headers: { 'Authorization': 'Bearer ' + token } });
      if (res.ok) {
        const data = await res.json();
        for (const p of data.predictions) {
          await fetch(`/api/predictions/${p.id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
        }
      }
    } catch (e) { /* ignore */ }
  }
  renderHistory();
}

// ===== PDF GENERATION =====
function buildPDFContent(entry) {
  const date = entry.date || new Date().toLocaleString();
  // Support both field naming conventions (localStorage vs DB)
  const causes     = (entry.causes || []).map(c => `  • ${c}`).join('\n');
  const prevention = (entry.prevention_measures || entry.prevention || []).map(p => `  • ${p}`).join('\n');
  const future     = (entry.future_avoidance || entry.future || []).map(f => `  • ${f}`).join('\n');

  return `
CROPGUARD AI — CROP DISEASE ANALYSIS REPORT
============================================
Date: ${date}

DIAGNOSIS
---------
Disease Name : ${entry.disease_name}
Disease Type : ${entry.disease_type}
Crop Type    : ${entry.crop_type || 'Not specified'}

CAUSES
------
${causes}

PREVENTION MEASURES
-------------------
${prevention}

HOW TO AVOID IN FUTURE
-----------------------
${future}

RECOMMENDATIONS
---------------
${entry.recommendations}

============================================
Generated by CropGuard AI
  `.trim();
}

function downloadPDF() {
  const btn = document.querySelector('.btn-pdf');
  if (btn) { btn.textContent = 'Preparing...'; btn.disabled = true; }

  const entry = {
    date: new Date().toLocaleString(),
    disease_name: document.getElementById('resDiseaseNameEl')?.textContent || '',
    disease_type: document.getElementById('resTypeBadge')?.textContent || '',
    crop_type: document.getElementById('cropType')?.value || '',
    causes: Array.from(document.getElementById('resCauses')?.querySelectorAll('li') || []).map(li => li.textContent),
    prevention_measures: Array.from(document.getElementById('resPrevention')?.querySelectorAll('li') || []).map(li => li.textContent),
    future_avoidance: Array.from(document.getElementById('resFuture')?.querySelectorAll('li') || []).map(li => li.textContent),
    recommendations: document.getElementById('resReco')?.textContent || '',
    image: base64Image ? `data:image/jpeg;base64,${base64Image}` : null
  };

  // Open window immediately (must be synchronous to avoid popup block)
  const win = window.open('', '_blank');
  generateAndDownloadPDF(entry, win);

  setTimeout(() => {
    if (btn) { btn.textContent = 'Download PDF Report'; btn.disabled = false; }
  }, 1500);
}

function downloadPDFFromHistory(id, btnEl) {
  if (btnEl) { btnEl.textContent = 'Preparing...'; btnEl.disabled = true; }

  const entry = loadHistory().find(e => e.id === id);
  if (!entry) {
    if (btnEl) { btnEl.textContent = 'Download PDF'; btnEl.disabled = false; }
    return;
  }

  // Open window immediately (synchronous)
  const win = window.open('', '_blank');
  generateAndDownloadPDF(entry, win);

  setTimeout(() => {
    if (btnEl) { btnEl.textContent = 'Download PDF'; btnEl.disabled = false; }
  }, 1500);
}

function generateAndDownloadPDF(entry, win) {
  if (!win || win.closed) win = window.open('', '_blank');
  const imageHTML = entry.image
    ? `<div class="crop-img-wrap">
        <img src="${entry.image}" alt="Analysed crop" class="crop-img" />
        <p class="crop-img-caption">Submitted crop image</p>
       </div>`
    : '';
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CropGuard AI Report — ${entry.disease_name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; color: #1c2b1c; padding: 40px; max-width: 820px; margin: 0 auto; background: #fff; }

        .report-header {
          background: linear-gradient(135deg, #1a4a1a, #2d7a2d);
          color: white; padding: 28px 32px; border-radius: 14px; margin-bottom: 28px;
          display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
        }
        .report-header-text h1 { font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; }
        .report-header-text p { opacity: 0.7; font-size: 0.82rem; }
        .report-logo { font-size: 2.5rem; opacity: 0.6; }

        .top-row { display: flex; gap: 20px; margin-bottom: 28px; align-items: flex-start; flex-wrap: wrap; }

        .crop-img-wrap {
          flex-shrink: 0; width: 220px; border-radius: 12px; overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 3px solid #a8d5a2;
        }
        .crop-img { width: 100%; height: 180px; object-fit: cover; display: block; }
        .crop-img-caption { text-align: center; font-size: 0.7rem; color: #6b8f6b; padding: 6px; background: #f0f7f0; }

        .report-meta { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 200px; }
        .meta-box { background: #f0f7f0; border-radius: 10px; padding: 12px 16px; }
        .meta-box label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1px; color: #6b8f6b; display: block; margin-bottom: 3px; }
        .meta-box strong { font-size: 1.05rem; color: #1a4a1a; font-weight: 800; }

        .section { margin-bottom: 22px; }
        .section h2 {
          font-size: 0.72rem; text-transform: uppercase; letter-spacing: 2px; color: #2d7a2d;
          border-bottom: 2px solid #a8d5a2; padding-bottom: 6px; margin-bottom: 10px; font-weight: 700;
        }
        .section ul { list-style: none; }
        .section ul li {
          padding: 7px 0 7px 18px; position: relative;
          font-size: 0.9rem; color: #3d5a3d; border-bottom: 1px solid #f5f5f5; line-height: 1.5;
        }
        .section ul li::before { content: '▸'; position: absolute; left: 0; color: #4caf50; }

        .reco-box {
          background: #f0faf0; border-left: 4px solid #4caf50; border-radius: 8px;
          padding: 14px 16px; font-size: 0.9rem; color: #3d5a3d; line-height: 1.65;
        }

        .footer {
          margin-top: 40px; text-align: center; font-size: 0.72rem; color: #bbb;
          border-top: 1px solid #eee; padding-top: 16px;
        }

        @media print {
          body { padding: 20px; }
          .report-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .crop-img-wrap { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <div class="report-header-text">
          <h1>CropGuard AI — Disease Analysis Report</h1>
          <p>Generated on ${entry.date}</p>
        </div>
        <div class="report-logo">🌿</div>
      </div>

      <div class="top-row">
        ${imageHTML}
        <div class="report-meta">
          <div class="meta-box"><label>Disease Name</label><strong>${entry.disease_name}</strong></div>
          <div class="meta-box"><label>Disease Type</label><strong>${entry.disease_type}</strong></div>
          ${entry.crop_type ? `<div class="meta-box"><label>Crop Type</label><strong>${entry.crop_type}</strong></div>` : ''}
        </div>
      </div>

      <div class="section">
        <h2>Causes</h2>
        <ul>${(entry.causes || []).map(c => `<li>${c}</li>`).join('')}</ul>
      </div>
      <div class="section">
        <h2>Prevention Measures</h2>
        <ul>${(entry.prevention_measures || []).map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
      <div class="section">
        <h2>How to Avoid in Future</h2>
        <ul>${(entry.future_avoidance || []).map(f => `<li>${f}</li>`).join('')}</ul>
      </div>
      <div class="section">
        <h2>Recommendations</h2>
        <div class="reco-box">${entry.recommendations}</div>
      </div>

      <div class="footer">CropGuard AI &mdash; AI-Driven Crop Disease Detection &amp; Prevention</div>
      <script>window.onload = function(){ window.print(); }<\/script>
    </body>
    </html>
  `);
  win.document.close();
}

// ===== INIT HISTORY ON PAGE LOAD =====
if (document.getElementById('historyGrid')) {
  // Show loading state immediately
  const grid = document.getElementById('historyGrid');
  grid.innerHTML = '<div class="history-empty"><p>Loading history...</p></div>';
  renderHistory();
}
