/* =========================================================================
   ArogyaSetu Intelligence - Master Core Engine v6 (Phases 4 & 5 Master)
   Clean Module IIFE, Single State Source of Truth, Delegated Event Bus,
   Accessible States (Skeleton/Empty/Error), Stacked Toasts, Robust i18n,
   100% Offline Resilience, and XSS-Safe Clinical Operations
   ========================================================================= */

(function (window, document) {
  'use strict';

  /* =======================================================================
     1. CONFIG & CONSTANTS
     ======================================================================= */
  const APP_VERSION = '1.0.0';
  const STORAGE_KEY_STATE = 'asi.v1.state';
  const STORAGE_KEY_ROLE = 'asi.v1.role';
  const STORAGE_SCHEMA_VERSION = 1;

  const ROUTE_MAP = {
    '#/auth': 'view-auth',
    '#/dashboard': 'view-dashboard',
    '#/directory': 'view-directory',
    '#/symptoms': 'view-symptoms',
    '#/schemes': 'view-schemes',
    '#/profile': 'view-profile',
    '#/centers': 'view-centers',
    '#/settings': 'view-settings'
  };

  const ROLES = {
    asha: {
      key: 'asha',
      name: 'Sunita Bai',
      roleLabel: 'ASHA Field Lead',
      badge: 'ASHA FIELD NODE (Ward 03)',
      defaultRoute: '#/directory',
      primaryAction: {
        text: 'Record Vitals / Intake',
        icon: 'icon-person-plus',
        targetRoute: '#/profile'
      },
      visibleTabs: ['view-dashboard', 'view-directory', 'view-profile', 'view-schemes', 'view-centers', 'view-settings'],
      mobileTabs: [
        { id: 'view-directory', route: '#/directory', label: 'Villagers', icon: 'icon-people' },
        { id: 'view-dashboard', route: '#/dashboard', label: 'Dashboard', icon: 'icon-bar-chart' },
        { id: 'view-profile', route: '#/profile', label: 'Intake', icon: 'icon-person-vcard' },
        { id: 'view-schemes', route: '#/schemes', label: 'Schemes', icon: 'icon-building-check' }
      ],
      moreItems: [
        { id: 'view-symptoms', route: '#/symptoms', label: 'AI Symptom Triage', icon: 'icon-robot' },
        { id: 'view-centers', route: '#/centers', label: 'Nearest PHC Facilities', icon: 'icon-hospital' },
        { id: 'view-settings', route: '#/settings', label: 'Offline Gateway & Sync', icon: 'icon-gear' }
      ]
    },
    doctor: {
      key: 'doctor',
      name: 'Dr. Anjali Verma',
      roleLabel: 'PHC Medical Officer',
      badge: 'PHC CLINICAL OFFICER NODE',
      defaultRoute: '#/dashboard',
      primaryAction: {
        text: 'Review Critical Queue',
        icon: 'icon-alert',
        targetRoute: '#/directory',
        customAction: function () {
          setRiskFilter('Critical');
          navigateTo('#/directory');
        }
      },
      visibleTabs: ['view-dashboard', 'view-directory', 'view-symptoms', 'view-centers', 'view-settings'],
      mobileTabs: [
        { id: 'view-dashboard', route: '#/dashboard', label: 'Overview', icon: 'icon-bar-chart' },
        { id: 'view-directory', route: '#/directory', label: 'Triage Queue', icon: 'icon-people' },
        { id: 'view-centers', route: '#/centers', label: 'Dispatch', icon: 'icon-hospital' },
        { id: 'view-settings', route: '#/settings', label: 'System', icon: 'icon-gear' }
      ],
      moreItems: [
        { id: 'view-symptoms', route: '#/symptoms', label: 'Clinical AI Diagnostics', icon: 'icon-robot' },
        { id: 'view-schemes', route: '#/schemes', label: 'National Schemes Radar', icon: 'icon-building-check' },
        { id: 'view-profile', route: '#/profile', label: 'Patient Intake Record', icon: 'icon-person-vcard' }
      ]
    },
    patient: {
      key: 'patient',
      name: 'Lakshmi Devi',
      roleLabel: 'Rural Villager / Patient',
      badge: 'VILLAGER CITIZEN NODE',
      defaultRoute: '#/symptoms',
      primaryAction: {
        text: 'Check Symptoms (Voice)',
        icon: 'icon-mic',
        targetRoute: '#/symptoms',
        customAction: function () {
          navigateTo('#/symptoms');
          const mic = document.getElementById('btn-triage-mic');
          if (mic) mic.click();
        }
      },
      visibleTabs: ['view-symptoms', 'view-profile', 'view-schemes', 'view-centers', 'view-settings'],
      mobileTabs: [
        { id: 'view-symptoms', route: '#/symptoms', label: 'Symptoms', icon: 'icon-robot' },
        { id: 'view-profile', route: '#/profile', label: 'My Health', icon: 'icon-person-vcard' },
        { id: 'view-schemes', route: '#/schemes', label: 'Schemes', icon: 'icon-building-check' },
        { id: 'view-centers', route: '#/centers', label: 'Nearest PHC', icon: 'icon-hospital' }
      ],
      moreItems: [
        { id: 'view-settings', route: '#/settings', label: 'Language & Audio Settings', icon: 'icon-gear' }
      ],
      data: { age: 32, abha: '91-4820-1928-3012' }
    },
    maternal: {
      key: 'maternal',
      name: 'Pooja Sharma',
      roleLabel: 'Maternal Mother (ANC)',
      badge: 'MATERNAL ANC CARE NODE',
      defaultRoute: '#/schemes',
      primaryAction: {
        text: 'My Benefits & ABHA Passport',
        icon: 'icon-shield-check',
        targetRoute: '#/schemes',
        customAction: function () {
          navigateTo('#/schemes');
          flipABHACard();
        }
      },
      visibleTabs: ['view-schemes', 'view-symptoms', 'view-profile', 'view-centers', 'view-settings'],
      mobileTabs: [
        { id: 'view-schemes', route: '#/schemes', label: 'My Benefits', icon: 'icon-building-check' },
        { id: 'view-symptoms', route: '#/symptoms', label: 'ANC Triage', icon: 'icon-robot' },
        { id: 'view-profile', route: '#/profile', label: 'ANC Vitals', icon: 'icon-person-vcard' },
        { id: 'view-centers', route: '#/centers', label: 'Maternity PHC', icon: 'icon-hospital' }
      ],
      moreItems: [
        { id: 'view-settings', route: '#/settings', label: 'Offline Gateway & Audio', icon: 'icon-gear' }
      ],
      data: { age: 24, abha: '91-7766-5544-3322' }
    }
  };

  const BODY_ZONE_SYMPTOMS = {
    Head: ['Severe Throbbing Migraine', 'Dizziness / Vertigo', 'High Pyrexia (Fever)', 'Visual Aura'],
    Throat: ['Acute Dysphagia', 'Sore Throat', 'Dry Hacking Cough', 'Hoarseness'],
    Chest: ['Sharp Chest Tightness', 'Dyspnea (Breathlessness)', 'Palpitations', 'Productive Cough'],
    Abdomen: ['Acute Epigastric Pain', 'Severe Watery Diarrhea', 'Persistent Nausea', 'Abdominal Cramping'],
    Pelvic: ['Maternal Pelvic Pain', 'Labor Contractions', 'Postpartum Spotting', 'Dysuria'],
    Joints: ['Acute Arthralgia (Joint Pain)', 'Limb Swelling / Edema', 'Muscular Rigidity', 'Fatigue']
  };

  const PHC_FACILITIES = [
    { name: 'Devnagar Sub-Center', type: 'Sub-Center (24x7)', dist: '1.2 km', eta: '4 min', bedsOccupied: 2, bedsTotal: 4, hasAmbulance: true, specs: ['Basic ANC', 'Oxygen Support'] },
    { name: 'Raghupur CHC', type: 'Community Hospital', dist: '5.8 km', eta: '14 min', bedsOccupied: 18, bedsTotal: 30, hasAmbulance: true, specs: ['Emergency OB/GYN', 'Blood Bank', 'ICU'] },
    { name: 'Bamnoli PHC', type: 'Primary Health Center', dist: '8.4 km', eta: '20 min', bedsOccupied: 8, bedsTotal: 10, hasAmbulance: false, specs: ['General OPD', 'Vaccination'] },
    { name: 'Sirsiya HWC', type: 'Health & Wellness Clinic', dist: '12.1 km', eta: '28 min', bedsOccupied: 2, bedsTotal: 2, hasAmbulance: false, specs: ['Diagnostic Lab'] }
  ];

  /* =======================================================================
     2. I18N DICTIONARY & INTERNATIONALIZATION
     ======================================================================= */
  const TRANSLATIONS = {
    en: {
      hero_tag: '● FRONTLINE RURAL HEALTH NETWORK',
      hero_title: 'Eliminating critical triage & maternal care delays.',
      hero_quote: '"Bridging the critical 48-hour gap between remote village hamlets, frontline ASHA workers, and verified government healthcare schemes with 100% offline edge intelligence."',
      stat_villagers: 'Villagers Screened',
      stat_wards: 'Wards Connected',
      stat_schemes: 'DBT Benefits Enabled',
      stat_screened_cap: 'VILLAGERS SCREENED',
      stat_alerts_cap: 'HIGH-RISK ALERTS',
      stat_dbt_cap: 'DBT DISBURSED',
      stat_sync_cap: 'OFFLINE SYNC HEALTH',
      footer_auth: 'National Health Mission Interface • Verified ABHA Health Node Access',
      auth_title: 'Access your clinical health node',
      auth_subtext: 'One-click role launch or enter verified credentials with instant OTP',
      lbl_or_fed: 'OR SECURE CREDENTIAL LOGIN',
      lbl_demo: '⚡ ONE-CLICK DEMO ACCESS (SELECT ROLE)',
      role_asha_title: 'ASHA Field Worker',
      role_asha_desc: 'Screen villagers, manage ANC cohorts & sync field records',
      role_doc_title: 'PHC Medical Officer',
      role_doc_desc: 'Review high-risk triage alerts & authorize 108 emergency dispatch',
      role_patient_title: 'Rural Villager / Patient',
      role_patient_desc: 'Check symptoms via vernacular voice & discover eligible schemes',
      role_maternal_title: 'Maternal Mother (ANC)',
      role_maternal_desc: 'Access maternity benefits (JSY/PMMVY) & digital ABHA passport',
      lbl_phone_abha: 'Phone Number or ABHA Health ID',
      lbl_enter_otp: 'ENTER 6-DIGIT VERIFICATION CODE',
      btn_verify_otp: 'Verify & Enter Health Platform',
      brand: 'ArogyaSetu Intelligence',
      search_placeholder: 'Search symptoms, schemes, ABHA...',
      btn_switch_node: 'Sign Out / Switch Node →',
      tab_dashboard: 'Dashboard',
      tab_directory: 'Villager Directory',
      tab_symptoms: 'AI Symptom Checker',
      tab_schemes: 'Scheme Radar',
      tab_profile: 'Profile & Vitals Intake',
      tab_centers: 'Nearest PHC Centers',
      tab_settings: 'Settings',
      dash_title: 'Field Operations & Epidemiology Dashboard',
      ac_record: 'Record Vitals',
      ac_triage: 'Run Voice Triage',
      ac_radar: 'Scheme Radar',
      ac_dispatch: 'Emergency 108 PHC',
      prof_title: 'Patient Profile & Vitals Intake',
      lbl_name: 'PATIENT NAME *',
      lbl_age: 'AGE',
      lbl_gender: 'GENDER',
      lbl_ward: 'VILLAGE / WARD',
      lbl_abha: 'ABHA ID (14-DIGIT)',
      lbl_symptoms: 'CURRENT ACTIVE SYMPTOMS',
      lbl_conditions: 'CHRONIC / MATERNAL CONDITIONS',
      btn_save: 'Save Patient Record',
      lbl_vitals_summary: 'Vitals Summary',
      lbl_cond_sym: 'Conditions & Symptoms',
      triage_title: 'Vernacular Voice & Body-Zone Diagnostic',
      triage_prompt: '"Tap to Speak in Vernacular (Hindi, Kannada, Tamil, English)"',
      lbl_confidence: 'Syndromic Risk Matrix',
      scheme_title: 'National Scheme Radar & ABHA Credential',
      lbl_eligibility: 'Eligibility Parameters',
      lbl_income: 'Annual Household Income',
      lbl_family: 'Family Members Count',
      lbl_category: 'Beneficiary Category',
      lbl_digital_abha: 'Digital ABHA Health Credential',
      lbl_matched_schemes: 'Evaluated Health Schemes',
      dir_title: 'Registered Villagers & Triage Directory',
      phc_title: 'Nearest Health Centers & Verified 108 SOS Dispatch',
      settings_title: 'Settings & Offline Gateway',
      lbl_safety_disclaimer: 'Clinical Advisory: This is a triage recommendation guide, not a final medical diagnosis. For emergency stabilization, immediately call 108.',
      offline_banner_text: 'DEMO SIMULATION: OFFLINE MODE ACTIVE — Network dropped. All records queued locally in Indexed/LocalStorage.',
      btn_restore_online: 'Restore Online',
      empty_directory_title: 'No villagers match filter criteria',
      empty_directory_msg: 'Try adjusting ward or risk filters to view community health records.',
      btn_clear_filters: 'Clear All Filters',
      empty_queue_title: 'No Critical Alerts Open',
      empty_queue_msg: 'All flagged vitals and syndromic risks in your wards have been cleared.',
      empty_schemes_title: 'No Matching Schemes',
      empty_schemes_msg: 'Adjust household income or category parameters to evaluate government health benefits.',
      empty_centers_title: 'No Facilities Found',
      empty_centers_msg: 'No health centers meet the selected bed or ambulance filter.',
      btn_show_all: 'Show All Facilities',
      toast_saved: 'Patient record saved successfully!',
      toast_synced: 'All offline records synchronized to Central NHM Registry.',
      toast_queued: 'Record queued locally in offline storage.',
      toast_exported: 'Data backup exported as JSON file.',
      toast_sos: 'EMERGENCY 108 BROADCASTED: Ambulance unit assigned.'
    },
    hi: {
      hero_tag: '● अग्रणी ग्रामीण स्वास्थ्य नेटवर्क',
      hero_title: 'आपातकालीन ट्राइएज और मातृ देखभाल में देरी को समाप्त करना।',
      hero_quote: '"दूरदराज के गांवों, आशा कार्यकर्ताओं और सरकारी स्वास्थ्य योजनाओं के बीच की 48 घंटे की महत्वपूर्ण खाई को 100% ऑफलाइन इंटेलिजेंस के साथ पाटना।"',
      stat_villagers: 'स्क्रीन किए गए ग्रामीण',
      stat_wards: 'जुड़े हुए वार्ड',
      stat_schemes: 'DBT लाभ सक्षम',
      stat_screened_cap: 'स्क्रीन किए गए ग्रामीण',
      stat_alerts_cap: 'उच्च जोखिम अलर्ट',
      stat_dbt_cap: 'DBT वितरित राशि',
      stat_sync_cap: 'ऑफलाइन सिंक स्थिति',
      footer_auth: 'राष्ट्रीय स्वास्थ्य मिशन इंटरफ़ेस • सत्यापित ABHA नोड',
      auth_title: 'अपने क्लिनिकल नोड में साइन इन करें',
      auth_subtext: 'एक-क्लिक डेमो चयन या ओटीपी के साथ लॉगिन करें',
      lbl_or_fed: 'या सुरक्षित क्रेडेंशियल लॉगिन',
      lbl_demo: '⚡ त्वरित डेमो एक्सेस (भूमिका चुनें)',
      role_asha_title: 'आशा कार्यकर्ता',
      role_asha_desc: 'ग्रामीणों की स्क्रीनिंग करें, ANC देखभाल और रिकॉर्ड सिंक करें',
      role_doc_title: 'PHC चिकित्सा अधिकारी',
      role_doc_desc: 'उच्च जोखिम अलर्ट देखें और 108 आपातकालीन प्रेषण करें',
      role_patient_title: 'ग्रामीण नागरिक / मरीज',
      role_patient_desc: 'आवाज से लक्षण जांचें और पात्र योजनाएं खोजें',
      role_maternal_title: 'गर्भवती माता (ANC)',
      role_maternal_desc: 'मातृत्व लाभ (JSY/PMMVY) और ABHA पासपोर्ट देखें',
      lbl_phone_abha: 'फोन नंबर या ABHA हेल्थ आईडी',
      lbl_enter_otp: '6-अंकीय सत्यापन कोड दर्ज करें',
      btn_verify_otp: 'सत्यापित करें और प्रवेश करें',
      brand: 'आरोग्यसेतु इंटेलिजेंस',
      search_placeholder: 'लक्षण, योजनाएं, ABHA खोजें...',
      btn_switch_node: 'साइन आउट / नोड बदलें →',
      tab_dashboard: 'डैशबोर्ड',
      tab_directory: 'ग्रामीण निर्देशिका',
      tab_symptoms: 'AI लक्षण चेकर',
      tab_schemes: 'योजना रडार',
      tab_profile: 'प्रोफ़ाइल और विटल्स',
      tab_centers: 'निकटतम PHC केंद्र',
      tab_settings: 'सेटिंग्स',
      dash_title: 'क्षेत्र संचालन और महामारी विज्ञान डैशबोर्ड',
      ac_record: 'विटल्स दर्ज करें',
      ac_triage: 'वॉयस ट्राइएज चलाएं',
      ac_radar: 'योजना रडार',
      ac_dispatch: 'आपातकालीन 108 प्रेषण',
      prof_title: 'मरीज प्रोफ़ाइल और विटल्स इंटेक',
      lbl_name: 'मरीज का नाम *',
      lbl_age: 'आयु',
      lbl_gender: 'लिंग',
      lbl_ward: 'गाँव / वार्ड',
      lbl_abha: 'ABHA ID (14-अंक)',
      lbl_symptoms: 'सक्रिय लक्षण',
      lbl_conditions: 'पुरानी / मातृ स्थितियां',
      btn_save: 'मरीज रिकॉर्ड सहेजें',
      lbl_vitals_summary: 'विटल्स सारांश',
      lbl_cond_sym: 'स्थितियां और लक्षण',
      triage_title: 'स्थानीय भाषा वॉयस और बॉडी-जोन निदान',
      triage_prompt: '"स्थानीय भाषा (हिंदी, कन्नड़, तमिल, अंग्रेजी) में बोलने के लिए टैप करें"',
      lbl_confidence: 'सिंड्रोमिक जोखिम मैट्रिक्स',
      scheme_title: 'राष्ट्रीय योजना रडार और ABHA क्रेडेंशियल',
      lbl_eligibility: 'पात्रता पैरामीटर',
      lbl_income: 'वार्षिक पारिवारिक आय',
      lbl_family: 'परिवार के सदस्य',
      lbl_category: 'लाभार्थी श्रेणी',
      lbl_digital_abha: 'डिजिटल ABHA स्वास्थ्य क्रेडेंशियल',
      lbl_matched_schemes: 'मूल्यांकित स्वास्थ्य योजनाएं',
      dir_title: 'पंजीकृत ग्रामीण और ट्राइएज निर्देशिका',
      phc_title: 'निकटतम स्वास्थ्य केंद्र और 108 आपातकालीन प्रेषण',
      settings_title: 'सेटिंग्स और ऑफलाइन गेटवे',
      lbl_safety_disclaimer: 'क्लिनिकल सलाह: यह एक ट्राइएज मार्गदर्शन है, अंतिम चिकित्सा निदान नहीं। आपात स्थिति में तुरंत 108 पर कॉल करें।',
      offline_banner_text: 'डेमो सिमुलेशन: ऑफलाइन मोड सक्रिय — नेटवर्क बंद। सभी रिकॉर्ड स्थानीय रूप से कतारबद्ध हैं।',
      btn_restore_online: 'ऑनलाइन पुनर्स्थापित करें',
      empty_directory_title: 'कोई ग्रामीण फिल्टर से मेल नहीं खाता',
      empty_directory_msg: 'रिकॉर्ड देखने के लिए वार्ड या जोखिम फिल्टर को साफ़ करें।',
      btn_clear_filters: 'सभी फ़िल्टर साफ़ करें',
      empty_queue_title: 'कोई गंभीर अलर्ट नहीं',
      empty_queue_msg: 'आपके वार्डों में सभी विटल्स सामान्य सीमा में हैं।',
      empty_schemes_title: 'कोई योजना मेल नहीं खाती',
      empty_schemes_msg: 'योजना पात्रता देखने के लिए आय या श्रेणी बदलें।',
      empty_centers_title: 'कोई स्वास्थ्य केंद्र नहीं मिला',
      empty_centers_msg: 'चयनित फिल्टर के अनुरूप कोई केंद्र उपलब्ध नहीं है।',
      btn_show_all: 'सभी केंद्र दिखाएं',
      toast_saved: 'मरीज का रिकॉर्ड सफलतापूर्वक सहेजा गया!',
      toast_synced: 'सभी रिकॉर्ड केंद्रीय रजिस्ट्री के साथ सिंक हो गए।',
      toast_queued: 'रिकॉर्ड स्थानीय ऑफलाइन मेमोरी में कतारबद्ध है।',
      toast_exported: 'डेटा बैकअप JSON प्रारूप में निर्यात किया गया।',
      toast_sos: 'आपातकालीन 108 प्रेषित: एम्बुलेंस इकाई भेजी गई।'
    },
    kn: {
      hero_tag: '● ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಜಾಲ',
      hero_title: 'ತುರ್ತು ಚಿಕಿತ್ಸೆ ಮತ್ತು ತಾಯಂದಿರ ಆರೈಕೆಯ ವಿಳಂಬವನ್ನು ನಿವಾರಿಸುವುದು.',
      hero_quote: '"ಗ್ರಾಮೀಣ ಹಳ್ಳಿಗಳು, ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರು ಮತ್ತು ಸರ್ಕಾರದ ಯೋಜನೆಗಳ ನಡುವಿನ ಅಂತರವನ್ನು 100% ಆಫ್‌ಲೈನ್ ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ."',
      stat_villagers: 'ಪರೀಕ್ಷಿಸಲ್ಪಟ್ಟ ಗ್ರಾಮಸ್ಥರು',
      stat_wards: 'ಸಂಪರ್ಕಿತ ವಾರ್ಡ್‌ಗಳು',
      stat_schemes: 'DBT ನೆರವು ಲಭ್ಯ',
      stat_screened_cap: 'ಪರೀಕ್ಷಿಸಲ್ಪಟ್ಟ ಗ್ರಾಮಸ್ಥರು',
      stat_alerts_cap: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಎಚ್ಚರಿಕೆಗಳು',
      stat_dbt_cap: 'ವಿತರಿಸಲಾದ DBT',
      stat_sync_cap: 'ಆಫ್‌ಲೈನ್ ಸಿಂಕ್ ಆರೋಗ್ಯ',
      footer_auth: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ • ಪರಿಶೀಲಿಸಿದ ABHA ನೋಡ್',
      auth_title: 'ನಿಮ್ಮ ಕ್ಲಿನಿಕಲ್ ನೋಡ್ ಪ್ರವೇಶಿಸಿ',
      auth_subtext: 'ಒಂದು ಕ್ಲಿಕ್ ಡೆಮೊ ಪ್ರವೇಶ ಅಥವಾ OTP ಲಾಗಿನ್',
      lbl_or_fed: 'ಅಥವಾ ಸುರಕ್ಷಿತ ಲಾಗಿನ್',
      lbl_demo: '⚡ ತ್ವರಿತ ಡೆಮೊ ಪ್ರವೇಶ (ಪಾತ್ರವನ್ನು ಆರಿಸಿ)',
      role_asha_title: 'ಆಶಾ ಕಾರ್ಯಕರ್ತೆ',
      role_asha_desc: 'ಗ್ರಾಮಸ್ಥರನ್ನು ಪರೀಕ್ಷಿಸಿ, ANC ದಾಖಲೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
      role_doc_title: 'PHC ವೈದ್ಯಾಧಿಕಾರಿ',
      role_doc_desc: 'ಅಪಾಯದ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು 108 ರವಾನೆ ಮಾಡಿ',
      role_patient_title: 'ಗ್ರಾಮೀಣ ಪ್ರಜೆ / ರೋಗಿ',
      role_patient_desc: 'ಧ್ವನಿಯ ಮೂಲಕ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
      role_maternal_title: 'ತಾಯಿ (ANC)',
      role_maternal_desc: 'ತಾಯ್ತನದ ಪ್ರಯೋಜನಗಳು ಮತ್ತು ABHA ಕಾರ್ಡ್ ವೀಕ್ಷಿಸಿ',
      lbl_phone_abha: 'ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ABHA ಆರೋಗ್ಯ ID',
      lbl_enter_otp: '6-ಅಂಕಿಯ ಪರಿಶೀಲನಾ ಕೋಡ್ ನಮೂದಿಸಿ',
      btn_verify_otp: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಪ್ರವೇಶಿಸಿ',
      brand: 'ಆರೋಗ್ಯಸೇತು ಇಂಟೆಲಿಜೆನ್ಸ್',
      search_placeholder: 'ರೋಗಲಕ್ಷಣಗಳು, ಯೋಜನೆಗಳು, ABHA ಹುಡುಕಿ...',
      btn_switch_node: 'ಸೈನ್ ಔಟ್ / ನೋಡ್ ಬದಲಾಯಿಸಿ →',
      tab_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      tab_directory: 'ಗ್ರಾಮಸ್ಥರ ಡೈರೆಕ್ಟರಿ',
      tab_symptoms: 'AI ಲಕ್ಷಣ ತಪಾಸಕ',
      tab_schemes: 'ಯೋಜನಾ ರೇಡಾರ್',
      tab_profile: 'ಪ್ರೊಫೈಲ್ ಮತ್ತು ವೈಟಲ್ಸ್',
      tab_centers: 'ಹತ್ತಿರದ PHC ಕೇಂದ್ರಗಳು',
      tab_settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      dash_title: 'ಕ್ಷೇತ್ರ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ರೋಗಶಾಸ್ತ್ರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      ac_record: 'ವೈಟಲ್ಸ್ ದಾಖಲಿಸಿ',
      ac_triage: 'ಧ್ವನಿ ಟ್ರಯಾಜ್ ನಡೆಸಿ',
      ac_radar: 'ಯೋಜನಾ ರೇಡಾರ್',
      ac_dispatch: 'ತುರ್ತು 108 ರವಾನೆ',
      prof_title: 'ರೋಗಿಯ ವಿವರ ಮತ್ತು ವೈಟಲ್ಸ್ ನಮೂದು',
      lbl_name: 'ರೋಗಿಯ ಹೆಸರು *',
      lbl_age: 'ವಯಸ್ಸು',
      lbl_gender: 'ಲಿಂಗ',
      lbl_ward: 'ಗ್ರಾಮ / ವಾರ್ಡ್',
      lbl_abha: 'ABHA ID (14-ಅಂಕಿ)',
      lbl_symptoms: 'ವರದಿ ಮಾಡಿದ ಲಕ್ಷಣಗಳು',
      lbl_conditions: 'ದೀರ್ಘಕಾಲಿಕ / ತಾಯಂದಿರ ಪರಿಸ್ಥಿತಿಗಳು',
      btn_save: 'ದಾಖಲೆಯನ್ನು ಉಳಿಸಿ',
      lbl_vitals_summary: 'ವೈಟಲ್ಸ್ ಸಾರಾಂಶ',
      lbl_cond_sym: 'ಪರಿಸ್ಥಿತಿಗಳು ಮತ್ತು ಲಕ್ಷಣಗಳು',
      triage_title: 'ಸ್ಥಳೀಯ ಭಾಷಾ ಧ್ವನಿ ಮತ್ತು ದೇಹದ ಭಾಗಗಳ ರೋಗನಿರ್ಣಯ',
      triage_prompt: '"ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ (ಕನ್ನಡ, ಹಿಂದಿ, ತಮಿಳು, ಇಂಗ್ಲಿಷ್)"',
      lbl_confidence: 'ಅಪಾಯದ ಮಾಪಕ',
      scheme_title: 'ರಾಷ್ಟ್ರೀಯ ಯೋಜನಾ ರೇಡಾರ್ & ABHA ಕಾರ್ಡ್',
      lbl_eligibility: 'ಅರ್ಹತಾ ನಿಯತಾಂಕಗಳು',
      lbl_income: 'ವಾರ್ಷಿಕ ಆದಾಯ',
      lbl_family: 'ಕುಟುಂಬದ ಸದಸ್ಯರು',
      lbl_category: 'ವರ್ಗ',
      lbl_digital_abha: 'ಡಿಜಿಟಲ್ ABHA ಹೆಲ್ತ್ ಕಾರ್ಡ್',
      lbl_matched_schemes: 'ಹೊಂದಾಣಿಕೆಯ ಯೋಜನೆಗಳು',
      dir_title: 'ನೋಂದಾಯಿತ ಗ್ರಾಮಸ್ಥರು ಮತ್ತು ಟ್ರಯಾಜ್ ಡೈರೆಕ್ಟರಿ',
      phc_title: 'ಹತ್ತಿರದ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳು ಮತ್ತು ತುರ್ತು 108 ರವಾನೆ',
      settings_title: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಆಫ್‌ಲೈನ್ ಗೇಟ್‌ವೇ',
      lbl_safety_disclaimer: 'ಕ್ಲಿನಿಕಲ್ ಸಲಹೆ: ಇದು ಟ್ರಯಾಜ್ ಮಾರ್ಗದರ್ಶನವಾಗಿದೆ, ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ. ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ ತಕ್ಷಣ 108 ಗೆ ಕರೆ ಮಾಡಿ.',
      offline_banner_text: 'ಡೆಮೊ ಸಿಮ್ಯುಲೇಶನ್: ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯ — ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ.',
      btn_restore_online: 'ಆನ್‌ಲೈನ್‌ಗೆ ಮರುಸ್ಥಾಪಿಸಿ',
      empty_directory_title: 'ಯಾವುದೇ ಗ್ರಾಮಸ್ಥರು ಕಂಡುಬಂದಿಲ್ಲ',
      empty_directory_msg: 'ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಸಡಿಲಗೊಳಿಸಿ.',
      btn_clear_filters: 'ಎಲ್ಲಾ ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ',
      empty_queue_title: 'ಯಾವುದೇ ಗಂಭೀರ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ',
      empty_queue_msg: 'ಎಲ್ಲಾ ಗ್ರಾಮಸ್ಥರ ಆರೋಗ್ಯ ಸ್ಥಿರವಾಗಿದೆ.',
      empty_schemes_title: 'ಯೋಜನೆಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ',
      empty_schemes_msg: 'ಪ್ಯಾರಾಮೀಟರ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ ಮರುಪರಿಶೀಲಿಸಿ.',
      empty_centers_title: 'ಆಸ್ಪತ್ರೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
      empty_centers_msg: 'ಆಯ್ಕೆಮಾಡಿದ ಫಿಲ್ಟರ್‌ಗೆ ಯಾವುದೇ ಕೇಂದ್ರಗಳಿಲ್ಲ.',
      btn_show_all: 'ಎಲ್ಲಾ ಕೇಂದ್ರಗಳನ್ನು ತೋರಿಸಿ',
      toast_saved: 'ರೋಗಿಯ ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!',
      toast_synced: 'ಎಲ್ಲಾ ದಾಖಲೆಗಳು ಸಿಂಕ್ ಆಗಿವೆ.',
      toast_queued: 'ದಾಖಲೆ ಸ್ಥಳೀಯ ಮೆಮೊರಿಯಲ್ಲಿ ಕ್ಯೂ ಆಗಿದೆ.',
      toast_exported: 'ಡೇಟಾ ಬ್ಯಾಕಪ್ JSON ರಫ್ತು ಮಾಡಲಾಗಿದೆ.',
      toast_sos: 'ತುರ್ತು 108 ರವಾನಿಸಲಾಗಿದೆ: ಆಂಬ್ಯುಲೆನ್ಸ್ ನಿಯೋಜಿಸಲಾಗಿದೆ.'
    },
    ta: {
      hero_tag: '● கிராமப்புற சுகாதார நெட்வொர்க்',
      hero_title: 'அவசர சிகிச்சை மற்றும் தாய்மை பராமரிப்பு தாமதங்களை நீக்குதல்.',
      hero_quote: '"தொலைதூர கிராமங்கள், ஆஷா பணியாளர்கள் மற்றும் அரசு சுகாதார திட்டங்களுக்கு இடையே உள்ள இடைவெளியை 100% ஆஃப்லைன் நுண்ணறிவுடன் குறைக்கிறது."',
      stat_villagers: 'பரிசோதிக்கப்பட்ட மக்கள்',
      stat_wards: 'இணைக்கப்பட்ட வார்டுகள்',
      stat_schemes: 'DBT நிதி அணுகல்',
      stat_screened_cap: 'பரிசோதிக்கப்பட்ட மக்கள்',
      stat_alerts_cap: 'அதி தீவிர எச்சரிக்கைகள்',
      stat_dbt_cap: 'வழங்கப்பட்ட DBT',
      stat_sync_cap: 'ஆஃப்லைன் ஒத்திசைவு',
      footer_auth: 'தேசிய சுகாதார பணி இடைமுகம் • ABHA நோட்',
      auth_title: 'உங்கள் மருத்துவ நோடில் நுழையவும்',
      auth_subtext: 'ஒரே கிளிக்கில் டெமோ அணுகல் அல்லது OTP உள்நுழைவு',
      lbl_or_fed: 'அல்லது பாதுகாப்பான உள்நுழைவு',
      lbl_demo: '⚡ உடனடி டெமோ அணுகல் (பங்கைத் தேர்ந்தெடுக்கவும்)',
      role_asha_title: 'ஆஷா களப்பணியாளர்',
      role_asha_desc: 'கிராம மக்களை பரிசோதித்து, ANC பதிவுகளை நிர்வகிக்கவும்',
      role_doc_title: 'PHC மருத்துவ அலுவலர்',
      role_doc_desc: 'ஆபத்து எச்சரிக்கைகளை ஆய்வு செய்து 108 ஆம்புலன்ஸ் அனுப்பவும்',
      role_patient_title: 'கிராமப்புற குடிமகன் / நோயாளி',
      role_patient_desc: 'குரல் வழியே அறிகுறிகளை சரிபார்த்து நலத்திட்டங்களை கண்டறியவும்',
      role_maternal_title: 'கர்ப்பிணி தாய் (ANC)',
      role_maternal_desc: 'தாய்மை நலத்திட்டங்கள் மற்றும் டிஜிட்டல் ABHA அட்டை பெறவும்',
      lbl_phone_abha: 'தொலைபேசி எண் அல்லது ABHA சுகாதார ID',
      lbl_enter_otp: '6-இலக்க சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்',
      btn_verify_otp: 'சரிபார்த்து தளத்திற்குள் நுழையவும்',
      brand: 'ஆரோக்யசேது இன்டெலிஜென்ஸ்',
      search_placeholder: 'அறிகுறிகள், திட்டங்கள், ABHA தேடவும்...',
      btn_switch_node: 'வெளியேறு / நோட் மாற்றவும் →',
      tab_dashboard: 'டாஷ்போர்டு',
      tab_directory: 'கிராம மக்கள் கோப்பகம்',
      tab_symptoms: 'AI அறிகுறி சரிபார்ப்பு',
      tab_schemes: 'திட்ட ரேடார்',
      tab_profile: 'சுயவிவரம் & அளவீடுகள்',
      tab_centers: 'அருகிலுள்ள PHC மையங்கள்',
      tab_settings: 'அமைப்புகள்',
      dash_title: 'கள செயல்பாடுகள் மற்றும் தொற்றுநோயியல் டாஷ்போர்டு',
      ac_record: 'அளவீடுகளை பதிவு செய்க',
      ac_triage: 'குரல் பரிசோதனை',
      ac_radar: 'திட்ட ரேடார்',
      ac_dispatch: 'அவசர 108 ஊர்தி',
      prof_title: 'நோயாளி சுயவிவரம் மற்றும் அளவீடுகள் பதிவு',
      lbl_name: 'நோயாளி பெயர் *',
      lbl_age: 'வயது',
      lbl_gender: 'பாலினம்',
      lbl_ward: 'கிராமம் / வார்டு',
      lbl_abha: 'ABHA ID (14-இலக்கம்)',
      lbl_symptoms: 'செயலில் உள்ள அறிகுறிகள்',
      lbl_conditions: 'முந்தைய / தாய்மை நிலைகள்',
      btn_save: 'பதிவை சேமிக்கவும்',
      lbl_vitals_summary: 'அளவீடுகள் சுருக்கம்',
      lbl_cond_sym: 'நிலைமைகள் மற்றும் அறிகுறிகள்',
      triage_title: 'உள்ளூர் மொழி குரல் மற்றும் உடல் பகுதி கண்டறிதல்',
      triage_prompt: '"பேச தட்டவும் (தமிழ், இந்தி, கன்னடம், ஆங்கிலம்)"',
      lbl_confidence: 'நம்பகத்தன்மை மாட்ரிக்ஸ்',
      scheme_title: 'தேசிய திட்ட ரேடார் & ABHA அட்டை',
      lbl_eligibility: 'தகுதி வரம்புகள்',
      lbl_income: 'ஆண்டு வருமானம்',
      lbl_family: 'குடும்ப உறுப்பினர்கள்',
      lbl_category: 'வகை',
      lbl_digital_abha: 'டிஜிட்டல் ABHA சுகாதார அட்டை',
      lbl_matched_schemes: 'பொருந்திய திட்டங்கள்',
      dir_title: 'பதிவுசெய்த மக்கள் மற்றும் ட்ரையேஜ் கோப்பகம்',
      phc_title: 'அருகிலுள்ள சுகாதார நிலையங்கள் மற்றும் அவசர 108 அனுப்புகை',
      settings_title: 'அமைப்புகள் மற்றும் ஆஃப்லைன் நுழைவாயில்',
      lbl_safety_disclaimer: 'மருத்துவ ஆலோசனை: இது ஒரு வழிகாட்டுதல் மட்டுமே, இறுதி நோயறிதல் அல்ல. அவசர சிகிச்சைக்கு உடனடியாக 108 ஐ அழைக்கவும்.',
      offline_banner_text: 'டெமோ உருவகப்படுத்துதல்: ஆஃப்லைன் பயன்முறை செயலில் உள்ளது.',
      btn_restore_online: 'மீண்டும் ஆன்லைனில் இணைக்கவும்',
      empty_directory_title: 'பொருந்தும் மக்கள் இல்லை',
      empty_directory_msg: 'பதிவுகளைக் காண வடிகட்டிகளை தளர்த்தவும்.',
      btn_clear_filters: 'அனைத்து வடிகட்டிகளையும் நீக்கு',
      empty_queue_title: 'அவசர எச்சரிக்கைகள் ஏதுமில்லை',
      empty_queue_msg: 'அனைத்து கிராம மக்களின் அளவீடுகளும் பாதுகாப்பான வரம்பில் உள்ளன.',
      empty_schemes_title: 'பொருந்திய திட்டங்கள் இல்லை',
      empty_schemes_msg: 'அளவுருக்களை மாற்றி மீண்டும் முயற்சிக்கவும்.',
      empty_centers_title: 'மையங்கள் காணப்படவில்லை',
      empty_centers_msg: 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுக்கு மையங்கள் இல்லை.',
      btn_show_all: 'அனைத்து மையங்களையும் காட்டு',
      toast_saved: 'நோயாளி பதிவு வெற்றிகரமாக சேமிக்கப்பட்டது!',
      toast_synced: 'அனைத்து பதிவுகளும் ஒத்திசைக்கப்பட்டன.',
      toast_queued: 'பதிவு ஆஃப்லைனில் வரிசைப்படுத்தப்பட்டது.',
      toast_exported: 'தரவு JSON வடிவில் பதிவிறக்கப்பட்டது.',
      toast_sos: '108 அவசர ஊர்தி அனுப்பப்பட்டது.'
    }
  };

  function getI18nText(key, lang) {
    const activeLang = lang || state.activeLanguage || 'en';
    const dict = TRANSLATIONS[activeLang] || TRANSLATIONS.en;
    if (dict && typeof dict[key] !== 'undefined') {
      return dict[key];
    }
    // Fallback to English
    if (TRANSLATIONS.en && typeof TRANSLATIONS.en[key] !== 'undefined') {
      return TRANSLATIONS.en[key];
    }
    // Dev logging helper for missing key
    console.warn(`[i18n] Missing translation key: "${key}" for locale: "${activeLang}"`);
    return key;
  }

  function formatNumber(num, locale) {
    try {
      const loc = locale || (state.activeLanguage === 'hi' ? 'hi-IN' : (state.activeLanguage === 'kn' ? 'kn-IN' : (state.activeLanguage === 'ta' ? 'ta-IN' : 'en-IN')));
      return new Intl.NumberFormat(loc).format(num);
    } catch (e) {
      return String(num);
    }
  }

  function formatRelativeTimeString(strOrDate) {
    let val = -10, unit = 'minute';
    if (typeof strOrDate === 'string') {
      const match = strOrDate.match(/(\d+)\s*([mhdw])/i);
      if (match) {
        const num = parseInt(match[1], 10);
        const u = match[2].toLowerCase();
        val = -num;
        if (u === 'm') unit = 'minute';
        else if (u === 'h') unit = 'hour';
        else if (u === 'd') unit = 'day';
        else if (u === 'w') unit = 'week';
      }
    } else if (typeof strOrDate === 'number') {
      const diffSec = Math.round((strOrDate - Date.now()) / 1000);
      if (Math.abs(diffSec) < 3600) {
        val = Math.round(diffSec / 60);
        unit = 'minute';
      } else if (Math.abs(diffSec) < 86400) {
        val = Math.round(diffSec / 3600);
        unit = 'hour';
      } else {
        val = Math.round(diffSec / 86400);
        unit = 'day';
      }
    }

    const loc = state.activeLanguage === 'hi' ? 'hi-IN' : (state.activeLanguage === 'kn' ? 'kn-IN' : (state.activeLanguage === 'ta' ? 'ta-IN' : 'en-IN'));
    try {
      const rtf = new Intl.RelativeTimeFormat(loc, { numeric: 'always', style: 'long' });
      return rtf.format(val, unit);
    } catch (e) {
      const absVal = Math.abs(val);
      return `${absVal} ${unit}${absVal === 1 ? '' : 's'} ago`;
    }
  }

  function formatRelativeTime(val, unit, locale) {
    return formatRelativeTimeString(`${Math.abs(val)}${unit ? unit[0] : 'm'} ago`);
  }

  /* =======================================================================
     3. SEED DATA
     ======================================================================= */
  const DEFAULT_PATIENTS = [
    { id: '91-4820-1928-3012', name: 'Lakshmi Devi', age: 32, gender: 'Female', ward: 'Ward 03', bp: '168/104', spo2: 95, risk: 'Critical', symptoms: ['Severe Headache', 'Pelvic Cramping'], conditions: ['Pregnant (Week 32)'], lastVisit: '14m ago', unsynced: true },
    { id: '91-9988-7766-5544', name: 'Sita Bai', age: 28, gender: 'Female', ward: 'Ward 04', bp: '110/70', spo2: 89, risk: 'Critical', symptoms: ['High Fever', 'Joint Pain'], conditions: ['Anaemia'], lastVisit: '22m ago', unsynced: false },
    { id: '91-1122-3344-5566', name: 'Ramesh Kumar', age: 65, gender: 'Male', ward: 'Ward 01', bp: '150/95', spo2: 92, risk: 'Attention', symptoms: ['Chest Tightness'], conditions: ['Diabetic', 'Hypertension'], lastVisit: '2h ago', unsynced: true },
    { id: '91-4433-2211-0099', name: 'Kishan Lal', age: 45, gender: 'Male', ward: 'Ward 02', bp: '128/82', spo2: 98, risk: 'Stable', symptoms: ['Mild Cough'], conditions: [], lastVisit: '3d ago', unsynced: false },
    { id: '91-7788-9900-1122', name: 'Meena Kumari', age: 24, gender: 'Female', ward: 'Ward 03', bp: '118/76', spo2: 99, risk: 'Stable', symptoms: [], conditions: ['Pregnant (Week 16)'], lastVisit: '5d ago', unsynced: false },
    { id: '91-5566-7788-9900', name: 'Basavaraj Patil', age: 52, gender: 'Male', ward: 'Ward 06', bp: '142/90', spo2: 94, risk: 'Attention', symptoms: ['Dizziness'], conditions: ['Hypertension'], lastVisit: '1w ago', unsynced: false }
  ];

  const DEFAULT_SCHEMES = [
    {
      id: 'pmjay',
      name: 'Ayushman Bharat PM-JAY',
      benefit: '₹5,00,000 / Year',
      rule: 'Annual Income ≤ ₹2,50,000 OR BPL Category',
      docs: ['Ration Card', 'Aadhaar Card', 'Income Certificate'],
      desc: 'Comprehensive secondary and tertiary hospitalization cover per eligible family.'
    },
    {
      id: 'jsy',
      name: 'Janani Suraksha Yojana (JSY)',
      benefit: '₹1,400 Cash DBT',
      rule: 'Pregnant Mother (ANC Registered)',
      docs: ['Mother-Child Protection Card (MCP)', 'Aadhaar', 'Bank Passbook'],
      desc: 'Direct Benefit Transfer to promote institutional delivery among rural mothers.'
    },
    {
      id: 'pmmvy',
      name: 'PM Matru Vandana Yojana (PMMVY)',
      benefit: '₹5,00,000 in 3 Installments',
      rule: 'Pregnant / Lactating Mother (First/Second Live Child)',
      docs: ['MCP Card', 'Aadhaar of Couple', 'Bank Account Details'],
      desc: 'Wage compensation for mothers to take adequate rest before and after delivery.'
    },
    {
      id: 'vay_vandana',
      name: 'Ayushman Vay Vandana',
      benefit: '₹5,00,000 Universal Cover',
      rule: 'Senior Citizen Aged 70+ Years',
      docs: ['Aadhaar (Age Proof)', 'Address Proof'],
      desc: 'Dedicated senior citizen healthcare security regardless of household income.'
    }
  ];

  /* =======================================================================
     4. STATE + PERSISTENCE (Single Source of Truth & Versioned Schema)
     ======================================================================= */
  const state = {
    currentUser: null,
    activeRoleKey: null,
    activeRoute: '#/auth',
    patients: [],
    schemes: [...DEFAULT_SCHEMES],
    activeLanguage: 'en',
    theme: 'light',
    isDemoOffline: false,
    selectedDirectoryIds: new Set(),
    directoryDensity: 'comfortable',
    activeWardFilter: 'All',
    activeRiskFilter: 'All',
    activeMapLayer: 'all',
    centersFilter: 'all',
    bodyOrientation: 'front',
    activeBodyZone: 'Head',
    triageSymptoms: [],
    profileSymptoms: [],
    profileConditions: [],
    lastFocusedTrigger: null,
    responderAdminId: (function () {
      try { return localStorage.getItem('asi.v1.responderAdminId') || null; } catch (e) { return null; }
    })()
  };

  function loadPersistedState() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY_STATE);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Version / migration guard
        if (parsed && parsed.version === STORAGE_SCHEMA_VERSION && Array.isArray(parsed.patients)) {
          state.patients = parsed.patients;
          state.theme = parsed.theme || 'light';
          state.activeLanguage = parsed.activeLanguage || 'en';
          state.isDemoOffline = Boolean(parsed.isDemoOffline);
          return;
        }
      }
    } catch (e) {
      console.warn('[ASI] Storage migration fallback:', e);
    }
    // Seed default if missing or invalid
    state.patients = JSON.parse(JSON.stringify(DEFAULT_PATIENTS));
    persistState();
  }

  function persistState() {
    try {
      const payload = {
        version: STORAGE_SCHEMA_VERSION,
        timestamp: Date.now(),
        patients: state.patients,
        theme: state.theme,
        activeLanguage: state.activeLanguage,
        isDemoOffline: state.isDemoOffline
      };
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(payload));
      updateStorageMeter();
    } catch (e) {
      console.error('[ASI] LocalStorage persistence quota error:', e);
    }
  }

  // Pure State Setters
  function setLanguage(lang) {
    state.activeLanguage = lang || 'en';
    document.documentElement.setAttribute('lang', state.activeLanguage);
    applyTranslations();
    persistState();
  }

  function setTheme(theme) {
    state.theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.innerHTML = `<use href="#icon-${state.theme === 'dark' ? 'sun' : 'moon'}"></use>`;
      if (state.theme === 'dark') icon.classList.add('text-warning');
      else icon.classList.remove('text-warning');
    }
    persistState();
  }

  function toggleTheme() {
    setTheme(state.theme === 'light' ? 'dark' : 'light');
  }

  function setWardFilter(ward) {
    state.activeWardFilter = ward || 'All';
    document.querySelectorAll('#ward-filter-chips .filter-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.ward === state.activeWardFilter);
    });
    renderActiveFilterSummary();
    renderDirectory();
  }

  function setRiskFilter(risk) {
    state.activeRiskFilter = risk || 'All';
    document.querySelectorAll('#risk-filter-chips .filter-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.risk === state.activeRiskFilter);
    });
    renderActiveFilterSummary();
    renderDirectory();
  }

  function renderActiveFilterSummary() {
    const summaryEl = document.getElementById('active-filters-summary');
    if (!summaryEl) return;
    const badges = [];
    if (state.activeWardFilter && state.activeWardFilter !== 'All') {
      badges.push(`
        <span class="active-filter-badge">
          ${escapeHTML(state.activeWardFilter)}
          <button type="button" data-action="remove-ward-filter" title="Remove ward filter" aria-label="Remove ward filter">&times;</button>
        </span>
      `);
    }
    if (state.activeRiskFilter && state.activeRiskFilter !== 'All') {
      badges.push(`
        <span class="active-filter-badge">
          ${escapeHTML(state.activeRiskFilter)}
          <button type="button" data-action="remove-risk-filter" title="Remove risk filter" aria-label="Remove risk filter">&times;</button>
        </span>
      `);
    }
    summaryEl.innerHTML = badges.join('');
  }

  function setMapLayer(layer) {
    state.activeMapLayer = layer || 'all';
    document.querySelectorAll('.map-layer-toggles .layer-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.layer === state.activeMapLayer);
    });
    const polys = document.querySelectorAll('.ward-poly');
    polys.forEach(poly => {
      const risk = poly.dataset.risk;
      if (state.activeMapLayer === 'all') {
        poly.style.opacity = '1';
      } else if (state.activeMapLayer === 'critical') {
        poly.style.opacity = risk === 'Critical' ? '1' : '0.25';
      } else if (state.activeMapLayer === 'maternal') {
        poly.style.opacity = (poly.dataset.ward === 'Ward 03' || poly.dataset.ward === 'Ward 01') ? '1' : '0.25';
      }
    });
  }

  function setCentersFilter(filter) {
    state.centersFilter = filter || 'all';
    document.querySelectorAll('#view-centers .layer-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === state.centersFilter);
    });
    renderCenters();
  }

  function toggleDemoOffline(isOffline) {
    state.isDemoOffline = Boolean(isOffline);
    const banner = document.getElementById('offline-demo-banner');
    const syncLabel = document.getElementById('sync-status-label');
    const syncChip = document.getElementById('sync-chip');
    const chk = document.getElementById('chk-simulate-offline');

    if (chk) chk.checked = state.isDemoOffline;

    if (state.isDemoOffline) {
      if (banner) banner.classList.remove('d-none');
      if (syncLabel) syncLabel.innerText = 'Offline (Queued)';
      if (syncChip) {
        syncChip.style.background = 'var(--c-amb-bg)';
        syncChip.style.color = 'var(--c-amb-text)';
        syncChip.style.borderColor = 'var(--c-amb-border)';
      }
      showToast(getI18nText('offline_banner_text'), 'warning');
    } else {
      if (banner) banner.classList.add('d-none');
      if (syncLabel) syncLabel.innerText = 'Offline Ready';
      if (syncChip) {
        syncChip.style.background = 'var(--c-mint-bg)';
        syncChip.style.color = 'var(--c-mint-text)';
        syncChip.style.borderColor = 'var(--c-mint-border)';
      }
      showToast(getI18nText('toast_synced'), 'success');
    }
    persistState();
  }

  /* =======================================================================
     5. UTILITIES (XSS Escaping, Accessible States, Stacked Toasts, Focus Trap)
     ======================================================================= */
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getInitials(name) {
    if (!name) return 'UN';
    const parts = name.trim().split(/\s+/);
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }

  // Accessible State Generators
  function renderSkeleton(container, type, count = 3) {
    if (!container) return;
    container.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = type === 'row' ? 'skeleton-row' : (type === 'metric' ? 'skeleton-metric' : 'skeleton-card');
      el.setAttribute('aria-hidden', 'true');
      frag.appendChild(el);
    }
    container.appendChild(frag);
  }

  function renderEmptyState(container, titleKey, msgKey, actionKey, actionFn) {
    if (!container) return;
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = `
      <svg class="icon" aria-hidden="true"><use href="#icon-shield-check"></use></svg>
      <div class="empty-state-title">${escapeHTML(getI18nText(titleKey))}</div>
      <div class="empty-state-msg">${escapeHTML(getI18nText(msgKey))}</div>
    `;
    if (actionKey && actionFn) {
      const btn = document.createElement('button');
      btn.className = 'btn-primary-pill';
      btn.type = 'button';
      btn.textContent = getI18nText(actionKey);
      btn.addEventListener('click', actionFn);
      div.appendChild(btn);
    }
    container.appendChild(div);
  }

  function renderErrorState(container, whatFailed, retryFn) {
    if (!container) return;
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'error-state';
    div.innerHTML = `
      <svg class="icon" aria-hidden="true"><use href="#icon-alert"></use></svg>
      <div class="error-state-title">Data Synchronization Paused</div>
      <div class="error-state-msg">${escapeHTML(whatFailed)}</div>
    `;
    if (retryFn) {
      const btn = document.createElement('button');
      btn.className = 'btn-outline-danger mt-2';
      btn.type = 'button';
      btn.textContent = 'Retry Synchronization';
      btn.addEventListener('click', retryFn);
      div.appendChild(btn);
    }
    container.appendChild(div);
  }

  // Phase 4: Stacked Toast System (role="status", auto-dismiss 4s, stacked, dismissible)
  function showToast(msg, type = 'success', duration = 4000) {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;

    // Cap at 5 visible toasts to avoid overwhelming screen
    const existing = stack.querySelectorAll('.toast-item');
    if (existing.length >= 5) {
      existing[0].remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute('role', 'status');

    const textSpan = document.createElement('span');
    textSpan.textContent = msg;
    toast.appendChild(textSpan);

    const dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'toast-dismiss';
    dismissBtn.setAttribute('aria-label', 'Dismiss notification');
    dismissBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>';
    dismissBtn.addEventListener('click', () => dismissToast(toast));
    toast.appendChild(dismissBtn);

    stack.appendChild(toast);

    const timer = setTimeout(() => {
      dismissToast(toast);
    }, duration);
    toast._dismissTimer = timer;
  }

  function dismissToast(toast) {
    if (!toast || !toast.parentElement) return;
    if (toast._dismissTimer) clearTimeout(toast._dismissTimer);
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => {
      if (toast.parentElement) toast.remove();
    }, { once: true });
  }

  // Accessible Modal Focus Trap & Esc Listener
  function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    state.lastFocusedTrigger = document.activeElement;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside modal
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) focusable[0].focus();
  }

  function hideModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
    if (state.lastFocusedTrigger && typeof state.lastFocusedTrigger.focus === 'function') {
      state.lastFocusedTrigger.focus();
    }
  }

  function handleModalTrap(e, modal) {
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // Count-up animation on first paint
  function runCountUpAnimations() {
    const elements = [
      { id: 'impact-screened', target: 24800, suffix: '+' },
      { id: 'impact-wards', target: 12, suffix: '' }
    ];

    elements.forEach(item => {
      const el = document.getElementById(item.id);
      if (!el) return;
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();

      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * item.target);
        el.textContent = formatNumber(current) + item.suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    });
  }

  function updateStorageMeter() {
    try {
      const size = new Blob([Object.values(localStorage)]).size;
      const kb = (size / 1024).toFixed(2);
      const el = document.getElementById('storage-usage');
      if (el) el.textContent = `${kb} KB / 5000 KB`;
      const bar = document.getElementById('storage-bar');
      if (bar) bar.style.width = `${Math.min((kb / 5000) * 100, 100)}%`;
    } catch (e) {
      console.warn('[ASI] Storage meter fallback:', e);
    }
  }

  /* =======================================================================
     6. RENDERERS (Per View, Using DocumentFragment & XSS Escaping)
     ======================================================================= */
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = getI18nText(key);
      const icon = el.querySelector('svg');
      if (icon) {
        const svgHTML = icon.outerHTML;
        el.innerHTML = `${svgHTML} ${escapeHTML(text)}`;
      } else {
        el.textContent = text;
      }
    });

    const searchSpan = document.getElementById('lang-search-placeholder');
    if (searchSpan) {
      searchSpan.innerHTML = `<svg class="icon me-2" aria-hidden="true"><use href="#icon-search"></use></svg> ${escapeHTML(getI18nText('search_placeholder'))}`;
    }

    const langSelect = document.getElementById('lang-select');
    if (langSelect && langSelect.value !== state.activeLanguage) {
      langSelect.value = state.activeLanguage;
    }
  }

  // 3.2 Dashboard Renderer — Critical Action Queue is now backed by live
  // escalation data from the Arogya backend (see Escalation module below).
  function renderDashboardQueue() {
    Escalation.syncDashboardVisibility();
    Escalation.renderFromCache();
  }

