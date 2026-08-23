import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const body = (await request.json()) as { kind?: 'course' | 'subscription'; courseId?: string }
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const stripe = getStripe()

  if (body.kind === 'subscription') {
    if (!stripe || !process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
      await prisma.subscription.create({ data: { userId: user.id, status: 'active' } })
      await prisma.billingEvent.create({
        data: { userId: user.id, kind: 'local.subscription', payload: '{}' },
      })
      return NextResponse.json({ ok: true, local: true })
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/campus?paid=1`,
      cancel_url: `${origin}/campus`,
      metadata: { userId: user.id, kind: 'subscription' },
    })
    return NextResponse.json({ url: session.url })
  }

  if (!body.courseId) return NextResponse.json({ error: 'course' }, { status: 400 })
  const course = await prisma.course.findUnique({ where: { id: body.courseId } })
  if (!course) return NextResponse.json({ error: 'missing' }, { status: 404 })

  if (!stripe || !process.env.STRIPE_COURSE_PRICE_ID) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      update: { kind: 'one_time' },
      create: { userId: user.id, courseId: course.id, kind: 'one_time' },
    })
    await prisma.billingEvent.create({
      data: { userId: user.id, kind: 'local.course', payload: course.id },
    })
    return NextResponse.json({ ok: true, local: true })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_COURSE_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/learn/${course.slug}?paid=1`,
    cancel_url: `${origin}/learn/${course.slug}`,
    metadata: { userId: user.id, courseId: course.id, kind: 'course' },
  })
  return NextResponse.json({ url: session.url })
}
