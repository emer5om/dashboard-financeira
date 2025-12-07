import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { createTransactionSchema } from "@/lib/schema";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    try {
        let query = supabase
            .from("transactions")
            .select("*")
            .order("date", { ascending: false })
            .order("created_at", { ascending: false });

        if (from) {
            query = query.gte("date", from);
        }
        if (to) {
            query = query.lte("date", to);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase error:", error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json(data || []);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return Response.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = createTransactionSchema.safeParse(body);

        if (!parsed.success) {
            return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const payload = parsed.data;

        const { data, error } = await supabase
            .from("transactions")
            .insert([
                {
                    date: payload.date,
                    type: payload.type,
                    amount: payload.amount,
                    category: payload.category || null,
                    note: payload.note || null,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return Response.json({ error: "Failed to create transaction" }, { status: 500 });
    }
}
