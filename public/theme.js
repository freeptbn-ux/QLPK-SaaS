(function() {
  try {
    var mode = localStorage.getItem('themeMode');
    var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
    if (!mode && supportDarkMode) mode = 'dark';
    if (mode === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
