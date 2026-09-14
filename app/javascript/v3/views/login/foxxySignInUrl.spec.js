// FOXXY: prueba del validador de la URL de entrada (spec 093 de olympus-ms-back).
import { acceptSignInUrl } from './foxxySignInUrl';

const ORIGIN = 'https://chat.foxxy.pro';

describe('acceptSignInUrl', () => {
  it('acepta la entrada SSO de este chat', () => {
    expect(
      acceptSignInUrl(
        'https://chat.foxxy.pro/app/login?email=a%40b.co&sso_auth_token=tok',
        ORIGIN
      )
    ).toBe(true);
  });

  it.each([
    ['otro origen', 'https://evil.example/app/login?sso_auth_token=tok'],
    [
      'subdominio parecido',
      'https://chat.foxxy.pro.evil.example/app/login?sso_auth_token=tok',
    ],
    [
      'usuario en la URL',
      'https://chat.foxxy.pro@evil.example/app/login?sso_auth_token=tok',
    ],
    ['http', 'http://chat.foxxy.pro/app/login?sso_auth_token=tok'],
    ['otra ruta', 'https://chat.foxxy.pro/app/accounts?sso_auth_token=tok'],
    ['sin token', 'https://chat.foxxy.pro/app/login?email=a%40b.co'],
    ['token vacío', 'https://chat.foxxy.pro/app/login?sso_auth_token='],
    // eslint-disable-next-line no-script-url
    ['javascript', 'javascript:alert(1)'],
    ['vacía', ''],
    ['no texto', undefined],
  ])('rechaza %s sin lanzar', (_name, raw) => {
    expect(acceptSignInUrl(raw, ORIGIN)).toBe(false);
  });
});
