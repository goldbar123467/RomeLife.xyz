"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#1a1612] group-[.toaster]:text-[#e8e4dc] group-[.toaster]:border-[#f0c14b]/30 group-[.toaster]:shadow-lg group-[.toaster]:shadow-black/50",
          description: "group-[.toast]:text-[#a09080]",
          actionButton:
            "group-[.toast]:bg-[#f0c14b] group-[.toast]:text-[#1a1612] group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-[#2a2420] group-[.toast]:text-[#a09080]",
          success: "group-[.toaster]:border-green-500/50",
          error: "group-[.toaster]:border-red-500/50",
          warning: "group-[.toaster]:border-yellow-500/50",
          info: "group-[.toaster]:border-blue-500/50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
