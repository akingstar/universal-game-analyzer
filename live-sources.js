(() => {
  const old = document.getElementById('uga-live-sources');
  if (old) old.remove();

  const section = document.createElement('section');
  section.id = 'uga-live-sources';
  section.style.cssText = 'margin:24px auto;padding:18px;max-width:1000px;background:#111;color:#eee;border:1px solid #444;border-radius:14px;font:14px Arial,sans-serif';

  const heading = document.createElement('h2');
  heading.textContent = 'GAME DATA ANALYZER';
  section.appendChild(heading);

  const note = document.createElement('p');
  note.textContent = 'Historical statistics and source status. No guaranteed predictions.';
  section.appendChild(note);

  const aviator = document.createElement('div');
  aviator.style.cssText = 'padding:14px;margin:12px 0;background:#202020;border-radius:10px';

  const title = document.createElement('h3');
  title.textContent = 'SPRIBE AVIATOR';
  aviator.appendChild(title);

  const warning = document.createElement('p');
  warning.textContent = 'SIMULATED DATA — These are model-based statistics, NOT actual casino round results.';
  warning.style.cssText = 'padding:12px;background:#542d00;color:#ffdc9b;border-radius:8px;font-weight:bold';
  aviator.appendChild(warning);

  const status = document.createElement('p');
  status.textContent = 'Connecting to statistics source...';
  aviator.appendChild(status);

  const stats = document.createElement('div');
  stats.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px';
  aviator.appendChild(stats);

  const details = document.createElement('pre');
  details.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;max-height:260px;overflow:auto;color:#b8e6c1;background:#151515;padding:10px;border-radius:8px';
  aviator.appendChild(details);

  const refresh = document.createElement('button');
  refresh.textContent = 'REFRESH STATISTICS';
  refresh.style.cssText = 'padding:11px 16px;border:0;border-radius:8px;cursor:pointer;font-weight:bold';
  aviator.appendChild(refresh);

  const source = document.createElement('a');
  source.href = 'https://aviatorstats.com/aviator/dataset';
  source.target = '_blank';
  source.rel = 'noopener';
  source.textContent = 'Source: AviatorStats — CC BY 4.0';
  source.style.cssText = 'display:block;margin-top:14px;color:#8fc8ff';
  aviator.appendChild(source);

  section.appendChild(aviator);

  const colours = document.createElement('div');
  colours.style.cssText = 'padding:14px;background:#202020;border-radius:10px';

  const colourTitle = document.createElement('h3');
  colourTitle.textContent = 'COLOUR GAME PLATFORMS';
  colours.appendChild(colourTitle);

  const platforms = [
    'Big Daddy Game', '91 Club', 'Tiranga Games', 'Daman Games',
    'Goa Games', 'OK Win', 'Jalwa Game', 'TC Lottery', 'Dream 99', 'BDG Win'
  ];

  platforms.forEach(name => {
    const p = document.createElement('p');
    p.textContent = name + ' — NO VERIFIED OFFICIAL FREE API';
    p.style.cssText = 'padding:8px;border-bottom:1px solid #444;margin:0;color:#ffcc80';
    colours.appendChild(p);
  });

  const disclaimer = document.createElement('p');
  disclaimer.textContent = 'No real results are available from a verified official feed for these platforms. No invented results or predictions are displayed.';
  colours.appendChild(disclaimer);
  section.appendChild(colours);

  document.body.prepend(section);

  function addCard(label, value) {
    const card = document.createElement('div');
    card.style.cssText = 'padding:12px;background:#292929;border-radius:8px;min-width:0';
    const name = document.createElement('div');
    name.textContent = label;
    name.style.cssText = 'color:#aaa;font-size:12px';
    const val = document.createElement('strong');
    val.textContent = value;
    val.style.cssText = 'display:block;font-size:20px;margin-top:7px;overflow-wrap:anywhere';
    card.append(name, val);
    stats.appendChild(card);
  }

  async function loadAviator() {
    status.textContent = 'Fetching published statistics...';
    refresh.disabled = true;
    stats.replaceChildren();
    details.textContent = '';

    try {
      const response = await fetch(
        'https://aviatorstats.com/api/v1/game.json',
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error('HTTP ' + response.status);

      const data = await response.json();
      const meta = data.meta || {};

      if (meta.source !== 'simulation') {
        throw new Error('Unexpected source type; data not displayed');
      }

      const w = data.windows || {};
      const d = w['7d'] || {};
      const m = w['30d'] || {};
      const n = w['90d'] || {};

      addCard('7 DAY BIG RATE', d.bigRatePct != null ? d.bigRatePct + '%' : 'N/A');
      addCard('7 DAY AVG MULTIPLIER', d.avgMultiplier != null ? d.avgMultiplier + 'x' : 'N/A');
      addCard('7 DAY ROUNDS (MODEL)', d.rounds != null ? Number(d.rounds).toLocaleString() : 'N/A');
      addCard('30 DAY BIG RATE', m.bigRatePct != null ? m.bigRatePct + '%' : 'N/A');
      addCard('90 DAY BIG RATE', n.bigRatePct != null ? n.bigRatePct + '%' : 'N/A');

      const top = data.records && Array.isArray(data.records.top)
        ? data.records.top.slice(0, 10)
        : [];

      const report = {
        source_type: meta.source,
        disclaimer: meta.disclaimer,
        model_version: meta.model_version,
        generated_at: meta.generated_at,
        dataset_last_day: data.last_day,
        theoretical_rtp_pct: data.game && data.game.theoretical_rtp_pct,
        seven_day: d,
        thirty_day: m,
        ninety_day: n,
        sample_records_not_live_rounds: top
      };

      details.textContent = JSON.stringify(report, null, 2);
      status.textContent = 'Statistics loaded • SIMULATION ONLY • Dataset through ' +
        (data.last_day || 'unknown') + ' • Retrieved ' + new Date().toLocaleString();

    } catch (error) {
      status.textContent = 'SOURCE UNAVAILABLE: ' + error.message;
      details.textContent = 'No results displayed. Please try again later.';
    } finally {
      refresh.disabled = false;
    }
  }

  refresh.addEventListener('click', loadAviator);
  loadAviator();
})();
