import { PrismaClient } from '@prisma/client'
import { DEMO_PLAYBACK } from '../src/lib/mux'

const prisma = new PrismaClient()

const quiz = (prompt: string, promptEn: string, options: string[], optionsEn: string[], answer: number) => ({
  prompt,
  promptEn,
  options: JSON.stringify(options),
  optionsEn: JSON.stringify(optionsEn),
  answer,
})

async function main() {
  await prisma.billingEvent.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.progress.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  const david = await prisma.user.create({
    data: { email: 'david@ividi.dev', name: 'David Martins', role: 'instructor' },
  })
  const ines = await prisma.user.create({
    data: { email: 'ines@aula.dev', name: 'Inês Costa', role: 'student' },
  })
  const nuno = await prisma.user.create({
    data: { email: 'nuno@aula.dev', name: 'Nuno Ribeiro', role: 'student' },
  })

  const foco = await prisma.course.create({
    data: {
      slug: 'foco-livre',
      title: 'Foco livre',
      titleEn: 'Open focus',
      synopsis: 'Aula aberta sobre luz, enquadramento e o hábito de ver antes de gravar.',
      synopsisEn: 'An open lesson on light, framing and the habit of seeing before you record.',
      access: 'free',
      priceCents: 0,
      hue: 'ember',
    },
  })
  const rua = await prisma.course.create({
    data: {
      slug: 'rua-noite',
      title: 'Rua à noite',
      titleEn: 'Street at night',
      synopsis: 'Fotojornalismo de rua: exposição, movimento e o recorte certo no passeio.',
      synopsisEn: 'Street reportage: exposure, motion and the right crop on the pavement.',
      access: 'one_time',
      priceCents: 4900,
      hue: 'amber',
    },
  })
  const quarto = await prisma.course.create({
    data: {
      slug: 'quarto-escuro',
      title: 'Quarto escuro',
      titleEn: 'Darkroom',
      synopsis: 'Revelação, papel e o silêncio do laboratório. Só no passe AULA.',
      synopsisEn: 'Development, paper and the quiet of the lab. AULA pass only.',
      access: 'subscription',
      priceCents: 0,
      hue: 'coal',
    },
  })

  const lessons = [
    {
      courseId: foco.id,
      title: 'Ver a luz',
      titleEn: 'See the light',
      position: 1,
      ...quiz(
        'O que decide primeiro o recorte?',
        'What decides the crop first?',
        ['A luz no sujeito', 'O ISO máximo', 'O peso da câmara'],
        ['Light on the subject', 'Maximum ISO', 'Camera weight'],
        0,
      ),
    },
    {
      courseId: foco.id,
      title: 'O hábito de esperar',
      titleEn: 'The habit of waiting',
      position: 2,
      ...quiz(
        'Quando disparas na rua?',
        'When do you fire on the street?',
        ['Assim que vês a cena', 'Quando o gesto fecha', 'Sempre em burst'],
        ['As soon as you see the scene', 'When the gesture closes', 'Always in burst'],
        1,
      ),
    },
    {
      courseId: rua.id,
      title: 'Cascais depois das 22',
      titleEn: 'Cascais after 22:00',
      position: 1,
      ...quiz(
        'Como seguras o movimento numa avenida?',
        'How do you hold motion on an avenue?',
        ['Tripeça e 1/15', 'Mão e 1/250', 'Flash em tudo'],
        ['Tripod and 1/15', 'Hand and 1/250', 'Flash on everything'],
        1,
      ),
    },
    {
      courseId: rua.id,
      title: 'Gente que passa',
      titleEn: 'People passing',
      position: 2,
      ...quiz(
        'O que evitas no retrato de rua?',
        'What do you avoid in a street portrait?',
        ['Olho no sujeito', 'O recorte no joelho', 'Fundo simples'],
        ['Eye on the subject', 'A crop at the knee', 'A simple background'],
        1,
      ),
    },
    {
      courseId: quarto.id,
      title: 'A tina e o tempo',
      titleEn: 'The tray and the time',
      position: 1,
      ...quiz(
        'O que marca o preto no papel?',
        'What marks the black on the paper?',
        ['O tempo na revelação', 'O ISO da câmara', 'O zoom digital'],
        ['Time in the developer', 'Camera ISO', 'Digital zoom'],
        0,
      ),
    },
    {
      courseId: quarto.id,
      title: 'A prova de contacto',
      titleEn: 'The contact sheet',
      position: 2,
      ...quiz(
        'Para que serve a prova?',
        'What is the contact sheet for?',
        ['Escolher o negativo', 'Calibrar o ecrã', 'Vender a câmara'],
        ['Choosing the negative', 'Calibrating the screen', 'Selling the camera'],
        0,
      ),
    },
  ]

  for (const item of lessons) {
    const lesson = await prisma.lesson.create({
      data: {
        courseId: item.courseId,
        title: item.title,
        titleEn: item.titleEn,
        position: item.position,
        playbackId: DEMO_PLAYBACK,
        durationSec: 96,
      },
    })
    await prisma.quiz.create({
      data: {
        lessonId: lesson.id,
        prompt: item.prompt,
        promptEn: item.promptEn,
        options: item.options,
        optionsEn: item.optionsEn,
        answer: item.answer,
      },
    })
  }

  await prisma.enrollment.create({
    data: { userId: ines.id, courseId: foco.id, kind: 'free' },
  })
  await prisma.subscription.create({
    data: { userId: nuno.id, status: 'active' },
  })

  console.log(`Seeded AULA: ${david.email}, ${ines.email}, ${nuno.email}`)
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
