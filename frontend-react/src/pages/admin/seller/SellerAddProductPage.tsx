import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { Box, Button, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { sellerPortalService } from "@/services/sellerPortalService";

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
  specifications: Array<{ title: string; value: string }>;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  brandName: string;
};

const featureOptions = ["Trending", "Featured", "Best Seller", "New Arrival"];

const initialFormState: ProductFormState = {
  productName: "",
  category: "",
  manufacturerName: "",
  features: "",
  manufacturerBrand: "",
  price: "",
  salePrice: "",
  rating: "",
  description: "",
  specifications: [],
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  brandName: "",
};

export const SellerAddProductPage = () => {
  const [formState, setFormState] = useState<ProductFormState>(initialFormState);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [featureImageFile, setFeatureImageFile] = useState<File | null>(null);
  const [featurePreviewUrl, setFeaturePreviewUrl] = useState("");
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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const items = await categoryService.list();
        setCategories(items.map(item => ({ _id: item._id, name: item.name })));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load categories";
        toast.error(message);
      }
    };

    void loadCategories();
  }, []);

  const updateField = (field: keyof ProductFormState, value: string | Array<{ title: string; value: string }>) => {
    setFormState(previous => ({ ...previous, [field]: value }));
  };

  const addSpecification = () => {
    setFormState(previous => ({
      ...previous,
      specifications: [...previous.specifications, { title: "", value: "" }],
    }));
  };

  const removeSpecification = (index: number) => {
    setFormState(previous => ({
      ...previous,
      specifications: previous.specifications.filter((_, i) => i !== index),
    }));
  };

  const updateSpecification = (index: number, field: "title" | "value", value: string) => {
    setFormState(previous => ({
      ...previous,
      specifications: previous.specifications.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)),
    }));
  };

  const handleFeatureSelect = (file: File | null) => {
    if (featurePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(featurePreviewUrl);
    }

    if (!file) {
      setFeatureImageFile(null);
      setFeaturePreviewUrl("");
      return;
    }

    setFeatureImageFile(file);
    setFeaturePreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!formState.productName || !formState.category || !formState.price) {
      toast.error("Product name, category, and price are required.");
      return;
    }

    setIsSaving(true);

    try {
      const [featureImageUrl] = featureImageFile ? await productService.uploadImages([featureImageFile]) : [""];
      const uploadedGalleryUrls = await productService.uploadImages(selectedFiles);
      const allUploadedImages = [...(featureImageUrl ? [featureImageUrl] : []), ...uploadedGalleryUrls];

      await sellerPortalService.createProduct({
        name: formState.productName,
        category: formState.category,
        price: Number(formState.price),
        salePrice: formState.salePrice ? Number(formState.salePrice) : undefined,
        rating: formState.rating ? Number(formState.rating) : undefined,
        description: formState.description,
        manufacturerName: formState.manufacturerName,
        manufacturerBrand: formState.manufacturerBrand,
        features: formState.features,
        featureImage: featureImageUrl,
        gallery: uploadedGalleryUrls,
        specifications: formState.specifications,
        metaTitle: formState.metaTitle,
        metaDescription: formState.metaDescription,
        metaKeywords: formState.metaKeywords,
        images: allUploadedImages,
        brandName: formState.brandName,
      });

      setFormState(initialFormState);
      handleFeatureSelect(null);
      setSelectedFiles([]);
      toast.success("Product created successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create product.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">ADD PRODUCT</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Seller / Add Product</Typography>
      </Stack>

      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">Basic Information</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 2 }}>Fill all information below</Typography>

        <Grid container spacing={1.8}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Product Name" value={formState.productName} onChange={event => updateField("productName", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Category" value={formState.category} onChange={event => updateField("category", event.target.value)}>
              {categories.map(item => (
                <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Manufacturer Name" value={formState.manufacturerName} onChange={event => updateField("manufacturerName", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Features" value={formState.features} onChange={event => updateField("features", event.target.value)}>
              {featureOptions.map(item => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Manufacturer Brand" value={formState.manufacturerBrand} onChange={event => updateField("manufacturerBrand", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Brand Name" value={formState.brandName} onChange={event => updateField("brandName", event.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Product Description" multiline rows={3} value={formState.description} onChange={event => updateField("description", event.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Price" type="number" value={formState.price} onChange={event => updateField("price", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Sale Price (Optional)" type="number" value={formState.salePrice} onChange={event => updateField("salePrice", event.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Rating" type="number" inputProps={{ min: "0", max: "5", step: "0.1" }} value={formState.rating} onChange={event => updateField("rating", event.target.value)} />
          </Grid>
        </Grid>

       
      </Paper>

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
            <Typography variant="caption" color="var(--skote-subtle)">{featureImageFile ? featureImageFile.name : "No image selected"}</Typography>
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
          onChange={event => {
            const files = Array.from(event.target.files || []);
            setSelectedFiles(previous => [...previous, ...files]);
            event.target.value = "";
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

        {selectedFiles.length ? (
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
        ) : null}
      </Paper>

      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">Product Specifications</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 2 }}>Add technical specifications like display, storage, battery, etc.</Typography>

        <Stack spacing={1.5}>
          {formState.specifications.map((spec, index) => (
            <Grid container spacing={1} key={`${spec.title}-${index}`}>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  label="Specification Title"
                  placeholder="e.g., Display, Storage, Battery"
                  value={spec.title}
                  onChange={event => updateSpecification(index, "title", event.target.value)}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 11, md: 6 }}>
                <TextField
                  fullWidth
                  label="Specification Value"
                  placeholder="e.g., 10.1 inch IPS"
                  value={spec.value}
                  onChange={event => updateSpecification(index, "value", event.target.value)}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 1, md: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeSpecification(index)}
                  sx={{ minWidth: 40, height: 40 }}
                >
                  <DeleteRoundedIcon fontSize="small" />
                </Button>
              </Grid>
            </Grid>
          ))}
        </Stack>

        <Button variant="outlined" onClick={addSpecification} sx={{ mt: 2 }}>+ Add Specification</Button>
      </Paper>

      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">Meta Data</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 2 }}>Fill all information below</Typography>

        <Grid container spacing={1.8}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Meta title" value={formState.metaTitle} onChange={event => updateField("metaTitle", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Meta Keywords" value={formState.metaKeywords} onChange={event => updateField("metaKeywords", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline rows={3} label="Meta Description" value={formState.metaDescription} onChange={event => updateField("metaDescription", event.target.value)} />
          </Grid>
        </Grid>
         <Stack direction="row" spacing={1} mt={2}>
          <Button variant="contained" onClick={() => void handleSave()} disabled={isSaving}>Save Changes</Button>
          <Button variant="outlined" onClick={() => setFormState(initialFormState)}>Cancel</Button>
        </Stack>
      </Paper>
    </Stack>
  );
};


