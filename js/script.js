import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC1ZgCCR-MakYRbA6Vw9I7QYWmITuOLC2M",
  authDomain: "medical-qr-50da9.firebaseapp.com",
  projectId: "medical-qr-50da9",
  storageBucket: "medical-qr-50da9.firebasestorage.app",
  messagingSenderId: "918654903799",
  appId: "1:918654903799:web:fa0d014fb068cb4f993af2",
  measurementId: "G-KEXK6MYLLC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {

  const confirmBtn = document.getElementById("confirmBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const editBtn = document.getElementById("editBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const qrcodeDiv = document.getElementById("qrcode");
  const form = document.getElementById("medicalForm");
  const deleteModal = document.getElementById("deleteModal");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const cancelDeleteBtn = document.getElementById("cancelDelete");
  const qrColorInput = document.getElementById("qrColor");

  const fabBtn = document.getElementById("fabBtn");
  const fabMenu = document.getElementById("fabMenu");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");
  const langBtns = document.querySelectorAll(".fab-menu .menu-btn[data-lang]");
  const navLogo = document.getElementById("navLogo");

  let lastID = localStorage.getItem("lastMedicalID");

  // --- CONDITIONAL FIELDS ---
  const conditionalFields = {
    allergiesYesNo: "allergies",
    diabetes: "diabetesType",
    epilepsy: "epilepsyType",
    smoke: "smokeFrequency"
  };

  Object.keys(conditionalFields).forEach(parentId => {
    const parent = document.getElementById(parentId);
    const child = document.getElementById(conditionalFields[parentId]);
    if (!parent || !child) return;

    if(parent.value === "Yes") child.classList.remove("hidden");
    else child.classList.add("hidden");

    parent.addEventListener("change", () => {
      if (parent.value === "Yes") child.classList.remove("hidden");
      else {
        child.classList.add("hidden");
        child.value = "";
      }
    });
  });

  // --- NAME VALIDATION (Letters only) ---
  const nameInput = document.getElementById("name");
  if (nameInput) {
    nameInput.addEventListener("input", function() {
      // Regex to remove anything that is not a letter or space
      this.value = this.value.replace(/[^a-zA-Z\s]/g, '');
    });
  }

  // --- AGE VALIDATION ---
  const ageInput = document.getElementById("age");
  if (ageInput) {
    ageInput.addEventListener("input", function() {
      // Regex to remove anything that is not a digit
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  }

  // --- LOAD EXISTING DATA ---
  if (lastID) {
    try {
      const docSnap = await getDoc(doc(db, "medicalProfiles", lastID));
      if (docSnap.exists()) {
        const data = docSnap.data();
        for (const key in data) {
          if (document.getElementById(key)) {
            document.getElementById(key).value = data[key];
            if (Object.values(conditionalFields).includes(key) && data[key] !== "") {
              document.getElementById(key).classList.remove("hidden");
            }
          }
        }
        form.querySelectorAll("input, textarea, select").forEach(el => el.disabled = true);
        editBtn.classList.remove("hidden");
        deleteBtn.classList.remove("hidden");
        confirmBtn.classList.add("hidden");

        const url = `https://hannahhaitham.github.io/medical-qr/pages/medical.html?id=${lastID}`;
        qrcodeDiv.innerHTML = "";
        new QRCode(qrcodeDiv, {
          text: url, width: 200, height: 200,
          colorDark: qrColorInput.value, colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
        qrcodeDiv.classList.remove("hidden");
        downloadBtn.classList.remove("hidden");
      }
    } catch (err) { console.error(err); }
  }

  // --- CONFIRM / SAVE DATA ---
  confirmBtn.addEventListener("click", async () => {
    const fields = [
      "name", "age", "allergies", "allergiesYesNo",
      "blood", "diabetes", "diabetesType", "highBP",
      "lowBP", "strokeHistory", "DNR", "organDonor",
      "medicine", "asthma", "smoke", "smokeFrequency",
      "epilepsy", "epilepsyType", "notes", "emergencyContact"
    ];

    const dataToSave = {};
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (!el) return;
      const val = el.value.trim();
      if (val && val !== "No") dataToSave[f] = val;
    });

    if (!dataToSave.name || !dataToSave.age || !dataToSave.blood) {
      let toast = document.getElementById("toast-notification");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-notification";
        toast.className = "toast-notification";
        document.body.appendChild(toast);
      }
      toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        Please fill in the required fields: Name, Age, and Blood Type.
      `;
      
      // Force reflow
      void toast.offsetWidth;
      toast.classList.add("show");
      
      setTimeout(() => {
        toast.classList.remove("show");
      }, 4000);
      
      return;
    } 

    try {
      const docRef = await addDoc(collection(db, "medicalProfiles"), dataToSave);
      lastID = docRef.id;

      localStorage.setItem("lastMedicalID", lastID);
      localStorage.setItem("lastMedicalName", dataToSave.name || "User"); 
    
      const url = `https://hannahhaitham.github.io/medical-qr/pages/medical.html?id=${lastID}`;
        
      qrcodeDiv.innerHTML = "";
      new QRCode(qrcodeDiv, {
        text: url,
        width: 200,
        height: 200,
        colorDark: qrColorInput.value,
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      qrcodeDiv.classList.remove("hidden");
      downloadBtn.classList.remove("hidden");
      
      form.querySelectorAll("input, textarea, select").forEach(el => el.disabled = true);
      editBtn.classList.remove("hidden");
      deleteBtn.classList.remove("hidden");
      confirmBtn.classList.add("hidden");
      
    } catch (err) {
      console.error(err);
      alert("Failed to save info.");
    }
  });

  // --- EDIT ---
  editBtn.addEventListener("click", () => {
    form.querySelectorAll("input, textarea, select").forEach(el => el.disabled = false);
    editBtn.classList.add("hidden");
    confirmBtn.classList.remove("hidden");
  });

  // --- DELETE ---
  deleteBtn.addEventListener("click", () => { deleteModal.classList.add("active"); });
  cancelDeleteBtn.addEventListener("click", () => { deleteModal.classList.remove("active"); });

  confirmDeleteBtn.addEventListener("click", async () => {
    deleteModal.classList.remove("active");
    if (!lastID) return;

    try {
      await setDoc(doc(db, "medicalProfiles", lastID), {});
      form.querySelectorAll("input, textarea, select").forEach(el => el.value = "");
      form.querySelectorAll("input, textarea, select").forEach(el => el.disabled = false);
      editBtn.classList.add("hidden");
      deleteBtn.classList.add("hidden");
      confirmBtn.classList.remove("hidden");
      qrcodeDiv.innerHTML = "";
      qrcodeDiv.classList.add("hidden");
      downloadBtn.classList.add("hidden");
      localStorage.removeItem("lastMedicalID");
      lastID = null;
    } catch (err) { console.error(err); alert("Failed to delete info."); }
  });

  // --- DOWNLOAD QR ---
  downloadBtn.addEventListener("click", () => {
    const qrCanvas = qrcodeDiv.querySelector("canvas");
    if (!qrCanvas) { alert("Generate QR first!"); return; }
    const imageURL = qrCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "medical-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // --- THEME LOGIC ---
  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
      if(navLogo) navLogo.src = "../imgs/logo-light.png";
      if(themeIcon) themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
      if(themeText) themeText.textContent = "Light Mode";
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
      if(navLogo) navLogo.src = "../imgs/logo-dark.png"; 
      if(themeIcon) themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      if(themeText) themeText.textContent = "Dark Mode";
    }
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDarkMode = localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && prefersDark);
  applyTheme(isDarkMode);

  if(themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      isDarkMode = !isDarkMode;
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      applyTheme(isDarkMode);
    });
  }

  // --- LANGUAGE LOGIC ---
  const systemLang = (navigator.language || 'en').split('-')[0];
  const defaultLang = ['en', 'fr', 'es', 'ar'].includes(systemLang) ? systemLang : 'en';
  const savedLang = localStorage.getItem("language") || defaultLang;
  setLanguage(savedLang, false);

  langBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      localStorage.setItem("language", lang);
      setLanguage(lang, true);
      if(fabMenu) fabMenu.classList.remove("active");
    });
  });

  function setLanguage(lang, smooth) {
    const body = document.querySelector(".main-container");
    if(smooth && body) {
      body.style.transition = "opacity 0.3s ease";
      body.style.opacity = "0";
      setTimeout(() => {
        updateTextForLanguage(lang);
        body.style.opacity = "1";
      }, 300);
    } else {
      updateTextForLanguage(lang);
    }
  }

  function updateTextForLanguage(lang) {
    const translations = {
      en: {
        formTitle: "Medical Information QR Code", labelName: "Full Name:", labelAge: "Age:", labelAllergies: "Allergies:", labelBlood: "Blood Type:", labelDiabetes: "Diabetes:", labelHighBP: "High Blood Pressure:", labelLowBP: "Low Blood Pressure:", labelStroke: "History of Strokes:", labelDNR: "DNR:", labelOrganDonor: "Organ Donor:", labelMedicine: "Medicine Taken:", labelAsthma: "Asthma:", labelSmoke: "Do you smoke?", labelEpilepsy: "Epilepsy:", labelNotes: "Notes:", labelEmergency: "Emergency Contact:", confirmBtn: "Confirm Info", deleteModalText: "Are you sure you want to delete your info?", cancelDelete: "Cancel", confirmDelete: "Delete", navHome: "Home", navProfile: "Profile",
        placeholderName: "Full Name", placeholderAge: "Age", placeholderAllergies: "Specify allergies", placeholderMedicine: "Medicines you take", placeholderNotes: "Other medical notes", placeholderEmergency: "Emergency contact number", placeholderSmokeFreq: "How many packs/day",
        optNo: "No", optYes: "Yes", optType1: "Type 1", optType2: "Type 2", optGestational: "Gestational", optMild: "Mild", optModerate: "Moderate", optSevere: "Severe", optSelf: "Self", optFamily: "Family Member", optFocal: "Focal", optGeneralized: "Generalized", optUnknown: "Unknown"
      },
      fr: {
        formTitle: "Code QR d'information médicale", labelName: "Nom complet :", labelAge: "Âge :", labelAllergies: "Allergies :", labelBlood: "Groupe sanguin :", labelDiabetes: "Diabète :", labelHighBP: "Hypertension :", labelLowBP: "Hypotension :", labelStroke: "Antécédents d'AVC :", labelDNR: "Ne pas réanimer :", labelOrganDonor: "Donneur d'organes :", labelMedicine: "Médicaments :", labelAsthma: "Asthme :", labelSmoke: "Fumez-vous ?", labelEpilepsy: "Épilepsie :", labelNotes: "Remarques :", labelEmergency: "Contact d'urgence :", confirmBtn: "Confirmer", deleteModalText: "Êtes-vous sûr de vouloir supprimer ?", cancelDelete: "Annuler", confirmDelete: "Supprimer", navHome: "Accueil", navProfile: "Profil",
        placeholderName: "Nom complet", placeholderAge: "Âge", placeholderAllergies: "Précisez les allergies", placeholderMedicine: "Médicaments", placeholderNotes: "Autres remarques", placeholderEmergency: "Numéro d'urgence", placeholderSmokeFreq: "Combien de paquets/jour",
        optNo: "Non", optYes: "Oui", optType1: "Type 1", optType2: "Type 2", optGestational: "Gestationnel", optMild: "Léger", optModerate: "Modéré", optSevere: "Sévère", optSelf: "Moi", optFamily: "Membre de la famille", optFocal: "Focale", optGeneralized: "Généralisée", optUnknown: "Inconnue"
      },
      es: {
        formTitle: "Código QR de Información Médica", labelName: "Nombre completo:", labelAge: "Edad:", labelAllergies: "Alergias:", labelBlood: "Tipo de sangre:", labelDiabetes: "Diabetes:", labelHighBP: "Presión alta:", labelLowBP: "Presión baja:", labelStroke: "Antecedentes de derrames:", labelDNR: "DNR:", labelOrganDonor: "Donante de órganos:", labelMedicine: "Medicamentos:", labelAsthma: "Asma:", labelSmoke: "¿Fumas?", labelEpilepsy: "Epilepsia:", labelNotes: "Notas:", labelEmergency: "Contacto de emergencia:", confirmBtn: "Confirmar Info", deleteModalText: "¿Seguro que quieres eliminar?", cancelDelete: "Cancelar", confirmDelete: "Eliminar", navHome: "Inicio", navProfile: "Perfil",
        placeholderName: "Nombre completo", placeholderAge: "Edad", placeholderAllergies: "Especificar alergias", placeholderMedicine: "Medicamentos", placeholderNotes: "Otras notas médicas", placeholderEmergency: "Número de emergencia", placeholderSmokeFreq: "Cuántos paquetes/día",
        optNo: "No", optYes: "Sí", optType1: "Tipo 1", optType2: "Tipo 2", optGestational: "Gestacional", optMild: "Leve", optModerate: "Moderado", optSevere: "Severo", optSelf: "Yo", optFamily: "Familiar", optFocal: "Focal", optGeneralized: "Generalizada", optUnknown: "Desconocida"
      },
      ar: {
        formTitle: "رمز الاستجابة السريعة للمعلومات الطبية", labelName: "الاسم الكامل:", labelAge: "العمر:", labelAllergies: "الحساسية:", labelBlood: "فصيلة الدم:", labelDiabetes: "السكري:", labelHighBP: "ارتفاع ضغط الدم:", labelLowBP: "انخفاض ضغط الدم:", labelStroke: "تاريخ السكتات الدماغية:", labelDNR: "عدم الإنعاش:", labelOrganDonor: "متبرع بالأعضاء:", labelMedicine: "الأدوية التي تتناولها:", labelAsthma: "الربو:", labelSmoke: "هل تدخن؟", labelEpilepsy: "الصرع:", labelNotes: "ملاحظات:", labelEmergency: "جهة اتصال الطوارئ:", confirmBtn: "تأكيد المعلومات", deleteModalText: "هل أنت متأكد أنك تريد الحذف؟", cancelDelete: "إلغاء", confirmDelete: "حذف", navHome: "الرئيسية", navProfile: "الملف الشخصي",
        placeholderName: "الاسم الكامل", placeholderAge: "العمر", placeholderAllergies: "حدد الحساسية", placeholderMedicine: "الأدوية التي تتناولها", placeholderNotes: "ملاحظات طبية أخرى", placeholderEmergency: "رقم طوارئ", placeholderSmokeFreq: "كم عدد العبوات/اليوم",
        optNo: "لا", optYes: "نعم", optType1: "النوع 1", optType2: "النوع 2", optGestational: "سكري الحمل", optMild: "خفيف", optModerate: "متوسط", optSevere: "شديد", optSelf: "أنا", optFamily: "فرد من العائلة", optFocal: "بؤري", optGeneralized: "معمم", optUnknown: "غير معروف"
      }
    };
    
    const t = translations[lang] || translations.en;
    
    // Labels & Text
    if(document.getElementById("formTitle")) document.getElementById("formTitle").textContent = t.formTitle;
    if(document.getElementById("labelName")) document.getElementById("labelName").textContent = t.labelName;
    if(document.getElementById("labelAge")) document.getElementById("labelAge").textContent = t.labelAge;
    if(document.getElementById("labelAllergies")) document.getElementById("labelAllergies").textContent = t.labelAllergies;
    if(document.getElementById("labelBlood")) document.getElementById("labelBlood").textContent = t.labelBlood;
    if(document.getElementById("labelDiabetes")) document.getElementById("labelDiabetes").textContent = t.labelDiabetes;
    if(document.getElementById("labelHighBP")) document.getElementById("labelHighBP").textContent = t.labelHighBP;
    if(document.getElementById("labelLowBP")) document.getElementById("labelLowBP").textContent = t.labelLowBP;
    if(document.getElementById("labelStroke")) document.getElementById("labelStroke").textContent = t.labelStroke;
    if(document.getElementById("labelDNR")) document.getElementById("labelDNR").textContent = t.labelDNR;
    if(document.getElementById("labelOrganDonor")) document.getElementById("labelOrganDonor").textContent = t.labelOrganDonor;
    if(document.getElementById("labelMedicine")) document.getElementById("labelMedicine").textContent = t.labelMedicine;
    if(document.getElementById("labelAsthma")) document.getElementById("labelAsthma").textContent = t.labelAsthma;
    if(document.getElementById("labelSmoke")) document.getElementById("labelSmoke").textContent = t.labelSmoke;
    if(document.getElementById("labelEpilepsy")) document.getElementById("labelEpilepsy").textContent = t.labelEpilepsy;
    if(document.getElementById("labelNotes")) document.getElementById("labelNotes").textContent = t.labelNotes;
    if(document.getElementById("labelEmergency")) document.getElementById("labelEmergency").textContent = t.labelEmergency;
    if(document.getElementById("confirmBtn")) document.getElementById("confirmBtn").textContent = t.confirmBtn;
    if(document.getElementById("deleteModalText")) document.getElementById("deleteModalText").textContent = t.deleteModalText;
    if(document.getElementById("cancelDelete")) document.getElementById("cancelDelete").textContent = t.cancelDelete;
    if(document.getElementById("confirmDelete")) document.getElementById("confirmDelete").textContent = t.confirmDelete;
    if(document.getElementById("navHomeText")) document.getElementById("navHomeText").textContent = t.navHome;
    if(document.getElementById("navProfileText")) document.getElementById("navProfileText").textContent = t.navProfile;

    // Placeholders
    if(document.getElementById("name")) document.getElementById("name").placeholder = t.placeholderName;
    if(document.getElementById("age")) document.getElementById("age").placeholder = t.placeholderAge;
    if(document.getElementById("allergies")) document.getElementById("allergies").placeholder = t.placeholderAllergies;
    if(document.getElementById("medicine")) document.getElementById("medicine").placeholder = t.placeholderMedicine;
    if(document.getElementById("notes")) document.getElementById("notes").placeholder = t.placeholderNotes;
    if(document.getElementById("emergencyContact")) document.getElementById("emergencyContact").placeholder = t.placeholderEmergency;
    if(document.getElementById("smokeFrequency")) document.getElementById("smokeFrequency").placeholder = t.placeholderSmokeFreq;

    // Options
    const optionsMap = {
      "No": t.optNo, "Yes": t.optYes,
      "Type 1": t.optType1, "Type 2": t.optType2, "Gestational": t.optGestational,
      "Mild": t.optMild, "Moderate": t.optModerate, "Severe": t.optSevere,
      "Self": t.optSelf, "Family Member": t.optFamily,
      "Focal": t.optFocal, "Generalized": t.optGeneralized, "Unknown": t.optUnknown
    };

    document.querySelectorAll("select option").forEach(opt => {
      if (optionsMap[opt.value]) {
        opt.textContent = optionsMap[opt.value];
      }
    });

    if(document.documentElement) document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  // --- FAB MENU TOGGLE ---
  if(fabBtn) {
    fabBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      fabMenu.classList.toggle("active");
    });
  }

  document.addEventListener("click", (e) => {
    if (fabMenu && fabMenu.classList.contains("active") && !fabMenu.contains(e.target) && !fabBtn.contains(e.target)) {
      fabMenu.classList.remove("active");
    }
  });

});