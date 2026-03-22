import express from "express";
import isAuth from "../middleware/isAuth.js";
import { cancelBooking, createBooking, createOrder, verifyPayment } from "../controllers/booking.controller.js";

let bookingRouter = express.Router()

bookingRouter.post("/create/:id",isAuth,createBooking)
bookingRouter.post("/create-order/:id", isAuth, createOrder)
bookingRouter.post("/verify-payment", isAuth, verifyPayment)
bookingRouter.delete("/cancel/:id",isAuth, cancelBooking)


export default bookingRouter