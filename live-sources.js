(() => {
  const section = document.createElement('section');
  section.id = 'uga-live-sources';
  section.style.cssText = 'margin:24px auto;padding:18px;max-width:1000px;background:#111;color:#eee;border:1px solid #444;border-radius:14px;font:14px Arial,sans-serif';

  const heading = document.createElement('h2');
  heading.textContent = 'LIVE DATA SOURCES';
  section.appendChild(heading);

  const note = document.createElement('p');
  note.textContent = 'Only verified source data is displayed. Historical statistics are not predictions.';
  section.appendChild(note);

  const aviator = document.createElement('div');
  aviator.style.cssText = 'padding:14px;margin:12px 0;background:#202020;border-radius:10px';
  const aviatorTitle = document.createElement('h3');
  aviatorTitle.textContent = 'SPRIBE Aviator — Free public statistics';
  aviator.appendChild(aviatorTitle);

  const status = document.createElement('p');
  status.textContent = 'Connecting…';
  aviator.appendChild(status);

  const output = document.createElement('pre');
  output.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;max-height:380px;overflow:auto;color:#b8e6c1';
  aviator.appendChild(output);

  const sourceLink = document.createElement('a');
  sourceLink.href = 'https://aviatorstats.com/aviator/dataset';
  sourceLink.target = '_blank';
  sourceLink.rel = 'noopener';
  sourceLink.textContent = 'Source: Aviator statistics, aviatorstats.com (CC BY 4.0)';
  sourceLink.style.color = '#8fc8ff';
  aviator.appendChild(sourceLink);

  const refresh = document.createElement('button');
  refresh.textContent = 'Refresh statistics';
  refresh.style.cssText = 'display:block;margin:12px 0;padding:10px 14px;border:0;border-radius:8px;cursor:pointer';
  aviator.appendChild(refresh);

  section.appendChild(aviator);

  const colours = document.createElement('div');
  colours.style.cssText = 'padding:14px;background:#202020;border-radius:10px';
  const colourTitle = document.createElement('h3');
  colourTitle.textContent = 'Colour game platforms';
  colours.appendChild(colourTitle);

  const platforms = [
    'Big Daddy Game', '91 Club', 'Tiranga Games', 'Daman Games',
    'Goa Games', 'OK Win', 'Jalwa Game', 'TC Lottery', 'Dream 99', 'BDG Win'
  ];

  platforms.forEach(name => {
    const p = document.createElement('p');
    p.textContent = name + ' — NO VERIFIED OFFICIAL FREE API CONNECTED';
    p.style.cssText = 'padding:7px;border-bottom:1px solid #444;margin:0';
    colours.appendChild(p);
  });

  const disclaimer = document.createElement('p');
  disclaimer.textContent = 'A third-party feed is not proof of an individual app’s official result. No guessed or generated results are shown.';
  colours.appendChild(disclaimer);
  section.appendChild(colours);

  document.body.prepend(section);

  async function loadAviator() {
    status.textContent = 'Fetching public statistics…';
    refresh.disabled = true;
    try {
      const response = await fetch(
        'https://aviatorstats.com/api/v1/game.json',
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      output.textContent = JSON.stringify(data, null, 2);
      const period = data.period_end || data[0]?.period_end || 'not supplied';
      status.textContent = 'Connected • Source period ending: ' + period +
        ' • Retrieved: ' + new Date().toLocaleString();
    } catch (error) {
      status.textContent = 'SOURCE UNAVAILABLE: ' + error.message;
    } finally {
      refresh.disabled = false;
    }
  }

  refresh.addEventListener('click', loadAviator);
  loadAviator();
  setInterval(loadAviator, 6 * 60 * 60 * 1000);
})();
