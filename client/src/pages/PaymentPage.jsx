import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      // Step 1: Create Razorpay Order from backend
      const { data } = await api.post("/payments/create-order", {
        orderId,
      });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          // Step 2: Verify Payment
          await api.post("/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
          });

          alert("Payment Successful!");
          navigate("/");
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Payment failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={handlePayment}
        className="bg-green-500 text-white px-6 py-3 rounded text-xl"
      >
        Pay Now
      </button>
    </div>
  );
}

export default PaymentPage;
