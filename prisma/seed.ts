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
      synopsis: 'Curso de exemplo gratuito. Qualquer aluno entra sem pagar.',
      synopsisEn: 'Free sample course. Any student can enter without paying.',
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
      synopsis: 'Curso de exemplo pago uma vez (49 €). Compra só este curso.',
      synopsisEn: 'Paid sample course (one-time, €49). Buy only this course.',
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
      synopsis: 'Curso de exemplo só com assinatura mensal. Não se compra à unidade.',
      synopsisEn: 'Sample course for the monthly subscription only. Not sold on its own.',
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
      notes: 'Antes do recorte, lê a luz no sujeito. O resto da câmara espera.',
      notesEn: 'Before the crop, read the light on the subject. The rest of the camera waits.',
      durationSec: 112,
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
      notes: 'A rua dá o gesto. Tu só disparas quando ele fecha.',
      notesEn: 'The street gives the gesture. You only fire when it closes.',
      durationSec: 98,
      ...quiz(
        'Quando disparas na rua?',
        'When do you fire on the street?',
        ['Assim que vês a cena', 'Quando o gesto fecha', 'Sempre em burst'],
        ['As soon as you see the scene', 'When the gesture closes', 'Always in burst'],
        1,
      ),
    },
    {
      courseId: foco.id,
      title: 'Um fotograma, uma decisão',
      titleEn: 'One frame, one decision',
      position: 3,
      notes: 'Menos rajada. Um fotograma que aguente o papel.',
      notesEn: 'Less burst. One frame that can hold the paper.',
      durationSec: 104,
      ...quiz(
        'O que pedes a um fotograma?',
        'What do you ask of a frame?',
        ['Que sobreviva ao papel', 'Que encha o cartão', 'Que imite um filtro'],
        ['That it survives the paper', 'That it fills the card', 'That it copies a filter'],
        0,
      ),
    },
    {
      courseId: rua.id,
      title: 'Cascais depois das 22',
      titleEn: 'Cascais after 22:00',
      position: 1,
      notes: 'Na avenida, 1/250 na mão. A luz laranja do passeio faz o resto.',
      notesEn: 'On the avenue, 1/250 in the hand. The orange pavement light does the rest.',
      durationSec: 128,
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
      notes: 'Evita o corte no joelho. Deixa o corpo inteiro ou fecha no rosto.',
      notesEn: 'Avoid the crop at the knee. Keep the body whole or close on the face.',
      durationSec: 118,
      ...quiz(
        'O que evitas no retrato de rua?',
        'What do you avoid in a street portrait?',
        ['Olho no sujeito', 'O recorte no joelho', 'Fundo simples'],
        ['Eye on the subject', 'A crop at the knee', 'A simple background'],
        1,
      ),
    },
    {
      courseId: rua.id,
      title: 'O último eléctrico',
      titleEn: 'The last tram',
      position: 3,
      notes: 'O vidro do eléctrico é um segundo recorte. Não disparares contra o reflexo.',
      notesEn: 'The tram glass is a second crop. Do not fire into the reflection.',
      durationSec: 121,
      ...quiz(
        'O que fazes com o reflexo no vidro?',
        'What do you do with the glass reflection?',
        ['Usas como camada', 'Disparas contra ele', 'Apagas no telemóvel'],
        ['You use it as a layer', 'You fire against it', 'You wipe it on the phone'],
        0,
      ),
    },
    {
      courseId: quarto.id,
      title: 'A tina e o tempo',
      titleEn: 'The tray and the time',
      position: 1,
      notes: 'O preto no papel nasce no tempo da revelação, não no ISO da câmara.',
      notesEn: 'The black on the paper is born in the developer time, not in camera ISO.',
      durationSec: 134,
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
      notes: 'A prova serve para escolher o negativo, não para vender a câmara.',
      notesEn: 'The sheet is for choosing the negative, not for selling the camera.',
      durationSec: 109,
      ...quiz(
        'Para que serve a prova?',
        'What is the contact sheet for?',
        ['Escolher o negativo', 'Calibrar o ecrã', 'Vender a câmara'],
        ['Choosing the negative', 'Calibrating the screen', 'Selling the camera'],
        0,
      ),
    },
    {
      courseId: quarto.id,
      title: 'A ampliadora',
      titleEn: 'The enlarger',
      position: 3,
      notes: 'Fecha o diafragma da ampliadora. O foco no papel pede calma.',
      notesEn: 'Stop down the enlarger. Focus on the paper asks for quiet.',
      durationSec: 126,
      ...quiz(
        'Onde focas no laboratório?',
        'Where do you focus in the lab?',
        ['No papel', 'No ecrã do telemóvel', 'No ISO automático'],
        ['On the paper', 'On the phone screen', 'On auto ISO'],
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
        durationSec: item.durationSec,
        notes: item.notes,
        notesEn: item.notesEn,
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
