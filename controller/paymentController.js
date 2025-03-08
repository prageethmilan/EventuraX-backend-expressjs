require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Advertisement = require("../models/advertisement.models");
const Vendor = require("../models/vendor.models");
const {STATUS_500, STATUS_400, STATUS_200_WITH_DATA} = require("../const/const");

const processPayment = async (req, res) => {
    try {
        const {advertisementId, amount, paymentMethod} = req.body;

        if (!advertisementId) {
            return res.status(400).json(STATUS_400("Advertisement ID is required", false));
        }

        const advertisement = await Advertisement.findById(advertisementId).populate("vendorId");
        if (!advertisement) {
            return res.status(404).json(STATUS_400("Advertisement not found", false));
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: [paymentMethod],
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}`,
            customer_email: advertisement.vendorId.email,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: advertisement.title
                            // description: advertisement.description,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                advertisementId: advertisement._id.toString(),
            },
        });

        res.status(200).json(STATUS_200_WITH_DATA({sessionUrl: session.url}, true, "Redirecting to Stripe checkout"));

    } catch (error) {
        console.error(error);
        res.status(500).json(STATUS_500);
    }
}

const verifyPayment = async (req, res) => {
    try {
        const {sessionId} = req.body;

        if (!sessionId) {
            return res.status(400).json({message: "Session ID is required", success: false});
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {

            const advertisementId = session.metadata.advertisementId;
            await Advertisement.findByIdAndUpdate(advertisementId, {paymentStatus: "COMPLETED"});

            res.status(200).json({message: "Payment verified", success: true});
        } else {
            res.status(400).json({message: "Payment not completed", success: false});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Payment verification failed", success: false});
    }
};
module.exports = {
    processPayment,
    verifyPayment
};