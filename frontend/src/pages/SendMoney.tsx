import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../api/client";
import { TransferResponse } from "../types/api";
import { Appbar } from "../components/Appbar";
import { Button } from "../components/Button";
import { AppShell } from "../components/layout/AppShell";
import { Avatar } from "../components/ui/Avatar";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function SendMoney() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id");
  const name = searchParams.get("name") ?? "User";
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!id) {
      setError("Invalid recipient.");
      toast.error("Invalid recipient.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post<TransferResponse>("/account/transfer", {
        to: id,
        amount: Number(amount),
      });
      toast.success(response.data.message);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Transfer failed.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell header={<Appbar />}>
      <div className="mx-auto w-full max-w-md animate-fade-in">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </button>

        <Card>
          <div className="mb-6 space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Send money</h1>
            <p className="text-sm text-muted-foreground">Transfer funds instantly</p>
          </div>

          <div className="mb-6 flex items-center gap-4 rounded-lg border border-border bg-muted/40 p-4">
            <Avatar name={name} size="lg" />
            <div>
              <p className="text-sm text-muted-foreground">Sending to</p>
              <p className="text-lg font-semibold text-foreground">{name}</p>
            </div>
          </div>

          <form onSubmit={handleTransfer} className="space-y-4">
            <Input
              label="Amount (INR)"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              leftIcon={<IndianRupee className="h-4 w-4" aria-hidden="true" />}
              error={error || undefined}
            />
            <Button
              type="submit"
              label="Initiate transfer"
              isLoading={loading}
              disabled={!amount}
            />
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
