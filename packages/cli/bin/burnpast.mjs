#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { webcrypto } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline/promises'

const crypto = globalThis.crypto || webcrypto
const subtle = crypto.subtle
const encoder = new TextEncoder()
const decoder = new TextDecoder()

const DEFAULT_SERVER = 'http://127.0.0.1:3000'
const DEFAULT_EXPIRES = '1h'
const CONFIG_DIR = process.env.BURNPAST_HOME || process.env.BURNPASTE_HOME || path.join(os.homedir(), '.burnpast')
const IDENTITY_FILE = path.join(CONFIG_DIR, 'identity.json')
const CONTACTS_FILE = path.join(CONFIG_DIR, 'contacts.json')

class CliError extends Error {
  constructor(message, exitCode = 1) {
    super(message)
    this.exitCode = exitCode
  }
}

const help = `BurnPast developer CLI

Commands:
  burnpast init
  burnpast init --alias @alice [--server http://127.0.0.1:3000]
  burnpast whoami
  burnpast send --to @bob --text "secret" [--expires 10m] [--no-burn]
  burnpast send --to @bob --clipboard
  burnpast send --to @bob ./file.env
  burnpast inbox [--json]
  burnpast watch [--interval 5] [--once] [--reveal]
  burnpast reveal <message-id> [--copy]
  burnpast trust @bob

Environment:
  BURNPAST_HOME      Override identity directory
  BURNPAST_API_URL   Override server URL

Legacy aliases:
  burnpaste, BURNPASTE_HOME, and BURNPASTE_API_URL are still accepted.
`

const parseArgs = (argv) => {
  const flags = {}
  const positionals = []

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--') {
      positionals.push(...argv.slice(index + 1))
      break
    }

    if (!arg.startsWith('--')) {
      positionals.push(arg)
      continue
    }

    const [rawName, rawValue] = arg.slice(2).split(/=(.*)/s, 2)
    const name = rawName.replace(/-([a-z])/g, (_, char) => char.toUpperCase())

    if (rawValue !== undefined) {
      flags[name] = rawValue
      continue
    }

    const next = argv[index + 1]
    if (next && !next.startsWith('--')) {
      flags[name] = next
      index += 1
    } else {
      flags[name] = true
    }
  }

  return { flags, positionals }
}

const normalizeServer = (value) => String(
  value || process.env.BURNPAST_API_URL || process.env.BURNPASTE_API_URL || DEFAULT_SERVER
).replace(/\/+$/g, '')

const assertSafeServerUrl = (serverUrl, allowInsecure = false) => {
  let parsed

  try {
    parsed = new URL(serverUrl)
  } catch {
    throw new CliError(`Invalid server URL: ${serverUrl}`)
  }

  const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
  const isLocal = localHosts.has(parsed.hostname)

  if (parsed.protocol !== 'https:' && !isLocal && !allowInsecure) {
    throw new CliError('Refusing to send secrets over insecure HTTP. Use HTTPS or pass --allow-insecure for controlled local testing.')
  }
}

const normalizeAlias = (value) => {
  if (!value) throw new CliError('Developer alias is required.')
  const alias = String(value).trim().startsWith('@') ? String(value).trim() : `@${String(value).trim()}`

  if (!/^@[a-zA-Z0-9][a-zA-Z0-9_-]{1,31}$/.test(alias)) {
    throw new CliError('Invalid alias. Use something like @alice or @backend_01.')
  }

  return alias.toLowerCase()
}

const prompt = async (question) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  try {
    return await rl.question(question)
  } finally {
    rl.close()
  }
}

const defaultAlias = () => {
  const raw = process.env.USER || os.userInfo().username || 'developer'
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')

  return normalizeAlias(cleaned || 'developer')
}

const resolveInitAlias = async (flags, positionals) => {
  if (flags.alias || positionals[0]) return normalizeAlias(flags.alias || positionals[0])

  const fallback = defaultAlias()

  if (!process.stdin.isTTY || flags.yes) {
    return fallback
  }

  const answer = await prompt(`Choose developer alias [${fallback}]: `)
  return normalizeAlias(answer.trim() || fallback)
}

const bytesToBase64Url = (bytes) => Buffer.from(bytes).toString('base64url')
const base64UrlToBytes = (value) => new Uint8Array(Buffer.from(value, 'base64url'))

const ensureConfigDir = () => {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 })
}

const saveIdentity = (identity) => {
  ensureConfigDir()
  fs.writeFileSync(IDENTITY_FILE, `${JSON.stringify(identity, null, 2)}\n`, { mode: 0o600 })
}

