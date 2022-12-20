import { Injectable } from '@angular/core';

// Enums
import { AuftragStatus } from '../enums/auftrag.enums';
import { BathType } from '../enums/bath.enums';
import { LogImportance, Process } from '../enums/shared.enums';

// Interfaces
import { AuftragSettings } from '../interfaces/auftrag.interfaces';
import { WorkTime } from '../interfaces/shared.interfaces';
import { plantSettings } from '../settings';
import { Logger } from './logger.class';

@Injectable({
  providedIn: 'root',
})
/**
 * Class for Auftrag management
 *
 * @method `getWorkTime()` Retrieve the working time for a specific BathType
 * @method `setStatus()` Set the Status of the Auftrag
 * @method `getStatus()` Get the Status of the Auftrag
 */
export class Auftrag {
  readonly number: string;
  readonly material: string;
  readonly process: Process;
  readonly silverAmount: number; // Ag Bedarf in g/1000 Stück
  readonly copperAmount: number; // Cu Bedarf in g/1000 Stück
  readonly quantity: number; // Stückzahl
  readonly workTimeOverride: WorkTime[];
  private status: AuftragStatus;
  private logger: Logger;

  constructor(auftrag: AuftragSettings) {
    this.number = auftrag.number;
    this.material = auftrag.material;
    this.process = auftrag.process;
    this.status = AuftragStatus.Queue;
    this.silverAmount = auftrag.silverAmount;
    if (typeof auftrag.copperAmount !== 'undefined') {
      this.copperAmount = auftrag.copperAmount;
    }
    this.quantity = auftrag.quantity;
    if (typeof auftrag.workTimeOverride !== 'undefined') {
      this.workTimeOverride = auftrag.workTimeOverride;
    }
    this.logger = new Logger();
  }

  /**
   * Retrieve the working time for a specific BathType.
   * If no work time is found, it returns `undefined`
   *
   * @param bathType The type of bath for which you want to retrieve the working time
   * @returns The time in seconds, the bath needs to work
   */
  public getWorkTime(bathType: BathType | undefined): number | undefined {
    if (typeof bathType !== 'undefined') {
      switch (bathType) {
        case BathType.Copper: {
          // TODO
          this.logger.log(
            'Auftrag:getWorkTime',
            'Calculation of copper working time not implemented',
            LogImportance.Normal
          );
          return undefined;
        }
        case BathType.Silver: {
          return Math.round(
            894.45 *
              ((this.silverAmount * (this.quantity / 1000)) /
                plantSettings.AgCurrent)
          );
        }
        case BathType.PreTreatment:
        case BathType.RinseFlow:
        case BathType.RinseStand:
        case BathType.LoadingStation:
          {
            if (typeof this.workTimeOverride !== 'undefined') {
              this.workTimeOverride.forEach((workTime) => {
                if (workTime.bathType === bathType) {
                  return workTime.time;
                } else {
                  return undefined;
                }
              });
            } else {
              return undefined;
            }
          }
          {
            return undefined;
          }
        case BathType.Parkplatz:
        default: {
          this.logger.log(
            'Auftrag:getWorkTime',
            'Function called with an unhandled bathType',
            LogImportance.Warn
          );
          return undefined;
        }
      }
    } else {
      this.logger.log(
        'Auftrag:getWorkTime',
        'Function called with an undefined bathType',
        LogImportance.Warn
      );
      return undefined;
    }
  }

  /**
   * Set the status of the Auftrag
   *
   * @param status The status to which set the Auftrag to
   */
  public setStatus(status: AuftragStatus): void {
    this.logger.log(
      'Auftrag:setStatus',
      `New status for Auftrag ${this.number}: ${AuftragStatus[status]}`,
      LogImportance.Normal
    );
    this.status = status;
  }

  /**
   * Retrieve the status of the Auftrag
   *
   * @returns the status of the Auftrag
   */
  public getStatus(): AuftragStatus {
    this.logger.log(
      'Auftrag:setStatus',
      `[Auftrag:setStatus] Auftrag ${this.number} has status: ${this.status}`,
      LogImportance.Normal
    );
    return this.status;
  }
}
