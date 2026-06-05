"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Modal,
  Panel,
  Select,
  Text,
} from "@bigcommerce/big-design";
import type {
  GiftCertificate,
  GiftCertificateStatus,
  RecipientParty,
} from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { GIFT_CERTIFICATE_STATUSES } from "@/lib/gift-certificate-filters";
import { FieldRow } from "@/components/detail-field";

interface GiftCertificateDetailsTabProps {
  giftCertificate: GiftCertificate;
}

/**
 * Sender/recipient panel. The "Account email" row is only shown when an
 * `accountEmail` is provided (i.e. for the sender) — recipients are matched by
 * email, so their account email always equals the certificate email.
 */
function PartyPanel({
  title,
  party,
  accountEmail,
}: {
  title: string;
  party: RecipientParty;
  accountEmail?: string | null;
}) {
  return (
    <Panel header={title}>
      <FieldRow label="Registered customer">
        {party.isRegisteredCustomer ? "Yes" : "No"}
      </FieldRow>
      <FieldRow label="Name on gift certificate">{party.name}</FieldRow>
      <FieldRow label="Email on gift certificate">{party.email}</FieldRow>
      <FieldRow label="Account name">{party.accountName ?? "-"}</FieldRow>
      {accountEmail !== undefined && (
        <FieldRow label="Account email">{accountEmail ?? "-"}</FieldRow>
      )}
    </Panel>
  );
}

export function GiftCertificateDetailsTab({
  giftCertificate: gc,
}: GiftCertificateDetailsTabProps) {
  // The saved status is the baseline; selecting a different value enables the
  // Update button. "Saving" updates the baseline (placeholder for a real call).
  const [savedStatus, setSavedStatus] = useState<GiftCertificateStatus>(
    gc.status,
  );
  const [status, setStatus] = useState<GiftCertificateStatus>(gc.status);
  const [resendOpen, setResendOpen] = useState(false);

  const isDirty = status !== savedStatus;

  return (
    <>
      <Panel header="Gift certificate">
        <FieldRow label="Gift certificate code">{gc.code}</FieldRow>
        <FieldRow label="Purchase date">{formatDate(gc.purchaseDate)}</FieldRow>
        <FieldRow label="Status">
          <Box style={{ width: 200 }}>
            <Select<GiftCertificateStatus>
              options={GIFT_CERTIFICATE_STATUSES.map((value) => ({
                value,
                content: value,
              }))}
              value={status}
              onOptionChange={(value) => value && setStatus(value)}
            />
          </Box>
        </FieldRow>
        <FieldRow label="Email template">{gc.emailTemplate}</FieldRow>
        <FieldRow label="Original value">
          {formatCurrency(gc.originalAmount, gc.currencyCode)}
        </FieldRow>
      </Panel>

      <PartyPanel
        title="Sender"
        party={gc.sender}
        accountEmail={gc.sender.accountEmail}
      />
      <PartyPanel title="Recipient" party={gc.recipient} />

      <Flex justifyContent="flex-end" flexGap="8px">
        <Button variant="subtle" onClick={() => setStatus(savedStatus)}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => setResendOpen(true)}>
          Re-send Email
        </Button>
        <Button
          variant="primary"
          disabled={!isDirty}
          onClick={() => setSavedStatus(status)}
        >
          Update Status
        </Button>
      </Flex>

      <Modal
        isOpen={resendOpen}
        header="Re-send gift certificate email?"
        onClose={() => setResendOpen(false)}
        actions={[
          {
            text: "Cancel",
            variant: "subtle",
            onClick: () => setResendOpen(false),
          },
          {
            text: "Re-send Email",
            variant: "primary",
            // Placeholder — wired up in a later phase.
            onClick: () => setResendOpen(false),
          },
        ]}
      >
        <Text>
          The gift certificate email will be re-sent to the recipient.
        </Text>
      </Modal>
    </>
  );
}