function removeTriageSymptom(sym) {
  triageSymptoms = triageSymptoms.filter(t => t !== sym);
  renderTriageTags();
  runClinicalRiskAlgo();
}

// -------------------------------------------------------------------------
// GRIEVANCE & SYMPTOM TEXT INPUT EXTENSION
// -------------------------------------------------------------------------
function switchGrievanceMode(mode) {
  const voiceTab = document.getElementById('tab-btn-voice');
  const textTab = document.getElementById('tab-btn-text');
  const voiceBox = document.getElementById('triage-voice-box');
  const textBox = document.getElementById('triage-text-box');

  if (mode === 'voice') {
    voiceTab.classList.add('active');
    textTab.classList.remove('active');
    voiceBox.style.display = 'flex';
    textBox.style.display = 'none';
  } else {
    textTab.classList.add('active');
    voiceTab.classList.remove('active');
    voiceBox.style.display = 'none';
    textBox.style.display = 'block';
  }
}

function submitTextGrievance() {
  const inputEl = document.getElementById('grievance-text-input');
  const val = inputEl.value.trim();
  if (!val) {
    showToast('Please type your health problem or grievance before submitting', 'warning');
    return;
  }

  addBodySymptom(val);
  inputEl.value = '';
  showToast('Grievance / Symptom submitted successfully!', 'success');
}

