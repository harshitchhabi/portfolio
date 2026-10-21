import type { Character } from './types.ts';
import { signe } from './signe.ts';
import { vayu } from './vayu.ts';
import { honeybot } from './honeybot.ts';
import { redacto } from './redacto.ts';
import { lockjaw } from './lockjaw.ts';
import { auctioneers } from './auctioneers.ts';
import { forge } from './forge.ts';
import { tula } from './tula.ts';
import { intruder } from './intruder.ts';

/** The daemons in station order, then the Intruder. */
export const CAST: Character[] = [signe, vayu, honeybot, redacto, lockjaw, auctioneers, forge, tula, intruder];
