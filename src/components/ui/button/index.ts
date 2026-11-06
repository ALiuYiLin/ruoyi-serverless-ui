import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as Button } from "./Button.vue";

export const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-4xl border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 active:not-aria-[haspopup]:translate-y-px [&_svg:not([class*=size-])]:size-4 group/button inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      /** 语义颜色，类似 antd 的 color */
      color: {
        default: "",
        primary: "",
        danger: "",
        success: "",
        warning: "",
        info: "",
      },
      /** 视觉样式 */
      variant: {
        solid: "",
        outline: "bg-transparent",
        ghost: "bg-transparent",
        link: "bg-transparent underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*=size-])]:size-3",
        sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*=size-])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    compoundVariants: [
      // default（中性）
      {
        color: "default",
        variant: "solid",
        class: "bg-background text-foreground border-border hover:bg-muted",
      },
      {
        color: "default",
        variant: "outline",
        class: "border-border text-foreground hover:bg-muted",
      },
      {
        color: "default",
        variant: "ghost",
        class: "text-foreground hover:bg-muted",
      },
      { color: "default", variant: "link", class: "text-foreground" },
      // primary
      {
        color: "primary",
        variant: "solid",
        class: "bg-primary text-primary-foreground hover:bg-primary/80",
      },
      {
        color: "primary",
        variant: "outline",
        class: "border-primary/40 text-primary hover:bg-primary/10",
      },
      {
        color: "primary",
        variant: "ghost",
        class: "text-primary hover:bg-primary/10",
      },
      { color: "primary", variant: "link", class: "text-primary" },
      // danger
      {
        color: "danger",
        variant: "solid",
        class: "bg-destructive text-white hover:bg-destructive/85",
      },
      {
        color: "danger",
        variant: "outline",
        class: "border-destructive/40 text-destructive hover:bg-destructive/10",
      },
      {
        color: "danger",
        variant: "ghost",
        class: "text-destructive hover:bg-destructive/10",
      },
      { color: "danger", variant: "link", class: "text-destructive" },
      // success
      {
        color: "success",
        variant: "solid",
        class: "bg-emerald-600 text-white hover:bg-emerald-500",
      },
      {
        color: "success",
        variant: "outline",
        class: "border-emerald-600/40 text-emerald-600 hover:bg-emerald-600/10",
      },
      {
        color: "success",
        variant: "ghost",
        class: "text-emerald-600 hover:bg-emerald-600/10",
      },
      { color: "success", variant: "link", class: "text-emerald-600" },
      // warning
      {
        color: "warning",
        variant: "solid",
        class: "bg-amber-500 text-white hover:bg-amber-400",
      },
      {
        color: "warning",
        variant: "outline",
        class: "border-amber-500/40 text-amber-600 hover:bg-amber-500/10",
      },
      {
        color: "warning",
        variant: "ghost",
        class: "text-amber-600 hover:bg-amber-500/10",
      },
      { color: "warning", variant: "link", class: "text-amber-600" },
      // info
      {
        color: "info",
        variant: "solid",
        class: "bg-sky-600 text-white hover:bg-sky-500",
      },
      {
        color: "info",
        variant: "outline",
        class: "border-sky-600/40 text-sky-600 hover:bg-sky-600/10",
      },
      {
        color: "info",
        variant: "ghost",
        class: "text-sky-600 hover:bg-sky-600/10",
      },
      { color: "info", variant: "link", class: "text-sky-600" },
    ],
    defaultVariants: {
      color: "default",
      variant: "solid",
      size: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type ButtonColor = NonNullable<ButtonVariants["color"]>;
export type ButtonVariant = NonNullable<ButtonVariants["variant"]>;
export type { Radius } from "../radius";
