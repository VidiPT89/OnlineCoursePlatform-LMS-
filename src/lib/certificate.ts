function escapePdf(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

export function certificatePdf(input: {
  name: string
  course: string
  serial: string
  date: string
  locale: 'pt' | 'en'
}) {
  const title = input.locale === 'pt' ? 'CERTIFICADO' : 'CERTIFICATE'
  const lead =
    input.locale === 'pt'
      ? 'A AULA reconhece que'
      : 'AULA recognises that'
  const mid =
    input.locale === 'pt'
      ? 'concluiu o curso'
      : 'completed the course'
  const brand = 'AULA  ·  ividi.dev'

  const content = [
    'BT',
    '/F1 28 Tf',
    '1 0.48 0 rg',
    `72 720 Td (${escapePdf(title)}) Tj`,
    '0 -36 Td',
    '/F1 12 Tf',
    '0.96 0.9 0.79 rg',
    `(${escapePdf(lead)}) Tj`,
    '0 -28 Td',
    '/F1 18 Tf',
    `1 0.67 0 rg (${escapePdf(input.name)}) Tj`,
    '0 -28 Td',
    '/F1 12 Tf',
    `0.96 0.9 0.79 rg (${escapePdf(mid)}) Tj`,
    '0 -24 Td',
    '/F1 16 Tf',
    `1 0.48 0 rg (${escapePdf(input.course)}) Tj`,
    '0 -40 Td',
    '/F1 10 Tf',
    `0.96 0.9 0.79 rg (${escapePdf(`${input.date}  ·  ${input.serial}`)}) Tj`,
    '0 -36 Td',
    `(${escapePdf(brand)}) Tj`,
    'ET',
  ].join('\n')

  const stream = `q
1 1 1 0.04 K
4 w
48 48 499 746 re
S
Q
${content}
`

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ]

  let offset = 9
  const xref = ['0000000000 65535 f ']
  const body = objects
    .map((object) => {
      xref.push(`${String(offset).padStart(10, '0')} 00000 n `)
      const chunk = `${object}\n`
      offset += Buffer.byteLength(chunk)
      return chunk
    })
    .join('')

  const pdf = `%PDF-1.4
${body}xref
0 6
${xref.join('\n')}
trailer << /Size 6 /Root 1 0 R >>
startxref
${offset}
%%EOF
`
  return Buffer.from(pdf)
}

export function serialFor(userId: string, courseId: string) {
  return `AULA-${userId.slice(-4).toUpperCase()}-${courseId.slice(-4).toUpperCase()}`
}
