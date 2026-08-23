export type SessionUser = { id: string; email: string; name: string; role: string }

export type CourseCard = {
  id: string
  slug: string
  title: string
  titleEn: string
  synopsis: string
  synopsisEn: string
  access: string
  priceCents: number
  hue: string
  lessons: number
  enrolled: boolean
  percent: number
  certificated: boolean
}

export type LessonCard = {
  id: string
  title: string
  titleEn: string
  position: number
  playbackId: string
  durationSec: number
  percent: number
  completed: boolean
  quizPassed: boolean
  hasQuiz: boolean
}

export type CampusPayload = {
  user: SessionUser | null
  demoUsers: SessionUser[]
  subscribed: boolean
  mux: boolean
  stripe: boolean
  courses: CourseCard[]
}

export type LessonRoomPayload = {
  course: Pick<CourseCard, 'id' | 'slug' | 'title' | 'titleEn'>
  lessons: LessonCard[]
  lesson: LessonCard & {
    quiz: { prompt: string; promptEn: string; options: string[]; optionsEn: string[] } | null
  }
  access: boolean
  certificateReady: boolean
}