const assertPrivateFileMode = (filePath) => {
  if (process.platform === 'win32' || !fs.existsSync(filePath)) return

  const mode = fs.statSync(filePath).mode & 0o777
  if ((mode & 0o077) !== 0) {
    throw new CliError(`${filePath} is readable by group/others. Run: chmod 600 ${filePath}`)
  }
}

const loadContacts = () => {
  if (!fs.existsSync(CONTACTS_FILE)) return {}
  assertPrivateFileMode(CONTACTS_FILE)
  return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'))
}

const saveContacts = (contacts) => {
  ensureConfigDir()
  fs.writeFileSync(CONTACTS_FILE, `${JSON.stringify(contacts, null, 2)}\n`, { mode: 0o600 })
}

const trustContact = (identity) => {
  const contacts = loadContacts()
  const existing = contacts[identity.alias]

  if (existing && existing.publicKeyFingerprint !== identity.publicKeyFingerprint) {
    throw new CliError(
      `Public key changed for ${identity.alias}.\n` +
      `Previous: ${existing.publicKeyFingerprint}\n` +
      `Current:  ${identity.publicKeyFingerprint}\n` +
      'Verify out-of-band before replacing this contact.'
    )
  }

  if (!existing) {
    contacts[identity.alias] = {
      publicKeyFingerprint: identity.publicKeyFingerprint,
      firstSeenAt: Date.now()
    }
    saveContacts(contacts)
    console.error(`Trusted ${identity.alias} (${identity.publicKeyFingerprint})`)
  }
}

const loadIdentity = () => {
  if (!fs.existsSync(IDENTITY_FILE)) {
    throw new CliError('No local identity found. Run: burnpast init --alias @yourname')
  }

  assertPrivateFileMode(IDENTITY_FILE)
  return JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf8'))
}

const apiFetch = async (method, route, options = {}) => {
  const identity = options.auth ? loadIdentity() : options.identity
  const serverUrl = normalizeServer(options.serverUrl || identity?.serverUrl)
  assertSafeServerUrl(serverUrl, options.allowInsecure)
  const headers = { accept: 'application/json' }

  if (options.body !== undefined) headers['content-type'] = 'application/json'
  if (options.auth) {
    headers['x-burnpast-alias'] = identity.alias
    headers['x-burnpast-token'] = identity.token
  }

  const response = await fetch(`${serverUrl}${route}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new CliError(data.message || data.statusMessage || `Request failed with HTTP ${response.status}`)
  }

  return data
}

const parseDuration = (value = DEFAULT_EXPIRES) => {
  const match = String(value).trim().match(/^(\d+)(s|m|h|d)$/)
  if (!match) throw new CliError('Invalid duration. Use values like 10m, 1h, or 7d.')

  const amount = Number(match[1])
  const unit = match[2]
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 }

  return amount * multipliers[unit]
}

const formatTimeLeft = (expiresAt) => {
  const seconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)}h`
  return `${Math.ceil(seconds / 86400)}d`
}

const readClipboard = () => {
  const attempts = process.platform === 'darwin'
    ? [['pbpaste']]
    : process.platform === 'win32'
      ? [['powershell.exe', '-NoProfile', '-Command', 'Get-Clipboard']]
      : [['wl-paste', '-n'], ['xclip', '-selection', 'clipboard', '-o'], ['xsel', '--clipboard', '--output']]

  for (const command of attempts) {
    const result = spawnSync(command[0], command.slice(1), { encoding: 'utf8' })
    if (result.status === 0 && result.stdout) return result.stdout
  }

  throw new CliError('Unable to read clipboard on this system.')
}

const writeClipboard = (text) => {
  const attempts = process.platform === 'darwin'
    ? [['pbcopy']]
    : process.platform === 'win32'
      ? [['clip.exe']]
      : [['wl-copy'], ['xclip', '-selection', 'clipboard'], ['xsel', '--clipboard', '--input']]

  for (const command of attempts) {
    const result = spawnSync(command[0], command.slice(1), { input: text, encoding: 'utf8' })
    if (result.status === 0) return true
  }

  return false
}

const readStdin = () => fs.readFileSync(0, 'utf8')

const resolveSendContent = ({ flags, positionals }) => {
  if (typeof flags.text === 'string') return flags.text
  if (flags.clipboard) return readClipboard()
  if (positionals[0]) return fs.readFileSync(path.resolve(positionals[0]), 'utf8')
  if (!process.stdin.isTTY) return readStdin()

  throw new CliError('No secret content provided. Use --text, --clipboard, a file path, or stdin.')
}

const generateIdentityKeys = async () => {
  const keyPair = await subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  )

  const publicKey = await subtle.exportKey('jwk', keyPair.publicKey)
  const privateKey = await subtle.exportKey('jwk', keyPair.privateKey)

  publicKey.alg = 'RSA-OAEP-256'
  publicKey.key_ops = ['encrypt']
  privateKey.alg = 'RSA-OAEP-256'
  privateKey.key_ops = ['decrypt']

  return { publicKey, privateKey }
}

