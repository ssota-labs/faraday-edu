// Chat bubble primitives — ported from mirror-dimension's shadcn chat UI
// (base-mira == our style-faraday lineage), path rewired to "@/faraday/lib/utils".
// The message-content surface is driven by data-slot + variant so bubbles theme
// with the rest of the design tokens.
import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/faraday/lib/utils";

function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  );
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[85%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end",
  {
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground",
        muted: "*:data-[slot=bubble-content]:bg-muted *:data-[slot=bubble-content]:text-foreground",
        outline:
          "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Bubble({
  variant = "default",
  align = "start",
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bubbleVariants> & {
    align?: "start" | "end";
  }) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleVariants({ variant }), className)}
      {...props}
    />
  );
}

function BubbleContent({ className, render, ...props }: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "w-fit max-w-full min-w-0 overflow-hidden rounded-lg border border-transparent px-3 py-2 text-sm/relaxed whitespace-pre-wrap wrap-break-word group-data-[align=end]/bubble:self-end",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "bubble-content",
    },
  });
}

export { BubbleGroup, Bubble, BubbleContent };
