/**
 * This file collects all the settings for the app.
 */

// Enums
import { BathType } from './enums/bath.enums';
import {
  Graphics,
  LogLevel,
  Priority,
  Process,
  Scheduler,
} from './enums/shared.enums';

// Interfaces
import { AuftragSettings } from './interfaces/auftrag.interfaces';
import { BathSettings } from './interfaces/bath.interfaces';
import { DrumSettings } from './interfaces/drum.interfaces';
import { SimulationSettings, WorkTime } from './interfaces/shared.interfaces';

/**
 * This constant specifies the plant settings
 */
export const plantSettings = {
  /** Current, in Ampere, to use at the PSU for Silver Baths */
  AgCurrent: 70,
  /** Current, in Ampere, to use at the PSU for Copper Baths */
  CuCurrent: 100,
  /** The starting position of the Crane */
  craneStartingPosition: 31,
};

/**
 * This costant specifies the simulation settings
 */
export const simulationSettings: SimulationSettings = {
  /**
   * Speed of the simulation -
   * 1 is realtime, 10 is 10X and so on
   */
  speed: 1000,
  /**
   * Max duration of the simulation, in seconds -
   * 16 hours = 57.600 seconds
   */
  maxTime: 57600,
  /**
   * The step for the simulation to simulate and scan all the
   * components of the plant (baths, drums, crane, etc...). Enter
   * a time in seconds
   */
  sampleTime: 2,
  /**
   * Type of Scheduler to use for the crane
   */
  scheduler: Scheduler.FCFSPrio,
  /**
   * Level of logging in Console
   */
  logLevel: LogLevel.Standard,
  /**
   * Graphic motor to use for output
   */
  graphics: Graphics.ASCII,
};

/**
 * This costant specifies the standard worktimes for specific bathType,
 * if present. Time is in seconds
 */
export const standardWorkTimes: WorkTime[] = [
  {
    bathType: BathType.Copper,
    time: undefined,
  },
  {
    bathType: BathType.LoadingStation,
    time: 120, // 2 minutes
  },
  {
    bathType: BathType.Parkplatz,
    time: undefined,
  },
  {
    bathType: BathType.PreTreatment,
    time: 600, // 10 minutes
  },
  {
    bathType: BathType.RinseFlow,
    time: 900, // 15 minutes
  },
  {
    bathType: BathType.RinseStand,
    time: 5,
  },
  {
    bathType: BathType.Silver,
    time: undefined,
  },
];

/**
 * This costant specifies the standard times for the phases of the crane.
 * Time is in seconds.
 */
export const defaultCraneTimes = {
  /** Standard drain time in second (Abtropfzeit) */
  drain: 15,
  /** Time the crane needs to sink the drum in the bath (Absenkzeit) */
  drop: 20,
  /** Time the crane needs to pick up the drum from the bath (Abholzeit) */
  pick: 20,
  /** Various moving time components */
  moving: {
    /** Time needed to accelerate from 0 to full speed from the origin
     * bath and reach the next bath */
    start: 6,
    /** Time needed at full speed to go from one bath to the next (nor the destination or the origin bath) */
    middle: 2,
    /** Time needed to decelerate from full speed to 0 and reach the
     * destination bath */
    end: 3,
    /** Time needed for the crane to go from one bath to the other, when the two baths are origin and destination */
    contiguous: 5,
  },
};

/**
 * This costant specifies the data to initialize the drums
 */
export const drumsInitData: DrumSettings[] = [
  { number: 1 },
  { number: 2 },
  { number: 3 },
  { number: 4 },
  { number: 5 },
  { number: 6 },
  { number: 7 },
  { number: 8 },
];

/**
 * This costant specifies the data to initialize the baths
 */
