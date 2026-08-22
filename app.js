/* ============================================================
   ArogyaSetu Intelligence — Vanilla JS Engine
   Handles View Routing, Interactivity, and Data Binding
   ============================================================ */

const MOCK_PATIENTS = [
  { name: 'Ramesh Kumar',  ward: 'Ward 02', risk: 'amber', tags: [{label:'Ayushman Bharat', cls:'sky'}, {label:'Hypertension (150/95)', cls:'lav'}], ai: 'Patient has sustained hypertension. Ensure daily medication compliance.', bp:'150/95', sugar:'110 mg/dL', spo2:'96%' },
  { name: 'Sunita Bai',    ward: 'Ward 01', risk: 'green', tags: [{label:'PMMVY Phase 2', cls:'mint'}, {label:'Janani Suraksha', cls:'sky'}], ai: 'Maternal health stable. Routine ANC checkup scheduled.', bp:'110/70', sugar:'85 mg/dL', spo2:'99%' },
  { name: 'Venkatesh Rao', ward: 'Ward 04', risk: 'green', tags: [{label:'Ayushman Bharat', cls:'sky'}, {label:'Senior Citizen', cls:'gray'}], ai: 'Normal vitals for age group.', bp:'130/80', sugar:'92 mg/dL', spo2:'97%' },
  { name: 'Gita Devi',     ward: 'Ward 03', risk: 'amber', tags: [{label:'Diabetic', cls:'lav'}, {label:'BP Alert', cls:'amb'}], ai: 'High BP and Sugar. Urgent referral.', bp:'160/100', sugar:'180 mg/dL', spo2:'94%' },
  { name: 'Ananya Patil',  ward: 'Ward 02', risk: 'red',   tags: [{label:'Severe Anemia (Hb: 7.2)', cls:'amb'}, {label:'ANC 3rd Trimester', cls:'lav'}], ai: 'CRITICAL: Severe anemia in 3rd trimester. Immediate blood transfusion prep required.', bp:'90/60', sugar:'95 mg/dL', spo2:'95%' },
  { name: 'Mohan Lal',     ward: 'Ward 01', risk: 'green', tags: [{label:'Free Dialysis Program', cls:'mint'}, {label:'BPL Card', cls:'gray'}], ai: 'Undergoing routine dialysis. Stable.', bp:'125/85', sugar:'105 mg/dL', spo2:'98%' }
];

const MOCK_PHCS = [
  { name: 'Devnagar Health Sub-Center (HWC)', dist: '0.8 km away', open: 'Open 24/7', doc: 'Dr. Anjali Verma (On-Duty)', beds: '4/6 Available', stock: '92% Essential Drugs in Stock', acts: ['Call PHC', 'Refer Patient'] },
  { name: 'Raghupur Community Health Center (CHC)', dist: '3.4 km away', open: 'Open 8 AM - 8 PM', doc: 'Dr. Rajesh Sharma (Specialist)', beds: '14/20 Available', stock: '85% Stock', acts: ['Request Ambulance (108)', 'Schedule Tele-Consult'] },
  { name: 'Bamnoli Primary Health Center (PHC)', dist: '5.2 km away', open: 'Open 9 AM - 5 PM', doc: 'Dr. K. Srinivas', beds: '8/10 Available', stock: '70% Stock', acts: ['Call PHC'] },
  { name: 'Ayushman Bharat HWC — Sirsiya', dist: '6.5 km away', open: 'Open 8 AM - 6 PM', doc: 'Staff Nurse On-Duty', beds: 'N/A', stock: 'Full Generic Stock Available', acts: ['Tele-Consult'] }
];

document.addEventListener('DOMContentLoaded', () => {
  initRouting();
  initDashboardCanvas();
  initTagsInput();
  initTwoWayBinding();
  initVoiceMic();
  initSchemes();
  initDirectory();
  initPHCs();
});

/* ── 1. ROUTING LOGIC ─────────────────────────────────────── */
function loginDemo(role) {
  document.getElementById('view-auth').classList.remove('active');
  document.getElementById('app-shell').style.display = 'flex';
  
  if (role === 'asha') {
    switchPane('view-dashboard', 'sb-dashboard', 'ASHA Field Worker');
  } else {
    switchPane('view-profile', 'sb-profile', 'Patient Profile');
  }
}

function logout() {
  document.getElementById('app-shell').style.display = 'none';
  document.getElementById('view-auth').classList.add('active');
}

