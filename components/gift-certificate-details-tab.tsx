"use client";

import { useState } from "react";
import type {
  GiftCertificate,
  GiftCertificateStatus,
  RecipientParty,
} from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { GIFT_CERTIFICATE_STATUSES } from "@/lib/gift-certificate-filters";
import { Button, Modal, Panel, Select } from "@/components/ui";
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
          <div className="w-48">
            <Select<GiftCertificateStatus>
              value={status}
              options={GIFT_CERTIFICATE_STATUSES.map((value) => ({
                value,
                label: value,
              }))}
              onValueChange={(value) => setStatus(value)}
            />
          </div>
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

      <div className="flex justify-end gap-2">
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
      </div>

      <Modal
        isOpen={resendOpen}
        header="Re-send gift certificate email?"
        onClose={() => setResendOpen(false)}
        actions={
          <>
            <Button variant="subtle" onClick={() => setResendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              // Placeholder — wired up in a later phase.
              onClick={() => setResendOpen(false)}
            >
              Re-send Email
            </Button>
          </>
        }
      >
        The gift certificate email will be re-sent to the recipient.
      </Modal>
    </>
  );
}
