import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = resolve(root, process.argv[2] ?? 'dist')
const fixtureSource = readFileSync(resolve(root, 'tests/fixtures/demo-auth.ts'), 'utf8')
const markers = [...fixtureSource.matchAll(/(?:id|email|password): '([^']+)'/g)]
  .map(([, value]) => value)
const accountEmails = [...fixtureSource.matchAll(/email: '([^']+)'/g)].map(([, value]) => value)
const accountPasswords = [...fixtureSource.matchAll(/password: '([^']+)'/g)].map(([, value]) => value)
const roleLabels = new Set(['Admin Sekolah', 'Kepala Sekolah'])
const demoNames = [...fixtureSource.matchAll(/full_name: '([^']+)'/g)]
  .map(([, value]) => value)
  .filter(value => !roleLabels.has(value))
function listFiles(directory, relative = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const childRelative = relative ? `${relative}/${entry.name}` : entry.name
    const childPath = resolve(directory, entry.name)
    return entry.isDirectory() ? listFiles(childPath, childRelative) : [childRelative]
  })
}

const outputFiles = listFiles(output)
const bundles = outputFiles.filter(name => name.endsWith('.js'))
const leaked = []

for (const name of bundles) {
  const content = readFileSync(resolve(output, name), 'utf8')
  for (const marker of markers) {
    if (content.includes(marker)) leaked.push(`${name}: akun demo ditemukan`)
  }
}

for (const name of outputFiles) {
  const path = resolve(output, name)
  if (!/\.(?:html|js|css|json|map|txt|svg)$/i.test(name)) continue
  let content
  try { content = readFileSync(path, 'utf8') } catch { continue }
  if (accountEmails.some(marker => content.includes(marker))
    || accountPasswords.some(marker => content.includes(marker))
    || demoNames.some(marker => content.includes(marker))) {
    leaked.push(`${name}: kredensial akun demo ditemukan`)
  }
}

if (!bundles.length) {
  console.error('Pemeriksaan bundel gagal: tidak ada berkas JavaScript di dist/assets.')
  process.exit(1)
}

if (leaked.length) {
  console.error('Pemeriksaan bundel gagal:')
  for (const message of leaked) console.error(`- ${message}`)
  process.exit(1)
}

console.log(`Bundel produksi OK: ${bundles.length} berkas JavaScript tanpa akun demo.`)