function initRouting() {
  document.querySelectorAll('.side-item').forEach(item => {
    item.addEventListener('click', function() {
      const targetPane = this.getAttribute('data-target');
      if (targetPane) {
        switchPane(targetPane, this.id, document.getElementById('top-persona').textContent);
      }
    });
  });
}

function switchPane(paneId, sbId, personaText) {
  document.querySelectorAll('.side-item').forEach(i => i.classList.remove('active'));
  const sbEl = document.getElementById(sbId);
  if (sbEl) sbEl.classList.add('active');

  document.querySelectorAll('.view-pane').forEach(pane => {
    pane.classList.remove('active');
    pane.classList.add('d-none');
  });

  const target = document.getElementById(paneId);
  if (target) {
    target.classList.remove('d-none');
    target.classList.add('active');
  }

  const pText = document.getElementById('top-persona');
  if(pText && personaText) pText.textContent = personaText;
  document.querySelector('.content-stage').scrollTo(0,0);
}


/* ── 2. DASHBOARD KNOWLEDGE GRAPH ─────────────────────────── */
function initDashboardCanvas() {
  const canvas = document.getElementById('kgCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight - 60;
  }
  window.addEventListener('resize', resize);
  resize();

  let time = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += 0.01;
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    // Nodes
    const nodes = [
      { x: cx, y: cy, r: 25, label: "Devnagar Ward 1", c: "#10B981" },
      { x: cx - 120 + Math.sin(time)*10, y: cy - 80 + Math.cos(time)*10, r: 15, label: "Maternal Care", c: "#8B5CF6" },
      { x: cx + 140 + Math.cos(time)*15, y: cy - 40 + Math.sin(time)*10, r: 18, label: "Hypertension", c: "#F59E0B" },
      { x: cx - 80 + Math.sin(time)*20, y: cy + 90 + Math.cos(time)*15, r: 12, label: "Anemia", c: "#DC2626" }
    ];

    // Draw lines
    ctx.strokeStyle = "#E7E5E4";
    ctx.lineWidth = 2;
    for(let i=1; i<nodes.length; i++) {
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[i].x, nodes[i].y);
      ctx.stroke();
    }

    // Draw nodes
    ctx.font = "12px JetBrains Mono";
    ctx.textAlign = "center";
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = n.c;
      ctx.fill();
      ctx.fillStyle = "#1C1917";
      ctx.fillText(n.label, n.x, n.y + n.r + 15);
    });

    requestAnimationFrame(draw);
  }
  draw();
}


/* ── 3. TWO-WAY DATA BINDING (PATIENT INTAKE) ─────────────── */
function initTwoWayBinding() {
  const iN = document.getElementById('inp-name');
  const iV = document.getElementById('inp-village');
  const iA = document.getElementById('inp-abha');
  
  if(iN) iN.addEventListener('input', (e) => { 
    document.getElementById('card-name').textContent = e.target.value || 'Patient Name'; 
    document.getElementById('ab-gen-name').textContent = e.target.value || 'Patient Name';
  });
  if(iV) iV.addEventListener('input', (e) => document.getElementById('card-village').textContent = e.target.value || 'Location');
  if(iA) iA.addEventListener('input', (e) => {
    document.getElementById('card-abha').textContent = e.target.value || 'N/A';
    document.getElementById('ab-gen-id').textContent = e.target.value || 'N/A';
  });
}


/* ── 4. TAGS & VOICE MIC (SYMPTOM CHECKER) ────────────────── */
function initTagsInput() {
  document.querySelectorAll('.tag-interactive .del').forEach(btn => attachTagDelete(btn));
  const sym = document.getElementById('sym-input');
  if(sym) sym.addEventListener('keydown', e => handleTagKey(e, sym));
  const cond = document.getElementById('cond-input');
  if(cond) cond.addEventListener('keydown', e => handleTagKey(e, cond));
}
function handleTagKey(e, inp) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const val = inp.value.trim().replace(/,/g, '');
    if (val) { 
      const span = document.createElement('span');
      span.className = 'tag-interactive';
      span.innerHTML = `● ${val} <span class="del">✕</span>`;
      attachTagDelete(span.querySelector('.del'));
      inp.parentElement.insertBefore(span, inp);
      inp.value = ''; 
    }
  }
}
function attachTagDelete(btn) { btn.addEventListener('click', function() { this.parentElement.remove(); }); }

