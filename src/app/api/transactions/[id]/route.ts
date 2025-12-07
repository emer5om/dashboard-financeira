import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("transactions")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Supabase error:", error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        return Response.json({ success: true, id }, { status: 200 });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return Response.json({ error: "Failed to delete transaction" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const { data, error } = await supabase
            .from("transactions")
            .update({
                date: body.date,
                type: body.type,
                amount: body.amount,
                category: body.category || null,
                note: body.note || null,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return Response.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return Response.json({ error: "Transaction not found" }, { status: 404 });
        }

        return Response.json(data, { status: 200 });
    } catch (error) {
        console.error("Error updating transaction:", error);
        return Response.json({ error: "Failed to update transaction" }, { status: 500 });
    }
}
