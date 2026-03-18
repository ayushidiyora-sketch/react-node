import { useState } from "react";

import { Layout } from "@/components/Layout";
import { PageBanner } from "@/components/PageBanner";
import { sellerService } from "@/services/sellerService";

type SellerFormState = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  taxId: string;
  address: string;
  message: string;
};

const initialState: SellerFormState = {
  fullName: "",
  businessName: "",
  email: "",
  phone: "",
  taxId: "",
  address: "",
  message: "",
};

const BecomeSeller = () => {
  const [formState, setFormState] = useState<SellerFormState>(initialState);
  const [kycFiles, setKycFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const updateField = (field: keyof SellerFormState, value: string) => {
    setFormState(previous => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setStatusType("");

    if (!formState.fullName || !formState.businessName || !formState.email || !formState.phone) {
      setStatusType("error");
      setStatusMessage("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      await sellerService.apply({
        ...formState,
        kycFiles,
      });
      setStatusType("success");
      setStatusMessage("Application submitted successfully. Our team will review and contact you soon.");
      setFormState(initialState);
      setKycFiles([]);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error instanceof Error ? error.message : "Unable to submit seller application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageBanner title="Become a Seller" breadcrumbs={[{ label: "Home", path: "/" }, { label: "Become a Seller" }]} />

      <section className="py-12">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-foreground">Seller Onboarding Form</h2>
            <p className="mt-2 text-sm text-muted-foreground">Fill your business details to apply as a seller on ShopO.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Full Name *</label>
                  <input
                    type="text"
                    value={formState.fullName}
                    onChange={event => updateField("fullName", event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Business Name *</label>
                  <input
                    type="text"
                    value={formState.businessName}
                    onChange={event => updateField("businessName", event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Email *</label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={event => updateField("email", event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Phone *</label>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={event => updateField("phone", event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Tax/GST ID</label>
                  <input
                    type="text"
                    value={formState.taxId}
                    onChange={event => updateField("taxId", event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Business Address</label>
                  <input
                    type="text"
                    value={formState.address}
                    onChange={event => updateField("address", event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-muted-foreground">Message</label>
                <textarea
                  rows={4}
                  value={formState.message}
                  onChange={event => updateField("message", event.target.value)}
                  className="w-full resize-none rounded-md border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-muted-foreground">KYC Documents (PDF/JPG/PNG/WEBP)</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={event => setKycFiles(Array.from(event.target.files || []))}
                  className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
                />
                {kycFiles.length ? (
                  <p className="mt-1.5 text-xs text-muted-foreground">{kycFiles.length} file(s) selected</p>
                ) : null}
              </div>

              {statusMessage ? (
                <div className={`rounded-md px-3 py-2 text-sm ${statusType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {statusMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BecomeSeller;
