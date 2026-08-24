/* =========================================================================
   ArogyaSetu Intelligence - Core Application Engine v3 (Visual Polish)
   ========================================================================= */

// -------------------------------------------------------------------------
// 1. I18N TRANSLATION ENGINE
// -------------------------------------------------------------------------
const TRANSLATIONS = {
  en: {
    hero_tag: "● RURAL HEALTH INTELLIGENCE NETWORK",
    hero_title: "24,000+ rural lives connected to instant care.",
    hero_quote: "\"ArogyaSetu Intelligence bridges the critical gap between remote village hamlets, ASHA frontline workers, and verified government healthcare schemes.\"",
    stat_villagers: "Active Villagers",
    stat_voice: "Multilingual Voice",
    stat_schemes: "Schemes Unlocked",
    footer_auth: "National Health Mission Interface • Secure ABHA Node Access",
    auth_title: "Sign in to your health node",
    auth_subtext: "Enter your ABHA ID, Phone number, or select a demo role below",
    btn_access: "Access Health Platform →",
    lbl_or_fed: "OR FEDERATED ACCESS",
    btn_abha: "Continue with ABHA ID",
    lbl_demo: "INSTANT DEMO ACCESS",
    role_patient: "Rural Villager / Patient",
    role_asha: "ASHA Field Worker",
    role_doctor: "PHC Medical Officer",
    role_maternal: "Maternal Mother (ANC)",
    brand: "ArogyaSetu Intelligence",
    search_placeholder: " Search symptoms, schemes, ABHA...",
    btn_switch_node: "Sign Out / Switch Node →",
    tab_dashboard: "Dashboard",
    tab_directory: "Villager Directory",
    tab_symptoms: "AI Symptom Checker",
    tab_schemes: "Scheme Radar",
    tab_profile: "Profile & Vitals Intake",
    tab_centers: "Nearest PHC Centers",
    tab_settings: "Settings",
    dash_title: "Field Operations & Epidemiology Dashboard",
    sc_screened: "VILLAGERS SCREENED",
    sc_alerts: "HIGH-RISK MATERNAL ALERTS",
    sc_claims: "DBT DISBURSED",
    sc_sync: "OFFLINE CLOUD SYNC",
    ac_record: "Record Vitals",
    ac_triage: "Run Voice Triage",
    ac_radar: "Scheme Radar",
    ac_dispatch: "Emergency 108 PHC",
    lbl_network: "Live Telemetry: Devnagar Ward Cluster Map",
    prof_title: "Patient Profile & Vitals Intake",
    lbl_name: "PATIENT NAME",
    lbl_age: "AGE",
    lbl_gender: "GENDER",
    lbl_ward: "VILLAGE / WARD",
    lbl_abha: "ABHA ID",
    lbl_symptoms: "REPORTED SYMPTOMS",
    lbl_conditions: "EXISTING CONDITIONS",
    btn_save: "Save Patient Record",
    lbl_vitals_summary: "Vitals Summary",
    lbl_cond_sym: "Conditions & Symptoms",
    triage_title: "Vernacular Voice Symptom Diagnostic",
    triage_prompt: "\"Tap to Speak in Local Language\"",
    lbl_body_map: "Or click affected body zones:",
    lbl_confidence: "Confidence Matrix",
    btn_listen: "Listen to Advice",
    scheme_title: "National Scheme Radar & ABHA ID Generator",
    lbl_eligibility: "Eligibility Parameters",
    lbl_income: "Annual Income",
    lbl_family: "Family Members",
    lbl_category: "Category",
    lbl_digital_abha: "Digital ABHA Health Card",
    btn_dl_abha: "Download ABHA PNG",
    lbl_matched_schemes: "Matched Schemes",
    dir_title: "Registered Villagers & Triage Directory",
    phc_title: "Nearest Health Centers & Emergency Dispatch",
    settings_title: "Settings & Offline Gateway"
  },
  hi: {
    hero_tag: "● ग्रामीण स्वास्थ्य खुफिया नेटवर्क",
    hero_title: "24,000+ ग्रामीण जीवन तत्काल देखभाल से जुड़े।",
    hero_quote: "\"आरोग्यसेतु इंटेलिजेंस दूरदराज के गांवों, आशा कार्यकर्ताओं और सरकारी स्वास्थ्य योजनाओं के बीच की खाई को पाटता है।\"",
    stat_villagers: "सक्रिय ग्रामीण",
    stat_voice: "बहुभाषी आवाज़",
    stat_schemes: "योजनाएं अनलॉक्ड",
    footer_auth: "राष्ट्रीय स्वास्थ्य मिशन इंटरफ़ेस • सुरक्षित ABHA नोड",
    auth_title: "अपने हेल्थ नोड में साइन इन करें",
    auth_subtext: "अपना ABHA ID या डेमो भूमिका चुनें",
    btn_access: "प्लेटफ़ॉर्म एक्सेस करें →",
    lbl_or_fed: "या फेडेरेटेड एक्सेस",
    btn_abha: "ABHA ID के साथ जारी रखें",
    lbl_demo: "त्वरित डेमो एक्सेस",
    role_patient: "ग्रामीण / मरीज",
    role_asha: "आशा कार्यकर्ता",
    role_doctor: "PHC चिकित्सा अधिकारी",
    role_maternal: "गर्भवती माता (ANC)",
    brand: "आरोग्यसेतु इंटेलिजेंस",
    search_placeholder: " लक्षण, योजनाएं, ABHA खोजें...",
    btn_switch_node: "साइन आउट / नोड बदलें →",
    tab_dashboard: "डैशबोर्ड",
    tab_directory: "ग्रामीण निर्देशिका",
    tab_symptoms: "AI लक्षण चेकर",
    tab_schemes: "योजना रडार",
    tab_profile: "प्रोफ़ाइल और विटल्स",
    tab_centers: "निकटतम PHC केंद्र",
    tab_settings: "सेटिंग्स",
    dash_title: "क्षेत्र संचालन और महामारी विज्ञान डैशबोर्ड",
    sc_screened: "स्क्रीन किए गए ग्रामीण",
    sc_alerts: "उच्च-जोखिम अलर्ट",
    sc_claims: "DBT क्लेम वितरित",
    sc_sync: "क्लाउड सिंक स्थिति",
    ac_record: "विटल्स दर्ज करें",
    ac_triage: "वॉयस ट्राइएज चलाएं",
    ac_radar: "योजना रडार",
    ac_dispatch: "आपातकालीन रेफरल",
    lbl_network: "लाइव टेलीमेट्री: देवनगर क्लस्टर मैप",
    prof_title: "मरीज प्रोफ़ाइल और विटल्स इंटेक",
    lbl_name: "मरीज का नाम",
    lbl_age: "आयु",
    lbl_gender: "लिंग",
    lbl_ward: "गाँव / वार्ड",
    lbl_abha: "ABHA ID",
    lbl_symptoms: "लक्षण",
    lbl_conditions: "मौजूदा स्थितियां",
    btn_save: "मरीज रिकॉर्ड सहेजें",
    lbl_vitals_summary: "विटल्स सारांश",
    lbl_cond_sym: "स्थितियां और लक्षण",
    triage_title: "स्थानीय भाषा वॉयस लक्षण निदान",
    triage_prompt: "\"स्थानीय भाषा में बोलने के लिए टैप करें\"",
    lbl_body_map: "या प्रभावित शरीर क्षेत्रों पर क्लिक करें:",
    lbl_confidence: "कॉन्फिडेंस मैट्रिक्स",
    btn_listen: "सलाह सुनें",
    scheme_title: "राष्ट्रीय योजना रडार और ABHA जनरेटर",
    lbl_eligibility: "पात्रता पैरामीटर",
    lbl_income: "वार्षिक आय",
    lbl_family: "परिवार के सदस्य",
    lbl_category: "श्रेणी",
    lbl_digital_abha: "डिजिटल ABHA हेल्थ कार्ड",
    btn_dl_abha: "ABHA PNG डाउनलोड करें",
    lbl_matched_schemes: "मिलान योजनाएं",
    dir_title: "पंजीकृत ग्रामीण और ट्राइएज निर्देशिका",
    phc_title: "निकटतम स्वास्थ्य केंद्र और आपातकालीन प्रेषण",
    settings_title: "सेटिंग्स और ऑफलाइन गेटवे"
  }
};

