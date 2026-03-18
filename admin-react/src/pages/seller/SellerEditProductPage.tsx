import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { Box, Button, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { categoryService } from "../../services/categoryService.ts";
import { productService } from "../../services/productService.ts";
import { sellerPortalService } from "../../services/sellerPortalService.ts";

type ProductFormState = {
  productName: string;
  category: string;
  manufacturerName: string;
  features: string;
  manufacturerBrand: string;
  price: string;
  salePrice: string;
  rating: string;
  description: string;
  featureImage: string;
  specifications: Array<{ title: string; value: string }>;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  brandName: string;
};

const featureOptions = ["Trending", "Featured", "Best Seller", "New Arrival"];

const emptyForm: ProductFormState = {
  productName: "",
  category: "",
  manufacturerName: "",
  features: "",
  manufacturerBrand: "",
  price: "",
  salePrice: "",
  rating: "",
  description: "",
  featureImage: "",
  specifications: [],
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  brandName: "",
};

export const SellerEditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Product passed via navigation state from the list page
  const passedProduct = (location.state as { product?: Record<string, unknown> } | null)?.product;

  const [formState, setFormState] = useState<ProductFormState>(emptyForm);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [featureImageFile, setFeatureImageFile] = useState<File | null>(null);
  const [featurePreviewUrl, setFeaturePreviewUrl] = useState("");
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const featureInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (featurePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(featurePreviewUrl);
      }
    };
  }, [featurePreviewUrl]);

  // Populate form from passed product state
  useEffect(() => {
    if (passedProduct) {
      const categoryId = typeof passedProduct.category === "object" && passedProduct.category !== null
        ? (passedProduct.category as { _id: string })._id
        : String(passedProduct.category ?? "");

      setFormState({
        productName: String(passedProduct.name ?? ""),
        category: categoryId,
        manufacturerName: String(passedProduct.manufacturerName ?? ""),
        features: String(passedProduct.features ?? ""),
        manufacturerBrand: String(passedProduct.manufacturerBrand ?? ""),
        price: String(passedProduct.price ?? ""),
        salePrice: passedProduct.salePrice != null ? String(passedProduct.salePrice) : "",
        rating: passedProduct.rating != null ? String(passedProduct.rating) : "",
        description: String(passedProduct.description ?? ""),
        featureImage: String(passedProduct.featureImage ?? ""),
        specifications: Array.isArray(passedProduct.specifications)
          ? (passedProduct.specifications as Array<{ title: string; value: string }>)
          : [],
        metaTitle: String(passedProduct.metaTitle ?? ""),
        metaDescription: String(passedProduct.metaDescription ?? ""),
        metaKeywords: String(passedProduct.metaKeywords ?? ""),
        brandName: String(passedProduct.brandName ?? ""),
      });
      setFeaturePreviewUrl(String(passedProduct.featureImage ?? ""));
      const existingImages = Array.isArray(passedProduct.images)
        ? (passedProduct.images as string[]).filter(Boolean)
        : Array.isArray(passedProduct.gallery)
          ? (passedProduct.gallery as string[]).filter(Boolean)
          : [];
      setExistingGalleryUrls(existingImages);
    }
  }, [passedProduct]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await categoryService.list();
        setCategories(items.map(item => ({ _id: item._id, name: item.name })));
      } catch {
        // non-critical
      }
    };
    void loadCategories();
  }, []);

  const updateField = (field: keyof ProductFormState, value: string | Array<{ title: string; value: string }>) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const addSpecification = () => {
    setFormState(prev => ({ ...prev, specifications: [...prev.specifications, { title: "", value: "" }] }));
  };

  const removeSpecification = (index: number) => {
    setFormState(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  };

  const updateSpecification = (index: number, field: "title" | "value", value: string) => {
    setFormState(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)),
    }));
  };

  const handleFeatureSelect = (file: File | null) => {
    if (featurePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(featurePreviewUrl);
    }

    if (!file) {
      setFeatureImageFile(null);
      setFeaturePreviewUrl("");
      updateField("featureImage", "");
      return;
    }

    setFeatureImageFile(file);
    setFeaturePreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!id) return;
    if (!formState.productName || !formState.category || !formState.price) {
      toast.error("Product name, category, and price are required.");
      return;
    }

    setIsSaving(true);
    try {
      const [uploadedFeatureImage] = featureImageFile ? await productService.uploadImages([featureImageFile]) : [""];
      const uploadedGalleryUrls = selectedFiles.length > 0 ? await productService.uploadImages(selectedFiles) : [];
      const finalFeatureImage = uploadedFeatureImage || formState.featureImage || "";
      const finalGalleryUrls = [...existingGalleryUrls, ...uploadedGalleryUrls];

      await sellerPortalService.updateProduct(id, {
        name: formState.productName,
        category: formState.category,
        price: Number(formState.price),
        salePrice: formState.salePrice ? Number(formState.salePrice) : null,
        rating: formState.rating ? Number(formState.rating) : undefined,
        description: formState.description,
        manufacturerName: formState.manufacturerName,
        manufacturerBrand: formState.manufacturerBrand,
        features: formState.features,
        featureImage: finalFeatureImage,
        gallery: finalGalleryUrls,
        specifications: formState.specifications,
        metaTitle: formState.metaTitle,
        metaDescription: formState.metaDescription,
        metaKeywords: formState.metaKeywords,
        images: [...(finalFeatureImage ? [finalFeatureImage] : []), ...finalGalleryUrls],
        brandName: formState.brandName,
      });

      toast.success("Product updated and sent for re-approval.");
      navigate("/seller/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => navigate("/seller/products");

  const SaveCancelButtons = () => (
    <Stack direction="row" spacing={1} mt={2}>
      <Button variant="contained" onClick={() => void handleSave()} disabled={isSaving}
        sx={{ bgcolor: "#556ee6", "&:hover": { bgcolor: "#4a5fd4" }, textTransform: "uppercase", fontWeight: 700, px: 3 }}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
      <Button variant="outlined" onClick={handleCancel} disabled={isSaving}
        sx={{ textTransform: "uppercase", fontWeight: 700 }}>
        Cancel
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={2.2}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography variant="h5" fontWeight={700} color="var(--skote-heading)">Dashboard</Typography>
          <Typography variant="subtitle2" fontWeight={700} color="var(--skote-heading)" sx={{ textTransform: "uppercase", letterSpacing: 1, mt: 0.5 }}>Edit Product</Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Edit Product</Typography>
      </Stack>

      {/* Basic Information */}
      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">Basic Information</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 2 }}>Fill all information below</Typography>

        <Grid container spacing={1.8}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Product Name" value={formState.productName} onChange={e => updateField("productName", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Category" value={formState.category} onChange={e => updateField("category", e.target.value)}>
              {categories.map(item => (
                <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Manufacturing Name" value={formState.manufacturerName} onChange={e => updateField("manufacturerName", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Features" value={formState.features} onChange={e => updateField("features", e.target.value)}>
              <MenuItem value="">None</MenuItem>
              {featureOptions.map(item => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Manufacturer Brand" value={formState.manufacturerBrand} onChange={e => updateField("manufacturerBrand", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Product Description" multiline rows={3} value={formState.description} onChange={e => updateField("description", e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Price" type="number" value={formState.price} onChange={e => updateField("price", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Sale Price (Optional)" type="number" value={formState.salePrice} onChange={e => updateField("salePrice", e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Rating" type="number" inputProps={{ min: "0", max: "5", step: "0.1" }} value={formState.rating} onChange={e => updateField("rating", e.target.value)} />
          </Grid>
        </Grid>

        <SaveCancelButtons />
      </Paper>

      {/* Product Images */}
      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">Product Images</Typography>

        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mt: 2, mb: 1 }}>Feature Image (Single)</Typography>
        <input
          ref={featureInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={event => {
            const file = event.target.files?.[0] ?? null;
            handleFeatureSelect(file);
            event.target.value = "";
          }}
        />
        <Box
          onClick={() => featureInputRef.current?.click()}
          sx={{
            border: "1px dashed #d3d7e3",
            borderRadius: 2,
            minHeight: 120,
            display: "grid",
            placeItems: "center",
            bgcolor: "#fcfcfd",
            cursor: "pointer",
            mb: 1,
          }}
        >
          <Stack spacing={1} alignItems="center">
            <CloudUploadRoundedIcon sx={{ fontSize: 34, color: "#7b8197" }} />
            <Typography color="var(--skote-subtle)">Click to upload feature image.</Typography>
            <Typography variant="caption" color="var(--skote-subtle)">{featureImageFile ? featureImageFile.name : "No new image selected"}</Typography>
          </Stack>
        </Box>
        {featurePreviewUrl ? (
          <Box sx={{ mb: 2, mt: 0.5 }}>
            <img
              src={featurePreviewUrl}
              alt="Feature preview"
              style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 8, border: "1px solid #e0e0e0", objectFit: "contain" }}
            />
            <Stack direction="row" spacing={1} mt={1}>
              <Button size="small" variant="outlined" onClick={() => featureInputRef.current?.click()}>Change</Button>
              <IconButton
                size="small"
                color="error"
                aria-label="Remove feature image"
                onClick={() => handleFeatureSelect(null)}
                sx={{ border: "1px solid", borderColor: "error.main", borderRadius: 1 }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        ) : null}

        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 1 }}>Product Gallery (Multiple Upload)</Typography>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={e => {
            const files = Array.from(e.target.files ?? []);
            setSelectedFiles(prev => [...prev, ...files]);
            e.target.value = "";
          }}
        />
        <Box
          onClick={() => galleryInputRef.current?.click()}
          sx={{
            border: "1px dashed #d3d7e3",
            borderRadius: 2,
            minHeight: 180,
            display: "grid",
            placeItems: "center",
            bgcolor: "#fcfcfd",
            cursor: "pointer",
          }}
        >
          <Stack spacing={1} alignItems="center">
            <CloudUploadRoundedIcon sx={{ fontSize: 42, color: "#7b8197" }} />
            <Typography color="var(--skote-subtle)">Drop files here or click to upload.</Typography>
            <Typography variant="caption" color="var(--skote-subtle)">{selectedFiles.length} image(s) selected</Typography>
          </Stack>
        </Box>

        {existingGalleryUrls.length ? (
          <Stack direction="row" spacing={1} mt={1.2} flexWrap="wrap" useFlexGap>
            {existingGalleryUrls.map((url, index) => (
              <Stack key={`${url}-${index}`} spacing={0.5}
                sx={{ px: 1, py: 0.8, borderRadius: 1.5, bgcolor: "#eef2ff", width: 110 }}>
                <img src={url} alt={`Existing ${index + 1}`} style={{ width: "100%", height: 64, borderRadius: 6, objectFit: "cover" }} />
                <Typography variant="caption" sx={{ color: "#4f46e5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Existing image
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Remove existing gallery image"
                  onClick={() => setExistingGalleryUrls(prev => prev.filter((_, i) => i !== index))}
                  sx={{ alignSelf: "flex-end", p: 0.3 }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        ) : null}

        {selectedFiles.length > 0 && (
          <Stack direction="row" spacing={1} mt={1.2} flexWrap="wrap" useFlexGap>
            {selectedFiles.map((file, index) => (
              <Stack key={`${file.name}-${index}`} spacing={0.5}
                sx={{ px: 1, py: 0.8, borderRadius: 1.5, bgcolor: "#eef2ff", width: 110 }}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{ width: "100%", height: 64, borderRadius: 6, objectFit: "cover" }}
                  onLoad={event => URL.revokeObjectURL((event.target as HTMLImageElement).src)}
                />
                <Typography variant="caption" sx={{ color: "#4f46e5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</Typography>
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Remove gallery image"
                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                  sx={{ alignSelf: "flex-end", p: 0.3 }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Product Specifications */}
      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">Product Specifications</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 2 }}>Add technical specifications like display, storage, battery, etc.</Typography>

        <Stack spacing={1.5}>
          {formState.specifications.map((spec, index) => (
            <Grid container spacing={1} key={index}>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField fullWidth label="Specification Title" placeholder="e.g., Display, Storage"
                  value={spec.title} onChange={e => updateSpecification(index, "title", e.target.value)} size="small" />
              </Grid>
              <Grid size={{ xs: 11, md: 6 }}>
                <TextField fullWidth label="Specification Value" placeholder="e.g., 10.1 inch IPS"
                  value={spec.value} onChange={e => updateSpecification(index, "value", e.target.value)} size="small" />
              </Grid>
              <Grid size={{ xs: 1, md: 1 }}>
                <Button variant="outlined" color="error" onClick={() => removeSpecification(index)} sx={{ minWidth: 40, height: 40 }}>
                  <DeleteRoundedIcon fontSize="small" />
                </Button>
              </Grid>
            </Grid>
          ))}
        </Stack>

        <Button variant="outlined" onClick={addSpecification} sx={{ mt: 2 }}>+ ADD SPECIFICATION</Button>
      </Paper>

      {/* Meta Data */}
      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">Meta Data</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 2 }}>Fill all information below</Typography>

        <Grid container spacing={1.8}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Meta Title" value={formState.metaTitle} onChange={e => updateField("metaTitle", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Meta Description" value={formState.metaDescription} onChange={e => updateField("metaDescription", e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Meta Keywords" value={formState.metaKeywords} onChange={e => updateField("metaKeywords", e.target.value)} />
          </Grid>
        </Grid>

        <SaveCancelButtons />
      </Paper>
    </Stack>
  );
};
