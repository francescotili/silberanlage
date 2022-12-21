import { Injectable } from '@angular/core';
import { Drum } from './drum.class';
import { defaultCraneTimes, plantSettings } from '../settings';

// Enums
import { CraneStatus, CraneWorkingPhase } from '../enums/crane.enums';

// Interfaces
import { CraneOperation, CranePhase } from '../interfaces/crane.interfaces';
import { Logger } from './logger.class';
import { LogImportance } from '../enums/shared.enums';

@Injectable({
  providedIn: 'root',
})
/**
 * Class for Crane management
 *
 * @method `updateTime()` Update the remaining time, based on sampleTime
 * @method `getPhase()` Retrieve the current phase of the Crane
 * @method `setStatus()` Set the desired status
 * @method `nextPhase()` Go to the next phase of the crane
 * @method `getTime()` Retrieve current remaining time
 * @method `getStatus()` Retrieve the current crane status
 * @method `calculateMovingTime()` Calculate time needed for a phase
 */
export class Crane {
  public position: number;
  private status: CraneStatus;
  drum: Drum | undefined;
  remainingTime: number | undefined;
  phases: CranePhase[];
  currentPhase: CraneWorkingPhase | undefined;
  private logger: Logger;
  craneTotalDistance: number;

  constructor() {
    this.position = plantSettings.craneStartingPosition;
    this.status = CraneStatus.Waiting;
    this.phases = [];
    this.logger = new Logger();
    this.craneTotalDistance = 0;
  }

  /**
   * This function updates the remaining time of the Crane and
   * then call the function to update Crane position
   *
   * @param sampleTime The time to subtract from the remaining time
   */
  public updateTime(sampleTime: number): void {
    this.remainingTime -= sampleTime;
    this.updatePosition();
  }

  /**
   * This function updates the position of the Crane, based on
   * time elapsed and remaining, of each phase
   */
  private updatePosition(): void {
    switch (this.getPhase()) {
      case CraneWorkingPhase.Draining:
      case CraneWorkingPhase.Picking:
      case CraneWorkingPhase.Dropping: {
        this.position = this.phases[0].origin;
        break;
      }
      case CraneWorkingPhase.Moving: {
        this.position = Math.round(
          (this.phases[0].time - this.remainingTime) /
            (this.phases[0].time /
              (this.phases[0].destination - this.phases[0].origin)) +
            this.phases[0].origin
        );
        break;
      }
      case undefined: {
        this.logger.log(
          'Crane:updatePosition',
          'Was called but Crane status is undefined',
          LogImportance.Warn
        );
        break;
      }
      default: {
        this.logger.log(
          'Crane:updatePosition',
          `Was called, but the Crane is in an unhandled phase: ${this.getPhase()}`,
          LogImportance.Warn
        );
        break;
      }
    }
  }

  /**
   * This function retrieve the current phase of the Crane, if present
   *
   * @returns A CraneWorkingPhase object or undefined
   */
  public getPhase(): CraneWorkingPhase | undefined {
    if (this.phases.length > 0) {
      return this.phases[0].phase;
    } else {
      this.logger.log(
        'Crane:getPhase',
        'The crane phase is undefined',
        LogImportance.Normal
      );
      return undefined;
    }
  }

