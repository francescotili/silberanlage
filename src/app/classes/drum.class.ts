import { Injectable } from '@angular/core';
import { Auftrag } from './auftrag.class';

// Enums
import { DrumStatus } from '../enums/drum.enums';

/**
 * Class for Drum management
 *
 * @method `getStatus()` Get the Status of the Drum
 * @method `loadParts()` Load the parts in the Drum
 * @method `unloadParts()` Unload the parts from the Drum
 * @method `setStatus()` Set a specific status for the Drum
 * @method `getAuftrag()` Retrieve current Auftrag object
 */
@Injectable({
  providedIn: 'root',
})
export class Drum {
  readonly number: number;
  private status: DrumStatus;
  private auftrag: Auftrag | undefined;

  constructor(number: number) {
    this.number = number;
  }

  /**
   * This function retrieve the status of the Drum: is it full or not?
   *
   * @returns the status of the Drum
   */
  public getStatus(): DrumStatus {
    return this.status;
  }

  /**
   * This function set the status of the Drum
   *
   * @param status The status to set
   */
  public setStatus(status: DrumStatus): void {
    switch (status) {
      case DrumStatus.Empty: {
        this.status = status;
        this.auftrag = undefined;
        break;
      }
      case DrumStatus.Full: {
        this.status = status;
      }
      default: {
        console.log(
          `[Drum:setStatus] Drum ${this.number}: wanted an unhandled status!`
        );
      }
    }
  }

  /**
   * This function load the parts in the drum
   *
   * @param auftrag The Auftrag to load
   */
  public loadParts(auftrag: Auftrag): void {
    this.auftrag = auftrag;
    this.setStatus(DrumStatus.Full);
  }

  /**
   * This functions retrieve the Auftrag from the Drum
   *
   * @returns the Auftrag object
   */
  public getAuftrag(): Auftrag {
    return this.auftrag;
  }

  /**
   * This function unload the parts from the Drum
   */
  public unloadParts(): void {
    this.setStatus(DrumStatus.Empty);
  }
}
