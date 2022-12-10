import { Injectable } from '@angular/core';
import { Plant } from './plant.class';

// Enums
import { SimulationStatus } from '../enums/shared.enums';

// Interfaces
import { SimulationSettings } from '../interfaces/shared.interfaces';

/**
 * Class for the Simulation
 *
 * @method `getStatus()` Get the Status of the Drum
 */
@Injectable({
  providedIn: 'root',
})
export class Simulation {
  plant: Plant;
  settings: SimulationSettings;
  time: number;
  interval: number;
  status: SimulationStatus;

  constructor(plant: Plant, simulationSettings: SimulationSettings) {
    this.plant = plant;
    this.settings = simulationSettings;
    this.status = SimulationStatus.Ready;
  }

  public startSimulation(): void {
    this.status = SimulationStatus.Running;
    this.time = 0;
    this.stopSimulation(false);

    this.interval = setInterval(() => {
      this.plant.updateBaths(this.settings.sampleTime);
      this.plant.updateCrane(this.settings.sampleTime);
      this.time += this.settings.sampleTime;
    }, 1000 / this.settings.speed);
  }

  public resumeSimulation(): void {
    this.interval = setInterval(() => {
      this.stopSimulation(false);
      this.plant.updateBaths(this.settings.sampleTime);
      this.plant.updateCrane(this.settings.sampleTime);
      this.time += this.settings.sampleTime;
    }, 1000 / this.settings.speed);
  }

  public stopSimulation(force: boolean): void {
    if (force || this.time >= this.settings.maxTime) {
      this.status = SimulationStatus.Paused;
      clearInterval(this.interval);
    }
  }
}
