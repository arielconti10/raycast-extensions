import {
  Action,
  Clipboard,
  Icon,
  Keyboard,
  showToast,
  Toast,
  getPreferenceValues,
  closeMainWindow,
} from "@raycast/api";
import { execFileSync } from "child_process";

import { CLI_PATH, titleCaseWord } from "../utils";

export function CopyToClipboard({
  id,
  vault_id,
  shortcut,
  field = "password",
}: {
  id: string;
  field?: string;
  shortcut: Keyboard.Shortcut;
  vault_id: string;
}) {
  return (
    <Action
      icon={Icon.Clipboard}
      title={`Copy ${titleCaseWord(field)}`}
      shortcut={shortcut}
      onAction={async () => {
        const toast = await showToast({
          style: Toast.Style.Animated,
          title: `Copying ${field}...`,
        });
        try {
          const stdout = execFileSync(CLI_PATH!, ["read", `op://${vault_id}/${id}/${field}`]);
          await Clipboard.copy(stdout.toString().trim(), { concealed: true });

          toast.style = Toast.Style.Success;
          toast.title = "Copied to clipboard";
        } catch (error) {
          toast.style = Toast.Style.Failure;
          toast.title = "Failed to copy";
          if (error instanceof Error) {
            toast.message = error.message;
            toast.primaryAction = {
              title: "Copy logs",
              onAction: async (toast) => {
                await Clipboard.copy((error as Error).message);
                toast.hide();
              },
            };
          }
        } finally {
          const preferences = getPreferenceValues<Preferences>();
          if (preferences.closeWindowAfterCopying) {
            await closeMainWindow();
          }
        }
      }}
    />
  );
}
