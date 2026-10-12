/* page-feedback.js - submit feedback / bug reports / video reports. */
window.Pages = window.Pages || {};
window.Pages.feedback = function () {
  'use strict';
  const el = U.el, icon = UI.icon;
  const host = U.qs('#feedbackBody');
  const params = new URLSearchParams(location.search);
  const user = Store.get('user');

  function renderForm() {
    host.innerHTML = '';
    const panel = el('div', { class: 'panel' });

    const typeSelect = el('select', { class: 'select' });
    [['feedback', 'General feedback'], ['bug', 'Bug report'], ['feature', 'Feature request'], ['report', 'Report a video']]
      .forEach(function (o) { typeSelect.appendChild(el('option', { value: o[0], text: o[1] })); });
    const initialType = params.get('type');
    if (initialType && ['feedback', 'bug', 'feature', 'report'].indexOf(initialType) !== -1) typeSelect.value = initialType;

    const videoField = el('div', { class: 'field' + (typeSelect.value === 'report' ? '' : ' hidden') });
    const videoInput = el('input', { class: 'input', placeholder: 'Video link or id', value: params.get('video') || '' });
    videoField.appendChild(el('label', { text: 'Video' }));
    videoField.appendChild(videoInput);

    const subject = el('input', { class: 'input', placeholder: 'Short summary', maxlength: '120' });
    const message = el('textarea', { class: 'textarea', rows: '6', placeholder: 'Tell us what happened…' });
    const email = el('input', { class: 'input', type: 'email', placeholder: 'you@example.com', value: user ? user.email : '' });
    const err = el('div', { class: 'help', style: 'color:var(--brand);min-height:16px' });

    typeSelect.addEventListener('change', function () {
      videoField.classList.toggle('hidden', typeSelect.value !== 'report');
    });

    panel.appendChild(el('p', { class: 'muted', text: 'Your feedback helps improve YClone. We read everything.' }));
    panel.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Type' }), typeSelect]));
    panel.appendChild(videoField);
    panel.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Subject' }), subject]));
    panel.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Details' }), message]));
    panel.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Email (optional)' }), email]));
    panel.appendChild(err);

    const submit = el('button', { class: 'btn btn--brand', text: 'Submit' });
    submit.addEventListener('click', function () {
      err.textContent = '';
      submit.disabled = true;
      submit.textContent = 'Sending…';
      API.submitFeedback({
        type: typeSelect.value,
        subject: subject.value.trim() || typeSelect.options[typeSelect.selectedIndex].text,
        message: message.value,
        email: email.value.trim(),
        videoId: typeSelect.value === 'report' ? videoInput.value.trim() : null
      }).then(function () {
        renderThanks();
      }).catch(function (e) {
        submit.disabled = false;
        submit.textContent = 'Submit';
        err.textContent = e.message || 'Could not send feedback.';
      });
    });
    panel.appendChild(submit);

    host.appendChild(panel);
    renderHistory();
  }

  function renderThanks() {
    host.innerHTML = '';
    const panel = el('div', { class: 'panel', style: 'text-align:center' });
    panel.appendChild(el('div', { class: 'empty__icon', html: icon('check', 56), style: 'color:var(--brand)' }));
    panel.appendChild(el('h2', { text: 'Thanks for your feedback!' }));
    panel.appendChild(el('p', { class: 'muted', text: 'We have recorded your message on this device.' }));
    const row = el('div', { class: 'row', style: 'justify-content:center;margin-top:8px' });
    const again = el('button', { class: 'btn btn--filled', text: 'Send more feedback' });
    again.addEventListener('click', renderForm);
    row.appendChild(again);
    row.appendChild(el('a', { class: 'btn btn--ghost', href: 'index.html', text: 'Back to home' }));
    panel.appendChild(row);
    host.appendChild(panel);
    renderHistory();
  }

  function renderHistory() {
    const list = Store.get('feedback');
    if (!list.length) return;
    const wrap = el('div', { style: 'margin-top:24px' });
    wrap.appendChild(el('h2', { style: 'font-size:16px', text: 'Your recent feedback' }));
    list.slice(0, 5).forEach(function (f) {
      const row = el('div', { class: 'panel', style: 'margin-bottom:8px;padding:12px 16px' });
      row.appendChild(el('strong', { text: f.subject || f.type }));
      row.appendChild(el('div', { class: 'muted', text: f.message }));
      row.appendChild(el('div', { class: 'muted', style: 'font-size:12px;margin-top:4px', text: U.timeAgo(f.at) }));
      wrap.appendChild(row);
    });
    host.appendChild(wrap);
  }

  renderForm();
};
