// FOXXY: validador de la URL de entrada que devuelve el back (spec 093 de olympus-ms-back).
//
// La URL sólo se abre si es una entrada SSO de ESTE chat: mismo origen que la página, ruta
// /app/login y un sso_auth_token no vacío. Cualquier otra cosa se trata como «el chat no responde»:
// la pantalla del código no puede convertirse en un redirector a otro sitio. Nunca lanza.
export function acceptSignInUrl(raw, origin) {
  if (typeof raw !== 'string' || !raw) return false;
  try {
    const url = new URL(raw);
    return (
      url.origin === origin &&
      url.pathname === '/app/login' &&
      !!url.searchParams.get('sso_auth_token')
    );
  } catch {
    return false;
  }
}
