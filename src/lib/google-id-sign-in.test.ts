import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import {
  DEFAULT_GOOGLE_CLIENT_ID,
  DEFAULT_OAUTH_OPTIONS,
  generateGoogleIdNonce,
  googleClientId,
  hashNonce,
  signInWithGoogleIdToken,
  signInWithOAuthFallback,
} from './google-id-sign-in.ts'

test('hashNonce is SHA-256 hex of the raw nonce, which is what GIS receives', async () => {
  const nonce = 'test-nonce-value'
  const hashed = await hashNonce(nonce)
  const expected = createHash('sha256').update(nonce, 'utf8').digest('hex')
  assert.equal(hashed, expected)
  assert.match(hashed, /^[0-9a-f]{64}$/)
})

test('generateGoogleIdNonce returns a raw nonce and its SHA-256 hex', async () => {
  const { nonce, hashedNonce } = await generateGoogleIdNonce()
  assert.ok(nonce.length > 0)
  assert.equal(hashedNonce, await hashNonce(nonce))
  assert.equal(hashedNonce, createHash('sha256').update(nonce, 'utf8').digest('hex'))
})

test('googleClientId defaults to the public Pilates client and accepts an explicit value', () => {
  assert.equal(googleClientId(), DEFAULT_GOOGLE_CLIENT_ID)
  assert.equal(googleClientId('  123.apps.googleusercontent.com  '), '123.apps.googleusercontent.com')
  assert.equal(googleClientId(''), '')
})

function mockSupabase() {
  const calls: { idToken: unknown[]; oauth: unknown[] } = { idToken: [], oauth: [] }
  const supabase = {
    auth: {
      async signInWithIdToken(args: unknown) {
        calls.idToken.push(args)
        return { data: { user: { id: 'u' } }, error: null }
      },
      async signInWithOAuth(args: unknown) {
        calls.oauth.push(args)
        return { data: {}, error: null }
      },
    },
  }
  return { supabase, calls }
}

test('empty client ID falls back to signInWithOAuth with the same redirectTo and existing options', async () => {
  const { supabase, calls } = mockSupabase()
  const result = await signInWithGoogleIdToken({
    supabase,
    redirectTo: 'https://rkpilatestudio.com/app/',
    clientId: '',
  })
  assert.equal(result.method, 'oauth')
  assert.equal(calls.idToken.length, 0)
  assert.deepEqual(calls.oauth, [{
    provider: 'google',
    options: {
      redirectTo: 'https://rkpilatestudio.com/app/',
      ...DEFAULT_OAUTH_OPTIONS,
    },
  }])
})

test('GIS script failure falls back to unchanged OAuth', async () => {
  const { supabase, calls } = mockSupabase()
  const result = await signInWithGoogleIdToken({
    supabase,
    redirectTo: 'https://rkpilatestudio.com/app/',
    clientId: '123.apps.googleusercontent.com',
    loadScript: async () => { throw new Error('gis-load-failed') },
  })
  assert.equal(result.method, 'oauth')
  assert.equal(calls.idToken.length, 0)
  assert.equal((calls.oauth[0] as { options: { redirectTo: string } }).options.redirectTo, 'https://rkpilatestudio.com/app/')
  assert.deepEqual(
    (calls.oauth[0] as { options: { queryParams: unknown } }).options.queryParams,
    DEFAULT_OAUTH_OPTIONS.queryParams,
  )
})

test('successful GIS passes raw nonce to Supabase and hashed nonce to GIS', async () => {
  const { supabase, calls } = mockSupabase()
  const pair = { nonce: 'raw-nonce', hashedNonce: await hashNonce('raw-nonce') }
  let seenHashed
  const result = await signInWithGoogleIdToken({
    supabase,
    redirectTo: 'https://rkpilatestudio.com/app/',
    clientId: '123.apps.googleusercontent.com',
    nonce: pair,
    loadScript: async () => ({
      initialize(config: { nonce?: string; callback: (r: { credential: string }) => void }) {
        seenHashed = config.nonce
        setTimeout(() => config.callback({ credential: 'jwt-from-gis' }), 0)
      },
      prompt() {},
      renderButton() {},
      cancel() {},
    }),
  })
  assert.equal(result.method, 'gis')
  assert.equal(seenHashed, pair.hashedNonce)
  assert.equal(calls.oauth.length, 0)
  assert.deepEqual(calls.idToken, [{
    provider: 'google',
    token: 'jwt-from-gis',
    nonce: 'raw-nonce',
  }])
})

test('signInWithIdToken error falls back to OAuth', async () => {
  const { supabase, calls } = mockSupabase()
  supabase.auth.signInWithIdToken = async (args: unknown) => {
    calls.idToken.push(args)
    return { data: null, error: { message: 'bad token' } }
  }
  const result = await signInWithGoogleIdToken({
    supabase,
    redirectTo: 'https://rkpilatestudio.com/app/',
    clientId: '123.apps.googleusercontent.com',
    nonce: { nonce: 'n', hashedNonce: 'h' },
    loadScript: async () => ({
      initialize(config: { callback: (r: { credential: string }) => void }) { config.callback({ credential: 'jwt' }) },
      prompt() {},
      renderButton() {},
      cancel() {},
    }),
  })
  assert.equal(result.method, 'oauth')
  assert.equal(calls.idToken.length, 1)
  assert.equal((calls.oauth[0] as { options: { redirectTo: string } }).options.redirectTo, 'https://rkpilatestudio.com/app/')
})

test('gis-cancelled from the dialog does not call OAuth', async () => {
  const { supabase, calls } = mockSupabase()
  const result = await signInWithGoogleIdToken({
    supabase,
    redirectTo: 'https://rkpilatestudio.com/app/',
    clientId: '123.apps.googleusercontent.com',
    nonce: { nonce: 'n', hashedNonce: 'h' },
    loadScript: async () => {
      throw new Error('gis-cancelled')
    },
  })
  assert.equal(result.method, 'cancelled')
  assert.equal(calls.oauth.length, 0)
  assert.equal(calls.idToken.length, 0)
})

test('OAuth fallback helper keeps provider google, redirectTo, and existing queryParams', async () => {
  const { supabase, calls } = mockSupabase()
  await signInWithOAuthFallback(supabase, 'https://rkpilatestudio.com/app/')
  assert.deepEqual(calls.oauth[0], {
    provider: 'google',
    options: {
      redirectTo: 'https://rkpilatestudio.com/app/',
      ...DEFAULT_OAUTH_OPTIONS,
    },
  })
})
