"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";
import { formatBRL } from "@/lib/utils";
import { Transaction, TransactionType } from "@/lib/schema";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Megaphone,
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

type ToastConfig = {
  message: string;
  type: "success" | "error" | "info";
} | null;

const COLORS = {
  ads: "#3b82f6",
  expense: "#ef4444",
  revenue: "#10b981",
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [date, setDate] = useState<string>("");
  const [type, setType] = useState<TransactionType>("revenue");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // UI states
  const [toast, setToast] = useState<ToastConfig>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string; message: string }>({
    isOpen: false,
    id: "",
    message: "",
  });

  // Set default date range to today
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setFrom(today);
    setTo(today);
  }, []);

  // Fetch transactions
  useEffect(() => {
    if (!from || !to) return;
    fetch(`/api/transactions?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data: Transaction[]) => setTransactions(data));
  }, [from, to]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      return true;
    });
  }, [transactions, from, to]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const ads = filtered.filter(t => t.type === "ads").reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const revenue = filtered.filter(t => t.type === "revenue").reduce((s, t) => s + t.amount, 0);
    const totalCost = ads + expenses;
    const profit = revenue - totalCost;
    const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;
    const roas = ads > 0 ? (revenue / ads) : 0;
    const margin = revenue > 0 ? ((profit / revenue) * 100) : 0;

    // Group by date
    const byDate = filtered.reduce((acc, t) => {
      if (!acc[t.date]) {
        acc[t.date] = { ads: 0, expenses: 0, revenue: 0 };
      }
      if (t.type === "ads") acc[t.date].ads += t.amount;
      if (t.type === "expense") acc[t.date].expenses += t.amount;
      if (t.type === "revenue") acc[t.date].revenue += t.amount;
      return acc;
    }, {} as Record<string, { ads: number; expenses: number; revenue: number }>);

    const dailyData = Object.entries(byDate).map(([date, values]) => ({
      date,
      result: values.revenue - (values.ads + values.expenses),
      revenue: values.revenue,
      costs: values.ads + values.expenses,
    })).sort((a, b) => a.date.localeCompare(b.date));

    const goodDays = dailyData.filter(d => d.result > 0).length;
    const badDays = dailyData.length - goodDays;
    const avgProfit = dailyData.length > 0 ? profit / dailyData.length : 0;

    // Type distribution for pie chart
    const typeData = [
      { name: "Investimento Ads", value: ads, color: COLORS.ads },
      { name: "Despesas", value: expenses, color: COLORS.expense },
    ].filter(d => d.value > 0);

    return {
      ads,
      expenses,
      revenue,
      totalCost,
      profit,
      roi,
      roas,
      margin,
      goodDays,
      badDays,
      avgProfit,
      dailyData,
      typeData,
    };
  }, [filtered]);

  // Quick date filters
  const setQuickFilter = (period: string) => {
    const today = new Date();
    let start: Date;
    let end: Date = endOfDay(today);

    switch (period) {
      case "today":
        start = startOfDay(today);
        break;
      case "yesterday":
        start = startOfDay(subDays(today, 1));
        end = endOfDay(subDays(today, 1));
        break;
      case "week":
        start = startOfWeek(today, { locale: ptBR });
        break;
      case "last7":
        start = startOfDay(subDays(today, 6));
        break;
      case "month":
        start = startOfMonth(today);
        break;
      case "last30":
        start = startOfDay(subDays(today, 29));
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      default:
        return;
    }

    setFrom(format(start, "yyyy-MM-dd"));
    setTo(format(end, "yyyy-MM-dd"));
  };

  const handleSubmit = async () => {
    if (!date || !amount) {
      setToast({ message: "Preencha data e valor", type: "error" });
      return;
    }

    const payload = {
      date,
      type,
      amount: parseFloat(amount),
      category: category || undefined,
      note: note || undefined,
    };

    if (editingId) {
      await fetch(`/api/transactions/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setToast({ message: "Transação atualizada!", type: "success" });
    } else {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setToast({ message: "Transação adicionada!", type: "success" });
    }

    // Refresh
    const res = await fetch(`/api/transactions?from=${from}&to=${to}`);
    const data: Transaction[] = await res.json();
    setTransactions(data);
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    const res = await fetch(`/api/transactions?from=${from}&to=${to}`);
    const data: Transaction[] = await res.json();
    setTransactions(data);
    setToast({ message: "Transação removida!", type: "success" });
    setConfirmModal({ isOpen: false, id: "", message: "" });
  };

  const openForm = (txType: TransactionType) => {
    resetForm();
    setType(txType);
    setDate(format(new Date(), "yyyy-MM-dd"));
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setDate("");
    setType("revenue");
    setAmount("");
    setCategory("");
    setNote("");
  };

  const exportCSV = () => {
    const headers = ["Data", "Tipo", "Categoria", "Valor", "Nota"];
    const rows = filtered.map(t => [
      t.date,
      t.type === "ads" ? "Investimento Ads" : t.type === "expense" ? "Despesa" : "Receita",
      t.category || "",
      t.amount.toFixed(2),
      t.note || "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro-${from}-${to}.csv`;
    a.click();
    setToast({ message: "CSV exportado!", type: "success" });
  };

  const getTypeLabel = (t: TransactionType) => {
    if (t === "ads") return "Investimento Ads";
    if (t === "expense") return "Despesa";
    return "Receita";
  };

  const getTypeColor = (t: TransactionType) => {
    if (t === "ads") return "text-blue-400";
    if (t === "expense") return "text-red-400";
    return "text-green-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">BILLIONS</h1>
            <p className="text-neutral-400 mt-1">GESTÃO FINANCEIRA</p>
          </div>
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Quick filters + Date range */}
        <Card className="border-neutral-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Quick filter buttons - compact on mobile */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuickFilter("today")}
                className="text-xs sm:text-sm h-8 px-2.5 sm:h-9 sm:px-3"
              >
                Hoje
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuickFilter("yesterday")}
                className="text-xs sm:text-sm h-8 px-2.5 sm:h-9 sm:px-3"
              >
                Ontem
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuickFilter("week")}
                className="text-xs sm:text-sm h-8 px-2.5 sm:h-9 sm:px-3"
              >
                Esta semana
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuickFilter("last7")}
                className="text-xs sm:text-sm h-8 px-2.5 sm:h-9 sm:px-3"
              >
                Últimos 7d
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuickFilter("month")}
                className="text-xs sm:text-sm h-8 px-2.5 sm:h-9 sm:px-3"
              >
                Este mês
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuickFilter("last30")}
                className="text-xs sm:text-sm h-8 px-2.5 sm:h-9 sm:px-3"
              >
                Últimos 30d
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuickFilter("lastMonth")}
                className="text-xs sm:text-sm h-8 px-2.5 sm:h-9 sm:px-3"
              >
                Mês passado
              </Button>
            </div>

            {/* Date inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="from" className="text-xs sm:text-sm">De</Label>
                <Input
                  id="from"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="to" className="text-xs sm:text-sm">Até</Label>
                <Input
                  id="to"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons - responsive sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="primary"
            className="h-12 sm:h-16 text-sm sm:text-lg gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            onClick={() => openForm("ads")}
          >
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Adicionar Investimento Ads</span>
          </Button>
          <Button
            variant="destructive"
            className="h-12 sm:h-16 text-sm sm:text-lg gap-2 sm:gap-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
            onClick={() => openForm("expense")}
          >
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Adicionar Despesa</span>
          </Button>
          <Button
            variant="primary"
            className="h-12 sm:h-16 text-sm sm:text-lg gap-2 sm:gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
            onClick={() => openForm("revenue")}
          >
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">Adicionar Receita</span>
          </Button>
        </div>



        {/* Main metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Investimento Ads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{formatBRL(metrics.ads)}</div>
              <p className="text-xs text-neutral-500 mt-1">Total investido</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{formatBRL(metrics.expenses)}</div>
              <p className="text-xs text-neutral-500 mt-1">Ferramentas e outros</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{formatBRL(metrics.revenue)}</div>
              <p className="text-xs text-neutral-500 mt-1">Total gerado</p>
            </CardContent>
          </Card>
          <Card className={`border-${metrics.profit >= 0 ? 'emerald' : 'rose'}-500/30 bg-gradient-to-br from-${metrics.profit >= 0 ? 'emerald' : 'rose'}-500/10 to-transparent`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrics.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'} flex items-center gap-2`}>
                {metrics.profit >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                {metrics.profit >= 0 ? formatBRL(metrics.profit) : `- ${formatBRL(Math.abs(metrics.profit))}`}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Lucro/Prejuízo</p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.roi.toFixed(1)}%
              </div>
              <p className="text-xs text-neutral-500 mt-1">Retorno sobre investimento</p>
            </CardContent>
          </Card>
          <Card className="border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">ROAS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{metrics.roas.toFixed(2)}x</div>
              <p className="text-xs text-neutral-500 mt-1">Retorno por real investido em ads</p>
            </CardContent>
          </Card>
          <Card className="border-neutral-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Margem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.margin.toFixed(1)}%
              </div>
              <p className="text-xs text-neutral-500 mt-1">Margem de lucro</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Line chart */}
          <Card className="border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Evolução do Resultado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={metrics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#d1d5db" }}
                  />
                  <Line type="monotone" dataKey="result" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar chart */}
          <Card className="border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-400" />
                Receita vs Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metrics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#d1d5db" }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Receita" />
                  <Bar dataKey="costs" fill="#ef4444" name="Custos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie chart */}
          {metrics.typeData.length > 0 && (
            <Card className="border-neutral-800">
              <CardHeader>
                <CardTitle>Distribuição de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${formatBRL(entry.value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {metrics.typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card className="border-neutral-800">
            <CardHeader>
              <CardTitle>Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">Dias positivos</span>
                <span className="text-lg font-semibold text-emerald-400">{metrics.goodDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">Dias negativos</span>
                <span className="text-lg font-semibold text-rose-400">{metrics.badDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">Lucro médio/dia</span>
                <span className={`text-lg font-semibold ${metrics.avgProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatBRL(metrics.avgProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">Total de transações</span>
                <span className="text-lg font-semibold text-neutral-100">{filtered.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions table */}
        <Card className="border-neutral-800">
          <CardHeader>
            <CardTitle>Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-neutral-500 py-8">
                        Nenhuma transação encontrada neste período
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${getTypeColor(t.type)}`}>
                            {getTypeLabel(t.type)}
                          </span>
                        </TableCell>
                        <TableCell>{t.category || "-"}</TableCell>
                        <TableCell className="font-semibold">{formatBRL(t.amount)}</TableCell>
                        <TableCell className="max-w-xs truncate text-neutral-400 text-sm">{t.note || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(t.id);
                                setDate(t.date);
                                setType(t.type);
                                setAmount(String(t.amount));
                                setCategory(t.category || "");
                                setNote(t.note || "");
                                setShowForm(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  id: t.id,
                                  message: `Deseja realmente apagar a transação de ${formatBRL(t.amount)} do dia ${format(new Date(t.date), "dd/MM/yyyy")}?`,
                                });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={`${editingId ? "Editar" : "Adicionar"} ${getTypeLabel(type)}`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="mt-1"
              >
                <option value="ads">Investimento Ads</option>
                <option value="expense">Despesa</option>
                <option value="revenue">Receita</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Google Ads, Ferramentas..."
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="note">Observação</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Adicione detalhes sobre esta transação..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-800">
            <Button
              variant="ghost"
              onClick={() => { setShowForm(false); resetForm(); }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: "", message: "" })}
        onConfirm={() => handleDelete(confirmModal.id)}
        title="Confirmar exclusão"
        message={confirmModal.message}
        confirmText="Apagar"
        cancelText="Cancelar"
      />
    </div>
  );
}
