import { useEffect, useRef } from "react";
import { loadScript } from "@paypal/paypal-js";
import { paymentService } from "@/services/paymentService";

type PayPalButtonProps = {
  amount: number;
  orderId: string;
  customerEmail: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  isLoading?: boolean;
};

type PayPalButtonsInstance = {
  render: (container: HTMLElement | string) => Promise<void> | void;
  close: () => Promise<void> | void;
};

export const PayPalButton = ({ amount, orderId, customerEmail, onSuccess, onError, isLoading = false }: PayPalButtonProps) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalButtonsRef = useRef<PayPalButtonsInstance | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const setupPayPal = async () => {
      const clientId = String(import.meta.env.VITE_PAYPAL_CLIENT_ID || "").trim();

      if (!clientId) {
        onError("PayPal Client ID not configured");
        return;
      }

      try {
        await loadScript({
          clientId,
          intent: "capture",
          currency: "USD",
        });

        if (!window.paypal || !paypalContainerRef.current) {
          onError("PayPal SDK failed to load");
          return;
        }

        if (paypalButtonsRef.current) {
          await paypalButtonsRef.current.close();
        }

        paypalButtonsRef.current = window.paypal.Buttons({
          createOrder: async () => {
            try {
              const response = await paymentService.createPayPalOrder({
                amount,
                currency: "USD",
                orderId,
                customerEmail,
              });
              return response.orderId;
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to create PayPal order";
              onError(errorMessage);
              throw error;
            }
          },
          onApprove: async (data: { orderID?: string }) => {
            try {
              if (!data.orderID) {
                throw new Error("PayPal order ID is missing");
              }

              await paymentService.capturePayPalOrder(data.orderID);
              onSuccess();
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to capture PayPal payment";
              onError(errorMessage);
            }
          },
          onError: () => {
            onError("PayPal payment was not completed");
          },
        });

        paypalButtonsRef.current.render(paypalContainerRef.current);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize PayPal";
        onError(errorMessage);
      }
    };

    void setupPayPal();

    return () => {
      if (paypalButtonsRef.current) {
        void paypalButtonsRef.current.close();
      }
    };
  }, [amount, customerEmail, isLoading, onError, onSuccess, orderId]);

  return <div ref={paypalContainerRef} className="mt-3 rounded-md border border-border bg-background p-3" />;
};
