(() => {
  'use strict';

  const VERSION = 'Demo v3.2';
  const DRAFT_KEY = 'ssp_sales_demo_v32';
  const $ = id => document.getElementById(id);
  const all = selector => Array.from(document.querySelectorAll(selector));

  const stages = [
    {
      tab: 'customer',
      title: 'Customer priorities',
      kicker: 'Start with what matters',
      heading: 'Understand the customer before designing the system.',
      copy: 'Capture goals, timing and concerns so the final recommendation feels considered rather than generic.',
      bullets: ['Decision makers and priorities', 'Current concern and reason for acting', 'Clear expectations for the next step'],
      facts: [['Primary goal', 'Lower bills and greater independence'], ['Typical usage', '15.2 kWh per day'], ['Next decision', 'Solar, battery and EV readiness']]
    },
    {
      tab: 'usage',
      title: 'Energy and usage',
      kicker: 'Confirm real demand',
      heading: 'Turn bills and tariffs into a useful energy profile.',
      copy: 'Annual usage, timing and tariff data guide storage and help explain why the system has been sized this way.',
      bullets: ['Annual and daily energy use', 'Peak and off-peak tariff context', 'EV, heat-pump and evening-load flags'],
      facts: [['Annual usage', '5,550 kWh'], ['Tariff pattern', 'Day and off-peak'], ['Design signal', 'High evening use']]
    },
    {
      tab: 'site',
      title: 'Site walkthrough',
      kicker: 'Capture the practical route',
      heading: 'Keep every photo, measurement and install note together.',
      copy: 'The survey records the roof, electrical setup, equipment location, cable route and access before proposal handover.',
      bullets: ['Categorised evidence gallery', 'Roof dimensions and panel fit', 'Electrical, route and access notes'],
      facts: [['Roof evidence', 'Captured'], ['Cable route', 'Discussed'], ['Access check', 'Ready for design']]
    },
    {
      tab: 'build',
      title: 'Design and sizing',
      kicker: 'Right-size with confidence',
      heading: 'Connect the customer need, roof fit and system choice.',
      copy: 'Panel count, storage and extras are checked in one place, with an illustrative total for the public demonstration.',
      bullets: ['Roof-led panel suggestion', 'Battery configuration guide', 'Clear inclusions and assumptions'],
      facts: [['Solar array', '5.94 kWp'], ['Storage route', 'Modular battery'], ['Commercial view', 'Illustrative only']]
    },
    {
      tab: 'present',
      title: 'Customer proposal',
      kicker: 'Explain the recommendation',
      heading: 'Present one clear story instead of a technical data dump.',
      copy: 'The customer sees what was understood, what was checked, why the system fits and what happens next.',
      bullets: ['Customer priorities reflected back', 'System and value explained clearly', 'Professional recommendation view'],
      facts: [['Recommendation', 'Customer-ready'], ['Design confidence', 'Visible'], ['Next step', 'Easy to understand']]
    },
    {
      tab: 'agreement',
      title: 'Acceptance and handover',
      kicker: 'Move forward cleanly',
      heading: 'Capture the next step and produce the complete survey pack.',
      copy: 'Acceptance, signature, recommendation, evidence and handover notes can leave the visit as one organised package.',
      bullets: ['Simple next-step choice', 'Survey acceptance and signature', 'Proposal, CRM notes and export pack'],
      facts: [['Acceptance', 'Recorded'], ['Handover', 'Structured'], ['Survey pack', 'Ready to export']]
    }
  ];

  const sample = {
    customerName: 'Sample household',
    surveyDate: new Date().toISOString().slice(0, 10),
    address: 'Illustrative property, Demo Town',
    wants: 'Lower bills, battery tariff use and a clear next step after survey.',
    whyNow: 'Energy use has increased and the household wants a confident plan before adding an EV.',
    decisionMakers: 'Household decision makers',
    competitors: 'One online comparison',
    annualKwh: '5550',
    dailyKwh: '15.2',
    tariff: 'Illustrative day and off-peak tariff',
    peak: '28',
    offpeak: '7',
    annualSpend: '1550',
    exportRate: '15',
    solarSelfUsePct: '75',
    panelModel: 'AIKO 495W|495|1762 x 1134 x 30 mm|20.6 kg',
    panelCount: '12',
    framingSelection: 'Plain Tile',
    batteryBrand: 'Sigenergy',
    sig10Qty: '1',
    sig6Qty: '1',
    sigInstallType: 'solarBattery',
    sigControllerMode: 'auto',
    scaffoldLifts: '2',
    zappiPrice: '1000',
    eddiPrice: '600',
    roof: 'Main roof with good solar access. Plain tile assumed for the demonstration.',
    dims: 'Dimensions captured on site. Final layout remains subject to design checks.',
    shade: 'Minor morning shade noted for the demonstration.',
    batteryLoc: 'Garage wall near the consumer unit.',
    meter: 'Meter and consumer unit accessible in the garage.',
    cable: 'Preferred route through the garage and loft void.',
    access: 'Front scaffold access assumed with parking available.',
    nextAction: 'Prepare formal quote'
  };

  const sampleChecks = ['solar', 'battery', 'ev', 'eddi', 'bird', 'spds', 'sigGateway'];
  let currentStage = 0;
  let saveTimer = null;
  let signatureDrawn = false;

  function showToast(message) {
    let toast = $('demoToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'demoToast';
      toast.className = 'demoToast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('on');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('on'), 1800);
  }

  function updateHeader() {
    const name = ($('customerName')?.value || '').trim();
    const address = ($('address')?.value || '').trim();
    if ($('headerContact')) $('headerContact').textContent = name ? `${name}${address ? ` | ${address}` : ''}` : 'No survey loaded';
  }

  function activateTab(tabId, options = {}) {
    all('nav button[data-tab]').forEach(button => button.classList.toggle('on', button.dataset.tab === tabId));
    all('main > section.panel').forEach(panel => panel.classList.toggle('on', panel.id === tabId));
    if (tabId === 'present' || tabId === 'agreement') renderDemoOutputs();
    try {
      history.replaceState(null, '', `${location.pathname}${location.search}${tabId === 'home' ? '' : `#${tabId}`}`);
    } catch (_) {}
    if (options.scroll !== false) window.scrollTo(0, 0);
  }

  function setPresentationMode(enabled) {
    const button = $('presentationMode');
    document.body.classList.toggle('presentationActive', enabled);
    if (!button) return;
    button.setAttribute('aria-pressed', String(enabled));
    const status = button.querySelector('strong');
    if (status) status.textContent = enabled ? 'On' : 'Off';
  }

  function renderTour(index) {
    currentStage = Math.max(0, Math.min(stages.length - 1, index));
    const stage = stages[currentStage];
    all('.tourStage').forEach((button, i) => {
      const active = i === currentStage;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    if ($('tourProgressLabel')) $('tourProgressLabel').textContent = `Step ${currentStage + 1} of ${stages.length}`;
    if ($('tourStepPill')) $('tourStepPill').textContent = `Step ${currentStage + 1} of ${stages.length}`;
    if ($('tourPreviewTitle')) $('tourPreviewTitle').textContent = stage.title;
    if ($('tourPreviewBody')) {
      $('tourPreviewBody').innerHTML = `
        <div class="tourPreviewCopy">
          <span class="tourPreviewKicker">${stage.kicker}</span>
          <h3>${stage.heading}</h3>
          <p>${stage.copy}</p>
          <ul>${stage.bullets.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="tourSamplePanel">
          <span>Illustrative demo profile</span>
          <b>Sample household</b>
          <dl>${stage.facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>
        </div>`;
    }
  }

  function fillSample() {
    Object.entries(sample).forEach(([id, value]) => {
      const element = $(id);
      if (element) element.value = value;
    });
    all('input[type="checkbox"]').forEach(element => {
      if (sampleChecks.includes(element.id)) element.checked = true;
    });
    updateHeader();
    renderDemoOutputs();
    queueSave();
  }

  function renderDemoOutputs() {
    if ($('consultationProof')) $('consultationProof').innerHTML = `
      <div><span>1</span><b>Understood</b><small>Lower bills, tariff use and EV readiness</small></div>
      <div><span>2</span><b>Checked</b><small>Roof, route and access captured</small></div>
      <div><span>3</span><b>Right-sized</b><small>12 panels with modular storage</small></div>
      <div><span>4</span><b>Protected</b><small>Formal design checks remain clear</small></div>`;
    if ($('customerStoryCard')) $('customerStoryCard').innerHTML = '<span class="smallCaps">Customer priorities</span><h3>Lower bills now, with room for an EV later.</h3><p>The recommendation connects evening use, the off-peak tariff and future plans to one clear system route.</p>';
    if ($('designConfidenceCard')) $('designConfidenceCard').innerHTML = '<span class="smallCaps">Survey confidence</span><h3>Evidence captured before handover.</h3><p>Roof fit, equipment location, cable route and access notes stay with the recommendation.</p>';
    if ($('presentVisuals')) $('presentVisuals').innerHTML = `
      <div class="visualCard"><h3>Illustrative solar design</h3><div class="bigMetric">5.94 kWp</div><div class="metricLabel">12 x 495W high-efficiency panels</div></div>
      <div class="visualCard"><h3>Storage route</h3><div class="bigMetric">15.06 kWh</div><div class="metricLabel">Modular battery capacity for evening and tariff use</div></div>`;
    if ($('batteryImagePanel')) $('batteryImagePanel').innerHTML = `
      <div class="productHero"><img alt="Illustrative modular home battery" src="sigenergy-battery.webp"/>
      <div><span class="brandPill sigPill">Modular storage</span><h3>Designed around the household</h3><p>Illustrative public-demo configuration. Final equipment and price remain subject to formal design.</p></div></div>`;
    if ($('paybackSummary')) $('paybackSummary').innerHTML = '<div class="paybackCard"><span class="smallCaps">Commercial view</span><b>Clear value story</b><p>The public demo intentionally avoids production pricing. Approved commercial data can be connected privately.</p></div>';
    if ($('whyThisSystem')) $('whyThisSystem').innerHTML = '<h3>Why this system fits</h3><p>It balances roof capacity, evening demand, tariff opportunity and future EV readiness without turning the customer conversation into a technical data dump.</p>';
    if ($('presentSummary')) $('presentSummary').innerHTML = '<b>Recommendation summary</b><br>12-panel solar array with modular storage, bird protection and electrical protection included for illustration.<br><br><b>Next step</b><br>Confirm final design, formal pricing and installation checks.';
    if ($('customerAgreementSummary')) $('customerAgreementSummary').innerHTML = '<b>Illustrative survey summary</b><br>Customer priorities, energy profile, site evidence and the recommended system route are ready to be formalised into a quote.';
    if ($('quoteCheck')) $('quoteCheck').innerHTML = '<div class="quoteGood"><b>Illustrative demo ready</b><br>12 panels | 5.94 kWp | modular storage | customer-ready recommendation</div>';
  }

  function draftData() {
    const data = {};
    all('input[id], textarea[id], select[id]').forEach(element => {
      if (element.type === 'file') return;
      data[element.id] = element.type === 'checkbox' ? element.checked : element.value;
    });
    return data;
  }

  function saveDraft() {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData()));
      showToast('Demo saved on this device');
    } catch (_) {
      showToast('Demo is ready');
    }
  }

  function queueSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData())); } catch (_) {}
    }, 250);
  }

  function loadDraft() {
    try {
      const data = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
      Object.entries(data).forEach(([id, value]) => {
        const element = $(id);
        if (!element) return;
        if (element.type === 'checkbox') element.checked = Boolean(value);
        else element.value = value;
      });
    } catch (_) {}
    updateHeader();
  }

  function resetSurvey() {
    all('input[id], textarea[id], select[id]').forEach(element => {
      if (element.type === 'checkbox') element.checked = false;
      else if (!['surveyDate'].includes(element.id)) element.value = '';
    });
    try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
    signatureDrawn = false;
    clearSignature();
    updateHeader();
    showToast('Blank survey ready');
  }

  function download(name, text, type = 'text/plain') {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type }));
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function initSignature() {
    const canvas = $('signatureCanvas');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.strokeStyle = '#062819';
    let drawing = false;
    const point = event => {
      const rect = canvas.getBoundingClientRect();
      const source = event.touches?.[0] || event;
      return {
        x: (source.clientX - rect.left) * (canvas.width / rect.width),
        y: (source.clientY - rect.top) * (canvas.height / rect.height)
      };
    };
    const start = event => {
      event.preventDefault();
      drawing = true;
      signatureDrawn = true;
      const p = point(event);
      context.beginPath();
      context.moveTo(p.x, p.y);
    };
    const move = event => {
      if (!drawing) return;
      event.preventDefault();
      const p = point(event);
      context.lineTo(p.x, p.y);
      context.stroke();
    };
    const end = () => { drawing = false; };
    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
  }

  function clearSignature() {
    const canvas = $('signatureCanvas');
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    signatureDrawn = false;
  }

  function bind() {
    document.body.classList.add('demoV3');
    if ($('homeVersionSmall')) $('homeVersionSmall').textContent = VERSION;
    if ($('appVersionBadge')) $('appVersionBadge').textContent = `App version: ${VERSION}`;
    loadDraft();
    renderTour(0);
    renderDemoOutputs();
    setPresentationMode(true);
    initSignature();

    all('nav button[data-tab]').forEach(button => button.addEventListener('click', () => activateTab(button.dataset.tab)));
    all('.journeyStep[data-jump]').forEach(button => button.addEventListener('click', () => activateTab(button.dataset.jump)));
    all('.continueBtn[data-next]').forEach(button => button.addEventListener('click', () => activateTab(button.dataset.next)));
    all('.tourStage').forEach((button, index) => button.addEventListener('click', () => renderTour(index)));
    all('[data-output-tab]').forEach(button => button.addEventListener('click', () => {
      fillSample();
      activateTab(button.dataset.outputTab);
    }));

    $('presentationMode')?.addEventListener('click', event => {
      event.preventDefault();
      setPresentationMode($('presentationMode').getAttribute('aria-pressed') !== 'true');
    });
    $('loadDemoCustomer')?.addEventListener('click', event => {
      event.preventDefault();
      renderTour(0);
      document.querySelector('.tourWorkspace')?.scrollIntoView({ block: 'start' });
    });
    $('homeNewSurvey')?.addEventListener('click', event => {
      event.preventDefault();
      fillSample();
      activateTab('customer');
    });
    $('tourOpenStage')?.addEventListener('click', () => {
      fillSample();
      activateTab(stages[currentStage].tab);
    });

    all('input[id], textarea[id], select[id]').forEach(element => {
      element.addEventListener('input', () => {
        updateHeader();
        queueSave();
      });
      element.addEventListener('change', queueSave);
    });

    all('.chips[data-target] button').forEach(button => button.addEventListener('click', () => {
      const target = $(button.closest('.chips').dataset.target);
      if (target) target.value = target.value ? `${target.value}, ${button.textContent}` : button.textContent;
      queueSave();
    }));

    $('calculateQuote')?.addEventListener('click', renderDemoOutputs);
    $('refreshPresent')?.addEventListener('click', renderDemoOutputs);
    $('saveSurvey')?.addEventListener('click', saveDraft);
    $('homeSaveCurrent')?.addEventListener('click', saveDraft);
    $('saveAndNew')?.addEventListener('click', () => { saveDraft(); resetSurvey(); activateTab('customer'); });
    $('reset')?.addEventListener('click', resetSurvey);
    $('newSurveyTop')?.addEventListener('click', () => { resetSurvey(); activateTab('customer'); });
    $('clearSignature')?.addEventListener('click', clearSignature);

    all('#likelihoodButtons button[data-likelihood]').forEach(button => button.addEventListener('click', () => {
      all('#likelihoodButtons button').forEach(item => item.classList.toggle('on', item === button));
      if ($('customerLikelihood')) $('customerLikelihood').value = button.dataset.likelihood;
      if ($('blockerPrompt')) $('blockerPrompt').textContent = button.dataset.likelihood;
    }));

    $('stampAccept')?.addEventListener('click', () => {
      if (!signatureDrawn) {
        showToast('Add a signature first');
        return;
      }
      const name = $('customerName')?.value || 'Sample household';
      if ($('acceptanceStamp')) $('acceptanceStamp').textContent = `${name} accepted the illustrative survey guidance on ${new Date().toLocaleDateString('en-GB')}.`;
      saveDraft();
    });

    $('json')?.addEventListener('click', () => download('solar-survey-demo.json', JSON.stringify(draftData(), null, 2), 'application/json'));
    $('txt')?.addEventListener('click', () => download('solar-survey-demo.txt', $('presentSummary')?.innerText || 'Solar Survey Pro demo'));
    $('brief')?.addEventListener('click', () => download('solar-survey-demo-brief.txt', `${$('customerName')?.value || 'Sample household'}\n${$('presentSummary')?.innerText || ''}`));
    $('copy')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText($('presentSummary')?.innerText || 'Solar Survey Pro demo');
        showToast('Customer pack copied');
      } catch (_) {
        showToast('Customer pack ready');
      }
    });
    $('updateApp')?.addEventListener('click', async () => {
      try {
        const registrations = await navigator.serviceWorker?.getRegistrations();
        await Promise.all((registrations || []).map(registration => registration.update()));
      } catch (_) {}
      location.reload();
    });

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
    try { history.scrollRestoration = 'manual'; } catch (_) {}
    window.scrollTo(0, 0);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})();
