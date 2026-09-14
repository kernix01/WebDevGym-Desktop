(function () {
  const aiButton = document.getElementById('wdgAiBtn');
  const libraryButton = document.getElementById('wdgLibraryBtn');

  if (aiButton) aiButton.innerHTML = '<span class="wdg-symbol" aria-hidden="true">✦</span>';
  if (libraryButton) {
    libraryButton.querySelector('iconify-icon')?.remove();
    libraryButton.insertAdjacentHTML('afterbegin', '<span class="wdg-symbol" aria-hidden="true">▦</span>');
  }

  const symbols = [
    ['html', '5'], ['css', '#'], ['javascript', 'JS'], ['typescript', 'TS'], ['react', '⚛'],
    ['git', '◆'], ['node', 'N'], ['sql', 'DB'], ['сервер', '☁'], ['server', '☁'],
    ['linux', 'L'], ['postgres', 'PG'], ['vite', '⚡'], ['практи', '◎'], ['practice', '◎'],
    ['ошиб', '!'], ['mistake', '!'], ['ресурс', '↗'], ['resource', '↗'], ['путь', '→'],
    ['roadmap', '→'], ['календар', '□'], ['calendar', '□'], ['figma', 'F'], ['playground', '>_'],
    ['шпаргал', '?'], ['cheat', '?'], ['github', 'GH'], ['карьер', '▣'], ['career', '▣'],
    ['ссыл', '↗'], ['link', '↗'], ['алгоритм', '∑'], ['algorithm', '∑'], ['nexus', '◇'],
    ['ии', '✦'], ['ai', '✦'], ['рефактор', '↻'], ['refactor', '↻'], ['шрифт', 'Aa'], ['font', 'Aa']
  ];

  document.querySelectorAll('.wdg-library-item').forEach(item => {
    const label = item.textContent.trim().toLowerCase();
    const symbol = symbols.find(([key]) => label.includes(key))?.[1] || '•';
    item.querySelector('iconify-icon')?.remove();
    item.insertAdjacentHTML('afterbegin', '<span class="wdg-library-symbol" aria-hidden="true">' + symbol + '</span>');
  });
})();

