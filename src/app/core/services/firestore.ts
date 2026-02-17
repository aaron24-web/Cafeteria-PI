import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore); // Inyección moderna de Angular

  // Obtener todos los productos en tiempo real
  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'productos');
    return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
  }

  // Obtener una mesa específica
  getTable(id: string) {
    const tableRef = doc(this.firestore, `mesas/${id}`);
    return docData(tableRef);
  }
}
