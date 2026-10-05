import assert from 'node:assert/strict'
import { test } from 'node:test'
import { certificatePdf, serialFor } from '../src/lib/certificate'

const cert = (name: string, course = 'Introdução à Fotografia') =>
  certificatePdf({ name, course, serial: 'AULA-AB12-CD34', date: '2026-10-05', locale: 'pt' })

test('Portuguese accents are written in the font encoding, not as UTF-8 bytes', () => {
  const pdf = cert('José Conceição')
  // WinAnsi: é = 0xE9, ç = 0xE7, ã = 0xE3. UTF-8 would be two bytes each (é = C3 A9).
  assert.ok(pdf.includes(Buffer.from([0x4a, 0x6f, 0x73, 0xe9])), 'José as WinAnsi bytes')
  assert.ok(pdf.includes(Buffer.from([0x43, 0x6f, 0x6e, 0x63, 0x65, 0x69, 0xe7, 0xe3, 0x6f])), 'Conceição as WinAnsi bytes')
  assert.equal(pdf.includes(Buffer.from([0xc3, 0xa9])), false, 'no UTF-8 é left in the file')
  assert.match(pdf.toString('latin1'), /\/Encoding \/WinAnsiEncoding/)
})

test('parentheses and backslashes in a name cannot break the PDF string', () => {
  const text = cert('Ana (Lisboa) \\ Porto').toString('latin1')
  assert.ok(text.includes('(Ana \\(Lisboa\\) \\\\ Porto) Tj'))
})

test('every xref offset points at its object and startxref points at the table', () => {
  const pdf = cert('José Conceição')
  const text = pdf.toString('latin1')
  const entries = text.split('xref\n0 6\n')[1].split('\ntrailer')[0].split('\n').slice(1)
  assert.equal(entries.length, 5)
  entries.forEach((entry, index) => {
    const offset = Number(entry.slice(0, 10))
    assert.equal(pdf.subarray(offset, offset + 8).toString('latin1'), `${index + 1} 0 obj `)
  })
  const startxref = Number(text.split('startxref\n')[1].split('\n')[0])
  assert.equal(pdf.subarray(startxref, startxref + 4).toString('latin1'), 'xref')
})

test('the content stream length matches its bytes', () => {
  const text = cert('José Conceição').toString('latin1')
  const length = Number(text.match(/\/Length (\d+) >> stream\n/)![1])
  const start = text.indexOf('stream\n') + 'stream\n'.length
  const end = text.indexOf('\nendstream')
  assert.equal(end - start, length)
})

test('serial numbers use the last four characters of each id', () => {
  assert.equal(serialFor('user_abc123xyz9', 'course_77k2'), 'AULA-XYZ9-77K2')
})
