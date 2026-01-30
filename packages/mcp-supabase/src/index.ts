import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const server = new Server(
    {
        name: "mcp-supabase",
        version: "1.0.0",
    },
    {
        capabilities: {
            import { Server } from "@modelcontextprotocol/sdk/server/index.js";
            import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
            import {
                CallToolRequestSchema,
                ListToolsRequestSchema,
            } from "@modelcontextprotocol/sdk/types.js";
            import { createClient } from "@supabase/supabase-js";
            import dotenv from "dotenv";
            import { z } from "zod";

            dotenv.config();

            const SUPABASE_URL = process.env.SUPABASE_URL;
            const SUPABASE_KEY = process.env.SUPABASE_KEY;

            if(!SUPABASE_URL || !SUPABASE_KEY) {
                console.error("Missing SUPABASE_URL or SUPABASE_KEY environment variables");
process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const server = new Server(
    {
        name: "mcp-supabase",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_table",
                description: "Read data from a Supabase table with optional filtering and column selection",
                inputSchema: {
                    type: "object",
                    properties: {
                        table: {
                            type: "string",
                            description: "The name of the table to read from",
                        },
                        columns: {
                            type: "string",
                            description: "Comma-separated list of columns to select (default: '*')",
                        },
                        limit: {
                            type: "number",
                            description: "Number of rows to return (default: 10)",
                        },
                        filter: {
                            type: "object",
                            description: "Key-value pairs for equality filtering (e.g., { 'id': '123' })",
                        },
                    },
                    required: ["table"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "read_table": {
            const table = String(request.params.arguments?.table);
            const columns = String(request.params.arguments?.columns || "*");
            const limit = Number(request.params.arguments?.limit || 10);
            const filter = request.params.arguments?.filter as Record<string, any> | undefined;

            try {
                let query = supabase.from(table).select(columns).limit(limit);

                if (filter) {
                    Object.entries(filter).forEach(([key, value]) => {
                        query = query.eq(key, value);
                    });
                }

                const { data, error } = await query;

                if (error) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Error reading table '${table}': ${error.message}`,
                            },
                        ],
                        isError: true,
                    };
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(data, null, 2),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        default:
            throw new Error("Unknown tool");
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
