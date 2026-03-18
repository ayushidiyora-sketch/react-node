import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { Box, Button, CircularProgress, Grid, IconButton, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { categoryService } from "../../services/categoryService.ts";
import { productService } from "../../services/productService.ts";

type ProductFormState = {
  productName: string;
  category: string;
  manufacturerName: string;
  features: string;
  manufacturerBrand: string;
  price: string;
  salePrice: string;
  rating: string;
  salesCount: string;
  orderCount: string;
  isPopular: string;
  bestSelling: string;
  description: string;
  specifications: Array<{ title: string; value: string }>;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
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
  salesCount: "0",
  orderCount: "0",
  isPopular: "false",
  bestSelling: "false",
  description: "",
  specifications: [],
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
};

type CategoryOption = {
  _id: string;
  name: string;
  isCreateOption?: boolean;
  inputValue?: string;
};

const RECENT_CATEGORY_KEY = "admin_add_product_recent_categories";

const normalizeCategoryName = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

const highlightMatchedText = (label: string, query: string) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return label;
  }

  const index = label.toLowerCase().indexOf(normalizedQuery.toLowerCase());

  if (index === -1) {
    return label;
  }

  const start = label.slice(0, index);
  const match = label.slice(index, index + normalizedQuery.length);
  const end = label.slice(index + normalizedQuery.length);

  return (
    <>
      {start}
      <Box component="span" sx={{ fontWeight: 700, bgcolor: "#fff3cd", borderRadius: 0.5, px: 0.3 }}>{match}</Box>
      {end}
    </>
  );
};

const categoryFilter = createFilterOptions<CategoryOption>();

