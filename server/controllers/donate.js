const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const donate = async (req, res) => {
  
  try {
    const { name, locality, phno, amt, donationType, token } = req.body;

    if (!name || !locality || !phno || !amt || !donationType || !token) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const charge = await stripe.charges.create({
      amount: amt * 100,
      currency: "usd",
      description: `Donation for ${donationType}`,
      source: token.id,
    });

    console.log("Payment Successful:", charge);

    res.status(200).json({ success: true, message: "Payment successful" });

  } catch (error) {
    console.error("Payment Error:", error);

    let errorMessage = "Payment failed";
    if (error.type === 'StripeCardError') {
      errorMessage = error.message;
    }

    res.status(500).json({ success: false, error: errorMessage });
  }
};

module.exports = { donate };
