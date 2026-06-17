import { Routes } from '@angular/router';
import {TravelDetailComponent} from "../app/travel-detail/travel-detail.component"
import { TravelsComponent } from './travels/travels.component';
import { StepDetailComponent } from './step-detail/step-detail.component';
import { MyTravelsComponent } from './my-travels/my-travels.component';

export const routes: Routes = [
    {path: "", component: TravelsComponent},
    {path: "my-travels", component: MyTravelsComponent},
    {path: "travel/:uuid", component: TravelDetailComponent},
    {path: "travel/:uuidTravel/step/:idStep", component: StepDetailComponent},
];