// -------------------------------------------------------------------------
// HELP CHATBOT COMPONENT (MODULAR & GEMINI BACKEND READY)
// -------------------------------------------------------------------------
let isChatVoiceRecording = false;
let chatRecognition;

if ('webkitSpeechRecognition' in window) {
  try {
    chatRecognition = new webkitSpeechRecognition();
    chatRecognition.continuous = false;
    chatRecognition.interimResults = false;

    chatRecognition.onstart = function() {
      isChatVoiceRecording = true;
      const btn = document.getElementById('btn-chat-mic');
      if (btn) btn.classList.add('listening');
      showToast("Listening for Chatbot voice query...", 'info');
    };

    chatRecognition.onresult = function(event) {
      if (event.results && event.results[0]) {
        const text = event.results[0][0].transcript;
        const input = document.getElementById('chat-text-input');
        if (input) input.value = text;
        sendChatMessage();
      }
    };

    chatRecognition.onerror = function() {
      showToast("Voice mic access error. Simulated voice query filled.", 'warning');
      const input = document.getElementById('chat-text-input');
      if (input && !input.value) input.value = "How do I find government health schemes?";
      const btn = document.getElementById('btn-chat-mic');
      if (btn) btn.classList.remove('listening');
    };

    chatRecognition.onend = function() {
      isChatVoiceRecording = false;
      const btn = document.getElementById('btn-chat-mic');
      if (btn) btn.classList.remove('listening');
    };
  } catch (e) {
    console.warn("Speech recognition initialization fallback", e);
  }
}

