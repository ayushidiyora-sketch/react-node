export type ModuleField = {
  key: string;
  label: string;
  type: "text" | "number" | "status" | "textarea" | "image-single" | "image-multi";
};

export type ModuleConfig = {
  key: string;
  label: string;
  fields: ModuleField[];
  defaultStatus: string;
  statuses: string[];
};

export const moduleConfigs: ModuleConfig[] = [
  {
    key: "logos",
    label: "Logo Management",
    fields: [
      { key: "name", label: "Logo Name", type: "text" },
      { key: "imageUrl", label: "Logo Image", type: "image-single" },
    ],
    defaultStatus: "Active",
    statuses: ["Active", "Inactive"],
  },
  {
    key: "categories",
    label: "Category Management",
    fields: [
      { key: "name", label: "Category Name", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    defaultStatus: "Active",
    statuses: ["Active", "Inactive"],
  },
  {
    key: "products",
    label: "Product Management",
    fields: [
      { key: "name", label: "Product Name", type: "text" },
      { key: "sku", label: "SKU", type: "text" },
      { key: "price", label: "Price", type: "number" },
      { key: "stock", label: "Stock", type: "number" },
      { key: "category", label: "Category", type: "text" },
      { key: "images", label: "Product Images", type: "image-multi" },
    ],
    defaultStatus: "Approved",
    statuses: ["Approved", "Disapproved"],
  },
  {
    key: "users",
    label: "User Management",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "role", label: "Role", type: "text" },
    ],
    defaultStatus: "Approved",
    statuses: ["Approved", "Disapproved", "Blocked", "Unblocked"],
  },
  {
    key: "shipping",
    label: "Shipping Charges Management",
    fields: [
      { key: "name", label: "Rule Name", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "rate", label: "Shipping Rate", type: "number" },
    ],
    defaultStatus: "Active",
    statuses: ["Active", "Inactive"],
  },
  {
    key: "taxes",
    label: "Taxes Management",
    fields: [
      { key: "name", label: "Tax Rule", type: "text" },
      { key: "percentage", label: "Tax Percentage", type: "number" },
      { key: "appliesTo", label: "Applies To", type: "text" },
    ],
    defaultStatus: "Active",
    statuses: ["Active", "Inactive"],
  },
  {
    key: "payments",
    label: "Payment Details",
    fields: [
      { key: "transactionId", label: "Transaction ID", type: "text" },
      { key: "source", label: "Source", type: "text" },
      { key: "customerEmail", label: "Customer Email", type: "text" },
      { key: "method", label: "Method", type: "text" },
      { key: "gateway", label: "Gateway", type: "text" },
      { key: "amount", label: "Amount", type: "number" },
      { key: "paidAt", label: "Paid At", type: "text" },
    ],
    defaultStatus: "Successful",
    statuses: ["Successful", "Failed", "Pending"],
  },
  {
    key: "notifications",
    label: "Notification System",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "target", label: "Target Audience", type: "text" },
    ],
    defaultStatus: "Active",
    statuses: ["Active", "Inactive"],
  },
  {
    key: "services",
    label: "Services Management",
    fields: [
      { key: "name", label: "Service Name", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "price", label: "Price", type: "number" },
    ],
    defaultStatus: "Active",
    statuses: ["Active", "Inactive"],
  },
];

export const getModuleConfig = (moduleKey: string) => moduleConfigs.find(item => item.key === moduleKey);