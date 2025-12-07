import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { transactionSchema } from "@/lib/schema";

const dataFile = path.join(process.cwd(), "data", "transactions.json");

async function readAll() {
    try {
        const raw = await fs.readFile(dataFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((e) => transactionSchema.safeParse(e).success);
    } catch {
        return [];
    }
}

async function writeAll(transactions: unknown[]) {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(transactions, null, 2));
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const transactions = await readAll();
    const filtered = transactions.filter((t: any) => t.id !== id);

    if (transactions.length === filtered.length) {
        return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    await writeAll(filtered);
    return Response.json({ success: true, id }, { status: 200 });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    const transactions = await readAll();
    const index = transactions.findIndex((t: any) => t.id === id);

    if (index === -1) {
        return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    const updated = { ...transactions[index], ...body };
    transactions[index] = updated;

    await writeAll(transactions);
    return Response.json(updated, { status: 200 });
}