function toggleHelpChatbot() {
  const widget = document.getElementById('help-chatbot-widget');
  if (widget) {
    widget.classList.toggle('d-none');
    if (!widget.classList.contains('d-none')) {
      const input = document.getElementById('chat-text-input');
      if (input) input.focus();
    }
  }
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendChatMessage();
  }
}

function sendQuickHelpPrompt(text) {
  const input = document.getElementById('chat-text-input');
  if (input) {
    input.value = text;
    sendChatMessage();
  }
}

function toggleChatVoiceInput() {
  if (!chatRecognition) {
    const input = document.getElementById('chat-text-input');
    if (input) input.value = "How to record patient vitals?";
    sendChatMessage();
    return;
  }

  if (isChatVoiceRecording) {
    chatRecognition.stop();
  } else {
    try {
      chatRecognition.lang = document.getElementById('lang-select').value === 'en' ? 'en-US' : 'hi-IN';
      chatRecognition.start();
    } catch (e) {
      const input = document.getElementById('chat-text-input');
      if (input) input.value = "How to submit grievance?";
      sendChatMessage();
    }
  }
}

function sendChatMessage() {
  const input = document.getElementById('chat-text-input');
  if (!input) return;
  const promptText = input.value.trim();
  if (!promptText) return;

  // Add User Message to Chat Log
  appendChatMessage(promptText, 'user');
  input.value = '';

  // Call Modular Backend / Gemini Dispatcher
  queryGeminiBackend(promptText);
}

