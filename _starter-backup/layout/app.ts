import { Component, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import {ProductList} from './layout/product-list/product-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, ProductList],
    templateUrl: `./app.html`,
    styleUrls: [`./app.css`]
})
export class App {
    protected readonly title = signal('product-list');
}