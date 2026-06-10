"use client";

import { useState, type FormEvent } from "react";
import type { GiftCertificate } from "@/types";
import { formatCurrency } from "@/lib/format";
import { Button, Input, Modal, Panel } from "@/components/ui";
import { FieldRow } from "@/components/detail-field";
import { useToast } from "@/components/toast";
import { refillGiftCertificate } from "@/app/gift-certificates/[id]/actions";
import { initialRefillState } from "@/app/gift-certificates/[id]/refill-state";

interface GiftCertificateBalanceTabProps {
  giftCertificate: GiftCertificate;
}

type BalanceAction = "refill" | "addToBalance" | "transfer";

/** Parses a currency input; returns null for blank/invalid values. */
function parseAmount(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function GiftCertificateBalanceTab({
  giftCertificate: gc,
}: GiftCertificateBalanceTabProps) {
  const { originalAmount, balance, currencyCode } = gc;
  const money = (amount: number) => formatCurrency(amount, currencyCode);

  const { addToast } = useToast();

  const [active, setActive] = useState<BalanceAction | null>(null);
  const [refillValue, setRefillValue] = useState(String(originalAmount));
  const [addAmount, setAddAmount] = useState("");
  const [transferValue, setTransferValue] = useState(String(balance));
  const [confirmAddOpen, setConfirmAddOpen] = useState(false);

  // Transfer to store credit requires a remaining balance to move.
  const canTransfer = balance > 0;

  // React 18 has no useActionState / function-valued form actions, so the
  // Refill form calls the "use server" action directly from its submit handler,
  // tracking pending state manually and surfacing the result via the toast.
  const [refillPending, setRefillPending] = useState(false);

  async function handleRefillSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!refillValid) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    setRefillPending(true);
    try {
      const result = await refillGiftCertificate(initialRefillState, formData);
      addToast(result.message, "success");
    } finally {
      setRefillPending(false);
    }
  }

  // Selecting an action reveals its inputs and hides the others. Re-selecting
  // the active action collapses it. Inputs reset to defaults on (re)selection.
  function selectAction(action: BalanceAction) {
    if (active === action) {
      setActive(null);
      return;
    }
    setActive(action);
    if (action === "refill") setRefillValue(String(originalAmount));
    if (action === "addToBalance") setAddAmount("");
    if (action === "transfer") setTransferValue(String(balance));
  }

  // Placeholder for a real mutation — collapses the active action.
  function complete() {
    setActive(null);
    setConfirmAddOpen(false);
  }

  const refillParsed = parseAmount(refillValue);
  const refillValid =
    refillParsed !== null && refillParsed > 0 && refillParsed <= originalAmount;

  const addParsed = parseAmount(addAmount);
  const addValid = addParsed !== null && addParsed > 0;
  const newBalance = addParsed !== null ? balance + addParsed : null;

  const transferParsed = parseAmount(transferValue);
  const transferValid =
    transferParsed !== null && transferParsed > 0 && transferParsed <= balance;

  function submitAdd() {
    if (!addValid || addParsed === null) {
      return;
    }
    if (addParsed > originalAmount) {
      setConfirmAddOpen(true);
      return;
    }
    complete();
  }

  function actionVariant(action: BalanceAction) {
    return active === action ? "primary" : "secondary";
  }

  return (
    <>
      <Panel header="Balance">
        <FieldRow label="Original value">{money(originalAmount)}</FieldRow>
        <FieldRow label="Current balance">{money(balance)}</FieldRow>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant={actionVariant("refill")}
            onClick={() => selectAction("refill")}
          >
            Refill
          </Button>
          <Button
            variant={actionVariant("addToBalance")}
            onClick={() => selectAction("addToBalance")}
          >
            Add to Balance
          </Button>
          <Button
            variant={actionVariant("transfer")}
            disabled={!canTransfer}
            onClick={() => selectAction("transfer")}
          >
            Transfer to Store Credit
          </Button>
        </div>

        {active && (
          <div className="mt-4 rounded-md bg-slate-50 p-4">
            {active === "refill" && (
              <form onSubmit={handleRefillSubmit} className="flex flex-col gap-3">
                <div className="max-w-xs">
                  <Input
                    label="Refill to New Balance"
                    name="amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={refillValue}
                    onChange={(event) => setRefillValue(event.target.value)}
                  />
                </div>
                <p className="text-sm text-slate-500">
                  This will set the total active balance to this amount, up to{" "}
                  <strong>{money(originalAmount)}</strong>.
                </p>
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!refillValid || refillPending}
                    isLoading={refillPending}
                  >
                    Refill
                  </Button>
                </div>
              </form>
            )}

            {active === "addToBalance" && (
              <div className="flex flex-col gap-3">
                <div className="max-w-xs">
                  <Input
                    label="Amount"
                    type="number"
                    min={0}
                    step={0.01}
                    value={addAmount}
                    onChange={(event) => setAddAmount(event.target.value)}
                  />
                </div>
                <p className="text-sm text-slate-500">
                  This amount will be added to the current balance.
                </p>
                {newBalance !== null && addValid && (
                  <p className="text-sm font-semibold text-slate-900">
                    New Balance: {money(newBalance)}
                  </p>
                )}
                <div>
                  <Button
                    variant="primary"
                    disabled={!addValid}
                    onClick={submitAdd}
                  >
                    Add to Balance
                  </Button>
                </div>
              </div>
            )}

            {active === "transfer" && (
              <div className="flex flex-col gap-3">
                <div className="max-w-xs">
                  <Input
                    label="Amount to Transfer"
                    type="number"
                    min={0}
                    step={0.01}
                    value={transferValue}
                    onChange={(event) => setTransferValue(event.target.value)}
                  />
                </div>
                <p className="text-sm text-slate-500">
                  The gift certificate balance will be reduced by this amount,
                  and the customer&apos;s store credit balance will be increased
                  accordingly.
                </p>
                <div>
                  <Button
                    variant="primary"
                    disabled={!transferValid}
                    onClick={complete}
                  >
                    Transfer to Store Credit
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Panel>

      <Modal
        isOpen={confirmAddOpen}
        header="Add more than the original value?"
        onClose={() => setConfirmAddOpen(false)}
        actions={
          <>
            <Button variant="subtle" onClick={() => setConfirmAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={complete}>
              Add anyway
            </Button>
          </>
        }
      >
        The amount entered ({addParsed !== null ? money(addParsed) : ""}) is
        greater than this gift certificate&apos;s original value (
        {money(originalAmount)}). Are you sure you want to add it to the balance?
      </Modal>
    </>
  );
}
