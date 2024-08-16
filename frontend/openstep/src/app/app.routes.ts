import { Routes } from '@angular/router';
import {TravelDetailComponent} from "../app/travel-detail/travel-detail.component"
import { TravelsComponent } from './travels/travels.component';
export const routes: Routes = [
    {path: "", component: TravelsComponent},
    {path: "travel/:id", component: TravelDetailComponent}
];