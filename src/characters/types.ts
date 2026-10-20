import type { Pen, Pt } from './pen.ts';

export type PoseName = 'idle' | 'react' | 'action' | 'caught';

export interface Pose {
  /** What the daemon is doing in this pose, for alt text. */
  alt: string;
  /** Where the pupils look when the drawing is used as a still (-1..1). */
  gaze: Pt;
  draw(p: Pen): void;
}

export interface Character {
  id: string;
  name: string;
  /** Project slug this daemon guards; empty for the Intruder. */
  project: string;
  /** Short description of the character, used in alt text everywhere. */
  look: string;
  poses: Partial<Record<PoseName, Pose>> & Record<'idle' | 'react' | 'action', Pose>;
}
