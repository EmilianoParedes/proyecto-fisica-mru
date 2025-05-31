if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Import modules
    import('./js/mru-calculadora.js')
      .then(module => {
        module.initMRUCalculator();
      })
      .catch(error => {
        console.error('Error cargando MRU calculadora module:', error);
      });

    import('./js/encuentro-calculadora.js')
      .then(module => {
        module.initEncounterCalculator();
      })
      .catch(error => {
        console.error('Error loading encounter calculator module:', error);
      });
  });
}