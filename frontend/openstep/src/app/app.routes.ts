import { Routes } from '@angular/router';
import {TravelDetailComponent} from "../app/travel-detail/travel-detail.component"
import { TravelsComponent } from './travels/travels.component';
import { StepDetailComponent } from './step-detail/step-detail.component';
export const routes: Routes = [
    {path: "", component: TravelsComponent},
    {path: "travel/:id", component: TravelDetailComponent},
    {path: "step/:id", component: StepDetailComponent},
];