/* page-auth.js - login / signup screens (shared by login.html & signup.html). */
window.Pages = window.Pages || {};
window.Pages.auth = function () {
  'use strict';
  const el = U.el;
  const root = U.qs('#authRoot');
  const mode = document.body.dataset.mode || 'login';
  const next = U.param('next') || 'index.html';
  const isSignup = mode === 'signup';

  document.title = (isSignup ? 'Create your account' : 'Sign in') + ' - YClone';

  const card = el('div', { class: 'auth-card' });

  const logo = el('a', { class: 'auth-logo logo', href: 'index.html' });
  logo.innerHTML = '<span class="logo__mark">' + UI.icon('play', 16) + '</span><span class="logo__word" style="font-size:26px">YClone</span>';
  card.appendChild(logo);

  card.appendChild(el('h1', { text: isSignup ? 'Create your account' : 'Sign in' }));
  card.appendChild(el('p', {
    class: 'sub',
    text: isSignup ? 'to continue to YClone' : 'with your YClone email'
  }));

  const form = el('form', { novalidate: true });
  const errorBox = el('div', { class: 'help', style: 'color:var(--brand);min-height:18px;margin-bottom:8px' });

  let nameInput, emailInput, passInput;

  if (isSignup) {
    nameInput = el('input', { class: 'input', type: 'text', placeholder: 'Full name', autocomplete: 'name' });
    form.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Name' }), nameInput]));
  }
  emailInput = el('input', { class: 'input', type: 'email', placeholder: 'you@example.com', autocomplete: 'email' });
  passInput = el('input', { class: 'input', type: 'password', placeholder: 'Password', autocomplete: isSignup ? 'new-password' : 'current-password' });

  form.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Email' }), emailInput]));
  form.appendChild(el('div', { class: 'field' }, [el('label', { text: 'Password' }), passInput]));
  form.appendChild(errorBox);

  const submit = el('button', { type: 'submit', class: 'btn btn--brand btn--block', text: isSignup ? 'Create account' : 'Sign in' });
  form.appendChild(submit);

  if (!isSignup) {
    const demo = el('button', { type: 'button', class: 'btn btn--ghost btn--block', text: 'Use demo credentials', style: 'margin-top:12px' });
    demo.addEventListener('click', function () {
      emailInput.value = 'demo.viewer@yclone.dev';
      passInput.value = 'demo1234';
      errorBox.textContent = '';
      UI.toast('Demo credentials filled. Press Sign in.');
    });
    form.appendChild(demo);
  }

  card.appendChild(form);

  const switchText = el('div', { class: 'auth-switch' });
  switchText.innerHTML = (isSignup ? 'Already have an account?' : 'New to YClone?') +
    ' <a href="' + (isSignup ? 'login.html' : 'signup.html') + (next !== 'index.html' ? '?next=' + encodeURIComponent(next) : '') + '">' +
    (isSignup ? 'Sign in' : 'Create account') + '</a>';
  card.appendChild(switchText);

  const back = el('div', { class: 'auth-switch' });
  back.innerHTML = '<a href="index.html">← Back to YClone</a>';
  card.appendChild(back);

  root.appendChild(card);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.textContent = '';
    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = isSignup ? 'Creating…' : 'Signing in…';

    const promise = isSignup
      ? API.signup(nameInput.value, emailInput.value, passInput.value)
      : API.login(emailInput.value, passInput.value);

    promise.then(function (user) {
      UI.toast('Welcome' + (isSignup ? '' : ' back') + ', ' + user.name + '!');
      setTimeout(function () { location.href = next; }, 500);
    }).catch(function (err) {
      submit.disabled = false;
      submit.textContent = original;
      errorBox.textContent = err.message || 'Something went wrong.';
    });
  });

  // Focus the first empty field for convenience.
  setTimeout(function () {
    (nameInput && !nameInput.value ? nameInput : emailInput).focus();
  }, 50);
};