function setLanguage(lang) {
  appState.activeLanguage = lang;
  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      if(el.children.length > 0 && el.innerHTML.includes('<i')) {
        const iconHTML = el.querySelector('i').outerHTML;
        el.innerHTML = `${iconHTML} ${t[key]}`;
      } else {
        el.innerText = t[key];
      }
    }
  });
  const searchInput = document.getElementById('lang-search-placeholder');
  if(searchInput && searchInput.innerHTML.includes('<i')) {
     const icon = searchInput.querySelector('i').outerHTML;
     searchInput.innerHTML = `${icon} ${t['search_placeholder']}`;
  }
}

// -------------------------------------------------------------------------
// 2. STATE MANAGEMENT & DUAL THEME
// -------------------------------------------------------------------------
let appState = {
  currentUser: null,
  patients: [],
  schemes: [
    { name: "Ayushman Bharat PM-JAY", desc: "Up to ₹5,00,000 health cover per family per year.", type: "tag-mint" },
    { name: "Janani Suraksha Yojana (JSY)", desc: "₹1,400 Direct Cash Benefit for institutional delivery.", type: "tag-sky" },
    { name: "PM Matru Vandana Yojana (PMMVY)", desc: "₹5,000 cash benefit in 3 installments for ANC.", type: "tag-amb" },
    { name: "Ayushman Vay Vandana", desc: "₹5,00,000 top-up coverage for seniors.", type: "tag-lav" }
  ],
  activeLanguage: 'en',
  theme: 'light'
};

