import { Component, OnInit } from '@angular/core';
import { Plant } from './classes/plant.class';
import { Simulation } from './classes/simulation.class';
import {
  aufragToWork,
  bathsInitData,
  drumsInitData,
  simulationSettings,
} from './settings';

// Enums
import { Graphics } from './enums/shared.enums';

// Graphic morots
import { AsciiGraphics } from './graphics/ascii.graphics';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  silberAnlage: Plant;
  silberAnlageSimulation: Simulation;

  graphicMotor: AsciiGraphics; // | CSSGraphics | ThreeJSGraphics
  renderingOutput: string;

  // View variables
  viewBtn: {
    start: boolean;
    pause: boolean;
    reset: boolean;
    resume: boolean;
  };

  constructor() {}

  ngOnInit() {
    this.viewBtn = {
      start: true,
      pause: false,
      reset: false,
      resume: false,
    };

    // Initialize graphics motor
    switch (simulationSettings.graphics) {
      case Graphics.ASCII: {
        this.graphicMotor = new AsciiGraphics();
        break;
      }
      case Graphics.CSS:
      case Graphics.ThreeJS: {
        console.error('The choosen graphic motor is not yet implemented');
        break;
      }
    }

    // Initialize new plant
    this.silberAnlage = new Plant(
      'Silberanlage',
      bathsInitData,
      drumsInitData,
      aufragToWork
    );

    // Initialize simulation
    this.silberAnlageSimulation = new Simulation(
      this.silberAnlage,
      simulationSettings
    );

    this.renderingOutput = this.graphicMotor.updateView(
      this.silberAnlageSimulation.plant.baths,
      this.silberAnlageSimulation.plant.crane
    );
  }

  simulationStart(): void {
    this.viewBtn = {
      start: false,
      pause: true,
      reset: false,
      resume: false,
    };

    this.silberAnlageSimulation.startSimulation();
  }

  simulationPause(): void {
    this.viewBtn = {
      start: false,
      pause: false,
      reset: true,
      resume: true,
    };

    this.silberAnlageSimulation.stopSimulation(true);
  }

  simulationResume(): void {
    this.viewBtn = {
      start: false,
      pause: true,
      reset: false,
      resume: false,
    };

    this.silberAnlageSimulation.resumeSimulation();
  }

  simulationReset(): void {
    this.viewBtn = {
      start: true,
      pause: false,
      reset: false,
      resume: false,
    };
    console.clear();

    this.silberAnlage = undefined;
    this.silberAnlageSimulation = undefined;

    this.silberAnlage = new Plant(
      'Silberanlage',
      bathsInitData,
      drumsInitData,
      aufragToWork
    );

    this.silberAnlageSimulation = new Simulation(
      this.silberAnlage,
      simulationSettings
    );
  }

  getSimulationTime(): number {
    if (typeof this.silberAnlageSimulation !== 'undefined') {
      if (typeof this.silberAnlageSimulation.time !== 'undefined') {
        return this.silberAnlageSimulation.time;
      }
    }
    return 0;
  }

  renderOutput(): string {
    return (this.renderingOutput = this.graphicMotor.updateView(
      this.silberAnlageSimulation.plant.baths,
      this.silberAnlageSimulation.plant.crane
    ));
  }
}
