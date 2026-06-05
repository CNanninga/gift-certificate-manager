"use client";

import { useRouter } from "next/navigation";
import { Box, Link, Message } from "@bigcommerce/big-design";

interface GiftCertificateDetailProps {
  id: string;
}

/**
 * Client view for a single gift certificate. Placeholder for now; this is the
 * boundary where the BigDesign detail/management UI will live.
 */
export function GiftCertificateDetail({ id }: GiftCertificateDetailProps) {
  const router = useRouter();

  return (
    <Box backgroundColor="secondary20" padding={{ mobile: "medium", tablet: "xLarge" }}>
      <Box style={{ maxWidth: 800, margin: "0 auto" }}>
        <Box marginBottom="medium">
          <Link
            href="/"
            onClick={(event) => {
              event.preventDefault();
              router.push("/");
            }}
          >
            ← Back to gift certificates
          </Link>
        </Box>

        <Message
          type="info"
          header="Under construction"
          messages={[
            {
              text: `The detail and management view for ${id} is coming soon.`,
            },
          ]}
        />
      </Box>
    </Box>
  );
}