const DEFAULT_PATIENTS = [
  { id: '91-4820-1928-3012', name: 'Lakshmi Devi', age: 32, gender: 'Female', ward: 'Ward 03', bp: '120/80', spo2: 98, risk: 'Stable', symptoms: ['Fatigue'], conditions: ['Pregnant'] },
  { id: '91-1122-3344-5566', name: 'Ramesh Kumar', age: 65, gender: 'Male', ward: 'Ward 01', bp: '150/95', spo2: 92, risk: 'Attention', symptoms: ['Chest Tightness'], conditions: ['Diabetic', 'Hypertension'] },
  { id: '91-9988-7766-5544', name: 'Sita Bai', age: 28, gender: 'Female', ward: 'Ward 04', bp: '110/70', spo2: 89, risk: 'Critical', symptoms: ['High Fever', 'Joint Pain'], conditions: ['Anaemia'] },
  { id: '91-4433-2211-0099', name: 'Kishan Lal', age: 45, gender: 'Male', ward: 'Ward 02', bp: '130/85', spo2: 96, risk: 'Stable', symptoms: ['Cough'], conditions: [] }
];

const ROLES = {
  patient: { name: "Lakshmi Devi", roleLabel: "Rural Villager / Patient", badge: "PATIENT NODE", defaultTab: "view-symptoms", visibleTabs: ["view-symptoms", "view-profile", "view-schemes", "view-centers"], data: { age: 32, abha: "91-4820-1928-3012" } },
  asha: { name: "Sunita Bai", roleLabel: "ASHA Field Lead", badge: "ASHA WORKER NODE", defaultTab: "view-directory", visibleTabs: ["view-dashboard", "view-directory", "view-profile", "view-schemes", "view-centers", "view-settings"], data: {} },
  doctor: { name: "Dr. Anjali Verma", roleLabel: "PHC Medical Officer", badge: "PHC CLINICAL NODE", defaultTab: "view-dashboard", visibleTabs: ["view-dashboard", "view-directory", "view-centers", "view-settings"], data: {} },
  maternal: { name: "Pooja Sharma", roleLabel: "Maternal Mother (ANC)", badge: "MATERNAL CARE NODE", defaultTab: "view-schemes", visibleTabs: ["view-schemes", "view-symptoms", "view-profile", "view-centers"], data: { age: 24, abha: "91-7766-5544-3322" } }
};

function initStore() {
  const stored = localStorage.getItem('arogya_state_v3');
  if (stored) {
    appState = JSON.parse(stored);
  } else {
    appState.patients = [...DEFAULT_PATIENTS];
    saveStore();
  }
  applyTheme(appState.theme);
  setLanguage(appState.activeLanguage);
  document.getElementById('lang-select').value = appState.activeLanguage;
  updateStorageMeter();
  renderDirectory();
}
function saveStore() {
  localStorage.setItem('arogya_state_v3', JSON.stringify(appState));
  updateStorageMeter();
}
function resetState() {
  localStorage.removeItem('arogya_state_v3');
  initStore();
  showToast("Local Storage Reset and Re-seeded");
}

function toggleTheme() {
  appState.theme = appState.theme === 'light' ? 'dark' : 'light';
  applyTheme(appState.theme);
  saveStore();
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  if(theme === 'dark') {
    icon.className = 'bi bi-sun-fill text-warning';
  } else {
    icon.className = 'bi bi-moon-stars-fill';
  }
}

// -------------------------------------------------------------------------
// 3. UI LAYOUT & RBAC NAVIGATION
// -------------------------------------------------------------------------
function initRole(roleKey) {
  const role = ROLES[roleKey];
  appState.currentUser = role;
  
  document.querySelectorAll('.side-item').forEach(item => {
    item.style.display = role.visibleTabs.includes(item.dataset.target) ? 'flex' : 'none';
  });
  
  document.getElementById('top-persona').innerHTML = `[ 👤 ${role.roleLabel} ]`;
  document.getElementById('dropdown-role-badge').innerText = `ACTIVE NODE: ${role.badge}`;
  
  document.getElementById('view-auth').classList.remove('active');
  document.getElementById('app-shell').style.display = 'flex';
  
  switchTab(role.defaultTab);
  
  if(roleKey === 'patient' || roleKey === 'maternal') {
    document.getElementById('inp-name').value = role.name;
    document.getElementById('inp-abha').value = role.data.abha || '';
    if(role.data.age) document.getElementById('inp-age').value = role.data.age;
    updatePreviewCard();
  }
}

