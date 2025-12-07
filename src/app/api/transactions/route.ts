import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createTransactionSchema, transactionSchema } from "@/lib/schema";

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

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const transactions = await readAll();
    const filtered = transactions.filter((t: any) => {
        const d = t.date as string;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
    });
    return Response.json(filtered);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    const payload = parsed.data;
    const transactions = await readAll();
    const id = `${payload.date}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTransaction = {
        id,
        ...payload,
        createdAt: new Date().toISOString(),
    };
    const next = [...transactions, newTransaction].sort((a: any, b: any) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    await writeAll(next);
    return Response.json(newTransaction, { status: 201 });
}