window.addTriageSymptom = function(txt) {
  showToast('Added Symptom: ' + txt);
}

function initVoiceMic() {
  // Waveform canvas
  const canvas = document.getElementById('voice-waves');
  if(canvas) {
    const ctx = canvas.getContext('2d');
    let t = 0;
    function drawWave() {
      ctx.clearRect(0,0,400,150);
      ctx.beginPath();
      for(let x=0; x<400; x++) {
        const y = 75 + Math.sin(x*0.02 + t)*20 * Math.sin(t*0.5);
        ctx.lineTo(x,y);
      }
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 3;
      ctx.stroke();
      t+=0.1;
      requestAnimationFrame(drawWave);
    }
    drawWave();
  }

  const btn = document.getElementById('btn-triage-mic');
  if (btn) {
    let rec = false;
    btn.addEventListener('click', () => {
      if(rec) return; rec = true;
      btn.classList.add('recording');
      document.getElementById('triage-prompt').textContent = 'Listening... "Mujhe 3 din se tez bukhar hai"';
      setTimeout(() => {
        btn.classList.remove('recording');
        document.getElementById('triage-prompt').textContent = 'Transcribed: "I have high fever and chest pain for 3 days."';
        rec = false;
      }, 3000);
    });
  }
}

window.playAudioAdvice = function(msg = 'Check Platelet Count and Hydration Protocol.') {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(u);
  } else {
    showToast('Voice synthesized advice playing...');
  }
}


/* ── 5. SCHEME RADAR ──────────────────────────────────────── */
function initSchemes() {
  const inc = document.getElementById('range-inc');
  const fam = document.getElementById('range-fam');
  const cat = document.getElementById('sel-cat');
  if(!inc) return;

  const update = () => {
    document.getElementById('val-inc').textContent = '₹' + parseInt(inc.value).toLocaleString('en-IN');
    document.getElementById('val-fam').textContent = fam.value;
    renderSchemes(inc.value, cat.value);
  };
  inc.addEventListener('input', update);
  fam.addEventListener('input', update);
  cat.addEventListener('change', update);
  update();
}

function renderSchemes(income, category) {
  const grid = document.getElementById('scheme-results');
  grid.innerHTML = '';
  
  const schemes = [
    { title: 'Ayushman Bharat PM-JAY', desc: '₹5,00,000 Free Cashless Hospitalization', tag: '100% Eligible', docs: 'Aadhaar, Ration Card' },
    { title: 'National Free Dialysis Program', desc: '100% Subsidized Hemodialysis at CHC Level', tag: 'Eligible', docs: 'Medical Referral' }
  ];

  if(category === 'pregnant' || category === 'bpl') {
    schemes.push({ title: 'Janani Suraksha Yojana (JSY)', desc: '₹1,400 Direct Cash Benefit for Institutional Delivery', tag: 'Eligible', docs: 'Aadhaar, Bank AC' });
    schemes.push({ title: 'PM Matru Vandana Yojana (PMMVY)', desc: '₹5,000 Cash Incentive in 3 Installments', tag: 'Eligible', docs: 'MCP Card' });
  }

  schemes.forEach(s => {
    grid.innerHTML += `
      <div class="scheme-card">
        <div class="d-flex justify-content-between align-items-start">
          <h5 style="margin:0;font-size:1.1rem">${s.title}</h5>
          <span class="tag-pill tag-mint">${s.tag}</span>
        </div>
        <div class="text-muted" style="font-size:0.9rem">${s.desc}</div>
        <div class="mono-label mt-2">DOCS REQUIRED: ${s.docs}</div>
      </div>
    `;
  });
}