function logout() {
  appState.currentUser = null;
  document.getElementById('app-shell').style.display = 'none';
  document.getElementById('view-auth').classList.add('active');
  document.getElementById('profile-dropdown').classList.remove('show');
}

function switchTab(targetId) {
  document.querySelectorAll('.view-pane').forEach(p => p.classList.add('d-none'));
  document.querySelectorAll('.view-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.side-item').forEach(s => s.classList.remove('active'));
  
  const pane = document.getElementById(targetId);
  if(pane) {
    pane.classList.remove('d-none');
    pane.classList.add('active');
  }
  const navItem = document.querySelector(`[data-target="${targetId}"]`);
  if(navItem) navItem.classList.add('active');

  if(targetId === 'view-schemes') calcSchemes();
  if(targetId === 'view-directory') renderDirectory();
  if(targetId === 'view-centers') renderCenters();
  if(targetId === 'view-dashboard') setTimeout(renderClusterGraph, 100);
}

document.querySelectorAll('.side-item').forEach(item => {
  item.addEventListener('click', (e) => switchTab(e.currentTarget.dataset.target));
});

function toggleProfileDropdown() { document.getElementById('profile-dropdown').classList.toggle('show'); }
function toggleSidebar() { document.getElementById('app-sidebar').classList.toggle('sidebar-collapsed'); }

// -------------------------------------------------------------------------
// 4. TOASTS & UTILS
// -------------------------------------------------------------------------
const toastEl = document.getElementById('liveToast');
const toast = new bootstrap.Toast(toastEl);
function showToast(msg, type='success') {
  document.getElementById('toast-msg').innerText = msg;
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toast.show();
}

function getInitials(name) {
  if(!name) return 'UNK';
  const p = name.split(' ');
  return p.length > 1 ? (p[0][0] + p[1][0]).toUpperCase() : p[0].substring(0, 2).toUpperCase();
}

// -------------------------------------------------------------------------
// 5. DASHBOARD CANVAS GRAPH
// -------------------------------------------------------------------------
function renderClusterGraph() {
  const canvas = document.getElementById('cluster-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width - 48;
  canvas.height = 320;

  const nodes = [];
  const colors = ['#10B981', '#F59E0B', '#0EA5E9'];
  for(let i=0; i<35; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random()-0.5)*0.2, // Subtle oscillation
      vy: (Math.random()-0.5)*0.2,
      r: Math.random() * 4 + 4,
      c: colors[Math.floor(Math.random()*colors.length)]
    });
  }

  function draw() {
    if(!document.getElementById('view-dashboard').classList.contains('active')) return;
    
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    // update positions
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if(n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if(n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    // draw connections
    ctx.lineWidth = 1;
    for(let i=0; i<nodes.length; i++) {
      for(let j=i+1; j<nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 120) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = appState.theme === 'dark' ? `rgba(255,255,255,${0.1 - dist/1200})` : `rgba(0,0,0,${0.08 - dist/1500})`;
          ctx.stroke();
        }
      }
    }

    // draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = n.c;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// -------------------------------------------------------------------------
// 6. MULTILINGUAL AI TRIAGE
// -------------------------------------------------------------------------
let triageSymptoms = [];
let recognition;
let isRecording = false;
let synthesis = window.speechSynthesis;

if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  
  recognition.onstart = function() {
    isRecording = true;
    document.getElementById('btn-triage-mic').classList.add('listening');
    document.getElementById('triage-prompt').innerText = "Listening...";
    startVoiceAnimation();
  };
  
  recognition.onresult = function(event) {
    let final_transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) final_transcript += event.results[i][0].transcript;
    }
    if(final_transcript) addBodySymptom(final_transcript.trim());
  };
  
  recognition.onerror = function() {
    showToast("Mic access denied. Simulating...", 'warning');
    setTimeout(() => { addBodySymptom("Severe headache and fever"); }, 1000);
  };
  
  recognition.onend = function() {
    isRecording = false;
    document.getElementById('btn-triage-mic').classList.remove('listening');
    document.getElementById('triage-prompt').innerText = "Tap to Speak";
    stopVoiceAnimation();
  };
}

