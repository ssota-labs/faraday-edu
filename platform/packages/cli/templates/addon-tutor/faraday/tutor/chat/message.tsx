// Message row primitives — ported from mirror-dimension's shadcn chat UI. A
// Message aligns its content start (assistant) or end (user); the group data-attrs
// let bubbles/headers react to alignment.
import * as React from "react";

import { cn } from "@/faraday/lib/utils";

function Message({
  className,
  align = "start",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        "group/message relative flex w-full min-w-0 gap-1.5 text-sm/relaxed data-[align=end]:flex-row-reverse",
        className,
      )}
      {...props}
    />
  );
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end",
        className,
      )}
      {...props}
    />
  );
}

export { Message, MessageContent };
