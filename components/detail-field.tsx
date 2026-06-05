import type { ReactNode } from "react";
import { Box, Flex, Text } from "@bigcommerce/big-design";

interface FieldRowProps {
  label: string;
  children: ReactNode;
}

/**
 * A single label/value row used across the detail panels. String/number values
 * are wrapped in Text; richer values (e.g. a Select) are rendered as-is.
 */
export function FieldRow({ label, children }: FieldRowProps) {
  const value =
    typeof children === "string" || typeof children === "number" ? (
      <Text marginBottom="none">{children}</Text>
    ) : (
      children
    );

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      flexGap="24px"
      marginBottom="small"
    >
      <Text color="secondary60" marginBottom="none">
        {label}
      </Text>
      <Box style={{ textAlign: "right" }}>{value}</Box>
    </Flex>
  );
}