document.getElementById('btn-triage-mic').addEventListener('click', () => {
  if (isRecording) {
    recognition.stop();
  } else {
    try {
      recognition.lang = document.getElementById('lang-select').value === 'en' ? 'en-US' : 'hi-IN';
      recognition.start();
    } catch(e) {
      addBodySymptom("High fever and headache");
    }
  }
});

function addBodySymptom(sym) {
  if(!triageSymptoms.includes(sym)) {
    triageSymptoms.push(sym);
    renderTriageTags();
    runClinicalRiskAlgo();
  }
}

document.getElementById('triage-sym-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    if(this.value.trim() !== '') { addBodySymptom(this.value.trim()); this.value = ''; }
  }
});

function renderTriageTags() {
  const container = document.getElementById('triage-symptoms-tags');
  const inputHTML = '<input type="text" class="tag-input-field" placeholder="Add symptoms manually..." id="triage-sym-input">';
  container.innerHTML = triageSymptoms.map(t => `<span class="tag-interactive">● ${t} <span class="del" onclick="removeTriageSymptom('${t}')">✕</span></span>`).join('') + inputHTML;
  document.getElementById('triage-sym-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if(this.value.trim() !== '') { addBodySymptom(this.value.trim()); this.value = ''; }
    }
  });
}

function removeTriageSymptom(sym) {
  triageSymptoms = triageSymptoms.filter(t => t !== sym);
  renderTriageTags();
  runClinicalRiskAlgo();
}

function runClinicalRiskAlgo() {
  if(triageSymptoms.length === 0) { document.getElementById('risk-result').style.display = 'none'; return; }
  document.getElementById('risk-result').style.display = 'block';
  
  const text = triageSymptoms.join(' ').toLowerCase();
  let score = 20;
  if(text.includes('fever') || text.includes('chest') || text.includes('breath')) score += 40;
  if(text.includes('pain') || text.includes('headache')) score += 20;
  
  score = Math.min(score, 98);
  const banner = document.getElementById('risk-banner');
  if(score > 70) {
    banner.className = 'rc-urgency badge-red mb-3 p-3 rounded text-center fw-bold';
    banner.innerText = `URGENCY SCORE: ${score}% — CRITICAL RISK. IMMEDIATE PHC REFERRAL REQUIRED`;
  } else if (score > 40) {
    banner.className = 'rc-urgency mb-3 p-3 rounded text-center fw-bold';
    banner.style.backgroundColor = 'rgba(245,158,11,0.15)'; banner.style.color = '#B45309'; border = '1px solid #F59E0B';
    banner.innerText = `URGENCY SCORE: ${score}% — MONITOR AT SUB-CENTER`;
  } else {
    banner.className = 'rc-urgency mb-3 p-3 rounded text-center fw-bold text-success';
    banner.style.backgroundColor = 'rgba(16,185,129,0.15)';
    banner.innerText = `URGENCY SCORE: ${score}% — HOME CARE`;
  }
  
  document.getElementById('confidence-meters').innerHTML = `
    <div class="confidence-meter mb-3">
      <div class="d-flex justify-content-between mb-1"><span class="cm-label">Viral Pyrexia</span><span>${score}%</span></div>
      <div class="cm-track"><div class="cm-fill" style="width:${score}%; background:${score>70?'#DC2626':'#10B981'}"></div></div>
    </div>
  `;
}

// Voice Wave Animation
let waveReq;
function startVoiceAnimation() {
  const canvas = document.getElementById('voice-waves');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth; canvas.height = 100;
  let phase = 0;
  function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.beginPath();
    for(let x=0; x<canvas.width; x++) { ctx.lineTo(x, Math.sin((x * 0.05) + phase) * 20 + 50); }
    ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 3; ctx.stroke();
    phase += 0.15; waveReq = requestAnimationFrame(draw);
  }
  draw();
}
function stopVoiceAnimation() { cancelAnimationFrame(waveReq); }
function playAudioAdvice(customTxt) {
  if (synthesis.speaking) { synthesis.cancel(); }
  const text = customTxt || document.getElementById('risk-banner').innerText;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = parseFloat(document.getElementById('range-speed').value);
  utter.pitch = parseFloat(document.getElementById('range-pitch').value);
  synthesis.speak(utter);
}

// -------------------------------------------------------------------------
// 7. SCHEME RADAR & ABHA
// -------------------------------------------------------------------------
document.getElementById('range-inc').addEventListener('input', function() { document.getElementById('val-inc').innerText = `₹${parseInt(this.value).toLocaleString('en-IN')}`; calcSchemes(); });
document.getElementById('range-fam').addEventListener('input', function() { document.getElementById('val-fam').innerText = this.value; calcSchemes(); });
document.getElementById('sel-cat').addEventListener('change', calcSchemes);

