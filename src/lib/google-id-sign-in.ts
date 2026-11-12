// התחברות עם Google Identity Services: ה-prompt רץ על rkpilatestudio.com,
// וה-ID token מועבר ל-Supabase ב-signInWithIdToken. אין הפניה דרך
// *.supabase.co — אלא אם GIS אינו זמין, ואז חוזרים ל-signInWithOAuth
// הקיים בלי לשנות את התנהגותו (כולל redirectTo ו-queryParams).
//
// מזהה הלקוח הציבורי של אפליקציית "RK Pilates Studio" בפרויקט
// root-arcanum-344320 (….apps.googleusercontent.com). הוא אינו סודי.
// VITE_GOOGLE_CLIENT_ID יכול לדרוס אותו. אם מעבירים מחרוזת ריקה ל-
// clientId, GIS מדלג ומיד נופלים ל-OAuth.

export const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const GIS_LOAD_TIMEOUT_MS = 8000

// Public OAuth Web client ID for RK Pilates Studio. Safe to ship in the
// frontend; the secret stays in the Supabase Google provider config.
export const DEFAULT_GOOGLE_CLIENT_ID =
  '1050199374182-5r78j9atsj6hl85euudkhl24chd5nf19.apps.googleusercontent.com'

export const DEFAULT_OAUTH_OPTIONS = {
  skipBrowserRedirect: false,
  queryParams: {
    access_type: 'offline',
    prompt: 'select_account',
  },
} as const

export type GoogleSignInMethod = 'gis' | 'oauth' | 'cancelled'

export type GoogleSignInResult = { method: GoogleSignInMethod; error?: string }

export type GoogleOAuthFallbackOptions = {
  skipBrowserRedirect?: boolean
  queryParams?: Record<string, string>
}

export type SupabaseGoogleAuth = {
  auth: {
    signInWithIdToken: (args: {
      provider: 'google'
      token: string
      nonce: string
    }) => Promise<{ data?: unknown; error?: { message?: string } | null }>
    signInWithOAuth: (args: {
      provider: 'google'
      options: { redirectTo: string } & GoogleOAuthFallbackOptions
    }) => Promise<{ data?: unknown; error?: { message?: string } | null } | unknown>
  }
}

type CredentialResponse = { credential?: string }
type PromptMoment = {
  isNotDisplayed?: () => boolean
  isSkippedMoment?: () => boolean
  isDismissedMoment?: () => boolean
  getDismissedReason?: () => string
}

type GoogleAccountsId = {
  initialize: (config: Record<string, unknown>) => void
  prompt: (cb?: (notification: PromptMoment) => void) => void
  renderButton: (parent: HTMLElement, config: Record<string, unknown>) => void
  cancel?: () => void
}

function envClientId(): string {
  try {
    const value = import.meta.env?.VITE_GOOGLE_CLIENT_ID
    return typeof value === 'string' ? value.trim() : ''
  } catch {
    return ''
  }
}

export function googleClientId(explicit?: string): string {
  if (typeof explicit === 'string') return explicit.trim()
  return envClientId() || DEFAULT_GOOGLE_CLIENT_ID
}

/** nonce גולמי ל-Supabase, ו-SHA-256 hex לאותו מחרוזת — ל-GIS (מסמכי Supabase). */
export async function generateGoogleIdNonce(
  subtle: Pick<SubtleCrypto, 'digest'> = crypto.subtle,
  randomBytes: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n)),
): Promise<{ nonce: string; hashedNonce: string }> {
  const nonce = btoa(String.fromCharCode(...randomBytes(32)))
  return { nonce, hashedNonce: await hashNonce(nonce, subtle) }
}

