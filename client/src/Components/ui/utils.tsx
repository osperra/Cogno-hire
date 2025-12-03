import { mergeClasses } from "@fluentui/react-components";

export function cn(
  ...classes: Array<string | undefined | null | false>
): string {
  return mergeClasses(...classes.filter((c) => c !== null));
}
