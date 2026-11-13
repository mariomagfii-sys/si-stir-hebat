import test from 'node:test'
import assert from 'node:assert/strict'
import { createCsv } from '../src/utils/csv.ts'

test('CSV preserves commas, quotes, newlines and Indonesian text', () => {
  assert.equal(createCsv(['Nama'], [['Sekolah "Hebat", Wonosari\nGorontalo']]), '\uFEFF"Nama"\r\n"Sekolah ""Hebat"", Wonosari\nGorontalo"\r\n')
})
test('CSV neutralizes spreadsheet formulas including leading whitespace', () => {
  for (const value of ['=1+1', '+SUM(1)', '-1+2', '@SUM(1)', ' \t=1+1']) assert.ok(createCsv(['Isi'], [[value]]).includes(`"'${value}"`))
})
test('CSV handles empty values and reports only rows supplied', () => {
  assert.equal(createCsv(['Nama', 'Jumlah'], [[null, 0]]), '\uFEFF"Nama","Jumlah"\r\n"","0"\r\n')
})