export const bathsInitData: BathSettings[] = [
  {
    // Bad 0 (Dummy Bad)
    is_enabled: false,
  },
  {
    // Bad 1
    is_enabled: false,
  },
  {
    // Bad 2
    is_enabled: false,
  },
  {
    // Bad 3
    name: 'Abkochentfettung',
    type: BathType.PreTreatment,
    priority: Priority.Low,
    is_enabled: true,
    next: [
      {
        process: [Process.Silver, Process.Copper],
        baths: [7],
      },
      {
        process: [Process.PlantEmptying],
        baths: [8, 9],
      },
    ],
  },
  {
    // Bad 4
    is_enabled: false,
  },
  {
    // Bad 5
    is_enabled: false,
  },
  {
    // Bad 6
    is_enabled: false,
  },
  {
    // Bad 7
    name: 'Elektrolitisch Entfettung',
    type: BathType.PreTreatment,
    priority: Priority.Low,
    is_enabled: true,
    drainTime: 30,
    next: [
      {
        process: [Process.Silver, Process.Copper],
        baths: [8],
      },
      {
        process: [Process.PlantEmptying],
        baths: [8, 9],
      },
    ],
  },
  {
    // Bad 8
    name: 'Standspüle (Kaskade)',
    type: BathType.RinseStand,
    priority: Priority.Normal,
    is_enabled: true,
    next: [
      {
        process: [Process.Silver, Process.Copper],
        baths: [9],
      },
      {
        process: [Process.PlantEmptying],
        baths: [10, 13, 18, 26, 30],
      },
    ],
  },
  {
    // Bad 9
    name: 'Standspüle (Kaskade)',
    type: BathType.RinseStand,
    priority: Priority.Normal,
    is_enabled: true,
    next: [
      {
        process: [Process.Silver, Process.Copper],
        baths: [10],
      },
      {
        process: [Process.PlantEmptying],
        baths: [30, 26, 18, 13, 10],
      },
    ],
  },
  {
    // Bad 10
    name: 'Fliessspüle',
    type: BathType.RinseFlow,
    priority: Priority.SubLow,
    is_enabled: true,
    next: [
      {
        process: [Process.Silver, Process.Copper],
        baths: [11],
      },
      {
        process: [Process.PlantFilling],
        baths: [31],
      },
    ],
  },
  {
    // Bad 11
    name: 'Dekapierung',
    type: BathType.PreTreatment,
    priority: Priority.Normal,
    is_enabled: true,
    next: [
      {
        process: [
          Process.Silver,
          Process.Copper,
          Process.Rework,
          Process.PlantEmptying,
        ],
        baths: [12],
      },
    ],
  },
  {
    // Bad 12
    name: 'Standspüle',
    type: BathType.RinseStand,
    priority: Priority.Normal,
    is_enabled: true,
    next: [
      {
        process: [Process.Silver, Process.Copper, Process.Rework],
        baths: [13],
      },
      {
        process: [Process.PlantEmptying],
        baths: [30, 26, 18, 13, 10],
      },
    ],
  },
  {
    // Bad 13
    name: 'Fliessspule',
    type: BathType.RinseFlow,
    priority: Priority.SubLow,
    is_enabled: true,
    next: [
      {
        process: [Process.Copper],
        baths: [14, 15],
      },
      {
        process: [Process.Silver, Process.Rework],
        baths: [20, 21],
      },
      {
        process: [Process.PlantFilling],
        baths: [31],
      },
    ],
  },
  {
    // Bad 14
    name: 'Kupfer Elektrolyt',
    type: BathType.Copper,
    priority: Priority.High,
    is_enabled: true,
    next: [
      {
        process: [Process.Copper, Process.PlantEmptying],
        baths: [16],
      },
    ],
  },
  {
    // Bad 15
    name: 'Kupfer Elektrolyt',
    type: BathType.Copper,
    priority: Priority.High,
    is_enabled: true,
    next: [
      {
        process: [Process.Copper, Process.PlantEmptying],
        baths: [16],
      },
    ],
  },
  {
    // Bad 16
    name: 'Standspüle (Kaskade)',
    type: BathType.RinseStand,
    priority: Priority.Low,
    is_enabled: true,
    next: [
      {
        process: [Process.Copper],
        baths: [17],
      },
      {
        process: [Process.PlantEmptying],
        baths: [30, 26, 18, 13, 10],
      },
    ],
  },
  {
    // Bad 17
    name: 'Standspüle (Kaskade)',
    type: BathType.RinseStand,
    priority: Priority.Low,
    is_enabled: true,
    next: [
      {
        process: [Process.Copper],
        baths: [18],
      },
      {
        process: [Process.PlantEmptying],
        baths: [30, 26, 18, 13, 10],
      },
    ],
  },
  {
    // Bad 18
    name: 'Fließspüle',
    type: BathType.RinseFlow,
    priority: Priority.SubLow,
    is_enabled: true,
    next: [
      {
        process: [Process.Copper],
        baths: [20, 21],
      },
      {
        process: [Process.PlantFilling],
        baths: [31],
      },
    ],
  },
  {
    // Bad 19
    name: 'Vorsilber',
    is_enabled: false,
  },
  {
    // Bad 20
    name: 'Silber Elektrolyt',
    type: BathType.Silver,
    priority: Priority.High,
    is_enabled: true,
    next: [
      {
        process: [
          Process.Copper,
          Process.Silver,
          Process.Rework,
          Process.PlantEmptying,
        ],
        baths: [23],
      },
    ],
  },
  {
    // Bad 21
    name: 'Silber Elektrolyt',
    type: BathType.Silver,
    priority: Priority.High,
    is_enabled: true,
    next: [
      {
        process: [
          Process.Copper,
          Process.Silver,
          Process.Rework,
          Process.PlantEmptying,
        ],
        baths: [23],
      },
    ],
  },
  {
    // Bad 22
    name: 'Pufferbad',
    is_enabled: false,
  },
  {
    // Bad 23
    name: 'Standspüle (Kaskade)',
    type: BathType.RinseStand,
    priority: Priority.SuperHigh,
    is_enabled: true,
    next: [
      {
        process: [Process.Copper, Process.Silver, Process.Rework],
        baths: [24],
      },
      {
        process: [Process.PlantEmptying],
        baths: [30, 26, 18, 13, 10],
      },
    ],
  },
  {
    // Bad 24
    name: 'Standspüle (Kaskade)',
    type: BathType.RinseStand,
    priority: Priority.SuperHigh,
    is_enabled: true,
    next: [
      {
        process: [Process.Copper, Process.Silver, Process.Rework],
        baths: [26, 30],
      },
      {
        process: [Process.PlantEmptying],
        baths: [30, 26, 18, 13, 10],
      },
    ],
  },
  {
    // Bad 25
    name: 'Heißspüle',
    is_enabled: false,
  },
  {
    // Bad 26
    name: 'Fliessspüle',
    type: BathType.RinseFlow,
    priority: Priority.SubLow,
    is_enabled: true,
    next: [
      {
        process: [
          Process.Copper,
          Process.Silver,
          Process.Rework,
          Process.PlantFilling,
        ],
        baths: [31],
      },
    ],
  },
  {
    // Bad 27
    name: 'Parkplatz',
    type: BathType.Parkplatz,
    priority: Priority.SubLow,
    is_enabled: true,
    next: [
      {
        process: [Process.PlantFilling],
        baths: [31],
      },
    ],
  },
  {
    // Bad 28
    name: 'Parkplatz',
    type: BathType.Parkplatz,
    priority: Priority.SubLow,
    is_enabled: true,
    next: [
      {
        process: [Process.PlantFilling],
        baths: [31],
      },
    ],
  },
  {
    // Bad 29
    name: 'Parkplatz',
    type: BathType.Parkplatz,
    priority: Priority.SubLow,
    is_enabled: true,
    next: [
      {
        process: [Process.PlantFilling],
        baths: [31],
      },
    ],
  },
  {
    // Bad 30
    name: 'Fliessspüle',
    type: BathType.RinseFlow,
    priority: Priority.SubLow,
    is_enabled: true,
    next: [
      {
        process: [
          Process.Copper,
          Process.Silver,
          Process.Rework,
          Process.PlantFilling,
        ],
        baths: [31],
      },
    ],
  },
  {
    // Position 31
    name: 'Abladestation',
    type: BathType.LoadingStation,
    priority: Priority.Low,
    is_enabled: true,
    next: [
      {
        process: [Process.Copper, Process.Silver],
        baths: [3],
      },
      {
        process: [Process.PlantEmptying],
        baths: [10, 13, 18, 26, 30, 27, 28, 29],
      },
      {
        process: [Process.Rework],
        baths: [11],
      },
    ],
  },
];

