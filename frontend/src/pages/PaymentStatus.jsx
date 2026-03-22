import React, { useEffect, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { bookingDataContext } from '../Context/BookingContext';
import { authDataContext } from '../Context/AuthContext';
import { userDataContext } from '../Context/UserContext';
import { listingDataContext } from '../Context/ListingContext';
import { toast } from 'react-toastify';

function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setBookingData, setBooking } = useContext(bookingDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { getCurrentUser } = useContext(userDataContext);
  const { getListing } = useContext(listingDataContext);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const query = new URLSearchParams(location.search);
      const orderId = query.get('order_id');

      if (!orderId) {
        toast.error("Invalid payment redirect");
        navigate("/");
        return;
      }

      try {
        // Retrieve pending booking details
        const savedData = localStorage.getItem("pending_booking");
        if (!savedData) {
          toast.error("Booking data not found for verification");
          navigate("/");
          return;
        }

        const { orderId: savedOrderId, bookingDetails } = JSON.parse(savedData);

        if (savedOrderId !== orderId) {
           console.warn("Order ID mismatch, but proceeding with URL order_id");
        }

        const verifyResponse = await axios.post(
          serverUrl + "/api/booking/verify-payment",
          {
            orderId: orderId,
            bookingDetails: bookingDetails
          },
          { withCredentials: true }
        );

        if (verifyResponse.status === 200) {
          setBookingData(verifyResponse.data.booking);
          await getCurrentUser();
          await getListing();
          localStorage.removeItem("pending_booking");
          setVerifying(false);
          toast.success("Booking Successfully");
          navigate("/booked");
        }
      } catch (error) {
        console.error("Verification Error:", error);
        toast.error(error.response?.data?.message || "Payment verification failed");
        setVerifying(false);
        navigate("/");
      }
    };

    verify();
  }, []);

  if (verifying) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <h2 className="text-xl font-semibold">Verifying Payment...</h2>
        <p className="text-gray-500">Please do not refresh the page.</p>
      </div>
    );
  }

  return null;
}

export default PaymentStatus;
