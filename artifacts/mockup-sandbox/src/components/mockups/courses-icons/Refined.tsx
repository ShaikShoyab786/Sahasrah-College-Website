import { Current } from './Current';

export function Refined() {
  return (
    <div className="courses-icons-refined">
      <style>{`
        .courses-icons-refined {
          display: contents;
        }

        .courses-icons-refined .courses-icons-current svg {
          width: 15px !important;
          height: 15px !important;
          stroke-width: 1.8px !important;
          flex-shrink: 0;
        }

        .courses-icons-refined .courses-icons-current span:has(> svg) {
          width: 32px !important;
          height: 32px !important;
          flex-basis: 32px !important;
          border-radius: 10px !important;
          background-color: hsl(var(--primary) / 0.075) !important;
          color: hsl(var(--primary)) !important;
        }

        .courses-icons-refined .courses-icons-current span:has(> svg) svg {
          color: inherit !important;
        }

        .courses-icons-refined .courses-icons-current button:has(> svg) {
          color: hsl(var(--primary)) !important;
          background-color: hsl(var(--primary-foreground) / 0.12) !important;
          border-color: hsl(var(--primary-foreground) / 0.3) !important;
        }

        .courses-icons-refined .courses-icons-current a:has(> svg) > svg {
          color: currentColor;
        }

        .courses-icons-refined .courses-icons-current footer span:has(> svg) {
          background-color: hsl(var(--primary-foreground) / 0.1) !important;
          color: hsl(var(--primary-foreground) / 0.9) !important;
        }

        .courses-icons-refined .courses-icons-current a:hover span:has(> svg),
        .courses-icons-refined .courses-icons-current a:focus-visible span:has(> svg) {
          background-color: hsl(var(--accent)) !important;
          color: hsl(var(--accent-foreground)) !important;
        }
      `}</style>
      <Current />
    </div>
  );
}
