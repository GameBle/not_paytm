import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { apiClient } from "../api/client";
import { TransactionReceipt } from "../types/api";
import { Appbar } from "../components/Appbar";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/Button";

export function Receipt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient
      .get<TransactionReceipt>(`/transactions/${id}`)
      .then((res) => setReceipt(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  return (
    <AppShell header={<Appbar />}>
      <div className="mx-auto max-w-md animate-fade-in">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : receipt ? (
          <Card className="print:border-0 print:shadow-none" id="receipt">
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold sm:text-2xl">Payment Receipt</h1>
              <p className="text-sm text-muted-foreground">
                Ref: {receipt._id}
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="capitalize">{receipt.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-lg font-bold">₹{receipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">From</span>
                <span>
                  {receipt.from?.firstName} {receipt.from?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span>
                  {receipt.to?.firstName} {receipt.to?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(receipt.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row print:hidden">
              <Button
                label="Print"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={handlePrint}
              />
              <Button
                label="Back"
                variant="secondary"
                onClick={() => navigate("/transactions")}
              />
            </div>
          </Card>
        ) : (
          <Card className="text-center text-muted-foreground">Receipt not found.</Card>
        )}
      </div>
    </AppShell>
  );
}