function appendChatMessage(text, sender) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg chat-msg-${sender}`;
  msgDiv.innerText = text;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

/**
 * Modular Gemini API Backend Dispatcher Architecture
 * Cleanly separated so backend engineers can connect Google's Gemini API key on the server.
 */
function queryGeminiBackend(userPrompt) {
  /* =========================================================================
     FUTURE GEMINI BACKEND INTEGRATION POINT:
     Uncomment & configure the fetch call below when connecting your secure backend API server:
     
     fetch('/api/gemini/chat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ prompt: userPrompt, lang: appState.activeLanguage })
     })
     .then(res => res.json())
     .then(data => appendChatMessage(data.reply, 'assistant'))
     .catch(err => appendChatMessage("Could not reach Gemini backend service.", 'assistant'));
     ========================================================================= */

  // Intelligent client-side navigation assistant response
  setTimeout(() => {
    const lower = userPrompt.toLowerCase();
    let reply = "I am here to help you navigate ArogyaSetu Intelligence. You can use the left sidebar menu to navigate through all features.";

    if (lower.includes('symptom') || lower.includes('voice') || lower.includes('triage') || lower.includes('diagnostic')) {
      reply = "To report symptoms or voice complaints: Click on 'AI Symptom Checker' in the sidebar menu. You can tap the big microphone to speak, or switch to Text Input mode to type!";
    } else if (lower.includes('grievance') || lower.includes('complaint') || lower.includes('problem')) {
      reply = "To submit a grievance or complaint: Open 'AI Symptom Checker & Grievance Portal', choose 'Text Input' or 'Voice Input' to describe your health problem or PHC complaint.";
    } else if (lower.includes('scheme') || lower.includes('government') || lower.includes('benefit') || lower.includes('abha')) {
      reply = "To check eligible government health schemes or generate your ABHA digital card: Click on 'Scheme Radar' from the sidebar menu.";
    } else if (lower.includes('hospital') || lower.includes('phc') || lower.includes('center') || lower.includes('ambulance') || lower.includes('108')) {
      reply = "To locate nearest health centers or dispatch emergency 108 ambulance: Click on 'Nearest PHC Centers' in the sidebar.";
    } else if (lower.includes('register') || lower.includes('patient') || lower.includes('vitals') || lower.includes('record')) {
      reply = "To record patient details or vitals: Open 'Profile & Vitals Intake' from the sidebar and click 'Save Patient Record'.";
    } else {
      reply = `Thank you for your question: "${userPrompt}". Your request is logged and ready for Gemini API response connection!`;
    }

    appendChatMessage(reply, 'assistant');
  }, 400);
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


  // 3.3 Villager Directory Renderer
  function renderDirectory() {
    const container = document.getElementById('cohort-grid-container');
    if (!container) return;

    const searchInput = document.getElementById('dir-search');
    const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const chkUnsynced = document.getElementById('chk-unsynced-only');
    const unsyncedOnly = chkUnsynced ? chkUnsynced.checked : false;
    const sortVal = document.getElementById('dir-sort') ? document.getElementById('dir-sort').value : 'risk';

    let filtered = state.patients.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search) || p.id.includes(search) || (p.symptoms && p.symptoms.join(' ').toLowerCase().includes(search));
      const matchWard = (state.activeWardFilter === 'All' || p.ward === state.activeWardFilter);
      const matchRisk = (state.activeRiskFilter === 'All' || p.risk === state.activeRiskFilter);
      const matchUnsynced = !unsyncedOnly || p.unsynced === true;
      return matchSearch && matchWard && matchRisk && matchUnsynced;
    });

    if (sortVal === 'risk') {
      const rank = { 'Critical': 3, 'Attention': 2, 'Stable': 1 };
      filtered.sort((a, b) => (rank[b.risk] || 0) - (rank[a.risk] || 0));
    } else if (sortVal === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Result Count line and inline Clear button (P0.5)
    const countEl = document.getElementById('dir-count-text');
    const clearBtn = document.getElementById('btn-clear-filters-inline');
    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${state.patients.length} villagers`;
    }
    const hasActiveFilters = state.activeWardFilter !== 'All' || state.activeRiskFilter !== 'All' || search !== '' || unsyncedOnly;
    if (clearBtn) {
      clearBtn.classList.toggle('d-none', !hasActiveFilters);
    }

    // Cap grid max-width when few results match to prevent sparse collapsed screen (P0.5)
    if (filtered.length === 1) {
      container.style.maxWidth = '420px';
    } else if (filtered.length === 2) {
      container.style.maxWidth = '780px';
    } else {
      container.style.maxWidth = '100%';
    }

    if (filtered.length === 0) {
      renderEmptyState(container, 'empty_directory_title', 'empty_directory_msg', 'btn_clear_filters', clearDirectoryFilters);
      updateBulkActionBar();
      return;
    }

    const frag = document.createDocumentFragment();
    filtered.forEach(p => {
      const isSelected = state.selectedDirectoryIds.has(p.id);
      const bpNum = parseInt((p.bp || '120').split('/')[0], 10);
      const spo2Num = p.spo2 || 98;
      const bpClass = bpNum >= 140 ? 'vital-abnormal-red' : (bpNum >= 130 ? 'vital-abnormal-amb' : '');
      const spo2Class = spo2Num < 90 ? 'vital-abnormal-red' : (spo2Num < 95 ? 'vital-abnormal-amb' : '');

      const card = document.createElement('div');
      card.className = `patient-card risk-${(p.risk || 'stable').toLowerCase()}`;
      card.innerHTML = `
        <div class="pc-top">
          <div class="d-flex align-items-center">
            <input type="checkbox" class="me-2" ${isSelected ? 'checked' : ''} data-action="toggle-patient-select" data-id="${escapeHTML(p.id)}" aria-label="Select ${escapeHTML(p.name)}">
            <div class="pc-avatar" aria-hidden="true">${escapeHTML(getInitials(p.name))}</div>
            <div class="pc-identity">
              <div class="name">${escapeHTML(p.name)}</div>
              <div class="meta">${escapeHTML(p.id)} • ${escapeHTML(p.age)} yrs • ${escapeHTML(p.ward)}</div>
            </div>
          </div>
          <div class="d-flex flex-column align-items-end gap-1">
            <span class="status-pill status-${(p.risk || 'stable').toLowerCase()}">
              <span class="dot" aria-hidden="true"></span>${escapeHTML(p.risk)}
            </span>
            ${p.unsynced ? '<span class="badge-mono-pill text-warning" style="font-size:0.65rem">● Unsynced</span>' : ''}
          </div>
        </div>

        <div class="vitals-strip">
          <div class="v-block"><span class="v-lbl">BP (mmHg)</span><span class="v-val ${bpClass}">${escapeHTML(p.bp || '--')}</span></div>
          <div class="v-block"><span class="v-lbl">SpO2 (%)</span><span class="v-val ${spo2Class}">${p.spo2 ? escapeHTML(p.spo2) + '%' : '--'}</span></div>
        </div>

        <div class="link-tags mb-3">
          ${(p.symptoms || []).map(s => `<span class="tag-pill tag-red">${escapeHTML(s)}</span>`).join('')}
          ${(p.conditions || []).map(c => `<span class="tag-pill tag-sky">${escapeHTML(c)}</span>`).join('')}
        </div>

        <button type="button" class="pc-action border-0 bg-transparent w-100 text-start d-flex justify-content-between align-items-center" data-action="open-clinical-modal" data-id="${escapeHTML(p.id)}">
          <span class="card-visit-meta">Last visit: ${escapeHTML(formatRelativeTimeString(p.lastVisit || 'Recently'))}</span>
          <span>Clinical Intelligence &rarr;</span>
        </button>
      `;
      frag.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(frag);
    updateBulkActionBar();
  }

  function clearDirectoryFilters() {
    setWardFilter('All');
    setRiskFilter('All');
    const search = document.getElementById('dir-search');
    if (search) search.value = '';
    const chk = document.getElementById('chk-unsynced-only');
    if (chk) chk.checked = false;
    renderActiveFilterSummary();
    renderDirectory();
  }

  function updateBulkActionBar() {
    const bar = document.getElementById('bulk-actions-bar');
    const countEl = document.getElementById('bulk-selected-count');
    const count = state.selectedDirectoryIds.size;
    if (!bar) return;
    if (count > 0) {
      bar.classList.remove('d-none');
      if (countEl) countEl.textContent = `${count} Villagers Selected`;
    } else {
      bar.classList.add('d-none');
    }
  }

  // 3.4 AI Symptom Checker Renderer
  function renderZoneSymptomChips(zone) {
    state.activeBodyZone = zone || 'Head';
    const label = document.getElementById('active-zone-label');
    const container = document.getElementById('zone-symptom-chips');
    if (label) label.textContent = `SELECTED REGION: ${state.activeBodyZone.toUpperCase()}`;
    if (!container) return;

    const symptoms = BODY_ZONE_SYMPTOMS[state.activeBodyZone] || BODY_ZONE_SYMPTOMS.Head;
    container.innerHTML = symptoms.map(s => `
      <button type="button" class="sym-pick-chip border-0" data-action="add-body-symptom" data-sym="${escapeHTML(s)}">+ ${escapeHTML(s)}</button>
    `).join('');
  }

  function renderTriageTags() {
    const container = document.getElementById('triage-symptoms-tags');
    if (!container) return;

    const inputHTML = '<input type="text" class="tag-input-field" placeholder="Add manual symptoms..." id="triage-sym-input" aria-label="Add triage symptom">';
    container.innerHTML = state.triageSymptoms.map(t => `
      <span class="tag-interactive">● ${escapeHTML(t)} <button type="button" class="del border-0 bg-transparent p-0 ms-1" data-action="remove-triage-sym" data-sym="${escapeHTML(t)}" aria-label="Remove ${escapeHTML(t)}">✕</button></span>
    `).join('') + inputHTML;

    runClinicalRiskAlgo();
  }

  function runClinicalRiskAlgo() {
    const riskResult = document.getElementById('risk-result');
    if (!riskResult) return;

    if (state.triageSymptoms.length === 0) {
      riskResult.style.display = 'none';
      return;
    }
    riskResult.style.display = 'block';

    const text = state.triageSymptoms.join(' ').toLowerCase();
    let score = 25;
    const drivers = [];

    if (text.includes('chest') || text.includes('breath') || text.includes('pelvic') || text.includes('fever')) {
      score += 45;
      drivers.push('High Acute Synergistic Symptom: Cardiorespiratory / Maternal risk detected.');
    }
    if (text.includes('migraine') || text.includes('headache') || text.includes('pain')) {
      score += 20;
      drivers.push('Neurological / Acute pain marker contributing to elevated triage priority.');
    }

    score = Math.min(score, 96);

    const banner = document.getElementById('risk-banner');
    if (banner) {
      if (score > 70) {
        banner.className = 'rc-urgency tag-red mb-3 p-3 rounded text-center fw-bold';
        banner.textContent = `URGENCY SCORE: ${score}% — CRITICAL: IMMEDIATE PHC REFERRAL REQUIRED`;
      } else if (score > 40) {
        banner.className = 'rc-urgency tag-amb mb-3 p-3 rounded text-center fw-bold';
        banner.textContent = `URGENCY SCORE: ${score}% — ATTENTION: SUB-CENTER EVALUATION RECOMMENDED`;
      } else {
        banner.className = 'rc-urgency tag-mint mb-3 p-3 rounded text-center fw-bold';
        banner.textContent = `URGENCY SCORE: ${score}% — STABLE: ADVICE REST & REHYDRATION`;
      }
    }

    const factorsEl = document.getElementById('explainability-factors');
    if (factorsEl) {
      factorsEl.innerHTML = drivers.length > 0
        ? drivers.map(d => `<li>${escapeHTML(d)}</li>`).join('')
        : '<li>Baseline stable profile without immediate systemic distress indicators.</li>';
    }

    const metersEl = document.getElementById('confidence-meters');
    if (metersEl) {
      metersEl.innerHTML = `
        <div class="confidence-meter mb-2">
          <div class="d-flex justify-content-between mb-1" style="font-size:0.8rem">
            <span>Syndromic Infection Index</span><span>${score}%</span>
          </div>
          <div class="cm-track"><div class="cm-fill" style="width:${score}%; background:${score > 70 ? 'var(--c-red)' : (score > 40 ? 'var(--c-amb)' : 'var(--c-mint)')}"></div></div>
        </div>
      `;
    }
  }

  // 3.5 Scheme Radar Renderer
  function calcSchemes() {
    const rangeInc = document.getElementById('range-inc');
    const rangeFam = document.getElementById('range-fam');
    const selCat = document.getElementById('sel-cat');
    const results = document.getElementById('scheme-results');
    if (!results) return;

    const inc = rangeInc ? parseInt(rangeInc.value, 10) : 250000;
    const cat = selCat ? selCat.value : 'BPL';

    const valInc = document.getElementById('val-inc');
    if (valInc) valInc.textContent = `₹${formatNumber(inc)}`;
    const valFam = document.getElementById('val-fam');
    if (valFam && rangeFam) valFam.textContent = `${rangeFam.value} Members`;

    const frag = document.createDocumentFragment();
    state.schemes.forEach(s => {
      let eligible = false;
      let matchReason = '';

      if (s.id === 'pmjay' && (cat === 'BPL' || inc <= 250000)) {
        eligible = true;
        matchReason = 'Household income under ₹2.5L ✓, SECC-listed category ✓';
      } else if (s.id === 'jsy' && cat === 'Pregnant') {
        eligible = true;
        matchReason = 'Registered ANC Maternal Pregnancy ✓, Institutional Delivery Eligible ✓';
      } else if (s.id === 'pmmvy' && cat === 'Pregnant') {
        eligible = true;
        matchReason = 'First/Second live pregnancy wage compensation criteria met ✓';
      } else if (s.id === 'vay_vandana' && cat === 'Senior') {
        eligible = true;
        matchReason = 'Age 70+ Senior Citizen Verified ✓';
      }

      const card = document.createElement('div');
      card.className = `scheme-card mb-3 ${eligible ? '' : 'ineligible'}`;
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h3 class="fw-bold mb-0 fs-5">${escapeHTML(s.name)}</h3>
            <div class="sc-benefit-amount">${escapeHTML(s.benefit)}</div>
          </div>
          <span class="tag-pill ${eligible ? 'tag-mint' : 'tag-amb'}">${eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}</span>
        </div>
        <div class="sc-rule-reason">${eligible ? escapeHTML(matchReason) : `Criteria: ${escapeHTML(s.rule)}`}</div>
        <p class="text-muted mb-2" style="font-size:0.85rem">${escapeHTML(s.desc)}</p>
        <details class="scheme-docs-expander" style="font-size:0.8rem; cursor:pointer;">
          <summary class="fw-bold text-primary">Required Verification Documents</summary>
          <ul class="mt-1 ps-3 text-muted">
            ${s.docs.map(d => `<li>${escapeHTML(d)}</li>`).join('')}
          </ul>
        </details>
      `;
      frag.appendChild(card);
    });

    results.innerHTML = '';
    results.appendChild(frag);
    renderABHAQRCanvas();
  }

  function flipABHACard() {
    const container = document.getElementById('abha-flip-box');
    if (container) container.classList.toggle('flipped');
  }

  function renderABHAQRCanvas() {
    const canvas = document.getElementById('abha-qr-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 60, 60);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(4, 4, 16, 16);
    ctx.fillRect(40, 4, 16, 16);
    ctx.fillRect(4, 40, 16, 16);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(8, 8, 8, 8);
    ctx.fillRect(44, 8, 8, 8);
    ctx.fillRect(8, 44, 8, 8);
  }

  // 3.6 Patient Profile & Vitals Intake Renderer
  function validateBPFields() {
    const sys = parseInt(document.getElementById('inp-bp-sys')?.value || '120', 10);
    const dia = parseInt(document.getElementById('inp-bp-dia')?.value || '80', 10);
    const badge = document.getElementById('bp-range-badge');
    if (!badge) return;

    if (sys >= 160 || dia >= 100) {
      badge.className = 'vitals-range-badge badge-crisis';
      badge.textContent = 'Hypertensive Crisis';
    } else if (sys >= 130 || dia >= 85) {
      badge.className = 'vitals-range-badge badge-borderline';
      badge.textContent = 'Pre-hypertension';
    } else {
      badge.className = 'vitals-range-badge badge-normal';
      badge.textContent = 'Normal Range';
    }
    updatePreviewCard();
    triggerDraftAutosave();
  }

  function validateSpO2Field() {
    const spo2 = parseInt(document.getElementById('inp-spo2')?.value || '98', 10);
    const badge = document.getElementById('spo2-range-badge');
    if (!badge) return;

    if (spo2 < 90) {
      badge.className = 'vitals-range-badge badge-crisis';
      badge.textContent = `Critical Hypoxia (${spo2}%)`;
    } else if (spo2 < 95) {
      badge.className = 'vitals-range-badge badge-borderline';
      badge.textContent = `Borderline (${spo2}%)`;
    } else {
      badge.className = 'vitals-range-badge badge-normal';
      badge.textContent = `Normal (${spo2}%)`;
    }
    updatePreviewCard();
    triggerDraftAutosave();
  }

  let draftAutosaveTimeout;
  function triggerDraftAutosave() {
    clearTimeout(draftAutosaveTimeout);
    const ind = document.getElementById('draft-save-indicator');
    if (ind) ind.textContent = 'Saving draft...';

    draftAutosaveTimeout = setTimeout(() => {
      if (ind) ind.textContent = 'Draft saved just now';
    }, 1200);
  }

  function updatePreviewCard() {
    const name = document.getElementById('inp-name')?.value || '--';
    const village = document.getElementById('inp-village')?.value || '--';
    const abha = document.getElementById('inp-abha')?.value || '--';
    const sys = document.getElementById('inp-bp-sys')?.value || '120';
    const dia = document.getElementById('inp-bp-dia')?.value || '80';
    const spo2 = document.getElementById('inp-spo2')?.value || '98';

    const cardName = document.getElementById('card-name');
    const cardVillage = document.getElementById('card-village');
    const cardAbha = document.getElementById('card-abha');
    const cardVitals = document.getElementById('card-vitals');
    const ringText = document.getElementById('card-health-score');
    const ringCircle = document.getElementById('score-ring-circle');
    const explainText = document.getElementById('score-explanation-text');

    if (cardName) cardName.textContent = name;
    if (cardVillage) cardVillage.textContent = village;
    if (cardAbha) cardAbha.textContent = abha;

    if (cardVitals) {
      cardVitals.innerHTML = `
        <div class="v-block"><span class="v-lbl">BP (mmHg)</span><span class="v-val">${escapeHTML(sys)}/${escapeHTML(dia)}</span></div>
        <div class="v-block"><span class="v-lbl">SpO2 (%)</span><span class="v-val">${escapeHTML(spo2)}%</span></div>
      `;
    }

    let score = 100;
    const sysNum = parseInt(sys, 10);
    const spo2Num = parseInt(spo2, 10);
    const reasons = [];

    if (sysNum >= 160) { score -= 30; reasons.push('High systolic BP (>160)'); }
    else if (sysNum >= 130) { score -= 15; reasons.push('Elevated BP'); }

    if (spo2Num < 90) { score -= 35; reasons.push('Low SpO2 hypoxia (<90%)'); }
    else if (spo2Num < 95) { score -= 15; reasons.push('Borderline SpO2'); }

    if (state.profileSymptoms.length > 0) { score -= (state.profileSymptoms.length * 5); reasons.push(`${state.profileSymptoms.length} reported symptoms`); }

    score = Math.max(score, 20);

    if (ringText) ringText.textContent = `${score}%`;
    if (ringCircle) {
      const offset = 150.8 - (150.8 * score) / 100;
      ringCircle.style.strokeDashoffset = offset;
      ringCircle.style.stroke = score > 80 ? 'var(--c-mint)' : (score > 60 ? 'var(--c-amb)' : 'var(--c-red)');
    }

    if (explainText) {
      explainText.textContent = reasons.length > 0
        ? `Health score adjusted by: ${reasons.join(', ')}.`
        : 'All vitals baseline optimal. Regular routine checkup interval.';
    }
  }

  // 3.7 Nearest PHC Centers Renderer
  function renderCenters() {
    const container = document.getElementById('phc-grid-container');
    if (!container) return;

    const filter = state.centersFilter || 'all';
    const list = PHC_FACILITIES.filter(p => {
      if (filter === 'beds') return (p.bedsTotal - p.bedsOccupied) > 0;
      if (filter === 'ambulance') return p.hasAmbulance;
      return true;
    });

    if (list.length === 0) {
      renderEmptyState(container, 'empty_centers_title', 'empty_centers_msg', 'btn_show_all', () => setCentersFilter('all'));
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'phc-card';
      card.innerHTML = `
        <div class="phc-dist">
          <div class="phc-dist-val">${escapeHTML(p.dist.split(' ')[0])}</div>
          <div class="mono-label" style="font-size:0.65rem">KM (${escapeHTML(p.eta)})</div>
        </div>
        <div class="phc-info flex-1">
          <div class="d-flex justify-content-between align-items-start">
            <h3 class="mb-1 fw-bold fs-5">${escapeHTML(p.name)}</h3>
            <span class="badge-mono-pill text-success">● OPEN NOW</span>
          </div>
          <div class="text-muted mb-2" style="font-size:0.85rem">${escapeHTML(p.type)}</div>
          
          <div class="d-flex justify-content-between align-items-center mb-1" style="font-size:0.75rem">
            <span>Bed Availability</span>
            <strong>${p.bedsTotal - p.bedsOccupied} Free / ${p.bedsTotal} Total</strong>
          </div>
          <div class="bed-stacked-bar">
            <div class="bed-bar-occupied" style="width:${(p.bedsOccupied / p.bedsTotal) * 100}%"></div>
            <div class="bed-bar-free" style="width:${((p.bedsTotal - p.bedsOccupied) / p.bedsTotal) * 100}%"></div>
          </div>

          <div class="d-flex gap-1 flex-wrap mt-3">
            ${p.specs.map(s => `<span class="badge-mono-pill">${escapeHTML(s)}</span>`).join('')}
          </div>

          <div class="d-flex gap-2 mt-3">
            <a href="tel:108" class="btn-aq-call text-decoration-none">
              <svg class="icon" aria-hidden="true"><use href="#icon-phone"></use></svg> Call Facility
            </a>
            <button class="btn-aq-call" type="button" data-action="facility-directions" data-name="${escapeHTML(p.name)}">
              <svg class="icon" aria-hidden="true"><use href="#icon-geo"></use></svg> Directions
            </button>
          </div>
        </div>
      `;
      frag.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(frag);
  }

  // Mobile Navigation Renderers
  function renderMobileBottomNav(role) {
    const container = document.getElementById('bottom-nav-items');
    if (!container || !role) return;

    const tabs = role.mobileTabs || [];
    let html = tabs.map(tab => `
      <button type="button" class="bottom-tab-item border-0 bg-transparent" data-target="${tab.id}" data-action="navigate" data-route="${tab.route}" aria-label="${tab.label}">
        <svg class="icon" aria-hidden="true"><use href="#${tab.icon}"></use></svg>
        <span>${escapeHTML(tab.label)}</span>
      </button>
    `).join('');

    html += `
      <button type="button" class="bottom-tab-item border-0 bg-transparent" id="bottom-tab-more" data-action="open-more-sheet" aria-label="More Services">
        <svg class="icon" aria-hidden="true"><use href="#icon-more"></use></svg>
        <span>More</span>
      </button>
    `;

    container.innerHTML = html;
  }

  function renderMoreSheet(role) {
    const container = document.getElementById('more-sheet-items');
    if (!container || !role) return;

    const items = role.moreItems || [];
    let html = items.map(item => `
      <button type="button" class="more-sheet-item border-0 text-start" data-action="navigate" data-route="${item.route}">
        <svg class="icon" aria-hidden="true"><use href="#${item.icon}"></use></svg>
        <span>${escapeHTML(item.label)}</span>
      </button>
    `).join('');

    html += `
      <button type="button" class="more-sheet-item border-0 text-start" data-action="logout" style="grid-column: 1 / -1; background: var(--c-surface); border-color: var(--c-border-strong);">
        <svg class="icon" aria-hidden="true"><use href="#icon-arrow-switch"></use></svg>
        <span>Switch Persona / Sign Out</span>
      </button>
    `;

    container.innerHTML = html;
  }

  function updatePrimaryActionDock(role) {
    const dock = document.getElementById('primary-action-dock');
    const btn = document.getElementById('btn-primary-action');
    const icon = document.getElementById('primary-action-icon');
    const text = document.getElementById('primary-action-text');

    if (!dock || !btn || !icon || !text) return;

    const currentHash = window.location.hash || '#/dashboard';
    // P0.1: Hide FAB entirely on views where its action is already the page's primary control
    if (currentHash === '#/profile' || currentHash === '#/symptoms') {
      dock.style.display = 'none';
      return;
    }

    if (role && role.primaryAction) {
      dock.style.display = 'flex';
      text.textContent = role.primaryAction.text;
      icon.innerHTML = `<use href="#${role.primaryAction.icon}"></use>`;
    } else {
      dock.style.display = 'none';
    }
  }

  /* =======================================================================
     7. EVENT DELEGATION (Container Level Event Architecture)
     ======================================================================= */
  function setupDelegatedListeners() {
    // 1. Delegated Click Listener
    document.addEventListener('click', function (e) {
      const target = e.target.closest('[data-action], .side-item, .ward-poly, .body-zone-path');
      if (!target) return;

      // Sidebar item routing
      if (target.classList.contains('side-item')) {
        const route = target.dataset.route;
        if (route) navigateTo(route);
        return;
      }

      // Ward vector map poly
      if (target.classList.contains('ward-poly')) {
        const ward = target.dataset.ward;
        if (ward) {
          setWardFilter(ward);
          navigateTo('#/directory');
        }
        return;
      }

      // Body Zone SVG Path
      if (target.classList.contains('body-zone-path')) {
        const zone = target.dataset.zone || 'Head';
        document.querySelectorAll('.body-zone-path').forEach(p => p.classList.remove('selected'));
        target.classList.add('selected');
        renderZoneSymptomChips(zone);
        return;
      }

      const action = target.dataset.action;
      if (!action) return;

      switch (action) {
        case 'init-role': {
          const roleKey = target.dataset.role;
          if (roleKey) initRole(roleKey);
          break;
        }
        case 'request-otp':
        case 'resend-otp':
          requestMockOTP();
          break;
        case 'verify-otp':
          verifyMockOTP();
          break;
        case 'clear-filters':
          clearDirectoryFilters();
          break;
        case 'remove-ward-filter':
          setWardFilter('All');
          break;
        case 'remove-risk-filter':
          setRiskFilter('All');
          break;
        case 'restore-online':
          toggleDemoOffline(false);
          break;
        case 'logout':
          logout();
          break;
        case 'toggle-theme':
          toggleTheme();
          break;
        case 'toggle-profile-dropdown':
          toggleProfileDropdown();
          break;
        case 'toggle-sidebar':
          toggleSidebar();
          break;
        case 'focus-search':
          focusSearchInput();
          break;
        case 'open-mobile-search':
          openMobileSearch();
          break;
        case 'close-mobile-search':
          closeMobileSearch();
          break;
        case 'navigate': {
          const route = target.dataset.route;
          if (route) navigateTo(route);
          break;
        }
        case 'set-map-layer': {
          const layer = target.dataset.layer;
          setMapLayer(layer);
          break;
        }
        case 'filter-ward': {
          const ward = target.dataset.ward;
          setWardFilter(ward);
          break;
        }
        case 'filter-risk': {
          const risk = target.dataset.risk;
          setRiskFilter(risk);
          break;
        }
        case 'toggle-density':
          state.directoryDensity = state.directoryDensity === 'comfortable' ? 'compact' : 'comfortable';
          renderDirectory();
          break;
        case 'toggle-patient-select': {
          const id = target.dataset.id;
          if (id) {
            if (target.checked) state.selectedDirectoryIds.add(id);
            else state.selectedDirectoryIds.delete(id);
            updateBulkActionBar();
          }
          break;
        }
        case 'bulk-sync':
          executeBulkSync();
          break;
        case 'bulk-referral':
          executeBulkReferral();
          break;
        case 'open-clinical-modal': {
          const id = target.dataset.id;
          if (id) openClinicalModal(id);
          break;
        }
        case 'close-modal': {
          const modalId = target.dataset.modal || 'clinicalModal';
          hideModal(modalId);
          break;
        }
        case 'modal-referral':
          generateReferral();
          break;
        case 'call-patient': {
          const id = target.dataset.id;
          showToast(`Initiating direct telecom link for patient ${id}...`, 'warning');
          break;
        }
        case 'refer-phc': {
          const id = target.dataset.id;
          if (id) openClinicalModal(id);
          break;
        }
        case 'body-orientation': {
          const orientation = target.dataset.orientation || 'front';
          state.bodyOrientation = orientation;
          document.getElementById('btn-body-front')?.classList.toggle('active', orientation === 'front');
          document.getElementById('btn-body-back')?.classList.toggle('active', orientation === 'back');
          showToast(`Body view: ${orientation === 'front' ? 'Anterior (Front)' : 'Posterior (Back)'}`, 'info');
          break;
        }
        case 'add-body-symptom': {
          const sym = target.dataset.sym;
          if (sym && !state.triageSymptoms.includes(sym)) {
            state.triageSymptoms.push(sym);
            renderTriageTags();
          }
          break;
        }
        case 'remove-triage-sym': {
          const sym = target.dataset.sym;
          if (sym) {
            state.triageSymptoms = state.triageSymptoms.filter(s => s !== sym);
            renderTriageTags();
          }
          break;
        }
        case 'stop-speech':
          stopSpeechTriage();
          break;
        case 'play-advice':
          playAudioAdvice();
          break;
        case 'save-triage':
          saveTriageToPatientRecord();
          break;
        case 'flip-abha':
          flipABHACard();
          break;
        case 'copy-abha':
          copyABHAId();
          break;
        case 'download-abha':
          downloadABHACard();
          break;
        case 'save-patient':
          savePatientNode();
          break;
        case 'filter-centers': {
          const filter = target.dataset.filter || 'all';
          setCentersFilter(filter);
          break;
        }
        case 'facility-directions': {
          const name = target.dataset.name || 'PHC';
          showToast(`Loading GPS Satellite Directions to ${name}...`, 'info');
          break;
        }
        case 'stage-sos':
          stageSOSConfirmation();
          break;
        case 'dispatch-sos':
          executeSOSDispatch();
          break;
        case 'cancel-sos':
          cancelSOSConfirmation();
          break;
        case 'test-speech':
          playAudioAdvice('Voice synthesis calibrated for vernacular clinical assistance.');
          break;
        case 'force-sync':
          forceSyncCloud();
          break;
        case 'export-json':
          exportDataJSON();
          break;
        case 'reset-state':
          confirmResetState();
          break;
        case 'role-primary-action':
          handleRolePrimaryAction();
          break;
        case 'esc-accept':
          Escalation.respond(target.dataset.case, 'accept', target);
          break;
        case 'esc-reassign':
          Escalation.respond(target.dataset.case, 'decline', target);
          break;
        case 'esc-resolve':
          Escalation.resolve(target.dataset.case, target);
          break;
        case 'esc-retry':
          Escalation.pollNow();
          break;
        case 'open-more-sheet':
          openMoreSheet();
          break;
        case 'close-more-sheet':
          closeMoreSheet();
          break;
      }
    });

    // 2. Delegated Change Listener
    document.addEventListener('change', function (e) {
      const id = e.target.id;
      if (id === 'lang-select') {
        setLanguage(e.target.value);
      } else if (id === 'chk-unsynced-only' || id === 'dir-sort') {
        renderDirectory();
      } else if (id === 'chk-select-all') {
        toggleSelectAllDirectory(e.target.checked);
      } else if (id === 'chk-simulate-offline') {
        toggleDemoOffline(e.target.checked);
      } else if (id === 'sel-cat' || id === 'sel-state') {
        calcSchemes();
      } else if (id === 'responder-identity-select') {
        Escalation.setResponderIdentity(e.target.value);
      }
    });

    // 3. Delegated Input Listener
    document.addEventListener('input', function (e) {
      const id = e.target.id;
      if (id === 'dir-search') {
        renderDirectory();
      } else if (id === 'range-inc' || id === 'range-fam') {
        calcSchemes();
      } else if (id === 'inp-bp-sys' || id === 'inp-bp-dia') {
        validateBPFields();
      } else if (id === 'inp-spo2') {
        validateSpO2Field();
      } else if (id === 'inp-name' || id === 'inp-village' || id === 'inp-abha') {
        updatePreviewCard();
        triggerDraftAutosave();
      }
    });

    // 4. Delegated Keydown Listener (Shortcuts, Focus Trap, Escape)
    document.addEventListener('keydown', function (e) {
      // Modal Focus Trap
      const activeModal = document.querySelector('.modal.show');
      if (activeModal && e.key === 'Tab') {
        handleModalTrap(e, activeModal);
        return;
      }

      // Keyboard shortcuts / and Ctrl+K
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (window.innerWidth <= 768) openMobileSearch();
        else focusSearchInput();
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth <= 768) openMobileSearch();
        else focusSearchInput();
      }

      // Escape key to close modals / sheets / searches
      if (e.key === 'Escape') {
        closeMobileSearch();
        closeMoreSheet();
        if (activeModal) hideModal(activeModal.id);
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) dropdown.classList.remove('show');
      }

      // Enter / Comma on Symptom tag inputs
      if (e.target.id === 'triage-sym-input' && (e.key === 'Enter' || e.key === ',')) {
        e.preventDefault();
        const val = e.target.value.trim();
        if (val && !state.triageSymptoms.includes(val)) {
          state.triageSymptoms.push(val);
          renderTriageTags();
        }
        e.target.value = '';
      }

      if (e.target.id === 'profile-sym-input' && (e.key === 'Enter' || e.key === ',')) {
        e.preventDefault();
        const val = e.target.value.trim();
        if (val && !state.profileSymptoms.includes(val)) {
          state.profileSymptoms.push(val);
          renderProfileTags();
        }
        e.target.value = '';
      }

      if (e.target.id === 'profile-cond-input' && (e.key === 'Enter' || e.key === ',')) {
        e.preventDefault();
        const val = e.target.value.trim();
        if (val && !state.profileConditions.includes(val)) {
          state.profileConditions.push(val);
          renderProfileTags();
        }
        e.target.value = '';
      }
    });
  }

  function renderProfileTags() {
    const symContainer = document.getElementById('profile-symptoms-tags');
    if (symContainer) {
      symContainer.innerHTML = state.profileSymptoms.map(s => `
        <span class="tag-interactive">● ${escapeHTML(s)} <button type="button" class="del border-0 bg-transparent p-0 ms-1" data-action="remove-profile-sym" data-sym="${escapeHTML(s)}">✕</button></span>
      `).join('') + '<input type="text" class="tag-input-field" placeholder="Type and press Enter or Comma..." id="profile-sym-input" aria-label="Add symptom tag">';
    }

    const condContainer = document.getElementById('profile-cond-tags');
    if (condContainer) {
      condContainer.innerHTML = state.profileConditions.map(c => `
        <span class="tag-interactive">● ${escapeHTML(c)} <button type="button" class="del border-0 bg-transparent p-0 ms-1" data-action="remove-profile-cond" data-cond="${escapeHTML(c)}">✕</button></span>
      `).join('') + '<input type="text" class="tag-input-field" placeholder="Add condition..." id="profile-cond-input" aria-label="Add condition tag">';
    }

    const previewTags = document.getElementById('card-link-tags');
    if (previewTags) {
      previewTags.innerHTML = state.profileSymptoms.map(s => `<span class="tag-pill tag-red">${escapeHTML(s)}</span>`).join('') +
        state.profileConditions.map(c => `<span class="tag-pill tag-sky">${escapeHTML(c)}</span>`).join('');
    }

    updatePreviewCard();
    triggerDraftAutosave();
  }

  /* =======================================================================
     8. FEATURES (Speech Recognition, Web Audio Waveform, ABHA, Sync, SOS)
     ======================================================================= */
  // 1. Web Audio AnalyserNode Waveform with rAF cleanup
  let audioContext = null;
  let analyser = null;
  let microphoneStream = null;
  let waveAnimationFrame = null;

  async function startWebAudioWaveform() {
    const canvas = document.getElementById('voice-waves');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 400;
    canvas.height = 90;

    try {
      if (!audioContext && (window.AudioContext || window.webkitAudioContext)) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext && audioContext.state === 'suspended') await audioContext.resume();

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneStream = stream;
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function drawRealWave() {
          analyser.getByteFrequencyData(dataArray);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 1.5;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * (canvas.height * 0.8) + 4;
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight);
            x += barWidth;
          }
          waveAnimationFrame = requestAnimationFrame(drawRealWave);
        }
        drawRealWave();
        return;
      }
    } catch (e) {
      console.warn('[ASI] Audio analyser fallback to simulated wave:', e);
    }
    startSimulatedWaveform();
  }

  function startSimulatedWaveform() {
    const canvas = document.getElementById('voice-waves');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;
    function drawSimWave() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 6) {
        const y = Math.sin((x * 0.05) + phase) * 18 + 45;
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(x, y, 3, 16);
      }
      phase += 0.15;
      waveAnimationFrame = requestAnimationFrame(drawSimWave);
    }
    drawSimWave();
  }

  function stopWebAudioWaveform() {
    if (waveAnimationFrame) {
      cancelAnimationFrame(waveAnimationFrame);
      waveAnimationFrame = null;
    }
    if (microphoneStream) {
      microphoneStream.getTracks().forEach(t => t.stop());
      microphoneStream = null;
    }
  }

  // 2. Vernacular Speech Recognition Engine
  let speechRecognizer = null;
  let speechElapsedTimer = null;
  let speechElapsedSeconds = 0;
  const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechClass) {
    try {
      speechRecognizer = new SpeechClass();
      speechRecognizer.continuous = true;
      speechRecognizer.interimResults = true;

      speechRecognizer.onstart = function () {
        const micBtn = document.getElementById('btn-triage-mic');
        const stopBtn = document.getElementById('btn-triage-stop');
        const timerBadge = document.getElementById('voice-timer');
        const transcriptBox = document.getElementById('live-transcript-box');

        if (micBtn) micBtn.classList.add('listening');
        if (stopBtn) stopBtn.classList.remove('d-none');
        if (timerBadge) timerBadge.classList.remove('d-none');
        if (transcriptBox) transcriptBox.classList.remove('d-none');

        startWebAudioWaveform();
        startSpeechTimer();
      };

      speechRecognizer.onresult = function (e) {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            const finalTxt = e.results[i][0].transcript.trim();
            if (finalTxt && !state.triageSymptoms.includes(finalTxt)) {
              state.triageSymptoms.push(finalTxt);
              renderTriageTags();
            }
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        const transcriptText = document.getElementById('live-transcript-text');
        if (transcriptText && interim) transcriptText.textContent = interim;
      };

      speechRecognizer.onend = function () {
        stopSpeechTriage();
      };
    } catch (e) {
      console.warn('[ASI] Speech recognition initialization fallback:', e);
    }
  }

  const triageMic = document.getElementById('btn-triage-mic');
  if (triageMic) {
    triageMic.addEventListener('click', function () {
      if (!speechRecognizer) {
        showToast('Web Speech API not supported. Falling back to simulated capture.', 'warning');
        setTimeout(() => {
          if (!state.triageSymptoms.includes('Severe throbbing migraine')) {
            state.triageSymptoms.push('Severe throbbing migraine');
            renderTriageTags();
          }
        }, 800);
        return;
      }
      try {
        const lang = state.activeLanguage || 'en';
        speechRecognizer.lang = lang === 'hi' ? 'hi-IN' : (lang === 'kn' ? 'kn-IN' : (lang === 'ta' ? 'ta-IN' : 'en-US'));
        speechRecognizer.start();
      } catch (e) {
        showToast('Microphone active. Listening...', 'info');
      }
    });
  }

  function startSpeechTimer() {
    clearInterval(speechElapsedTimer);
    speechElapsedSeconds = 0;
    const timerBadge = document.getElementById('voice-timer');

    speechElapsedTimer = setInterval(() => {
      speechElapsedSeconds++;
      const mins = String(Math.floor(speechElapsedSeconds / 60)).padStart(2, '0');
      const secs = String(speechElapsedSeconds % 60).padStart(2, '0');
      if (timerBadge) timerBadge.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function stopSpeechTriage() {
    if (speechRecognizer) {
      try { speechRecognizer.stop(); } catch (e) {}
    }
    clearInterval(speechElapsedTimer);
    stopWebAudioWaveform();

    const micBtn = document.getElementById('btn-triage-mic');
    const stopBtn = document.getElementById('btn-triage-stop');
    const timerBadge = document.getElementById('voice-timer');
    const transcriptBox = document.getElementById('live-transcript-box');

    if (micBtn) micBtn.classList.remove('listening');
    if (stopBtn) stopBtn.classList.add('d-none');
    if (timerBadge) timerBadge.classList.add('d-none');
    if (transcriptBox) transcriptBox.classList.add('d-none');
  }

  function playAudioAdvice(customTxt) {
    if (!window.speechSynthesis) {
      showToast('Speech Synthesis not available in this browser', 'warning');
      return;
    }
    window.speechSynthesis.cancel();
    const banner = document.getElementById('risk-banner');
    const text = customTxt || (banner ? banner.innerText : 'ArogyaSetu Intelligence clinical diagnostic ready.');
    const utter = new SpeechSynthesisUtterance(text);

    const speed = document.getElementById('range-speed')?.value || '1.0';
    const pitch = document.getElementById('range-pitch')?.value || '1.0';
    utter.rate = parseFloat(speed);
    utter.pitch = parseFloat(pitch);

    window.speechSynthesis.speak(utter);
  }

  function saveTriageToPatientRecord() {
    if (state.triageSymptoms.length === 0) return;
    const newId = '91-' + Math.floor(1000 + Math.random() * 9000) + '-1928-3012';
    const newPatient = {
      id: newId,
      name: 'Screened Villager',
      age: 30,
      gender: 'Female',
      ward: 'Ward 01',
      bp: '135/88',
      spo2: 95,
      risk: state.triageSymptoms.length > 1 ? 'Critical' : 'Attention',
      symptoms: [...state.triageSymptoms],
      conditions: [],
      lastVisit: 'Just now',
      unsynced: true
    };
    state.patients.unshift(newPatient);
    persistState();
    showToast(getI18nText('toast_saved'), 'success');
    setTimeout(() => navigateTo('#/directory'), 600);
  }

  // 3. ABHA Card ID Copy and Download
  function copyABHAId() {
    const idEl = document.getElementById('ab-gen-id');
    const id = idEl ? idEl.innerText.trim() : '91-4820-1928-3012';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(id).then(() => {
        showToast(`Copied ABHA ID: ${id}`, 'success');
      }).catch(() => {
        showToast(`ABHA ID: ${id}`, 'success');
      });
    } else {
      showToast(`ABHA ID: ${id}`, 'success');
    }
  }

  function downloadABHACard() {
    const cvs = document.getElementById('abha-export-canvas');
    if (!cvs || !cvs.getContext) return;
    cvs.width = 600;
    cvs.height = 340;
    const ctx = cvs.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 340);
    ctx.fillStyle = '#0B1120';
    ctx.fillRect(0, 0, 600, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Ayushman Bharat Digital Health Account', 24, 34);

    const name = document.getElementById('ab-gen-name')?.innerText || 'Lakshmi Devi';
    const id = document.getElementById('ab-gen-id')?.innerText || '91-4820-1928-3012';

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(name, 160, 140);

    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#334155';
    ctx.fillText(id, 160, 180);

    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(30, 90, 100, 130);

    const link = document.createElement('a');
    link.download = `ABHA_Card_${name.replace(/\s+/g, '_')}.png`;
    link.href = cvs.toDataURL('image/png');
    link.click();
    showToast('ABHA Digital Card Downloaded (PNG)', 'success');
  }

  // 4. Patient Node Intake
  function savePatientNode() {
    const nameInput = document.getElementById('inp-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
      showToast('Patient Name is required', 'danger');
      if (nameInput) nameInput.focus();
      return;
    }

    const sys = document.getElementById('inp-bp-sys')?.value || '120';
    const dia = document.getElementById('inp-bp-dia')?.value || '80';
    const spo2 = parseInt(document.getElementById('inp-spo2')?.value || '98', 10);
    const risk = (parseInt(sys, 10) >= 160 || spo2 < 90 || state.profileSymptoms.length > 2)
      ? 'Critical'
      : (parseInt(sys, 10) >= 135 || spo2 < 95 ? 'Attention' : 'Stable');

    const newPatient = {
      id: document.getElementById('inp-abha')?.value.trim() || ('91-' + Math.floor(1000 + Math.random() * 9000) + '-1928-3012'),
      name: name,
      age: parseInt(document.getElementById('inp-age')?.value || '30', 10),
      gender: document.getElementById('inp-gender')?.value || 'Female',
      ward: document.getElementById('inp-village')?.value || 'Ward 01',
      bp: `${sys}/${dia}`,
      spo2: spo2,
      risk: risk,
      symptoms: [...state.profileSymptoms],
      conditions: [...state.profileConditions],
      lastVisit: 'Just now',
      unsynced: true
    };

    state.patients.unshift(newPatient);
    persistState();
    showToast(getI18nText('toast_saved'), 'success');
    setTimeout(() => navigateTo('#/directory'), 600);
  }

  // 5. Emergency 108 SOS Dispatch Simulator
  let sosElapsedInterval = null;
  function stageSOSConfirmation() {
    document.getElementById('btn-init-sos')?.classList.add('d-none');
    document.getElementById('sos-confirm-step')?.classList.remove('d-none');
  }

  function cancelSOSConfirmation() {
    document.getElementById('btn-init-sos')?.classList.remove('d-none');
    document.getElementById('sos-confirm-step')?.classList.add('d-none');
  }

  function executeSOSDispatch() {
    cancelSOSConfirmation();
    const feed = document.getElementById('sos-feed');
    if (feed) feed.classList.remove('d-none');

    let secs = 0;
    clearInterval(sosElapsedInterval);
    sosElapsedInterval = setInterval(() => {
      secs++;
      const m = String(Math.floor(secs / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      const timerEl = document.getElementById('sos-timer');
      if (timerEl) timerEl.textContent = `Elapsed: ${m}:${s}`;
    }, 1000);

    showToast(getI18nText('toast_sos'), 'danger');
  }

  function openClinicalModal(id) {
    const p = state.patients.find(x => x.id === id);
    if (!p) return;

    const titleEl = document.getElementById('modal-title');
    const subEl = document.getElementById('modal-subtitle');
    const bpEl = document.getElementById('modal-bp');
    const spo2El = document.getElementById('modal-spo2');
    const tagsEl = document.getElementById('modal-tags');
    const aiText = document.getElementById('modal-ai-text');

    if (titleEl) titleEl.textContent = `${p.name} (${p.age} yrs, ${p.gender || 'Female'})`;
    if (subEl) subEl.textContent = `ABHA: ${p.id} • ${p.ward}`;
    if (bpEl) bpEl.textContent = p.bp || '--';
    if (spo2El) spo2El.textContent = p.spo2 ? `${p.spo2}%` : '--';

    let tags = (p.symptoms || []).map(s => `<span class="tag-pill tag-red">${escapeHTML(s)}</span>`).join('');
    tags += (p.conditions || []).map(c => `<span class="tag-pill tag-sky">${escapeHTML(c)}</span>`).join('');
    if (tagsEl) tagsEl.innerHTML = tags || '<span class="text-muted">No conditions reported</span>';

    if (aiText) {
      if (p.risk === 'Critical') {
        aiText.textContent = `[CRITICAL CLINICAL ESCALATION]: Severe vital anomaly detected (BP ${p.bp}, SpO2 ${p.spo2}%). Immediate emergency referral to closest CHC recommended.`;
      } else if (p.risk === 'Attention') {
        aiText.textContent = `[CLINICAL MONITORING]: Moderate syndromic markers. Schedule frontline follow-up visit within 24 hours.`;
      } else {
        aiText.textContent = `[VITAL BASELINE STABLE]: Regular routine checkup interval. All parameters within safe limits.`;
      }
    }

    showModal('clinicalModal');
  }

  function generateReferral() {
    hideModal('clinicalModal');
    showToast('PHC Emergency Clinical Slip & 108 Dispatch Transmitted', 'danger');
  }

  // 6. Bulk Actions & Cloud Sync
  function toggleSelectAllDirectory(isChecked) {
    if (isChecked) {
      state.patients.forEach(p => state.selectedDirectoryIds.add(p.id));
    } else {
      state.selectedDirectoryIds.clear();
    }
    renderDirectory();
  }

  function executeBulkSync() {
    state.selectedDirectoryIds.forEach(id => {
      const p = state.patients.find(x => x.id === id);
      if (p) p.unsynced = false;
    });
    persistState();
    state.selectedDirectoryIds.clear();
    renderDirectory();
    showToast(getI18nText('toast_synced'), 'success');
  }

  function executeBulkReferral() {
    const count = state.selectedDirectoryIds.size;
    showToast(`${count} patient emergency slips transmitted to PHC`, 'danger');
    state.selectedDirectoryIds.clear();
    renderDirectory();
  }

  function forceSyncCloud() {
    showToast('Synchronizing all local offline records with Central NHM Registry...', 'info');
    setTimeout(() => {
      state.patients.forEach(p => p.unsynced = false);
      persistState();
      renderDirectory();
      showToast(getI18nText('toast_synced'), 'success');
    }, 1000);
  }

  function exportDataJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ArogyaSetu_DataBackup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(getI18nText('toast_exported'), 'success');
  }

  function confirmResetState() {
    if (confirm('Are you sure you want to reset and re-seed all sample villager records?')) {
      localStorage.removeItem(STORAGE_KEY_STATE);
      localStorage.removeItem(STORAGE_KEY_ROLE);
      state.patients = JSON.parse(JSON.stringify(DEFAULT_PATIENTS));
      persistState();
      renderDirectory();
      renderDashboardQueue();
      showToast('Database reset and re-seeded with demo records', 'success');
    }
  }

  /* =======================================================================
     9. ROUTER & ROLE ENGINE (Hash-Based with Deep Linking)
     ======================================================================= */
  function navigateTo(hash) {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      handleHashChange();
    }
  }

  function handleHashChange() {
    const hash = window.location.hash || '#/auth';
    state.activeRoute = hash;

    if (hash === '#/auth') {
      const appShell = document.getElementById('app-shell');
      const authView = document.getElementById('view-auth');
      if (appShell) appShell.style.display = 'none';
      if (authView) authView.classList.add('active');
      return;
    }

    if (!state.currentUser) {
      const savedRole = localStorage.getItem(STORAGE_KEY_ROLE) || 'asha';
      initRole(savedRole, false);
    }

    const targetViewId = ROUTE_MAP[hash] || 'view-dashboard';

    document.querySelectorAll('.view-pane').forEach(p => {
      p.classList.add('d-none');
      p.classList.remove('active');
    });

    const activePane = document.getElementById(targetViewId);
    if (activePane) {
      activePane.classList.remove('d-none');
      activePane.classList.add('active');
    }

    document.querySelectorAll('.side-item').forEach(s => {
      s.classList.toggle('active', s.dataset.target === targetViewId);
    });

    document.querySelectorAll('.bottom-tab-item').forEach(t => {
      t.classList.toggle('active', t.dataset.target === targetViewId);
    });

    closeMoreSheet();
    closeMobileSearch();
    updatePrimaryActionDock(state.currentUser);

    // View Lifecycle Hooks
    if (targetViewId === 'view-dashboard') {
      renderDashboardQueue();
      Escalation.onDashboardEnter();
    } else {
      Escalation.onDashboardLeave();
    }
    if (targetViewId === 'view-schemes') calcSchemes();
    if (targetViewId === 'view-directory') renderDirectory();
    if (targetViewId === 'view-centers') renderCenters();
    if (targetViewId === 'view-symptoms') renderZoneSymptomChips(state.activeBodyZone);

    const stage = document.getElementById('workspace-content');
    if (stage) stage.scrollTop = 0;
  }

  window.addEventListener('hashchange', handleHashChange);

  function initRole(roleKey, doNavigate = true) {
    const role = ROLES[roleKey];
    if (!role) return;

    state.currentUser = role;
    state.activeRoleKey = roleKey;
    localStorage.setItem(STORAGE_KEY_ROLE, roleKey);

    const mainViewport = document.getElementById('app-main-viewport');
    if (mainViewport) {
      mainViewport.classList.remove('persona-switching');
      void mainViewport.offsetWidth;
      mainViewport.classList.add('persona-switching');
    }

    document.querySelectorAll('.side-item').forEach(item => {
      item.style.display = role.visibleTabs.includes(item.dataset.target) ? 'flex' : 'none';
    });

    const personaEl = document.getElementById('top-persona');
    if (personaEl) personaEl.textContent = `[ 👤 ${role.roleLabel} ]`;

    const badgeEl = document.getElementById('dropdown-role-badge');
    if (badgeEl) badgeEl.textContent = `ACTIVE NODE: ${role.badge}`;

    const dashBadge = document.getElementById('dash-node-badge');
    if (dashBadge) dashBadge.textContent = `● ${role.badge}`;

    updatePrimaryActionDock(role);
    renderMobileBottomNav(role);
    renderMoreSheet(role);
    Escalation.onRoleChange(roleKey);

    const authView = document.getElementById('view-auth');
    const appShell = document.getElementById('app-shell');
    if (authView) authView.classList.remove('active');
    if (appShell) appShell.style.display = 'flex';

    if (roleKey === 'patient' || roleKey === 'maternal') {
      const inpName = document.getElementById('inp-name');
      const inpAbha = document.getElementById('inp-abha');
      const inpAge = document.getElementById('inp-age');
      if (inpName) inpName.value = role.name;
      if (inpAbha) inpAbha.value = role.data?.abha || '';
      if (inpAge && role.data?.age) inpAge.value = role.data.age;
      updatePreviewCard();
    }

    if (doNavigate) {
      navigateTo(role.defaultRoute);
    }
  }

  function handleRolePrimaryAction() {
    const role = state.currentUser;
    if (!role || !role.primaryAction) return;

    if (typeof role.primaryAction.customAction === 'function') {
      role.primaryAction.customAction();
    } else if (role.primaryAction.targetRoute) {
      navigateTo(role.primaryAction.targetRoute);
    }
  }

  function logout() {
    state.currentUser = null;
    state.activeRoleKey = null;
    localStorage.removeItem(STORAGE_KEY_ROLE);
    navigateTo('#/auth');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileDropdown) profileDropdown.classList.remove('show');
  }

  function toggleProfileDropdown() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.toggle('show');
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;
    const isCollapsed = sidebar.classList.toggle('sidebar-collapsed');
    const icon = document.getElementById('sidebar-toggle-icon');
    if (icon) icon.innerHTML = `<use href="#icon-chevron-${isCollapsed ? 'right' : 'left'}"></use>`;
  }

  function openMoreSheet() {
    const sheet = document.getElementById('moreSheet');
    if (sheet) sheet.classList.add('show');
  }

  function closeMoreSheet() {
    const sheet = document.getElementById('moreSheet');
    if (sheet) sheet.classList.remove('show');
  }

  function focusSearchInput() {
    const palette = document.querySelector('.cmd-palette');
    const input = document.getElementById('desktop-search-input');
    if (palette && input) {
      palette.classList.add('active-focus');
      input.focus();
    }
  }

  function openMobileSearch() {
    const overlay = document.getElementById('mobile-search-overlay');
    const input = document.getElementById('mobile-search-input');
    if (overlay && input) {
      overlay.classList.add('show');
      input.focus();
    }
  }

  function closeMobileSearch() {
    const overlay = document.getElementById('mobile-search-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  // 6-Digit OTP Mock System (P0.3)
  let otpResendSeconds = 30;
  let otpTimerInterval = null;

  function initOTPSystem() {
    const container = document.getElementById('otp-container');
    if (!container) return;
    const digits = container.querySelectorAll('.otp-digit');

    digits.forEach((digit, idx) => {
      digit.addEventListener('input', () => {
        if (digit.value.length === 1 && idx < digits.length - 1) {
          digits[idx + 1].focus();
        }
      });

      digit.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !digit.value && idx > 0) {
          digits[idx - 1].focus();
        }
        if (e.key === 'Enter') {
          verifyMockOTP();
        }
      });

      digit.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
        if (/^\d+$/.test(pasteData)) {
          pasteData.split('').slice(0, 6).forEach((char, i) => {
            if (digits[i]) digits[i].value = char;
          });
          const nextFocus = Math.min(pasteData.length, digits.length - 1);
          digits[nextFocus].focus();
        }
      });
    });
    // Note: Do not auto-start countdown on load before OTP is requested (P0.3)
  }

  function requestMockOTP() {
    const phoneInput = document.getElementById('inp-auth-user');
    const phoneVal = phoneInput ? phoneInput.value.trim() : '9876543210';
    showToast(`Verification code sent to ${escapeHTML(phoneVal)}`, 'success');

    const btnRequest = document.getElementById('btn-request-otp');
    const timerEl = document.getElementById('otp-timer');
    if (btnRequest) btnRequest.classList.add('d-none');
    if (timerEl) timerEl.classList.remove('d-none');

    startOTPTimer();

    // Auto-fill demo digits for seamless demonstration
    const digits = document.querySelectorAll('.otp-digit');
    ['1', '2', '3', '4', '5', '6'].forEach((d, i) => {
      if (digits[i]) digits[i].value = d;
    });
  }

  function startOTPTimer() {
    clearInterval(otpTimerInterval);
    otpResendSeconds = 30;
    const timerEl = document.getElementById('otp-timer');
    if (!timerEl) return;

    function formatTime(s) {
      const mins = Math.floor(s / 60);
      const secs = s % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    timerEl.className = 'text-muted fw-bold';
    timerEl.textContent = `Resend in ${formatTime(otpResendSeconds)}`;

    otpTimerInterval = setInterval(() => {
      otpResendSeconds--;
      if (otpResendSeconds > 0) {
        timerEl.textContent = `Resend in ${formatTime(otpResendSeconds)}`;
      } else {
        clearInterval(otpTimerInterval);
        timerEl.innerHTML = '<button type="button" class="btn-link text-primary fw-bold p-0 border-0 bg-transparent" data-action="resend-otp" style="font-size:0.75rem; text-decoration:none; cursor:pointer">Resend OTP Now</button>';
      }
    }, 1000);
  }

  function verifyMockOTP() {
    const digits = document.querySelectorAll('.otp-digit');
    let code = '';
    digits.forEach(d => code += d.value.trim());

    const container = document.getElementById('otp-container');
    const errorMsg = document.getElementById('otp-error-msg');

    if (code.length === 6) {
      if (errorMsg) errorMsg.classList.add('d-none');
      showToast('Credentials Verified • ABHA Node Connected', 'success');
      initRole('asha');
    } else {
      if (container) {
        container.classList.remove('error-shake');
        void container.offsetWidth;
        container.classList.add('error-shake');
      }
      if (errorMsg) errorMsg.classList.remove('d-none');
      showToast('Please enter complete 6-digit verification code', 'danger');
    }
  }

  // Interactive SVG Choropleth Map Telemetry
  function initWardVectorMap() {
    const polys = document.querySelectorAll('.ward-poly');
    const tooltip = document.getElementById('ward-map-tooltip');
    if (!polys.length || !tooltip) return;

    polys.forEach(poly => {
      poly.addEventListener('mouseenter', (e) => {
        const ward = poly.dataset.ward;
        const pop = poly.dataset.pop;
        const alerts = poly.dataset.alerts;
        const risk = poly.dataset.risk;

        tooltip.innerHTML = `
          <strong>${escapeHTML(ward)}</strong><br>
          Screened: ${escapeHTML(pop)} citizens<br>
          Active Alerts: <span class="${risk === 'Critical' ? 'text-danger fw-bold' : 'text-warning'}">${escapeHTML(alerts)} (${escapeHTML(risk)})</span><br>
          <em style="font-size:0.7rem; color:var(--c-text-muted)">Click to filter Directory</em>
        `;
        tooltip.style.display = 'block';
      });

      poly.addEventListener('mousemove', (e) => {
        const wrapper = document.getElementById('ward-choropleth-card');
        const rect = wrapper ? wrapper.getBoundingClientRect() : { left: 0, top: 0 };
        tooltip.style.left = `${e.clientX - rect.left + 15}px`;
        tooltip.style.top = `${e.clientY - rect.top + 15}px`;
      });

      poly.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  }

  /* =======================================================================
     10. INIT & BOOTSTRAP (Performance Cleanup & Graceful Fallbacks)
     ======================================================================= */
  function init() {
    loadPersistedState();
    setTheme(state.theme || 'light');
    setLanguage(state.activeLanguage || 'en');
    setupDelegatedListeners();
    initOTPSystem();
    initWardVectorMap();
    runCountUpAnimations();

    // FAB shrink to icon-only circle on scroll > 200px (P0.1)
    const stage = document.getElementById('workspace-content');
    if (stage) {
      stage.addEventListener('scroll', () => {
        const btn = document.getElementById('btn-primary-action');
        if (btn) {
          if (stage.scrollTop > 200) {
            btn.classList.add('is-shrunk');
          } else {
            btn.classList.remove('is-shrunk');
          }
        }
      }, { passive: true });
    }

    // Cancel rAF audio loops when tab visibility changes (Battery/Performance requirement)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopWebAudioWaveform();
      }
    });

    const savedRole = localStorage.getItem(STORAGE_KEY_ROLE);
    const currentHash = window.location.hash || '#/auth';

    if (savedRole && ROLES[savedRole] && currentHash !== '#/auth') {
      initRole(savedRole, false);
      handleHashChange();
    } else {
      navigateTo('#/auth');
    }
  }

  /* =======================================================================
     11. LIVE ESCALATION INTEGRATION
     Bridges the Critical Action Queue + Field Responders panel to the
     Arogya Sahayak n8n escalation system via the server/ backend.
     Only this dashboard section talks to the backend — everything else
     in the app stays on its existing mock data.
     ======================================================================= */
  const Escalation = (function () {
    const API_BASE = String(
      window.ESCALATION_API_BASE != null ? window.ESCALATION_API_BASE : 'http://localhost:3000'
    ).replace(/\/+$/, '');
    const POLL_MS = 8000;

    let pollTimer = null;
    let onDashboard = false;
    let hadSuccess = false;
    let lastCases = null;
    let lastAdmins = null;
    const inFlight = new Set(); // case_ids with an Accept/Reassign/Resolve request pending

    function apiFetch(pathname, opts) {
      const options = Object.assign({ headers: {} }, opts || {});
      options.headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers);
      return fetch(API_BASE + pathname, options).then(async (res) => {
        let data = null;
        try { data = await res.json(); } catch (e) { /* non-JSON */ }
        if (!res.ok) {
          const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`;
          throw new Error(msg);
        }
        return data || {};
      });
    }

    function severityMeta(label) {
      const l = String(label || '').toLowerCase();
      if (l === 'emergency') return { cls: 'sev-emergency', pill: 'status-critical', text: 'EMERGENCY' };
      if (l === 'urgent') return { cls: 'sev-urgent', pill: 'status-critical', text: 'URGENT' };
      if (l === 'moderate') return { cls: 'sev-moderate', pill: 'status-attention', text: 'MODERATE' };
      if (l === 'mild') return { cls: 'sev-mild', pill: 'status-stable', text: 'MILD' };
      return { cls: 'sev-mild', pill: 'status-stable', text: 'NOT ASSESSED' };
    }

    function elapsedSince(iso) {
      const t = Date.parse(iso);
      if (isNaN(t)) return 'recently';
      const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins} min ago`;
      const hrs = Math.round(mins / 60);
      if (hrs < 24) return `${hrs} hr ago`;
      return `${Math.round(hrs / 24)} d ago`;
    }

    function locationText(loc) {
      loc = loc || {};
      return loc.landmark || loc.decoded_location || loc.pin_code || 'Location pending';
    }

    function assignedText(c) {
      const snap = c.current_admin_snapshot;
      if (snap && snap.name) {
        return snap.designation ? `${snap.name} · ${snap.designation}` : snap.name;
      }
      return c.current_admin_id || null;
    }

    function caseCardHTML(c) {
      const sev = severityMeta(c.severity_label);
      const p = c.patient || {};
      const name = p.name || 'Unknown patient';
      const nameLine = p.age != null ? `${name}, ${p.age}` : name;
      const phone = p.contact_number || (c.location && c.location.contact_number) || null;
      const busy = inFlight.has(c.case_id);
      const assigned = assignedText(c);
      const symptoms = c.symptoms
        ? (c.duration ? `${c.symptoms} · ${c.duration}` : String(c.symptoms))
        : '';

      const actions = busy
        ? `<button class="btn-aq-refer" type="button" disabled><span class="esc-spinner"></span>Working…</button>`
        : `<button class="btn-aq-refer" type="button" data-action="esc-accept" data-case="${escapeHTML(c.case_id)}">Accept</button>
           <button class="btn-aq-call" type="button" data-action="esc-reassign" data-case="${escapeHTML(c.case_id)}">Reassign</button>
           <button class="esc-btn-resolve" type="button" data-action="esc-resolve" data-case="${escapeHTML(c.case_id)}">Resolve</button>`;

      return `
        <div class="esc-case-card ${sev.cls}">
          <div class="esc-case-main">
            <div class="esc-case-row1">
              <span class="status-pill ${sev.pill}"><span class="dot"></span>${escapeHTML(sev.text)}</span>
              <span class="aq-patient-name">${escapeHTML(nameLine)}</span>
              ${phone ? `<span class="badge-mono-pill">☎ ${escapeHTML(phone)}</span>` : ''}
              <span class="aq-meta">Attempt ${escapeHTML(c.attempt_number != null ? c.attempt_number : 1)} · updated ${escapeHTML(elapsedSince(c.updated_at))}</span>
            </div>
            ${symptoms ? `<div class="esc-case-symptoms">${escapeHTML(symptoms)}</div>` : ''}
            <div class="esc-case-meta-row">
              <span class="esc-meta-chip">📍 ${escapeHTML(locationText(c.location))}</span>
              ${assigned
                ? `<span class="esc-meta-chip">🩺 ${escapeHTML(assigned)}</span>`
                : `<span class="esc-meta-chip esc-unassigned">🩺 Unassigned</span>`}
            </div>
          </div>
          <div class="aq-actions esc-case-actions">${actions}</div>
        </div>`;
    }

    function renderQueue(cases, opts) {
      opts = opts || {};
      const container = document.getElementById('action-queue-list');
      const countBadge = document.getElementById('aq-open-count');
      if (!container) return;

      if (!Array.isArray(cases)) {
        renderSkeleton(container, 'row', 2);
        if (countBadge) countBadge.textContent = 'Syncing…';
        return;
      }

      const n = cases.length;
      if (countBadge) countBadge.textContent = `${n} Open Alert${n === 1 ? '' : 's'}`;

      if (n === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <svg class="icon" aria-hidden="true"><use href="#icon-shield-check"></use></svg>
            <div class="empty-state-title">No active escalations</div>
            <div class="empty-state-msg">Every triaged patient currently has a responder. New cases from the Telegram bot appear here automatically.</div>
          </div>`;
        return;
      }

      const note = opts.stale
        ? `<div class="esc-reconnect-note">⚠ Backend unreachable — showing last known state. <button type="button" class="btn-link p-0 border-0 bg-transparent" data-action="esc-retry" style="font:inherit;color:var(--c-sky-text);cursor:pointer;text-decoration:underline">Retry now</button></div>`
        : '';
      container.innerHTML = note + cases.map(caseCardHTML).join('');
    }

    function renderQueueError() {
      const container = document.getElementById('action-queue-list');
      const countBadge = document.getElementById('aq-open-count');
      if (countBadge) countBadge.textContent = 'Offline';
      if (!container) return;
      renderErrorState(
        container,
        `Cannot reach the escalation backend at ${API_BASE || 'this site'}. Start the server/ service, then retry.`,
        pollNow
      );
    }

    function responderStatusMeta(status) {
      const s = String(status || '').toLowerCase();
      if (s === 'available') return { pill: 'status-stable', text: 'AVAILABLE' };
      if (s === 'busy') return { pill: 'status-attention', text: 'BUSY' };
      if (s === 'not_working') return { pill: 'status-critical', text: 'NOT WORKING' };
      return { pill: 'status-attention', text: (status || 'UNKNOWN').toUpperCase() };
    }

    function renderResponders(admins) {
      const container = document.getElementById('field-responders-list');
      const countBadge = document.getElementById('fr-count');
      if (!container) return;

      if (!Array.isArray(admins)) {
        renderSkeleton(container, 'card', 3);
        return;
      }

      if (countBadge) countBadge.textContent = `${admins.length} On Roster`;

      container.innerHTML = admins.length
        ? admins.map((a) => {
            const meta = responderStatusMeta(a.status);
            return `
              <div class="responder-card">
                <div class="responder-card-head">
                  <span class="responder-name">${escapeHTML(a.name || a.admin_id)}</span>
                  <span class="status-pill ${meta.pill}"><span class="dot"></span>${escapeHTML(meta.text)}</span>
                </div>
                <div class="responder-desig">${escapeHTML(a.designation || '—')}</div>
                ${a.phone ? `<a class="responder-phone" href="tel:${escapeHTML(a.phone)}">☎ ${escapeHTML(a.phone)}</a>` : ''}
              </div>`;
          }).join('')
        : `<div class="empty-state"><div class="empty-state-msg">No responders on the roster yet. Seed the <code>admins</code> collection.</div></div>`;

      populateIdentitySelect(admins);
    }

    function populateIdentitySelect(admins) {
      const sel = document.getElementById('responder-identity-select');
      if (!sel) return;
      const current = state.responderAdminId || '';
      let opts = '<option value="">— select responder —</option>';
      let found = false;
      admins.forEach((a) => {
        if (a.admin_id === current) found = true;
        const label = a.designation ? `${a.name || a.admin_id} · ${a.designation}` : (a.name || a.admin_id);
        opts += `<option value="${escapeHTML(a.admin_id)}">${escapeHTML(label)}</option>`;
      });
      if (current && !found) {
        opts += `<option value="${escapeHTML(current)}">${escapeHTML(current)} (offline)</option>`;
      }
      sel.innerHTML = opts;
      sel.value = current;
    }

    function setResponderIdentity(val) {
      state.responderAdminId = val || null;
      try {
        if (val) localStorage.setItem('asi.v1.responderAdminId', val);
        else localStorage.removeItem('asi.v1.responderAdminId');
      } catch (e) { /* storage disabled */ }
      if (val) {
        const sel = document.getElementById('responder-identity-select');
        const label = sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : val;
        showToast(`Acting as ${label}`, 'info');
      }
    }

    function respond(caseId, action, btnEl) {
      if (!caseId || inFlight.has(caseId)) return;
      if (!state.responderAdminId) {
        showToast('Select which responder you are first — the "Acting as" dropdown in Field Responders.', 'warning');
        const sel = document.getElementById('responder-identity-select');
        if (sel) sel.focus();
        return;
      }
      inFlight.add(caseId);
      renderQueue(lastCases);

      apiFetch(`/api/escalations/${encodeURIComponent(caseId)}/respond`, {
        method: 'POST',
        body: JSON.stringify({ admin_id: state.responderAdminId, action }),
      })
        .then((data) => {
          showToast(data.message || (action === 'accept' ? 'Case accepted.' : 'Reassignment requested.'),
            data.ok === false ? 'warning' : 'success');
        })
        .catch((err) => {
          showToast(err.message || 'Could not reach the escalation manager.', 'danger');
        })
        .finally(() => {
          inFlight.delete(caseId);
          pollNow();
        });
    }

    function resolve(caseId, btnEl) {
      if (!caseId || inFlight.has(caseId)) return;
      inFlight.add(caseId);
      renderQueue(lastCases);

      apiFetch(`/api/escalations/${encodeURIComponent(caseId)}/resolve`, { method: 'PATCH', body: '{}' })
        .then(() => showToast('Case archived from the active queue.', 'success'))
        .catch((err) => showToast(err.message || 'Could not resolve case.', 'danger'))
        .finally(() => {
          inFlight.delete(caseId);
          pollNow();
        });
    }

    function pollOnce() {
      return Promise.all([
        apiFetch('/api/escalations?status=active'),
        apiFetch('/api/admins'),
      ])
        .then(([q, r]) => {
          lastCases = Array.isArray(q.escalations) ? q.escalations : [];
          lastAdmins = Array.isArray(r.admins) ? r.admins : [];
          hadSuccess = true;
          renderQueue(lastCases);
          renderResponders(lastAdmins);
        })
        .catch((err) => {
          console.warn('[ASI] Escalation poll failed:', err.message);
          if (!hadSuccess) {
            renderQueueError();
            renderResponders(lastAdmins);
          } else {
            renderQueue(lastCases, { stale: true });
          }
        });
    }

    function pollNow() { return pollOnce(); }

    function startPolling() {
      if (pollTimer) return;
      pollOnce();
      pollTimer = setInterval(() => {
        if (!document.hidden && onDashboard) pollOnce();
      }, POLL_MS);
    }

    function stopPolling() {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    }

    function syncDashboardVisibility() {
      const section = document.getElementById('field-responders-section');
      if (section) section.classList.toggle('d-none', state.activeRoleKey !== 'doctor');
    }

    function renderFromCache() {
      renderQueue(lastCases);
      renderResponders(lastAdmins);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopPolling();
      else if (onDashboard) startPolling();
    });

    return {
      onDashboardEnter() { onDashboard = true; if (!document.hidden) startPolling(); },
      onDashboardLeave() { onDashboard = false; stopPolling(); },
      onRoleChange() { syncDashboardVisibility(); renderFromCache(); },
      syncDashboardVisibility,
      renderFromCache,
      setResponderIdentity,
      respond,
      resolve,
      pollNow,
    };
  })();

  // Auto-boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export public namespace onto window
  window.ASI = {
    version: APP_VERSION,
    navigateTo: navigateTo,
    initRole: initRole,
    setLanguage: setLanguage,
    setTheme: setTheme,
    showToast: showToast,
    toggleDemoOffline: toggleDemoOffline,
    Escalation: Escalation
  };

})(window, document);