export async function hashNonce(
  nonce: string,
  subtle: Pick<SubtleCrypto, 'digest'> = crypto.subtle,
): Promise<string> {
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(nonce))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function signInWithOAuthFallback(
  supabase: SupabaseGoogleAuth,
  redirectTo: string,
  oauthOptions: GoogleOAuthFallbackOptions = DEFAULT_OAUTH_OPTIONS,
) {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: oauthOptions.skipBrowserRedirect,
      queryParams: oauthOptions.queryParams,
    },
  })
}

export function loadGisScript(
  src = GIS_SCRIPT_SRC,
  timeoutMs = GIS_LOAD_TIMEOUT_MS,
): Promise<GoogleAccountsId> {
  const existing = (globalThis as unknown as { google?: { accounts?: { id?: GoogleAccountsId } } }).google?.accounts?.id
  if (existing) return Promise.resolve(existing)
  if (typeof document === 'undefined') return Promise.reject(new Error('no-document'))

  return new Promise((resolve, reject) => {
    const done = (err?: Error) => {
      const api = (globalThis as unknown as { google?: { accounts?: { id?: GoogleAccountsId } } }).google?.accounts?.id
      if (api) resolve(api)
      else reject(err || new Error('gis-unavailable'))
    }
    const prior = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (prior) {
      if ((globalThis as unknown as { google?: { accounts?: { id?: GoogleAccountsId } } }).google?.accounts?.id) {
        done()
        return
      }
      prior.addEventListener('load', () => done())
      prior.addEventListener('error', () => done(new Error('gis-load-failed')))
    } else {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => done()
      script.onerror = () => done(new Error('gis-load-failed'))
      document.head.appendChild(script)
    }
    setTimeout(() => done(new Error('gis-load-timeout')), timeoutMs)
  })
}

function closeGisDialog() {
  if (typeof document === 'undefined') return
  document.getElementById('pilates-gis-dialog')?.remove()
}

function showGisButtonDialog(gis: GoogleAccountsId, onCancel: () => void) {
  if (typeof document === 'undefined') {
    onCancel()
    return
  }
  closeGisDialog()
  const dialog = document.createElement('dialog')
  dialog.id = 'pilates-gis-dialog'
  dialog.setAttribute('aria-labelledby', 'pilates-gis-title')
  dialog.setAttribute('dir', 'rtl')
  dialog.style.cssText = [
    'border:0', 'padding:0', 'background:transparent', 'max-width:calc(100vw - 32px)',
  ].join(';')
  dialog.innerHTML = `
    <div style="background:var(--color-ivory,#faf8f3);color:var(--color-ink,#2e3128);border:1px solid var(--color-line,#e4e0d6);border-radius:16px;padding:22px 20px 18px;min-width:280px;max-width:360px;font-family:var(--font-sans,Heebo,system-ui,sans-serif);box-shadow:0 16px 40px rgba(46,49,40,.18)">
      <h2 id="pilates-gis-title" style="margin:0 0 6px;font-size:18px;font-family:var(--font-serif,'Frank Ruhl Libre',Georgia,serif);color:var(--color-sage,#5f7154)">התחברות עם Google</h2>
      <p style="margin:0 0 16px;font-size:14px;color:var(--color-muted,#6b6e64)">בחרו חשבון כדי להמשיך באתר פילאטיס בתנועה.</p>
      <div id="pilates-gis-button" style="display:flex;justify-content:center;min-height:44px"></div>
      <button type="button" id="pilates-gis-cancel" style="display:block;width:100%;margin-top:14px;background:transparent;border:0;color:var(--color-muted,#6b6e64);font:inherit;font-size:14px;cursor:pointer;padding:8px">ביטול</button>
    </div>
  `
  const cancel = () => {
    dialog.removeEventListener('cancel', onCancel)
    closeGisDialog()
    onCancel()
  }
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    cancel()
  })
  document.body.appendChild(dialog)
  dialog.querySelector('#pilates-gis-cancel')?.addEventListener('click', cancel)
  try { dialog.showModal() } catch { dialog.setAttribute('open', '') }
  const host = dialog.querySelector<HTMLElement>('#pilates-gis-button')
  if (host) {
    gis.renderButton(host, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      locale: 'he',
      width: 280,
    })
  }
}

