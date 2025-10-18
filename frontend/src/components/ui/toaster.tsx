"use client"

import * as React from 'react';
import { Toast } from './toast';
import { useToast, toast } from './use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, action, variant }) => (
        <Toast
          key={id}
          variant={variant}
          onDismiss={() => dismiss(id)}
          className="mb-2 last:mb-0"
        >
          <div className="grid gap-1">
            {title && <div className="font-semibold">{title}</div>}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
          {action}
        </Toast>
      ))}
    </div>
  );
}
