export const swaggerSchemas = {
  Product: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      title: { type: "string", example: "Polaroid Classic" },
      price: { type: "integer", example: 1200 },
      category: {
        type: "string",
        enum: ["polaroid", "smsbook", "poster", "brochure"],
        example: "polaroid",
      },
      thumbnail_url: {
        type: "string",
        example: "/uploads/polaroid1-thumb.jpg",
      },
      images: {
        type: "array",
        items: { type: "string" },
        example: ["/uploads/polaroid1.jpg", "/uploads/polaroid2.jpg"],
      },
    },
  },

  User: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      email: { type: "string", example: "user@example.com" },
      role: { type: "string", enum: ["user", "admin"], example: "user" },
    },
  },
};
