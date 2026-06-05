"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  Panel,
  Text,
} from "@bigcommerce/big-design";
import type { GiftCertificate } from "@/types";
import { formatCurrency } from "@/lib/format";
import { FieldRow } from "@/components/detail-field";

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

  const [active, setActive] = useState<BalanceAction | null>(null);
  const [refillValue, setRefillValue] = useState(String(originalAmount));
  const [addAmount, setAddAmount] = useState("");
  const [transferValue, setTransferValue] = useState(String(balance));
  const [confirmAddOpen, setConfirmAddOpen] = useState(false);

  const canTransfer = gc.recipient.isRegisteredCustomer;

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
    <Panel header="Balance">
      <FieldRow label="Original value">{money(originalAmount)}</FieldRow>
      <FieldRow label="Current balance">{money(balance)}</FieldRow>

      <Box marginTop="medium">
        <Flex flexGap="8px" flexWrap="wrap">
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
        </Flex>
      </Box>

      {active && (
        <Box
          backgroundColor="secondary20"
          borderRadius="normal"
          padding="medium"
          marginTop="medium"
        >
          {active === "refill" && (
            <Flex flexDirection="column" flexGap="12px">
              <Box style={{ maxWidth: 280 }}>
                <Input
                  label="Refill to New Balance"
                  type="number"
                  min={0}
                  step={0.01}
                  value={refillValue}
                  onChange={(event) => setRefillValue(event.target.value)}
                />
              </Box>
              <Text color="secondary60" marginBottom="none">
                This will set the total active balance to this amount, up to{" "}
                <strong>{money(originalAmount)}</strong>.
              </Text>
              <Box>
                <Button
                  variant="primary"
                  disabled={!refillValid}
                  onClick={complete}
                >
                  Refill
                </Button>
              </Box>
            </Flex>
          )}

          {active === "addToBalance" && (
            <Flex flexDirection="column" flexGap="12px">
              <Box style={{ maxWidth: 280 }}>
                <Input
                  label="Amount"
                  type="number"
                  min={0}
                  step={0.01}
                  value={addAmount}
                  onChange={(event) => setAddAmount(event.target.value)}
                />
              </Box>
              <Text color="secondary60" marginBottom="none">
                This amount will be added to the current balance.
              </Text>
              {newBalance !== null && addValid && (
                <Text bold marginBottom="none">
                  New Balance: {money(newBalance)}
                </Text>
              )}
              <Box>
                <Button
                  variant="primary"
                  disabled={!addValid}
                  onClick={submitAdd}
                >
                  Add to Balance
                </Button>
              </Box>
            </Flex>
          )}

          {active === "transfer" && (
            <Flex flexDirection="column" flexGap="12px">
              <Box style={{ maxWidth: 280 }}>
                <Input
                  label="Amount to Transfer"
                  type="number"
                  min={0}
                  step={0.01}
                  value={transferValue}
                  onChange={(event) => setTransferValue(event.target.value)}
                />
              </Box>
              <Text color="secondary60" marginBottom="none">
                The gift certificate balance will be reduced by this amount, and
                the customer&apos;s store credit balance will be increased
                accordingly.
              </Text>
              <Box>
                <Button
                  variant="primary"
                  disabled={!transferValid}
                  onClick={complete}
                >
                  Transfer to Store Credit
                </Button>
              </Box>
            </Flex>
          )}
        </Box>
      )}

      <Modal
        isOpen={confirmAddOpen}
        header="Add more than the original value?"
        onClose={() => setConfirmAddOpen(false)}
        actions={[
          {
            text: "Cancel",
            variant: "subtle",
            onClick: () => setConfirmAddOpen(false),
          },
          { text: "Add anyway", variant: "primary", onClick: complete },
        ]}
      >
        <Text>
          The amount entered ({addParsed !== null ? money(addParsed) : ""}) is
          greater than this gift certificate&apos;s original value (
          {money(originalAmount)}). Are you sure you want to add it to the
          balance?
        </Text>
      </Modal>
    </Panel>
  );
}
