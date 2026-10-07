/* ==========================================================================
   Quick Dry Carpets — Interactive Controller (index.js)
   Handles Calculator, 10-Minute Test Simulator, Booking Wizard, FAQ & UI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileDrawer();
  initEstimator();
  initDemoModal();
  initBookingWizard();
  initReviewTabs();
  initFaqAccordion();
});

/* ==========================================================================
   1. Sticky Header & Mobile Drawer
   ========================================================================== */

function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const drawer = document.getElementById('mobileDrawer');
  const closeBtn = document.getElementById('mobileDrawerCloseBtn');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link');
  const drawerActions = drawer ? drawer.querySelectorAll('.mobile-drawer-actions a, .mobile-drawer-actions button') : [];

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  drawerActions.forEach(el => {
    el.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   2. Instant Quote & Booking Estimator
   ========================================================================== */

let estimatorState = {
  serviceType: 'residential', // 'residential' | 'commercial'
  roomCount: 2,
  carpetType: 'plush', // 'plush' (1.0), 'wool' (1.25), 'commercial' (1.1), 'oriental' (1.35)
  addons: {
    pet: false,
    woolGuard: false,
    deodorize: false
  }
};

const pricingConfig = {
  residential: {
    basePerRoom: 45,
    minPrice: 90
  },
  commercial: {
    basePerRoom: 65,
    minPrice: 150
  },
  carpetMultipliers: {
    plush: 1.0,
    wool: 1.25,
    commercial: 1.1,
    oriental: 1.35
  },
  addonPrices: {
    pet: 39,
    woolGuard: 29,
    deodorize: 19
  }
};

function initEstimator() {
  const serviceToggleBtns = document.querySelectorAll('.service-toggle-btn');
  const roomBtns = document.querySelectorAll('.room-btn');
  const carpetSelect = document.getElementById('carpetTypeSelect');
  const addonCheckboxes = document.querySelectorAll('.addon-checkbox');
  const lockInBtn = document.getElementById('estimatorLockInBtn');

  // Service Type toggles
  serviceToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      serviceToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      estimatorState.serviceType = btn.dataset.service;
      recalculateEstimate();
    });
  });

  // Room count buttons
  roomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roomBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      estimatorState.roomCount = parseInt(btn.dataset.rooms, 10);
      recalculateEstimate();
    });
  });

  // Carpet type
  if (carpetSelect) {
    carpetSelect.addEventListener('change', (e) => {
      estimatorState.carpetType = e.target.value;
      recalculateEstimate();
    });
  }

  // Addons
  addonCheckboxes.forEach(chk => {
    chk.addEventListener('change', (e) => {
      const addonKey = e.target.dataset.addon;
      estimatorState.addons[addonKey] = e.target.checked;
      const parentLabel = e.target.closest('.addon-checkbox-label');
      if (parentLabel) {
        if (e.target.checked) {
          parentLabel.classList.add('checked');
        } else {
          parentLabel.classList.remove('checked');
        }
      }
      recalculateEstimate();
    });
  });

  // Lock In Appointment Button
  if (lockInBtn) {
    lockInBtn.addEventListener('click', () => {
      openBookingModal(getEstimatorSummary());
    });
  }

  recalculateEstimate();
}

function recalculateEstimate() {
  const cfg = pricingConfig[estimatorState.serviceType];
  const multiplier = pricingConfig.carpetMultipliers[estimatorState.carpetType] || 1.0;

  let baseRoomsCost = estimatorState.roomCount * cfg.basePerRoom * multiplier;
  if (baseRoomsCost < cfg.minPrice) baseRoomsCost = cfg.minPrice;

  let addonsTotal = 0;
  if (estimatorState.addons.pet) addonsTotal += pricingConfig.addonPrices.pet;
  if (estimatorState.addons.woolGuard) addonsTotal += pricingConfig.addonPrices.woolGuard;
  if (estimatorState.addons.deodorize) addonsTotal += pricingConfig.addonPrices.deodorize;

  const totalEstimate = Math.round(baseRoomsCost + addonsTotal);

  // Update DOM elements
  const totalAmountEl = document.getElementById('calcTotalAmount');
  const serviceSummaryEl = document.getElementById('calcServiceSummary');
  const roomCountSummaryEl = document.getElementById('calcRoomsSummary');
  const durationSummaryEl = document.getElementById('calcDurationSummary');

  if (totalAmountEl) {
    totalAmountEl.innerHTML = `$${totalEstimate} <span>USD</span>`;
  }

  if (serviceSummaryEl) {
    serviceSummaryEl.textContent = estimatorState.serviceType === 'residential' ? 'Residential Deep Dry' : 'Commercial Facility Dry';
  }

  if (roomCountSummaryEl) {
    const label = estimatorState.roomCount >= 5 ? '5+ Rooms / Whole Floor' : `${estimatorState.roomCount} Area(s)`;
    roomCountSummaryEl.textContent = label;
  }

  if (durationSummaryEl) {
    const estTimeMinutes = 25 + (estimatorState.roomCount * 12);
    durationSummaryEl.textContent = `~${estTimeMinutes} mins (Dry in < 10m)`;
  }
}

