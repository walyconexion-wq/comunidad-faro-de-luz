const fs = require('fs');

function fixBunkerJs(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Quitar el cierre prematuro en la línea 232
  code = code.replace(
    `  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    checkSession();
  });

})();`,
    `  // Inicialización de Sesión
  document.addEventListener('DOMContentLoaded', () => {
    checkSession();
  });`
  );

  fs.writeFileSync(filePath, code, 'utf8');
}

fixBunkerJs('src/bunker.js');
fixBunkerJs('public/src/bunker.js');
