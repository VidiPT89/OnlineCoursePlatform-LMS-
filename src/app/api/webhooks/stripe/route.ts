import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) return NextResponse.json({ received: true })

  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''
  const event = stripe.webhooks.constructEvent(body, signature, secret)
  const payload = JSON.stringify(event.data.object)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId
    const courseId = session.metadata?.courseId
    const kind = session.metadata?.kind
    if (userId && kind === 'course' && courseId) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { kind: 'one_time' },
        create: { userId, courseId, kind: 'one_time' },
      })
      await prisma.billingEvent.create({ data: { userId, kind: event.type, payload } })
    }
    if (userId && kind === 'subscription') {
      await prisma.subscription.create({
        data: {
          userId,
          status: 'active',
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
          stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
        },
      })
      await prisma.billingEvent.create({ data: { userId, kind: event.type, payload } })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const object = event.data.object as { metadata?: { userId?: string } }
    if (object.metadata?.userId) {
      await prisma.subscription.updateMany({
        where: { userId: object.metadata.userId },
        data: { status: 'canceled' },
      })
    }
  }

  return NextResponse.json({ received: true })
}
