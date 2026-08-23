import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canIssueCertificate, hasCourseAccess, isLessonComplete, percentWatched } from '../src/lib/progress'

test('percent watched clamps to 100', () => {
  assert.equal(percentWatched(45, 90), 50)
  assert.equal(percentWatched(200, 90), 100)
  assert.equal(percentWatched(10, 0), 0)
})

test('lesson completes at 90 percent', () => {
  assert.equal(isLessonComplete(89), false)
  assert.equal(isLessonComplete(90), true)
})

test('subscription and purchase unlock the right rooms', () => {
  assert.equal(hasCourseAccess({ access: 'free', enrolled: false, subscribed: false, instructor: false }), true)
  assert.equal(hasCourseAccess({ access: 'one_time', enrolled: false, subscribed: false, instructor: false }), false)
  assert.equal(hasCourseAccess({ access: 'one_time', enrolled: true, subscribed: false, instructor: false }), true)
  assert.equal(hasCourseAccess({ access: 'subscription', enrolled: false, subscribed: true, instructor: false }), true)
  assert.equal(hasCourseAccess({ access: 'subscription', enrolled: false, subscribed: false, instructor: true }), true)
})

test('certificate needs watch and quiz', () => {
  assert.equal(
    canIssueCertificate({
      lessons: [
        { percent: 92, hasQuiz: true, quizPassed: true },
        { percent: 95, hasQuiz: true, quizPassed: true },
      ],
    }),
    true,
  )
  assert.equal(
    canIssueCertificate({
      lessons: [{ percent: 92, hasQuiz: true, quizPassed: false }],
    }),
    false,
  )
})
