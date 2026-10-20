import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// The one entrance curve used everywhere: cubic-bezier(0.2, 0.8, 0.2, 1).
export const ENTRANCE = CustomEase.create('entrance', 'M0,0 C0.2,0.8 0.2,1 1,1');

export { gsap };
