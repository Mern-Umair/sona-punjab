import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sona Punjab API",
      version: "1.0.0",
      description: "Sona Punjab Pigeon Tournament API",
    },
    servers: [
      { url: "http://localhost:5000/api", description: "Development" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/auth/login": {
        post: {
          summary: "Admin login",
          tags: ["Auth"],
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string", example: "admin" },
                    password: { type: "string", example: "admin123" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/me": {
        get: {
          summary: "Get current user",
          tags: ["Auth"],
          responses: { 200: { description: "Current user" } },
        },
      },
      "/banners": {
        get: {
          summary: "Get all banners",
          tags: ["Banners"],
          security: [],
          responses: { 200: { description: "List of banners" } },
        },
        post: {
          summary: "Upload banner",
          tags: ["Banners"],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    image: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Banner created" } },
        },
      },
      "/banners/{id}": {
        delete: {
          summary: "Delete banner",
          tags: ["Banners"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Banner deleted" } },
        },
      },
      "/headlines": {
        get: {
          summary: "Get all headlines", tags: ["Headlines"], security: [],
          responses: { 200: { description: "List of headlines" } },
        },
        post: {
          summary: "Create headline", tags: ["Headlines"],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { text: { type: "string" } } } } } },
          responses: { 201: { description: "Headline created" } },
        },
      },
      "/headlines/{id}": {
        put: {
          summary: "Update headline", tags: ["Headlines"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { text: { type: "string" } } } } } },
          responses: { 200: { description: "Headline updated" } },
        },
        delete: {
          summary: "Delete headline", tags: ["Headlines"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Headline deleted" } },
        },
      },
      "/clubs": {
        get: {
          summary: "Get all clubs", tags: ["Clubs"], security: [],
          responses: { 200: { description: "List of clubs" } },
        },
        post: {
          summary: "Create club", tags: ["Clubs"],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
          responses: { 201: { description: "Club created" } },
        },
      },
      "/clubs/{id}": {
        put: {
          summary: "Update club", tags: ["Clubs"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" } } } } } },
          responses: { 200: { description: "Club updated" } },
        },
        delete: {
          summary: "Delete club", tags: ["Clubs"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Club deleted" } },
        },
      },
      "/owners": {
        get: {
          summary: "Get all pigeon owners", tags: ["Pigeon Owners"],
          responses: { 200: { description: "List of owners" } },
        },
        post: {
          summary: "Create pigeon owner", tags: ["Pigeon Owners"],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name:  { type: "string" },
                    phone: { type: "string" },
                    city:  { type: "string" },
                    image: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Owner created" } },
        },
      },
      "/owners/{id}": {
        put: {
          summary: "Update owner", tags: ["Pigeon Owners"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Owner updated" } },
        },
        delete: {
          summary: "Delete owner", tags: ["Pigeon Owners"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Owner deleted" } },
        },
      },
      "/tournaments": {
        get: {
          summary: "Get all tournaments", tags: ["Tournaments"], security: [],
          responses: { 200: { description: "List of tournaments" } },
        },
        post: {
          summary: "Create tournament", tags: ["Tournaments"],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name:      { type: "string" },
                    club:      { type: "string" },
                    startDate: { type: "string", format: "date" },
                    startTime: { type: "string" },
                    days:      { type: "number" },
                    pigeons:   { type: "number" },
                    screen:    { type: "string", enum: ["On Screen", "Off Screen"] },
                    poster:    { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Tournament created" } },
        },
      },
      "/tournaments/{id}": {
        get: {
          summary: "Get tournament", tags: ["Tournaments"], security: [],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Tournament data" } },
        },
        put: {
          summary: "Update tournament", tags: ["Tournaments"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Tournament updated" } },
        },
        delete: {
          summary: "Delete tournament", tags: ["Tournaments"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Tournament deleted" } },
        },
      },
      "/tournaments/{id}/day/{date}": {
        get: {
          summary: "Get tournament day results", tags: ["Tournaments"], security: [],
          parameters: [
            { in: "path", name: "id",   required: true, schema: { type: "string" } },
            { in: "path", name: "date", required: true, schema: { type: "string" }, example: "2026-05-24" },
          ],
          responses: { 200: { description: "Day results" } },
        },
      },
      "/tournaments/{id}/results/{date}": {
        post: {
          summary: "Add day results", tags: ["Tournaments"],
          parameters: [
            { in: "path", name: "id",   required: true, schema: { type: "string" } },
            { in: "path", name: "date", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "Results added" } },
        },
      },
      "/tournaments/{id}/total-results": {
        post: {
          summary: "Add total results", tags: ["Tournaments"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Total results saved" } },
        },
      },
      "/tournaments/{id}/screen": {
        put: {
          summary: "Toggle screen on/off", tags: ["Tournaments"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Screen toggled" } },
        },
      },
      "/subadmins": {
        get: {
          summary: "Get all subadmins", tags: ["SubAdmins"],
          responses: { 200: { description: "List of subadmins" } },
        },
        post: {
          summary: "Create subadmin", tags: ["SubAdmins"],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    password: { type: "string" },
                    phone:    { type: "string" },
                    role:     { type: "string", enum: ["admin", "subadmin"] },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "SubAdmin created" } },
        },
      },
      "/subadmins/{id}": {
        put: {
          summary: "Update subadmin", tags: ["SubAdmins"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "SubAdmin updated" } },
        },
        delete: {
          summary: "Delete subadmin", tags: ["SubAdmins"],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "SubAdmin deleted" } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);