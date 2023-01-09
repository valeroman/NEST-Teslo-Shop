import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productservice: ProductsService,

  ) {}

  async runSeed() {

    await this.insertNewProducts();

    return 'SEED EXECUTED';
  }

  private async insertNewProducts() {

    await this.productservice.deleteAllProduct();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push(  this.productservice.create( product ) );
    });

    await Promise.all( insertPromises );

    return true;
  }
}