function calcSchemes() {
  const inc = parseInt(document.getElementById('range-inc').value);
  const cat = document.getElementById('sel-cat').value;
  const results = document.getElementById('scheme-results');
  results.innerHTML = '';
  
  appState.schemes.forEach(s => {
    let eligible = false;
    if (s.name.includes("PM-JAY") && (cat === 'BPL' || inc <= 250000)) eligible = true;
    if (s.name.includes("Suraksha") && cat === 'Pregnant') eligible = true;
    if (s.name.includes("Vandana Yojana") && cat === 'Pregnant') eligible = true;
    if (s.name.includes("Vay Vandana") && cat === 'Senior') eligible = true;
    
    if(eligible) {
      results.innerHTML += `<div class="scheme-card"><div class="d-flex justify-content-between align-items-start"><div class="sc-title">${s.name}</div><span class="tag-pill ${s.type}">ELIGIBLE</span></div><div class="sc-desc">${s.desc}</div></div>`;
    }
  });
  
  if(results.innerHTML === '') results.innerHTML = `<p class="text-muted text-center mt-3">No matching schemes.</p>`;
  renderABHACard();
}

function renderABHACard() {
  const name = document.getElementById('inp-name').value || (appState.currentUser ? appState.currentUser.name : "Citizen Name");
  let abha = document.getElementById('inp-abha').value || (appState.currentUser && appState.currentUser.data.abha ? appState.currentUser.data.abha : "91-" + Math.floor(1000+Math.random()*9000) + "-" + Math.floor(1000+Math.random()*9000) + "-" + Math.floor(1000+Math.random()*9000));
  document.getElementById('ab-gen-name').innerText = name;
  document.getElementById('ab-gen-id').innerText = abha;
}

function downloadABHACard() {
  const cvs = document.getElementById('abha-canvas');
  cvs.width = 600; cvs.height = 300;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0,0,600,300);
  ctx.fillStyle = '#0F172A'; ctx.font = 'bold 24px sans-serif'; ctx.fillText("Ayushman Bharat Health Account", 30, 40);
  ctx.beginPath(); ctx.moveTo(30, 60); ctx.lineTo(570, 60); ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 2; ctx.stroke();
  ctx.font = 'bold 28px sans-serif'; ctx.fillText(document.getElementById('ab-gen-name').innerText, 150, 140);
  ctx.font = '22px monospace'; ctx.fillStyle = '#334155'; ctx.fillText(document.getElementById('ab-gen-id').innerText, 150, 180);
  ctx.fillStyle = '#E2E8F0'; ctx.fillRect(30, 90, 100, 120);
  
  const link = document.createElement('a');
  link.download = `ABHA_Card.png`;
  link.href = cvs.toDataURL('image/png');
  link.click();
  showToast('ABHA Card Downloaded');
}

// -------------------------------------------------------------------------
// 8. ABHA PROFILE (TWO-WAY BINDING)
// -------------------------------------------------------------------------
const profileSyms = [];
const profileConds = [];

document.querySelectorAll('.bind-input').forEach(input => {
  input.addEventListener('input', updatePreviewCard);
});

function updatePreviewCard() {
  const name = document.getElementById('inp-name').value || '--';
  const age = document.getElementById('inp-age').value || '--';
  document.getElementById('card-name').innerText = name;
  document.getElementById('card-village').innerText = document.getElementById('inp-village').value || '--';
  document.getElementById('card-abha').innerText = document.getElementById('inp-abha').value || '--';

  let vitalsHTML = '';
  const bp = document.getElementById('inp-bp').value;
  const spo2 = document.getElementById('inp-spo2').value;
  vitalsHTML += `<div class="v-block"><span class="v-lbl">BP (mmHg)</span><span class="v-val">${bp || '--'}</span></div>`;
  vitalsHTML += `<div class="v-block"><span class="v-lbl">SpO2 (%)</span><span class="v-val">${spo2 || '--'}</span></div>`;
  document.getElementById('card-vitals').innerHTML = vitalsHTML;
  
  let html = profileSyms.map(t => `<span class="tag-pill tag-red">${t}</span>`).join('');
  html += profileConds.map(t => `<span class="tag-pill tag-sky">${t}</span>`).join('');
  document.getElementById('card-link-tags').innerHTML = html;
  
  let score = 100;
  if(spo2 && spo2 < 95) score -= 20;
  if(profileSyms.length > 0) score -= (profileSyms.length * 5);
  const ring = document.getElementById('card-health-score');
  ring.innerText = score + '%';
  ring.style.borderColor = score > 80 ? 'var(--c-mint)' : (score > 60 ? 'var(--c-amb)' : '#DC2626');
  ring.style.color = score > 80 ? 'var(--c-mint-text)' : (score > 60 ? '#B45309' : '#991B1B');
}

