import Booking from "../model/booking.model.js";
import Listing from "../model/listing.model.js";
import User from "../model/user.model.js";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import dotenv from "dotenv";

dotenv.config();

// Initialize Cashfree
const cashfree = new Cashfree(
    process.env.CASHFREE_ENV === "PRODUCTION" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);

export const createOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, customer_details } = req.body;

        const listing = await Listing.findById(id);
        if (!listing) return res.status(404).json({ message: "Listing not found" });

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const request = {
            order_amount: price,
            order_currency: "INR",
            order_id: `order_${Date.now()}`,
            customer_details: {
                customer_id: user._id.toString(),
                customer_email: user.email,
                customer_phone: customer_details.customer_phone || "9999999999", // Fallback if phone not provided
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL}/payment-status?order_id={order_id}`,
            },
        };

        const response = await cashfree.PGCreateOrder(request);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error creating Cashfree order:", error);
        res.status(500).json({ message: "Failed to create payment order", error: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { orderId, bookingDetails } = req.body;

        const response = await cashfree.PGOrderFetchPayments(orderId);
        const payments = response.data;

        const successfulPayment = payments.find(
            (p) => p.payment_status === "SUCCESS"
        );

        if (successfulPayment) {
            // Finalize booking
            const { checkIn, checkOut, totalRent, listingId } = bookingDetails;
            const listing = await Listing.findById(listingId);
            if (!listing || listing.isBooked) {
                return res.status(400).json({ message: "Listing already booked or not found" });
            }

            const booking = await Booking.create({
                checkIn,
                checkOut,
                totalRent,
                host: listing.host,
                guest: req.userId,
                listing: listing._id
            });

            await booking.populate("host", "email");

            await User.findByIdAndUpdate(req.userId, {
                $push: { booking: listing._id }
            });

            listing.guest = req.userId;
            listing.isBooked = true;
            await listing.save();

            return res.status(200).json({ message: "Booking successful", booking });
        } else {
            return res.status(400).json({ message: "Payment verification failed" });
        }

    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({ message: "Error verifying payment", error: error.message });
    }
};

export const createBooking = async (req, res) => {
    // Legacy function, currently handled by createOrder -> frontend -> verifyPayment flow
    try {
        let { id } = req.params;
        let { checkIn, checkOut, totalRent } = req.body;
        let listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: "Listing is not found" });
        }
        if (new Date(checkIn) >= new Date(checkOut)) {
            return res.status(400).json({ message: "Invalid checkIn/checkOut date" });
        }
        if (listing.isBooked) {
            return res.status(400).json({ message: "Listing is is already Booked" });
        }
        let booking = await Booking.create({
            checkIn,
            checkOut,
            totalRent,
            host: listing.host,
            guest: req.userId,
            listing: listing._id
        });
        await booking.populate("host", "email");

        let user = await User.findByIdAndUpdate(req.userId, {
            $push: { booking: listing }
        }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User is not found" });
        }

        listing.guest = req.userId;
        listing.isBooked = true;
        await listing.save();
        return res.status(201).json(booking);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Booking error ${error}` });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { isBooked: false });
        let user = await User.findByIdAndUpdate(listing.guest, { $pull: { booking: listing._id } }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "Booking cancelled" });
    } catch (error) {
        return res.status(500).json({ message: "Booking cancel error" });
    }
};