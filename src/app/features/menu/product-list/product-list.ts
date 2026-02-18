import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../core/services/firestore.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent {
  private firestoreService = inject(FirestoreService);

  // Obtenemos los productos como un Observable
  products$ = this.firestoreService.getProducts();
}