document.getElementById('profile-sym-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if(this.value.trim() !== '') { profileSyms.push(this.value.trim()); renderProfileInputTags('profile-symptoms-tags', profileSyms, 'sym'); this.value = ''; updatePreviewCard(); } }
});
document.getElementById('profile-cond-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if(this.value.trim() !== '') { profileConds.push(this.value.trim()); renderProfileInputTags('profile-cond-tags', profileConds, 'cond'); this.value = ''; updatePreviewCard(); } }
});

function renderProfileInputTags(containerId, arr, type) {
  const container = document.getElementById(containerId);
  const input = container.querySelector('input');
  container.innerHTML = arr.map(t => `<span class="tag-interactive">● ${t} <span class="del" onclick="removeProfileTag('${t}', '${type}')">✕</span></span>`).join('');
  container.appendChild(input);
}
function removeProfileTag(tag, type) {
  if(type==='sym') { profileSyms.splice(profileSyms.indexOf(tag), 1); renderProfileInputTags('profile-symptoms-tags', profileSyms, 'sym'); } 
  else { profileConds.splice(profileConds.indexOf(tag), 1); renderProfileInputTags('profile-cond-tags', profileConds, 'cond'); }
  updatePreviewCard();
}

function savePatientNode() {
  const name = document.getElementById('inp-name').value;
  if(!name) { showToast('Patient Name Required', 'danger'); return; }
  const newPatient = {
    id: document.getElementById('inp-abha').value || "91-" + Date.now().toString().slice(-12),
    name: name, age: document.getElementById('inp-age').value, gender: document.getElementById('inp-gender').value,
    ward: document.getElementById('inp-village').value, bp: document.getElementById('inp-bp').value, spo2: document.getElementById('inp-spo2').value,
    risk: profileSyms.length > 2 ? 'Critical' : 'Stable', symptoms: [...profileSyms], conditions: [...profileConds]
  };
  appState.patients.unshift(newPatient); saveStore(); showToast(`Patient ${name} saved successfully!`);
  document.querySelectorAll('.bind-input').forEach(i => i.value='');
  profileSyms.length = 0; profileConds.length = 0;
  renderProfileInputTags('profile-symptoms-tags', profileSyms, 'sym'); renderProfileInputTags('profile-cond-tags', profileConds, 'cond');
  updatePreviewCard();
  if(appState.currentUser && appState.currentUser.roleLabel.includes('ASHA')) setTimeout(() => switchTab('view-directory'), 1000);
}

// -------------------------------------------------------------------------
// 9. DIRECTORY & SOS TELEMETRY
// -------------------------------------------------------------------------
document.getElementById('dir-search').addEventListener('input', renderDirectory);
document.getElementById('dir-filter').addEventListener('change', renderDirectory);
document.getElementById('risk-filter').addEventListener('change', renderDirectory);

function renderDirectory() {
  const search = document.getElementById('dir-search').value.toLowerCase();
  const wardF = document.getElementById('dir-filter').value;
  const riskF = document.getElementById('risk-filter').value;
  const container = document.getElementById('cohort-grid-container');
  container.innerHTML = '';
  
  const filtered = appState.patients.filter(p => {
    let matchS = p.name.toLowerCase().includes(search) || p.id.includes(search) || p.symptoms.join(' ').toLowerCase().includes(search);
    let matchW = (wardF === 'All' || p.ward === wardF);
    let matchR = (riskF === 'All' || p.risk === riskF);
    return matchS && matchW && matchR;
  });
  
  filtered.forEach(p => {
    let statusPill = '';
    if(p.risk === 'Critical') statusPill = `<div class="status-pill status-critical"><div class="dot"></div>CRITICAL RISK</div>`;
    else if(p.risk === 'Attention') statusPill = `<div class="status-pill status-attention"><div class="dot"></div>ATTENTION REQUIRED</div>`;
    else statusPill = `<div class="status-pill status-stable"><div class="dot"></div>STABLE</div>`;
    
    let vitalsStr = `
      <div class="v-block"><span class="v-lbl">BP (mmHg)</span><span class="v-val">${p.bp || '--'}</span></div>
      <div class="v-block"><span class="v-lbl">SpO2 (%)</span><span class="v-val">${p.spo2 || '--'}</span></div>
    `;

    let tagsStr = p.symptoms.map(s => `<span class="tag-pill tag-red">${s}</span>`).join('');
    tagsStr += p.conditions.map(c => `<span class="tag-pill tag-sky">${c}</span>`).join('');
    
    const div = document.createElement('div');
    div.className = 'patient-card';
    div.innerHTML = `
      <div class="pc-top">
        <div class="d-flex">
          <div class="pc-avatar">${getInitials(p.name)}</div>
          <div class="pc-identity">
            <div class="name">${p.name}</div>
            <div class="meta">${p.id} • ${p.age} yrs • ${p.ward}</div>
          </div>
        </div>
        ${statusPill}
      </div>
      <div class="vitals-strip">${vitalsStr}</div>
      <div class="link-tags mb-3">${tagsStr}</div>
      <div class="pc-action" onclick="openClinicalModal('${p.id}')">
        <span>View Complete Intelligence &rarr;</span>
      </div>
    `;
    container.appendChild(div);
  });
  if(filtered.length === 0) container.innerHTML = `<div class="p-5 text-center text-muted" style="grid-column: 1 / -1;">No villagers found matching criteria.</div>`;
}

