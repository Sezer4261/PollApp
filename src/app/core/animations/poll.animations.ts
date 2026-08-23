/**
 * @fileoverview Angular animation triggers. Only opacity is animated to avoid layout shift.
 */
import { animate, style, transition, trigger } from '@angular/animations';

/** Fade for full-screen overlays. */
export const overlayAnimation = trigger('overlayAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('280ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
]);

/** Fade for overlay panels. */
export const panelAnimation = trigger('panelAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('280ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [animate('180ms ease-in', style({ opacity: 0 }))]),
]);

/** Fade when ending-soon cards appear. */
export const fadeListAnimation = trigger('fadeListAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('240ms ease-out', style({ opacity: 1 })),
  ]),
]);

/** Fade when switching Active / Past tabs. */
export const tabSwitchAnimation = trigger('tabSwitchAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('220ms ease-out', style({ opacity: 1 })),
  ]),
]);
