(function () {
  const declaredLanguage = document.documentElement.dataset.wdgLanguage || document.documentElement.lang;
  const isEnglishRepository = /(?:^|\/)WebDevGym-EN(?:\/|$)/i.test(location.pathname);
  const isEnglishPage = declaredLanguage.toLowerCase().startsWith('en') ||
    /index-en\.html$/i.test(location.pathname) ||
    isEnglishRepository;
  const pageLanguage = isEnglishPage ? 'en' : 'ru';
  document.documentElement.lang = pageLanguage;
  document.documentElement.dataset.wdgLanguage = pageLanguage;
  localStorage.setItem('webdevgym_main_lang', pageLanguage);
})();

