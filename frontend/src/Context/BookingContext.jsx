import axios from 'axios'
import React, { Children, createContext, useContext, useState } from 'react'
import { authDataContext } from './AuthContext'
import { userDataContext } from './UserContext'
import { listingDataContext } from './ListingContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { load } from '@cashfreepayments/cashfree-js'

export const bookingDataContext = createContext()


function BookingContext({ children }) {

  let [checkIn, setCheckIn] = useState("")
  let [checkOut, setCheckOut] = useState("")
  let [total, setTotal] = useState(0)
  let [night, setNight] = useState(0)
  let {serverUrl} = useContext(authDataContext)
  let {getCurrentUser} = useContext(userDataContext)
  let {getListing} = useContext(listingDataContext)
  let [bookingData, setBookingData] = useState([])
  let [booking, setBooking] = useState(false)
  let navigate = useNavigate()

  const [cashfree, setCashfree] = useState(null);

  React.useEffect(() => {
    const initializeSDK = async () => {
      const sdk = await load({
        mode: "sandbox", 
      });
      setCashfree(sdk);
    };
    initializeSDK();
  }, []);


  const handleBooking = async (id)=>{
    if (!cashfree) {
      toast.error("Payment SDK not loaded yet");
      return;
    }
    setBooking(true)
    try {
      // 1. Create order on backend
      let orderResponse = await axios.post(serverUrl + `/api/booking/create-order/${id}`,
        {
          price: total,
          customer_details: {
            customer_phone: "9999999999" // Fallback or get from user profile if available
          }
        },{withCredentials:true}
      )
      
      const { payment_session_id, order_id } = orderResponse.data;

      // Save details for redirect handling
      localStorage.setItem("pending_booking", JSON.stringify({
        orderId: order_id,
        bookingDetails: {
          checkIn,
          checkOut,
          totalRent: total,
          listingId: id
        }
      }));

      // 2. Launch checkout
      let checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_self", 
      };

      cashfree.checkout(checkoutOptions).then(async (result) => {
        if (result.error) {
          console.log("Payment Error:", result.error);
          setBooking(false)
          toast.error(result.error.message)
        }
        if (result.redirect) {
          console.log("Payment will be redirected");
        }
        if (result.paymentDetails) {
          console.log("Payment completed, verifying...");
          
          // 3. Verify payment on backend
          try {
            const verifyResponse = await axios.post(serverUrl + "/api/booking/verify-payment", {
              orderId: order_id,
              bookingDetails: {
                checkIn,
                checkOut,
                totalRent: total,
                listingId: id
              }
            }, { withCredentials: true });

            if (verifyResponse.status === 200) {
              setBookingData(verifyResponse.data.booking)
              await getCurrentUser()
              await getListing()
              setBooking(false)
              navigate("/booked")
              toast.success("Booking Successfully")
            }
          } catch (error) {
            console.error("Verification Error:", error);
            setBooking(false)
            toast.error(error.response?.data?.message || "Payment verification failed")
          }
        }
      });

    } catch (error) {
      console.log(error)
      setBooking(false)
      toast.error(error.response?.data?.message || "Error initiating payment")
    }
  }

  const cancelBooking = async (id) => {
    try {
      let result = await axios.delete(serverUrl + `/api/booking/cancel/${id}`,
          {withCredentials:true}
        )
        await getCurrentUser()
        await getListing()
        console.log(result.data)
        toast.success("CancelBooking Successfully")
      
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }


  let value = {
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    total, setTotal,
    night, setNight,
    bookingData, setBookingData,
    handleBooking, cancelBooking,
    booking, setBooking

  }

  return (
    <bookingDataContext.Provider value={value}>
      {children}
    </bookingDataContext.Provider>
  )
}

export default BookingContext