const encryptForRecipient = async (plaintext, publicKeyJwk) => {
  const publicKey = await subtle.importKey(
    'jwk',
    publicKeyJwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  )
  const aesKey = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoder.encode(plaintext))
  const rawKey = await subtle.exportKey('raw', aesKey)
  const wrappedKey = await subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, rawKey)

  return {
    encryptedContent: bytesToBase64Url(new Uint8Array(encrypted)),
    iv: bytesToBase64Url(iv),
    wrappedKey: bytesToBase64Url(new Uint8Array(wrappedKey)),
    size: encoder.encode(plaintext).byteLength
  }
}

const decryptDeveloperMessage = async (message, privateKeyJwk) => {
  const privateKey = await subtle.importKey(
    'jwk',
    privateKeyJwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  )
  const rawKey = await subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, base64UrlToBytes(message.wrappedKey))
  const aesKey = await subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt'])
  const plaintext = await subtle.decrypt(
    { name: 'AES-GCM', iv: base64UrlToBytes(message.iv) },
    aesKey,
    base64UrlToBytes(message.encryptedContent)
  )

  return decoder.decode(plaintext)
}

const commandInit = async (argv) => {
  const { flags, positionals } = parseArgs(argv)
  const alias = await resolveInitAlias(flags, positionals)
  const serverUrl = normalizeServer(flags.server)

  if (fs.existsSync(IDENTITY_FILE) && !flags.force) {
    throw new CliError(`Local identity already exists at ${IDENTITY_FILE}. Use --force to replace it locally.`)
  }

  const keys = await generateIdentityKeys()
  const registered = await apiFetch('POST', '/api/dev/identity', {
    serverUrl,
    allowInsecure: flags.allowInsecure,
    body: { alias, publicKey: keys.publicKey }
  })

  saveIdentity({
    alias: registered.alias,
    serverUrl,
    token: registered.token,
    publicKey: registered.publicKey,
    publicKeyFingerprint: registered.publicKeyFingerprint,
    privateKey: keys.privateKey,
    createdAt: registered.createdAt
  })

  console.log(`Identity created: ${registered.alias}`)
  console.log(`Fingerprint: ${registered.publicKeyFingerprint}`)
  console.log(`Server: ${serverUrl}`)
  console.log(`Private key stored: ${IDENTITY_FILE}`)
}

const commandWhoami = () => {
  const identity = loadIdentity()
  console.log(identity.alias)
  if (identity.publicKeyFingerprint) console.log(`Fingerprint: ${identity.publicKeyFingerprint}`)
  console.log(`Server: ${identity.serverUrl}`)
}

const commandTrust = async (argv) => {
  const { flags, positionals } = parseArgs(argv)
  const identity = loadIdentity()
  const alias = normalizeAlias(positionals[0])
  const contact = await apiFetch('GET', `/api/dev/identity/${encodeURIComponent(alias)}`, {
    identity,
    serverUrl: flags.server,
    allowInsecure: flags.allowInsecure
  })

  trustContact(contact)
  console.log(`${contact.alias} ${contact.publicKeyFingerprint}`)
}

