document.addEventListener("DOMContentLoaded", () => {

    const startBtn = document.getElementById("startBtn");
    const continueBtn = document.getElementById("continueBtn");
    const lastNameText = document.getElementById("lastNameText");
  
    // Only require essential elements
    if (!startBtn || !continueBtn) return;
  
    // CREATE NEW PROFILE -> clear old data
    startBtn.addEventListener("click", () => {
      localStorage.removeItem("lastMedicalID");
      localStorage.removeItem("lastMedicalName");
      window.location.href = "pages/form.html";
    });
  
    // LOAD SAVED DATA
    const lastID = localStorage.getItem("lastMedicalID");
    const lastName = localStorage.getItem("lastMedicalName");
  
    // CONTINUE BUTTON
    if (!lastID) {
      continueBtn.style.display = "none";
    } else {
      continueBtn.style.display = "block";
  
      continueBtn.addEventListener("click", () => {
        window.location.href = "pages/form.html";
      });
    }
  
    // LAST NAME TEXT
    if (lastNameText) {
      lastNameText.style.display = "none";
    }
  
  // --- THEME LOGIC FOR HOME SCREEN LOGOS ---
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDarkMode = localStorage.getItem("theme") === "dark" || (!localStorage.getItem("theme") && prefersDark);
  
  const navLogo = document.getElementById("navLogo");
  const homeLogo = document.getElementById("homeLogo");

  if (isDarkMode) {
    document.body.classList.add("dark-theme");
    document.body.classList.remove("light-theme");
    if (navLogo) navLogo.src = "imgs/logo-light.png";
    if (homeLogo) homeLogo.src = "imgs/logo-light.png";
  } else {
    document.body.classList.add("light-theme");
    document.body.classList.remove("dark-theme");
    if (navLogo) navLogo.src = "imgs/logo-dark.png";
    if (homeLogo) homeLogo.src = "imgs/logo-dark.png";
  }

  // --- LANGUAGE LOGIC FOR HOME SCREEN ---
  const systemLang = (navigator.language || 'en').split('-')[0];
  const defaultLang = ['en', 'fr', 'es', 'ar'].includes(systemLang) ? systemLang : 'en';
  const savedLang = localStorage.getItem("language") || defaultLang;

  function updateTextForLanguage(lang) {
    const translations = {
      en: {
        navHome: "Home", navProfile: "Create Profile",
        homeTitle: "Medical QR",
        homeSubtitle: "Your emergency medical profile",
        startBtn: "Create New QR",
        continueBtnText: "Continue Last Profile",
        continueAs: "Continue as",
        homeTrustText: "Your data is private and securely stored",
        homeCreditsText: "Designed & Developed by Hannah"
      },
      fr: {
        navHome: "Accueil", navProfile: "Créer un profil",
        homeTitle: "QR Médical",
        homeSubtitle: "Votre profil médical d'urgence",
        startBtn: "Créer un nouveau QR",
        continueBtnText: "Continuer le dernier profil",
        continueAs: "Continuer en tant que",
        homeTrustText: "Vos données sont privées et stockées en toute sécurité",
        homeCreditsText: "Conçu et développé par Hannah"
      },
      es: {
        navHome: "Inicio", navProfile: "Crear perfil",
        homeTitle: "QR Médico",
        homeSubtitle: "Tu perfil médico de emergencia",
        startBtn: "Crear Nuevo QR",
        continueBtnText: "Continuar último perfil",
        continueAs: "Continuar como",
        homeTrustText: "Tus datos son privados y están almacenados de forma segura",
        homeCreditsText: "Diseñado y desarrollado por Hannah"
      },
      ar: {
        navHome: "الرئيسية", navProfile: "إنشاء ملف",
        homeTitle: "رمز الاستجابة الطبية",
        homeSubtitle: "ملفك الطبي للطوارئ",
        startBtn: "إنشاء رمز جديد",
        continueBtnText: "متابعة الملف الأخير",
        continueAs: "متابعة باسم",
        homeTrustText: "بياناتك خاصة ومخزنة بأمان",
        homeCreditsText: "تصميم وتطوير هانا"
      }
    };
    
    const t = translations[lang] || translations.en;
    
    if(document.getElementById("navHomeText")) document.getElementById("navHomeText").textContent = t.navHome;
    if(document.getElementById("navProfileText")) document.getElementById("navProfileText").textContent = t.navProfile;
    if(document.getElementById("homeTitle")) document.getElementById("homeTitle").textContent = t.homeTitle;
    if(document.getElementById("homeSubtitle")) document.getElementById("homeSubtitle").textContent = t.homeSubtitle;
    if(document.getElementById("startBtn")) document.getElementById("startBtn").textContent = t.startBtn;
    if(document.getElementById("continueBtn")) {
      if (lastID && lastName) {
        document.getElementById("continueBtn").textContent = `${t.continueAs} ${lastName}`;
      } else {
        document.getElementById("continueBtn").textContent = t.continueBtnText;
      }
    }
    if(document.getElementById("homeTrustText")) document.getElementById("homeTrustText").textContent = t.homeTrustText;
    if(document.getElementById("homeCreditsText")) document.getElementById("homeCreditsText").textContent = t.homeCreditsText;

    if(lastNameText) {
      lastNameText.style.display = "none";
    }

    if(document.documentElement) document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  updateTextForLanguage(savedLang);
});