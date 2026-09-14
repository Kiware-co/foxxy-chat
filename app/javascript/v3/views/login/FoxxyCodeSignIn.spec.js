// FOXXY: prueba de la pantalla del código (spec 093 de olympus-ms-back). El contrato con el back
// son las dos rutas y sus cuerpos: si cambian aquí, cambian en
// specs/093-login-del-chat-con-codigo/contracts/openapi.yaml, y el back se despliega antes.
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import FoxxyCodeSignIn from './FoxxyCodeSignIn.vue';

const API = 'https://api.test/v1';
const GOOD_URL = `${window.location.origin}/app/login?email=a%40b.co&sso_auth_token=tok`;

function response(status, body = {}) {
  return { status, json: () => Promise.resolve(body) };
}

function mountWith({ locale = 'es', navigate = vi.fn() } = {}) {
  const i18n = createI18n({
    legacy: false,
    locale,
    messages: { [locale]: {} },
    missingWarn: false,
    fallbackWarn: false,
  });
  const wrapper = mount(FoxxyCodeSignIn, {
    props: { apiBase: API, navigate },
    global: { plugins: [i18n] },
  });
  return { wrapper, navigate };
}

async function typeEmailAndSend(wrapper, email = 'asesor@example.com') {
  await wrapper.find('[data-testid="foxxy-code-email"]').setValue(email);
  await wrapper.find('form').trigger('submit');
  await flushPromises();
}

async function typeCodeAndSubmit(wrapper, code = '482913') {
  await wrapper.find('[data-testid="foxxy-code-input"]').setValue(code);
  await wrapper.find('form').trigger('submit');
  await flushPromises();
}

describe('FoxxyCodeSignIn.vue', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('pide el código con el correo, sin credenciales, y pasa al paso del código', async () => {
    fetch.mockResolvedValueOnce(response(202, { expires_in: 300 }));
    const { wrapper } = mountWith();
    await typeEmailAndSend(wrapper, '  asesor@example.com ');

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(`${API}/public/chat-sign-in/code`);
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('omit');
    expect(JSON.parse(init.body)).toEqual({ email: 'asesor@example.com' });

    const input = wrapper.find('[data-testid="foxxy-code-input"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes('autocomplete')).toBe('one-time-code');
    expect(input.attributes('inputmode')).toBe('numeric');
  });

  it('no llama al back con un correo sin formato', async () => {
    const { wrapper } = mountWith();
    await typeEmailAndSend(wrapper, 'no-es-correo');
    expect(fetch).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="foxxy-code-error"]').text()).toBe(
      'Escribe un correo válido.'
    );
  });

  it('canjea el código y abre la entrada SSO con replace', async () => {
    fetch
      .mockResolvedValueOnce(response(202))
      .mockResolvedValueOnce(response(200, { url: GOOD_URL, expires_in: 60 }));
    const { wrapper, navigate } = mountWith();
    await typeEmailAndSend(wrapper);
    await typeCodeAndSubmit(wrapper, '482 913');

    const [url, init] = fetch.mock.calls[1];
    expect(url).toBe(`${API}/public/chat-sign-in/code/verify`);
    expect(init.credentials).toBe('omit');
    expect(JSON.parse(init.body)).toEqual({
      email: 'asesor@example.com',
      code: '482913',
    });
    expect(navigate).toHaveBeenCalledWith(GOOD_URL);
  });

  it('no abre una URL de otro origen', async () => {
    fetch.mockResolvedValueOnce(response(202)).mockResolvedValueOnce(
      response(200, {
        url: 'https://evil.example/app/login?sso_auth_token=t',
      })
    );
    const { wrapper, navigate } = mountWith();
    await typeEmailAndSend(wrapper);
    await typeCodeAndSubmit(wrapper);
    expect(navigate).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="foxxy-code-error"]').text()).toContain(
      'El chat no responde'
    );
  });

  it.each([
    [401, 'El código no es correcto o ya caducó'],
    [404, 'no pertenece a ninguna casa con chat'],
    [429, 'Demasiados intentos'],
    [502, 'El chat no responde'],
  ])('un %s enseña su mensaje y no navega', async (status, text) => {
    fetch
      .mockResolvedValueOnce(response(202))
      .mockResolvedValueOnce(response(status, { code: 'x' }));
    const { wrapper, navigate } = mountWith();
    await typeEmailAndSend(wrapper);
    await typeCodeAndSubmit(wrapper);
    expect(navigate).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="foxxy-code-error"]').text()).toContain(
      text
    );
  });

  it('un error de red al pedir el código se queda en el paso del correo', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const { wrapper } = mountWith();
    await typeEmailAndSend(wrapper);
    expect(wrapper.find('[data-testid="foxxy-code-email"]').exists()).toBe(
      true
    );
    expect(wrapper.find('[data-testid="foxxy-code-error"]').text()).toContain(
      'El chat no responde'
    );
  });

  it('un código que no son 6 dígitos no llega al back', async () => {
    fetch.mockResolvedValueOnce(response(202));
    const { wrapper } = mountWith();
    await typeEmailAndSend(wrapper);
    await typeCodeAndSubmit(wrapper, '12a4');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('pide otro código y permite cambiar el correo', async () => {
    fetch.mockResolvedValue(response(202));
    const { wrapper } = mountWith();
    await typeEmailAndSend(wrapper);

    await wrapper.find('[data-testid="foxxy-code-resend"]').trigger('click');
    await flushPromises();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[data-testid="foxxy-code-notice"]').text()).toBe(
      'Te enviamos otro código.'
    );

    await wrapper
      .find('[data-testid="foxxy-code-change-email"]')
      .trigger('click');
    expect(wrapper.find('[data-testid="foxxy-code-email"]').exists()).toBe(
      true
    );
  });

  it('«Volver» avisa al padre', async () => {
    const { wrapper } = mountWith();
    await wrapper.find('[data-testid="foxxy-code-back"]').trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it('en otro idioma habla en inglés', () => {
    // NextButton va stub en vitest.setup.js y no pinta su label: se mira el resto del texto.
    const { wrapper } = mountWith({ locale: 'en' });
    expect(wrapper.text()).toContain('Type the email of your Foxxy account.');
    expect(wrapper.text()).toContain('Back');
  });
});