const commandSend = async (argv) => {
  const parsed = parseArgs(argv)
  const identity = loadIdentity()
  const recipient = normalizeAlias(parsed.flags.to || parsed.flags.recipient)
  const content = resolveSendContent(parsed)

  if (!content.length) throw new CliError('Secret content is empty.')

  const recipientIdentity = await apiFetch('GET', `/api/dev/identity/${encodeURIComponent(recipient)}`, {
    identity,
    serverUrl: parsed.flags.server,
    allowInsecure: parsed.flags.allowInsecure
  })
  trustContact(recipientIdentity)
  const encrypted = await encryptForRecipient(content, recipientIdentity.publicKey)
  const response = await apiFetch('POST', '/api/dev/message', {
    auth: true,
    serverUrl: parsed.flags.server,
    allowInsecure: parsed.flags.allowInsecure,
    body: {
      recipient,
      encryptedContent: encrypted.encryptedContent,
      iv: encrypted.iv,
      wrappedKey: encrypted.wrappedKey,
      expiresIn: parseDuration(parsed.flags.expires || DEFAULT_EXPIRES),
      burnAfterReading: parsed.flags.noBurn ? false : true,
      size: encrypted.size
    }
  })

  console.log(`Secret sent to ${recipient}`)
  console.log(`ID: ${response.id}`)
  console.log(`Expires in: ${formatTimeLeft(response.expiresAt)}`)
}

const fetchInbox = async (flags = {}) => {
  return await apiFetch('GET', `/api/dev/inbox?limit=${encodeURIComponent(flags.limit || 20)}`, {
    auth: true,
    serverUrl: flags.server,
    allowInsecure: flags.allowInsecure
  })
}

const printInbox = (messages) => {
  if (!messages.length) {
    console.log('No pending secrets.')
    return
  }

  for (const message of messages) {
    console.log(`${message.id}  from ${message.sender}  expires ${formatTimeLeft(message.expiresAt)}  ${message.burnAfterReading ? 'burn' : 'kept'}  ${message.size} bytes`)
  }
}

const commandInbox = async (argv) => {
  const { flags } = parseArgs(argv)
  const inbox = await fetchInbox(flags)

  if (flags.json) {
    console.log(JSON.stringify(inbox, null, 2))
    return
  }

  printInbox(inbox.messages)
}

const revealMessage = async (id, flags = {}) => {
  const identity = loadIdentity()
  const message = await apiFetch('POST', `/api/dev/message/${encodeURIComponent(id)}/reveal`, {
    auth: true,
    serverUrl: flags.server,
    allowInsecure: flags.allowInsecure,
    body: {}
  })
  const plaintext = await decryptDeveloperMessage(message, identity.privateKey)

  if (flags.copy) {
    if (writeClipboard(plaintext)) {
      console.log('Secret copied to clipboard.')
    } else {
      console.log(plaintext)
      console.error('Clipboard unavailable; printed secret instead.')
    }
  } else {
    console.log(plaintext)
  }

  if (message.metadata.burnAfterReading) {
    console.error('This secret has now been burned.')
  }

  return plaintext
}

const commandReveal = async (argv) => {
  const { flags, positionals } = parseArgs(argv)
  const id = positionals[0]

  if (!id) throw new CliError('Message ID is required.')
  await revealMessage(id, flags)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const commandWatch = async (argv) => {
  const { flags } = parseArgs(argv)
  const identity = loadIdentity()
  const interval = Math.max(Number(flags.interval || 5), 1) * 1000
  const seen = new Set()
  let firstPoll = true

  console.log(`Watching inbox for ${identity.alias}...`)

  while (true) {
    const inbox = await fetchInbox(flags)
    const fresh = inbox.messages.filter((message) => !seen.has(message.id))

    if (firstPoll && flags.once && fresh.length === 0) {
      console.log('No pending secrets.')
    }

    for (const message of fresh) {
      seen.add(message.id)
      console.log(`\nNew secret from ${message.sender}`)
      console.log(`ID: ${message.id}`)
      console.log(`Expires in: ${formatTimeLeft(message.expiresAt)}`)
      console.log(`Burn after reveal: ${message.burnAfterReading ? 'yes' : 'no'}`)

      if (flags.reveal) {
        console.log('')
        await revealMessage(message.id, flags)
      } else {
        console.log(`Run: burnpast reveal ${message.id}`)
      }
    }

    firstPoll = false
    if (flags.once) break
    await sleep(interval)
  }
}

const main = async () => {
  const [command, ...argv] = process.argv.slice(2)

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(help)
    return
  }

  if (command === 'init') return await commandInit(argv)
  if (command === 'whoami') return commandWhoami()
  if (command === 'send') return await commandSend(argv)
  if (command === 'inbox') return await commandInbox(argv)
  if (command === 'watch') return await commandWatch(argv)
  if (command === 'reveal') return await commandReveal(argv)
  if (command === 'trust') return await commandTrust(argv)

  throw new CliError(`Unknown command: ${command}\n\n${help}`)
}

main().catch((error) => {
  console.error(error instanceof CliError ? error.message : error.stack || error.message)
  process.exit(error.exitCode || 1)
})
