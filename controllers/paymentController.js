const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

const createCheckoutSession = async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.est_gratuit) {
      return res.status(400).json({ error: 'This course is free' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.titre || 'Course Payment',
              description: course.description || 'Safoua Academy Course',
              images: course.image_couverture ? [course.image_couverture] : [],
            },
            unit_amount: Math.round(course.prix * 100) || 5000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        courseId: courseId,
        userId: req.user?._id || 'guest',
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error('Stripe Error:', e.message);
    res.status(500).json({ error: e.message });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { courseId, userId } = session.metadata;

      if (userId && userId !== 'guest') {
        const enrollment = await Enrollment.findOne({
          etudiant_id: userId,
          cours_id: courseId,
        });

        if (!enrollment) {
          await Enrollment.create({
            etudiant_id: userId,
            cours_id: courseId,
            statut: 'actif',
          });
        }
      }

      console.log('Payment completed for course:', courseId);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
};