  /**
   * This function set the passed status to the Crane and make the necessary
   * modifications
   *
   * @param status The status to set
   * @param phases An Array of CranePhase to do, required for the status "Working"
   */
  // public setStatus(status: CraneStatus, phases?: CranePhase[]): void {
  public setStatus(status: CraneStatus, operation?: CraneOperation): void {
    this.logger.log(
      'Crane:setStatus',
      `New status requested for the crane: ${CraneStatus[status]}`,
      LogImportance.Normal
    );
    this.status = status;
    switch (this.status) {
      case CraneStatus.Waiting: {
        this.remainingTime = 0;
        this.currentPhase = undefined;
        break;
      }
      case CraneStatus.Working: {
        if (typeof operation !== 'undefined') {
          this.phases = [];

          // Push time to move from current crane position to origin position
          let tempTime = this.calculateMovingTime(
            this.position - operation.origin.id
          );
          if (tempTime > 0) {
            this.phases.push({
              origin: this.position,
              destination: operation.origin.id,
              phase: CraneWorkingPhase.Moving,
              time: tempTime,
              transferDrum: false,
            } as CranePhase);
            this.craneTotalDistance += Math.abs(
              operation.origin.id - this.position
            );
          }

          // Push time to drain
          this.phases.push({
            origin: operation.origin.id,
            phase: CraneWorkingPhase.Draining,
            time:
              typeof operation.origin.drainTime !== 'undefined'
                ? operation.origin.drainTime
                : defaultCraneTimes.drain,
            transferDrum: true,
          } as CranePhase);

          // Push time to pickup
          this.phases.push({
            origin: operation.origin.id,
            phase: CraneWorkingPhase.Picking,
            time: defaultCraneTimes.pick,
            transferDrum: false,
          } as CranePhase);

          // Push time to move from origin to destination position
          tempTime = this.calculateMovingTime(
            operation.origin.id - operation.destination.id
          );
          if (tempTime > 0) {
            this.phases.push({
              origin: operation.origin.id,
              destination: operation.destination.id,
              phase: CraneWorkingPhase.Moving,
              time: tempTime,
              transferDrum: false,
            } as CranePhase);
            this.craneTotalDistance += Math.abs(
              operation.destination.id - operation.origin.id
            );
          }

          // Push time to drop
          this.phases.push({
            origin: operation.destination.id,
            phase: CraneWorkingPhase.Dropping,
            time: defaultCraneTimes.drop,
            transferDrum: true,
          } as CranePhase);

          // Send operation to the crane
          this.currentPhase = this.phases[0].phase;
          this.remainingTime = this.phases[0].time;
          this.logger.log(
            'Crane:nextPhase',
            `New phase for Crane: ${CraneWorkingPhase[this.phases[0].phase]}`,
            LogImportance.Normal
          );
        } else {
          this.logger.log(
            'Crane:setStatus',
            'The crane was set to "Working" but no Operation was passed!',
            LogImportance.Error
          );
        }
        break;
      }
      default: {
        this.logger.log(
          'Crane:setStatus',
          `An unhandled craneStatus (${status}) was passed to the crane`,
          LogImportance.Error
        );
        break;
      }
    }
  }

  /**
   * This function switch the crane to the next phase, removing the current one
   */
  public nextPhase(): void {
    this.phases.splice(0, 1); // Remove current elapsed operation
    if (this.phases.length > 0) {
      this.logger.log(
        'Crane:nextPhase',
        `New phase for Crane: ${CraneWorkingPhase[this.phases[0].phase]}`,
        LogImportance.Normal
      );
      this.currentPhase = this.phases[0].phase;
      this.remainingTime = this.phases[0].time;
    } else {
      this.logger.log(
        'Crane:nextPhase',
        'No new phases, crane operation has been completed',
        LogImportance.Normal
      );
      this.remainingTime = 0;
      this.setStatus(CraneStatus.Waiting);
    }
  }

  /**
   * This function retrieve the current remaining time
   */
  public getTime(): number | undefined {
    return this.remainingTime;
  }

  /**
   * This function retrieve the current crane status
   */
  public getStatus(): CraneStatus {
    return this.status;
  }

  /**
   * This function calculate the duration of a moving operation, based
   * on the distance needed to be covered
   *
   * @param distance The distance between the origin and destination bath
   */
  public calculateMovingTime(distance: number): number {
    switch (Math.abs(distance)) {
      case 0: {
        // Already in position
        return 0;
      }
      case 1: {
        // Adiacent bath
        return defaultCraneTimes.moving.contiguous;
      }
      case 2: {
        return defaultCraneTimes.moving.start + defaultCraneTimes.moving.end;
      }
      default: {
        return (
          defaultCraneTimes.moving.start +
          defaultCraneTimes.moving.middle * (Math.abs(distance) - 2) +
          defaultCraneTimes.moving.end
        );
      }
    }
  }
}