/* ── 6. VILLAGER DIRECTORY & MODAL ────────────────────────── */
function initDirectory() {
  const cont = document.getElementById('cohort-grid-container');
  if(!cont) return;
  const render = (data) => {
    cont.innerHTML = '';
    data.forEach((p, idx) => {
      const tags = p.tags.map(t=>`<span class="tag-pill tag-${t.cls}">${t.label}</span>`).join('');
      const pBadge = p.risk==='red'?'CRITICAL RISK':(p.risk==='amber'?'ATTENTION REQUIRED':'STABLE');
      const pColor = p.risk==='red'?'tag-amb':(p.risk==='amber'?'tag-amb':'tag-mint');
      cont.innerHTML += `
        <div class="villager-card">
          <div class="vc-top"><div class="telemetry-dot ${p.risk}"></div></div>
          <div class="vc-avatar-wrap">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=F5F5F4&color=1C1917" class="vc-avatar">
            <div class="vc-name-box">
              <span class="tag-pill ${pColor}" style="font-size:0.65rem;padding:0.1rem 0.5rem;border:none">${pBadge}</span>
              <h4>${p.name}</h4>
              <p>🏢 Devnagar Sub-Center • ${p.ward}</p>
            </div>
          </div>
          <div class="vc-tags">${tags}</div>
          <div class="vc-footer">
            <span class="vc-link" onclick="openIntelligenceModal(${idx})">View Complete Intelligence &rarr;</span>
          </div>
        </div>
      `;
    });
  }
  render(MOCK_PATIENTS);

  document.getElementById('dir-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    render(MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(q) || p.tags.some(t=>t.label.toLowerCase().includes(q))));
  });
}

window.openIntelligenceModal = function(idx) {
  const p = MOCK_PATIENTS[idx];
  document.getElementById('modal-title').textContent = p.name;
  document.getElementById('modal-subtitle').textContent = `AI Diagnostic Handoff • ${p.ward}`;
  document.getElementById('modal-bp').textContent = p.bp;
  document.getElementById('modal-sugar').textContent = p.sugar;
  document.getElementById('modal-spo2').textContent = p.spo2;
  document.getElementById('modal-ai-text').textContent = p.ai;
  document.getElementById('modal-tags').innerHTML = p.tags.map(t => `<span class="tag-pill tag-${t.cls}">${t.label}</span>`).join('');
  new bootstrap.Modal(document.getElementById('clinicalModal')).show();
}

document.getElementById('btn-refer-phc').addEventListener('click', () => {
  bootstrap.Modal.getInstance(document.getElementById('clinicalModal')).hide();
  showToast('PHC Referral Slip Dispatched Successfully.');
});

/* ── 7. PHC & DISPATCH ────────────────────────────────────── */
function initPHCs() {
  const cont = document.getElementById('phc-grid-container');
  if(!cont) return;
  MOCK_PHCS.forEach(p => {
    const acts = p.acts.map(a=>`<button class="btn btn-outline-secondary btn-sm" style="border-radius:12px">${a}</button>`).join('');
    cont.innerHTML += `
      <div class="phc-card">
        <div class="d-flex justify-content-between mb-2">
          <h5 style="margin:0;font-size:1.1rem">${p.name}</h5>
          <span class="tag-pill tag-mint">${p.dist}</span>
        </div>
        <div class="mono-label mb-3 text-success">${p.open}</div>
        <div class="text-muted" style="font-size:0.9rem; margin-bottom:0.2rem"><i class="bi bi-person-fill me-2"></i>${p.doc}</div>
        <div class="text-muted" style="font-size:0.9rem; margin-bottom:0.2rem"><i class="bi bi-hospital me-2"></i>Beds: ${p.beds}</div>
        <div class="text-muted" style="font-size:0.9rem; margin-bottom:1rem"><i class="bi bi-box me-2"></i>Pharmacy: ${p.stock}</div>
        <div class="d-flex gap-2">${acts}</div>
      </div>
    `;
  });
}

window.openDispatchModal = function() {
  switchPane('view-centers', 'sb-centers', 'Emergency Dispatch');
  setTimeout(dispatchSOS, 500);
}

window.dispatchSOS = function() {
  const feed = document.getElementById('sos-feed');
  feed.classList.remove('d-none');
  feed.innerHTML = `
    <div class="d-flex align-items-center mb-2">
      <div class="spinner-grow text-danger spinner-grow-sm me-2" role="status"></div>
      <strong class="text-danger">LIVE GPS BROADCAST ACTIVE</strong>
    </div>
    <div class="mono-label">Lat: 12.9716, Long: 77.5946</div>
    <div class="mt-2 font-monospace" style="font-size:0.9rem; color:#1C1917">
      <i class="bi bi-ambulance me-2"></i> 108 Ambulance Unit #4 En Route (ETA: 8 mins)
    </div>
  `;
}

/* ── UTILS ────────────────────────────────────────────────── */
window.showToast = function(msg) {
  document.getElementById('toast-msg').textContent = msg;
  new bootstrap.Toast(document.getElementById('liveToast')).show();
}
