export const COMPLETE_AT = 90

export function percentWatched(seconds: number, duration: number): number {
  if (duration <= 0) return 0
  return Math.min(100, Math.round((Math.max(0, seconds) / duration) * 100))
}

export function isLessonComplete(percent: number): boolean {
  return percent >= COMPLETE_AT
}

export function coursePercent(lessons: { percent: number }[]): number {
  if (lessons.length === 0) return 0
  return Math.round(lessons.reduce((sum, item) => sum + item.percent, 0) / lessons.length)
}

export function canIssueCertificate(input: {
  lessons: { percent: number; hasQuiz: boolean; quizPassed: boolean }[]
}): boolean {
  if (input.lessons.length === 0) return false
  return input.lessons.every((lesson) => {
    const watched = isLessonComplete(lesson.percent)
    const quiz = !lesson.hasQuiz || lesson.quizPassed
    return watched && quiz
  })
}

export function hasCourseAccess(input: {
  access: string
  enrolled: boolean
  subscribed: boolean
  instructor: boolean
}): boolean {
  if (input.instructor || input.access === 'free') return true
  if (input.access === 'subscription') return input.subscribed
  return input.enrolled || input.subscribed
}
