console.log('Script JS carregando...');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado');

  const root = document.getElementById('root');
  console.log('Root element:', root);

  if (root) {
    root.innerHTML = `
      <div style="
        background-color: yellow;
        color: black;
        font-size: 24px;
        padding: 20px;
        text-align: center;
        border: 3px solid red;
        margin: 20px;
        font-family: Arial, sans-serif;
      ">
        ✅ TESTE JS PURO FUNCIONANDO! ✅<br>
        Se você vê isso, o problema está no React/CSS
      </div>
    `;
    console.log('HTML inserido no root');
  } else {
    console.error('Root não encontrado!');
  }
});

console.log('Script JS carregado completamente');