/**
 * This costant specifies the auftrag to load
 */
export const aufragToWork: AuftragSettings[] = [
  {
    number: '16458719',
    material: '276.141.011',
    process: Process.Silver,
    silverAmount: 1.299,
    quantity: 40108,
  },
  {
    number: '16364066',
    material: '307.168.011',
    process: Process.Silver,
    silverAmount: 5.56,
    quantity: 40150,
  },
  {
    number: '16477107',
    material: '276.270.021',
    process: Process.Silver,
    silverAmount: 0.68,
    quantity: 50390,
    workTimeOverride: [
      {
        bathType: BathType.RinseFlow,
        time: 300,
      },
    ],
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '17179901',
    material: '279.038.073',
    process: Process.Silver,
    silverAmount: 2.531,
    quantity: 20000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473799',
    material: '257.024.101',
    process: Process.Silver,
    silverAmount: 17.345,
    quantity: 18000,
  },
  {
    number: '16473789',
    material: '279.124.011',
    process: Process.Silver,
    silverAmount: 5.983,
    quantity: 30000,
  },
  {
    number: '17150914',
    material: '276.466.011',
    process: Process.Copper,
    copperAmount: 5, // Is it not specified on the Auftrag
    silverAmount: 10,
    quantity: 5000,
  },
];
