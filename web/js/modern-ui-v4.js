(function () {
  if (!Array.isArray(window.GH_FIELDS)) {
    window.GH_FIELDS = [
      'ghc-token', 'ghc-name', 'ghc-visibility', 'ghc-desc',
      'gh-username', 'gh-repo', 'gh-token', 'gh-filepath', 'gh-branch'
    ];
  }
})();