function getEstimatorSummary() {
  const cfg = pricingConfig[estimatorState.serviceType];
  const multiplier = pricingConfig.carpetMultipliers[estimatorState.carpetType] || 1.0;
  let baseRoomsCost = estimatorState.roomCount * cfg.basePerRoom * multiplier;
  if (baseRoomsCost < cfg.minPrice) baseRoomsCost = cfg.minPrice;

  let addonsTotal = 0;
  if (estimatorState.addons.pet) addonsTotal += pricingConfig.addonPrices.pet;
  if (estimatorState.addons.woolGuard) addonsTotal += pricingConfig.addonPrices.woolGuard;
  if (estimatorState.addons.deodorize) addonsTotal += pricingConfig.addonPrices.deodorize;

  const total = Math.round(baseRoomsCost + addonsTotal);

  return {
    serviceType: estimatorState.serviceType === 'residential' ? 'Residential Deep Dry' : 'Commercial Facility Dry',
    roomCount: estimatorState.roomCount,
    carpetType: estimatorState.carpetType,
    totalPrice: total
  };
}

/* ==========================================================================
   3. "See the 10-Minute Test" Interactive Simulator Modal
   ========================================================================== */

let demoInterval = null;
let demoSeconds = 0;

function initDemoModal() {
  const triggerBtns = document.querySelectorAll('.open-demo-modal');
  const modal = document.getElementById('demoModal');
  const closeBtn = document.getElementById('demoModalCloseBtn');
  const startSimulationBtn = document.getElementById('demoStartBtn');
  const paperTowelTestBtn = document.getElementById('paperTowelTestBtn');
  const paperTowelVisual = document.getElementById('paperTowelVisual');
  const testResultText = document.getElementById('towelTestResult');

  if (!modal) return;

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      resetDemoSimulation();
      runDemoSimulation();
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    clearInterval(demoInterval);
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (startSimulationBtn) {
    startSimulationBtn.addEventListener('click', () => {
      resetDemoSimulation();
      runDemoSimulation();
    });
  }

  if (paperTowelTestBtn && paperTowelVisual) {
    paperTowelTestBtn.addEventListener('click', () => {
      paperTowelVisual.classList.add('pressed');
      paperTowelVisual.textContent = 'PRESSING FIBERS...';
      
      setTimeout(() => {
        paperTowelVisual.classList.remove('pressed');
        paperTowelVisual.style.backgroundColor = '#FFFFFF';
        paperTowelVisual.innerHTML = '✨ 100% BONE DRY<br><span style="font-size:0.65rem; color:#1898A8; font-weight:600;">0.0% Moisture Transfer</span>';
        if (testResultText) {
          testResultText.innerHTML = '<strong style="color:#64CAD4;">VERIFIED:</strong> Clean, dry paper towel pressed with 25 lbs pressure has 0% water transfer. Safe to walk immediately!';
        }
        showToast('Paper Towel Test Passed: 0.0% Moisture detected!');
      }, 900);
    });
  }
}

function resetDemoSimulation() {
  clearInterval(demoInterval);
  demoSeconds = 0;
  updateDemoStopwatch(0);
  const stepChips = document.querySelectorAll('.demo-step-chip');
  stepChips.forEach(chip => chip.classList.remove('active'));
  if (stepChips[0]) stepChips[0].classList.add('active');
  
  const moistureMeter = document.getElementById('demoMoistureMeter');
  if (moistureMeter) moistureMeter.textContent = '4.2%';
}

function runDemoSimulation() {
  const stopwatch = document.getElementById('demoStopwatch');
  const moistureMeter = document.getElementById('demoMoistureMeter');
  const stepChips = document.querySelectorAll('.demo-step-chip');

  // Accelerate 10 minutes (600 seconds) into 10 seconds of high-impact visual demonstration
  demoInterval = setInterval(() => {
    demoSeconds += 60; // advances 1 minute per tick
    updateDemoStopwatch(demoSeconds);

    const minutes = Math.floor(demoSeconds / 60);

    // Update active phase chip
    stepChips.forEach(c => c.classList.remove('active'));
    if (minutes <= 2) {
      if (stepChips[0]) stepChips[0].classList.add('active');
      if (moistureMeter) moistureMeter.textContent = '3.8% (Targeted Bio-Mist)';
    } else if (minutes <= 5) {
      if (stepChips[1]) stepChips[1].classList.add('active');
      if (moistureMeter) moistureMeter.textContent = '2.1% (Orbital Brushing)';
    } else if (minutes <= 8) {
      if (stepChips[2]) stepChips[2].classList.add('active');
      if (moistureMeter) moistureMeter.textContent = '0.7% (Micro-Crystal Bond)';
    } else {
      if (stepChips[3]) stepChips[3].classList.add('active');
      if (moistureMeter) moistureMeter.textContent = '0.1% (Fully Dry & Walkable)';
    }

    if (demoSeconds >= 600) {
      clearInterval(demoInterval);
      if (moistureMeter) moistureMeter.innerHTML = '<span style="color:#64CAD4; font-weight:800;">0.0% (Walkable Now)</span>';
      showToast('10-Minute Dry Technology Cycle Complete!');
    }
  }, 1000);
}