export const AddProductPage = () => {
  const [formState, setFormState] = useState<ProductFormState>(initialFormState);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState("");
  const [recentCategoryIds, setRecentCategoryIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_CATEGORY_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 5) : [];
    } catch {
      return [];
    }
  });
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
      setIsCategoriesLoading(true);

      try {
        const items = await categoryService.list();
        setCategories(items.map(item => ({ _id: item._id, name: item.name })));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load categories";
        toast.error(message);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    localStorage.setItem(RECENT_CATEGORY_KEY, JSON.stringify(recentCategoryIds.slice(0, 5)));
  }, [recentCategoryIds]);

  const markCategoryAsRecent = (categoryId: string) => {
    setRecentCategoryIds(previous => [categoryId, ...previous.filter(item => item !== categoryId)].slice(0, 5));
  };

  const categoryOptions = useMemo(() => {
    const recent = recentCategoryIds
      .map(id => categories.find(item => item._id === id))
      .filter((item): item is { _id: string; name: string } => Boolean(item));
    const nonRecent = categories.filter(item => !recentCategoryIds.includes(item._id));

    return [...recent, ...nonRecent];
  }, [categories, recentCategoryIds]);

  const selectedCategoryOption = useMemo(
    () => categoryOptions.find(item => item._id === formState.category) ?? null,
    [categoryOptions, formState.category],
  );

  const handleCategoryChange = async (option: CategoryOption | null) => {
    if (!option) {
      updateField("category", "");
      return;
    }

    if (!option.isCreateOption) {
      updateField("category", option._id);
      setCategorySearchText(option.name);
      markCategoryAsRecent(option._id);
      return;
    }

    const normalizedInput = (option.inputValue ?? categorySearchText).trim().replace(/\s+/g, " ");

    if (!normalizedInput) {
      toast.error("Category name cannot be empty.");
      return;
    }

    const existing = categories.find(item => normalizeCategoryName(item.name) === normalizeCategoryName(normalizedInput));

    if (existing) {
      updateField("category", existing._id);
      setCategorySearchText(existing.name);
      markCategoryAsRecent(existing._id);
      toast.info("Category already exists. Selected existing category.");
      return;
    }

    setIsCreatingCategory(true);

    try {
      const created = await categoryService.create({
        name: normalizedInput,
        description: "",
      });

      const nextCategory = { _id: created._id, name: created.name };

      setCategories(previous => [nextCategory, ...previous]);
      updateField("category", nextCategory._id);
      setCategorySearchText(nextCategory.name);
      markCategoryAsRecent(nextCategory._id);
      toast.success("Category created and selected.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create category";
      toast.error(message);
    } finally {
      setIsCreatingCategory(false);
    }
  };

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
      specifications: previous.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ),
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

      await productService.create({
        name: formState.productName,
        category: formState.category,
        price: Number(formState.price),
        salePrice: formState.salePrice ? Number(formState.salePrice) : undefined,
        rating: formState.rating ? Number(formState.rating) : undefined,
        salesCount: formState.salesCount ? Number(formState.salesCount) : 0,
        orderCount: formState.orderCount ? Number(formState.orderCount) : 0,
        isPopular: formState.isPopular === "true",
        bestSelling: formState.bestSelling === "true",
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
      });

      setFormState(initialFormState);
      handleFeatureSelect(null);
      setSelectedFiles([]);
      toast.success("Product created successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to create product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={700} color="var(--skote-heading)">ADD PRODUCT</Typography>
        <Typography variant="caption" sx={{ color: "var(--skote-subtle)" }}>Ecommerce / Add Product</Typography>
      </Stack>

      <Paper sx={{ p: 2.3, borderRadius: 2.5, border: "1px solid var(--skote-border)", boxShadow: "none" }}>
        <Typography variant="subtitle1" fontWeight={700} color="var(--skote-heading)">Basic Information</Typography>
        <Typography variant="body2" sx={{ color: "var(--skote-subtle)", mb: 2 }}>Fill all information below</Typography>

        <Grid container spacing={1.8}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Product Name" value={formState.productName} onChange={event => updateField("productName", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              fullWidth
              options={categoryOptions}
              value={selectedCategoryOption}
              inputValue={categorySearchText}
              onInputChange={(_event, value) => setCategorySearchText(value)}
              onChange={(_event, value) => void handleCategoryChange(value)}
              loading={isCategoriesLoading || isCreatingCategory}
              filterOptions={(options, params) => {
                const filtered = categoryFilter(options, params);
                const normalizedInput = normalizeCategoryName(params.inputValue);

                if (!normalizedInput) {
                  return filtered;
                }

                const exists = options.some(item => normalizeCategoryName(item.name) === normalizedInput);

                if (!exists) {
                  filtered.push({
                    _id: "__create_new__",
                    name: `Add new category: ${params.inputValue.trim()}`,
                    isCreateOption: true,
                    inputValue: params.inputValue,
                  });
                }

                return filtered;
              }}
              getOptionLabel={option => option.name}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              noOptionsText={categorySearchText.trim() ? "No category found" : "No categories available"}
              loadingText="Loading categories..."
              renderOption={(props, option) => (
                <Box component="li" {...props} key={`${option._id}-${option.name}`}>
                  {option.isCreateOption ? (
                    <Typography fontWeight={600} color="#556ee6">{option.name}</Typography>
                  ) : (
                    <>
                      {highlightMatchedText(option.name, categorySearchText)}
                    </>
                  )}
                </Box>
              )}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Category"
                  placeholder="Search category"
                  helperText={isCreatingCategory ? "Creating category..." : "Type to search or add a new category"}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {(isCategoriesLoading || isCreatingCategory) ? <CircularProgress color="inherit" size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
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

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Sales Count" type="number" inputProps={{ min: "0" }} value={formState.salesCount} onChange={event => updateField("salesCount", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Order Count" type="number" inputProps={{ min: "0" }} value={formState.orderCount} onChange={event => updateField("orderCount", event.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Popular Product" value={formState.isPopular} onChange={event => updateField("isPopular", event.target.value)}>
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Best Selling" value={formState.bestSelling} onChange={event => updateField("bestSelling", event.target.value)}>
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} mt={2}>
          <Button variant="contained" onClick={() => void handleSave()} disabled={isSaving}>Save Changes</Button>
          <Button variant="outlined" onClick={() => setFormState(initialFormState)}>Cancel</Button>
        </Stack>
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
            <Grid container spacing={1} key={index}>
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
            <TextField fullWidth label="Meta Description" multiline rows={3} value={formState.metaDescription} onChange={event => updateField("metaDescription", event.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Meta Keywords" value={formState.metaKeywords} onChange={event => updateField("metaKeywords", event.target.value)} />
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