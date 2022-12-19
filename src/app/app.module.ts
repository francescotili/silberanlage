import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { SimulationButtonsComponent } from './graphics/buttons/buttons.component'
import { TimeOutputPipe } from './pipes/timeOutput.pipe';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, HelloComponent, SimulationButtonsComponent, TimeOutputPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