function openClinicalModal(id) {
  const p = appState.patients.find(x => x.id === id);
  if(!p) return;
  document.getElementById('modal-title').innerText = `${p.name} (${p.age} yrs)`;
  document.getElementById('modal-subtitle').innerText = `ABHA: ${p.id} • ${p.ward}`;
  document.getElementById('modal-bp').innerText = p.bp || '--';
  document.getElementById('modal-spo2').innerText = p.spo2 ? p.spo2 + '%' : '--';
  let tags = p.symptoms.map(s => `<span class="tag-pill tag-red">${s}</span>`).join('');
  tags += p.conditions.map(c => `<span class="tag-pill tag-sky">${c}</span>`).join('');
  document.getElementById('modal-tags').innerHTML = tags || '--';
  
  const m = new bootstrap.Modal(document.getElementById('clinicalModal'));
  m.show();
}
function generateReferral() {
  bootstrap.Modal.getInstance(document.getElementById('clinicalModal')).hide();
  showToast("PHC Emergency Slip Generated", "success");
}

function renderCenters() {
  const PHCS = [ { name: 'Devnagar Sub-Center', type: 'Sub-Center', dist: '1.2 km', beds: '2/4 Beds' }, { name: 'Raghupur CHC', type: 'Community Hospital', dist: '5.8 km', beds: '12/30 Beds' }, { name: 'Bamnoli PHC', type: 'Primary Health Center', dist: '8.4 km', beds: '4/10 Beds' }, { name: 'Sirsiya HWC', type: 'Health & Wellness', dist: '12.1 km', beds: '1/2 Beds' } ];
  document.getElementById('phc-grid-container').innerHTML = PHCS.map(p => `
    <div class="phc-card">
      <div class="phc-dist"><div class="phc-dist-val">${p.dist.split(' ')[0]}</div><div class="mono-label" style="font-size:0.65rem">KILOMETERS</div></div>
      <div class="phc-info"><h4>${p.name}</h4><div class="text-muted" style="font-size:0.85rem">${p.type}</div><div class="badge-mono-pill mt-2 d-inline-block">${p.beds} Avail.</div></div>
    </div>
  `).join('');
}

function dispatchSOS() {
  const gpsEl = document.getElementById('gps-coords');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => { gpsEl.innerText = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`; triggerDispatchUI(); },
      (err) => { gpsEl.innerText = `12.9716° N, 77.5946° E (Fallback)`; triggerDispatchUI(); }
    );
  } else { gpsEl.innerText = `12.9716° N, 77.5946° E (Fallback)`; triggerDispatchUI(); }
}
function triggerDispatchUI() {
  const feed = document.getElementById('sos-feed'); feed.classList.remove('d-none');
  setTimeout(() => { showToast("108 Dispatch Confirmed", "danger"); }, 2000);
}

// -------------------------------------------------------------------------
// 10. STORAGE METRICS
// -------------------------------------------------------------------------
function updateStorageMeter() {
  const lsSize = new Blob([Object.values(localStorage)]).size;
  const kb = (lsSize / 1024).toFixed(2);
  const el = document.getElementById('storage-usage');
  if(el) el.innerText = `${kb} KB / 5000 KB`;
  const bar = document.getElementById('storage-bar');
  if(bar) bar.style.width = Math.min((kb/5000)*100, 100) + '%';
}
function forceSyncCloud() {
  const bar = document.getElementById('storage-bar');
  const oldWidth = bar.style.width;
  bar.classList.remove('bg-primary'); bar.classList.add('bg-warning'); bar.style.width = '100%'; bar.style.transition = 'width 2s ease';
  setTimeout(() => { bar.classList.remove('bg-warning'); bar.classList.add('bg-primary'); bar.style.transition = 'none'; bar.style.width = oldWidth; showToast('Cloud sync complete.'); }, 2000);
}

// Initial Boot
initStore();