function updateDemoStopwatch(seconds) {
  const stopwatch = document.getElementById('demoStopwatch');
  if (!stopwatch) return;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  stopwatch.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/* ==========================================================================
   4. Online Booking Wizard Modal
   ========================================================================== */

let bookingWizardCurrentStep = 1;

function initBookingWizard() {
  const triggerBtns = document.querySelectorAll('.open-booking-modal');
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('bookingModalCloseBtn');
  const nextStepBtn = document.getElementById('bookingNextBtn');
  const prevStepBtn = document.getElementById('bookingPrevBtn');
  const confirmBtn = document.getElementById('bookingConfirmBtn');
  const form = document.getElementById('bookingForm');

  if (!modal) return;

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal(getEstimatorSummary());
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      if (validateStep(bookingWizardCurrentStep)) {
        goToBookingStep(bookingWizardCurrentStep + 1);
      }
    });
  }

  if (prevStepBtn) {
    prevStepBtn.addEventListener('click', () => {
      goToBookingStep(bookingWizardCurrentStep - 1);
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (validateStep(bookingWizardCurrentStep)) {
        processBookingConfirmation();
      }
    });
  }
}

function openBookingModal(data) {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Sync prefilled data
  const summaryService = document.getElementById('wizardSummaryService');
  const summaryPrice = document.getElementById('wizardSummaryPrice');
  if (summaryService && data) summaryService.textContent = `${data.serviceType} (${data.roomCount} Rooms)`;
  // Set default tomorrow date if empty
  const dateInput = document.getElementById('bookingDate');
  if (dateInput && !dateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  goToBookingStep(1);
}

function goToBookingStep(step) {
  bookingWizardCurrentStep = step;

  // Step Indicators
  const stepIndicators = document.querySelectorAll('.step-indicator-item');
  stepIndicators.forEach((el, index) => {
    if (index + 1 === step) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Panes
  const panes = document.querySelectorAll('.booking-step-pane');
  panes.forEach(pane => {
    if (parseInt(pane.dataset.step, 10) === step) {
      pane.style.display = 'block';
    } else {
      pane.style.display = 'none';
    }
  });

  // Controls
  const prevBtn = document.getElementById('bookingPrevBtn');
  const nextBtn = document.getElementById('bookingNextBtn');
  const confirmBtn = document.getElementById('bookingConfirmBtn');

  if (prevBtn) prevBtn.style.display = step > 1 && step < 4 ? 'inline-flex' : 'none';
  if (nextBtn) nextBtn.style.display = step < 3 ? 'inline-flex' : 'none';
  if (confirmBtn) confirmBtn.style.display = step === 3 ? 'inline-flex' : 'none';
}

function validateStep(step) {
  if (step === 1) {
    const dateInput = document.getElementById('bookingDate');
    const timeSelect = document.getElementById('bookingTimeSlot');
    if (!dateInput.value) {
      showToast('Please select your preferred appointment date.');
      dateInput.focus();
      return false;
    }
    return true;
  }
  if (step === 2) {
    const nameInput = document.getElementById('bookingName');
    const phoneInput = document.getElementById('bookingPhone');
    const emailInput = document.getElementById('bookingEmail');
    if (!nameInput.value.trim()) {
      showToast('Please enter your full name.');
      nameInput.focus();
      return false;
    }
    if (!phoneInput.value.trim()) {
      showToast('Please provide your contact phone number.');
      phoneInput.focus();
      return false;
    }
    return true;
  }
  return true;
}

function processBookingConfirmation() {
  const confirmationCode = 'QDC-' + Math.floor(100000 + Math.random() * 900000);
  const codeEl = document.getElementById('confirmedRefCode');
  if (codeEl) codeEl.textContent = confirmationCode;

  goToBookingStep(4);
  showToast(`Appointment Confirmed! Reference: ${confirmationCode}`);
}

/* ==========================================================================
   5. Review Tabs & Filtering
   ========================================================================== */

function initReviewTabs() {
  const tabs = document.querySelectorAll('.filter-tab-btn');
  const cards = document.querySelectorAll('.review-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   6. FAQ Accordion
   ========================================================================== */

function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer-pane');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close other items
      items.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          const otherAnswer = otherItem.querySelector('.faq-answer-pane');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   7. Toast Notification Utility
   ========================================================================== */

function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64CAD4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}