async function collectCredential(
  gis: GoogleAccountsId,
  clientId: string,
  hashedNonce: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (value: string) => {
      if (settled) return
      settled = true
      try { gis.cancel?.() } catch { /* ignore */ }
      closeGisDialog()
      resolve(value)
    }
    const fail = (error: Error) => {
      if (settled) return
      settled = true
      try { gis.cancel?.() } catch { /* ignore */ }
      closeGisDialog()
      reject(error)
    }
    const onUserCancel = () => {
      if (!settled) fail(new Error('gis-cancelled'))
    }

    try {
      gis.initialize({
        client_id: clientId,
        nonce: hashedNonce,
        callback: (response: CredentialResponse) => {
          if (response?.credential) finish(response.credential)
          else fail(new Error('gis-empty-credential'))
        },
        ux_mode: 'popup',
        use_fedcm_for_prompt: true,
        auto_select: false,
        context: 'signin',
        itp_support: true,
        cancel_on_tap_outside: true,
      })
    } catch (error) {
      fail(error instanceof Error ? error : new Error('gis-initialize-failed'))
      return
    }

    const offerButton = () => {
      if (settled) return
      try { gis.cancel?.() } catch { /* ignore */ }
      try { showGisButtonDialog(gis, onUserCancel) }
      catch (error) { fail(error instanceof Error ? error : new Error('gis-button-failed')) }
    }

    try {
      gis.prompt((notification) => {
        if (settled) return
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
          offerButton()
          return
        }
        if (notification.isDismissedMoment?.()) {
          const reason = notification.getDismissedReason?.() || ''
          if (reason === 'credential_returned') return
          // ביטול ה-One Tap: מציגים את הכפתור הרשמי באתר, לא קופצים ל-OAuth
          // (שעדיין עובר דרך supabase.co). ביטול הכפתור = cancelled, בלי הפניה.
          offerButton()
        }
      })
    } catch {
      offerButton()
    }
  })
}

export async function signInWithGoogleIdToken(opts: {
  supabase: SupabaseGoogleAuth
  redirectTo: string
  clientId?: string
  loadScript?: () => Promise<GoogleAccountsId>
  nonce?: { nonce: string; hashedNonce: string }
  oauthOptions?: GoogleOAuthFallbackOptions
}): Promise<GoogleSignInResult> {
  const clientId = googleClientId(opts.clientId)
  const oauthOptions = opts.oauthOptions ?? DEFAULT_OAUTH_OPTIONS
  if (!clientId) {
    const fallback = await signInWithOAuthFallback(opts.supabase, opts.redirectTo, oauthOptions)
    const error = fallback && typeof fallback === 'object' && 'error' in fallback
      ? (fallback as { error?: { message?: string } | null }).error?.message
      : undefined
    return error ? { method: 'oauth', error } : { method: 'oauth' }
  }

  try {
    const gis = await (opts.loadScript || loadGisScript)()
    const pair = opts.nonce || await generateGoogleIdNonce()
    const token = await collectCredential(gis, clientId, pair.hashedNonce)
    const { error } = await opts.supabase.auth.signInWithIdToken({
      provider: 'google',
      token,
      nonce: pair.nonce,
    })
    if (error) throw new Error(error.message || 'id-token-failed')
    return { method: 'gis' }
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message === 'gis-cancelled') return { method: 'cancelled' }
    const fallback = await signInWithOAuthFallback(opts.supabase, opts.redirectTo, oauthOptions)
    const oauthError = fallback && typeof fallback === 'object' && 'error' in fallback
      ? (fallback as { error?: { message?: string } | null }).error?.message
      : undefined
    return oauthError ? { method: 'oauth', error: oauthError } : { method: 'oauth' }
  }
}
