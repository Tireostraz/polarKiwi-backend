import { z } from "zod";

// --- Общие списки допустимых значений ---
const allowedFontKeys = ["font-playfair", "font-arial", "font-roboto"];
const allowedColorKeys = ["white", "black", "red"];
const allowedFilterTags = ["none", "greycheerzou"];
const allowedPlacedBy = ["none", "user"];
const allowedTemplateTypes = ["print", "photobook"];
const allowedFilterTypeKeys = ["default"];
const allowedPageDefinitionKeys = ["STANDART", "T1-RETRO"];

// --- Составные схемы ---
export const OffsetSchema = z.object({
  x_dmm: z.number(),
  y_dmm: z.number(),
});

export const SizeSchema = z.object({
  width_dmm: z.number(),
  height_dmm: z.number(),
});

export const PhotoPlacementSchema = z.object({
  is_default: z.boolean(),
  placed_by: z.enum(allowedPlacedBy),
  rotation: z.number(),
  offset: OffsetSchema,
  size: SizeSchema,
});

export const EditablePictureSchema = z.object({
  editable_picture_key: z.string(),
  selection_photo_key: z.string(),
  filter_tag: z.enum(allowedFilterTags),
  photo_placement: PhotoPlacementSchema,
});

export const EditableTextSchema = z.object({
  editable_text_key: z.string(),
  content: z.string(),
  font_key: z.enum(allowedFontKeys),
});

export const PageSchema = z.object({
  key: z.string(),
  color_key: z.enum(allowedColorKeys),
  filter_type_key: z.enum(allowedFilterTypeKeys),
  page_definition_key: z.enum(allowedPageDefinitionKeys),
  editable_pictures: z.array(EditablePictureSchema),
  editable_texts: z.array(EditableTextSchema),
  videos: z.array(z.any()), // можно уточнить позже
});

export const UsedPhotoSchema = z.object({
  key: z.string(),
  creation_date: z.string().datetime(),
  height_px: z.number(),
  width_px: z.number(),
  fotom_key: z.string(),
  provider: z.string(),
  provider_ref: z.string(),
});

export const PrintQuantitySchema = z.object({
  page_key: z.string(),
  quantity: z.number().int().min(1),
});

export const DefinitionSchema = z.object({
  template_type: z.enum(allowedTemplateTypes),
  definition_version: z.number().int(),
  pages: z.array(PageSchema),
  used_photos: z.array(UsedPhotoSchema),
  print_quantities: z.array(PrintQuantitySchema),
});
