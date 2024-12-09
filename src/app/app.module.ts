import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import { NavComponent } from './components/sidenav/sidenav.component';
import { NotesComponent } from './components/notes/notes.component';
import { InputComponent } from './components/input/input.component';
import { ph } from './pipes/ph.pipe';
import { AppRoutingModule } from './app-routing.module';
import { CboxSortPipe } from './pipes/cbox-sort.pipe';
import { CboxDonePipe } from './pipes/cbox-done.pipe';
import { NotesToolsPipe } from './pipes/notes-tools.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    NavComponent,
    NotesComponent,
    InputComponent,
    ph,
    CboxSortPipe,
    CboxDonePipe,
    NotesToolsPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
