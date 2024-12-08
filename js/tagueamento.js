// Preencha este arquivo com qualquer código que você necessite para realizar a
// coleta, desde a biblioteca analytics.js, gtag.js ou o snippet do Google Tag 
// Manager. No último caso, não é necessário implementar a tag <noscript>.
// O ambiente dispõe da jQuery 3.5.1, então caso deseje, poderá utilizá-la
// para fazer a sua coleta.
// Caso tenha alguma dúvida sobre o case, não hesite em entrar em contato.

// -------------------- VARIÁVEIS GLOBAIS --------------------
const pageLocation = document.URL;

// -------------------- LISTENERS --------------------

/**
 * Capturar cliques em links do menu/navbar e verifica se link é um download/PDF ou link normal.
 * Local: Todas as páginas
 */
const navMenu = document.querySelector('nav');
navMenu?.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;

  const linkText = link.textContent.trim();
  const linkHref = link.getAttribute('href');
  const eventName = linkHref.endsWith('.pdf') ? 'file_download' : 'click';

  gtag('event', eventName, {
    page_location: pageLocation,
    element_name: sanitize(linkText),
    element_group: 'menu',
    link_url: linkHref
  });
});

/**
 * Capturar cliques nos cards de montadoras.
 * Local: https://dp6-js.lullio.com.br/analise.html#tristique
 */
const cardsContainer = document.querySelector('.cards-montadoras');
cardsContainer?.addEventListener('click', (e) => {
  const cardElement = e.target.closest('.card');
  if (!cardElement) return;

  const linkText = cardElement.getAttribute('data-id') ||
    cardElement.querySelector('.card-title')?.textContent;

  if (linkText) {
    gtag('event', 'click', {
      page_location: pageLocation,
      element_name: sanitize(linkText),
      element_group: 'ver_mais',
      link_url: cardElement.href
    });
  }
});

/**
 * Adiciona listeners para os campos do formulário.
 * 
 * form_start: quando o usuário começa a preencher um campo (focus).
 *  form_field: indica qual campo está sendo preenchido
 * 
 * form_submit: quando o usuário termina de preencher um campo (change).
 *  form_field: indica qual campo está sendo preenchido
 * 
 * Local: https://dp6-js.lullio.com.br/sobre.html#contato
 */

document.querySelectorAll('form input').forEach(input => {
  var isFilled = false; // marca se campo já foi preenchido
  const form = input.closest('form');

  // texto do campo com prefixo para checkboxes
  const getFieldText = () => {
    var type = input.type;
    var labelText = input.id || input.placeholder;
    var fieldText = labelText ? labelText.trim() : input.parentElement?.querySelector('label')?.textContent;

    // se checkbox, adicionar prefixo "sim_" ou "nao_"
    if (type === 'checkbox') {
      var prefix = input.checked ? 'sim_' : 'nao_';
      fieldText = prefix + fieldText;
    }
    return fieldText;
  };

  input.addEventListener('focus', function (e) {
    if (!input.dataset.started) {
      input.dataset.started = true; // marca inicio do preenchimento

      var fieldText = getFieldText();
      gtag('event', 'form_start', {
        page_location: pageLocation,
        form_id: form.id || input.id,
        form_name: form.name || form.className || input.name,
        form_destination: form.action,
        form_field: sanitize(fieldText)
      });
    }
  });

  input.addEventListener('blur', function () {
    if (input.value.trim() !== "" && !isFilled) {
      isFilled = true;

      var fieldText = getFieldText();
      gtag('event', 'form_submit', {
        page_location: pageLocation,
        form_id: form.id || input.id,
        form_name: form.name || form.className || input.name,
        form_destination: form.action,
        form_field: sanitize(fieldText)
      });
    }
  });
});

/**
 * Função para disparar o evento de sucesso no arquivo main.js
 * Local: https://dp6-js.lullio.com.br/sobre.html#contato (qualquer formulário na página)
 */
const sendFormSuccessEvent = () => {
  const form = document.forms[0];
  const fieldText = form?.querySelector('[type=submit]')?.textContent;
  gtag('event', 'view_form_success', {
    page_location: pageLocation,
    form_id: form?.id,
    form_name: form?.name || form?.className,
    form_destination: form?.action,
    form_field: sanitize(fieldText),
    form_submit_text: sanitize(fieldText)
  });
};

/* -------------------- EXTRAS --------------------
Eventos adicionais implementados fora do escopo principal do case
*/

/**
 * Captura cliques em links de documentações
 * Local: https://dp6-js.lullio.com.br/index.html
 */
const docs = document.querySelectorAll(".docs");
docs?.forEach(doc => {
  doc.addEventListener("click", () => {
    const text = doc.textContent.trim();
    const section = doc.closest('section');
    const title = section?.querySelector('h4')?.textContent?.trim() || section?.querySelector('h3, h2, h1')?.textContent.trim();
    if (text) {
      gtag('event', 'click', {
        page_location: pageLocation,
        element_name: sanitize(text),
        element_group: "documentacao",
        element_section: sanitize(title)
      });
    }
  })
})

/**
 * Captura cliques em textos destacados e verifica títulos próximos ao texto clicado.
 * Local: https://dp6-js.lullio.com.br/analise.html#tristique
 */
document.querySelectorAll("[class^=highlight]")?.forEach(text => {
  text.addEventListener('click', () => {
    const highlightText = text.textContent?.trim();
    let title;

    // procurar título nos irmãos anteriores
    let sibling = text.previousElementSibling || text.parentElement;
    for (let i = 0; i < 5 && sibling; i++) {
      if (sibling.tagName === 'H3') {
        title = sibling.textContent;
        break;
      }
      sibling = sibling.previousElementSibling || sibling.parentElement;
    }
    gtag('event', 'click', {
      page_location: pageLocation,
      element_name: sanitize(highlightText),
      element_group: "texto_destacado",
      element_section: sanitize(title)
    });
  });
});

/**
 * Função auxiliar para sanitizar textos.
 * Remove caracteres especiais e formata strings com _.
 */
function sanitize(str, opts) {
  var split, i, spacer;

  if (!str) return '';
  opts = opts || {};
  spacer = typeof opts.spacer === 'string' ? opts.spacer : '_';
  str = str
    .toLowerCase()
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
    .replace(/\s+/g, '_')
    .replace(/[áàâãåäæª]/g, 'a')
    .replace(/[éèêëЄ€]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõöøº]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç¢©]/g, 'c')
    .replace(/[^a-z0-9_\-]/g, '_');

  if (opts.capitalized) {
    split = str.replace(/^_+|_+$/g, '').split(/_+/g);
    for (i = 0; i < split.length; i++) {
      if (split[i]) split[i] = split[i][0].toUpperCase() + split[i].slice(1);
    }
    return split.join(spacer);
  }

  return str.replace(/^_+|_+$/g, '').replace(/_+/g, spacer);
}