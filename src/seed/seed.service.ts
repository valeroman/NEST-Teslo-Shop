import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productservice: ProductsService,

    @InjectRepository( User )
    private readonly useRepository: Repository<User>
  ) {}

  async runSeed() {

    await this.deleteTables();
    const adminUser = await this.insertUsers();

    await this.insertNewProducts( adminUser );

    return 'SEED EXECUTED';
  }

  private async deleteTables() {

    await this.productservice.deleteAllProduct();

    const queryBuilder = this.useRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }

  private async insertUsers() {

    const seedUsers = initialData.users;

    

    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push( this.useRepository.create( user) )
    });

    const dbUsers = await this.useRepository.save( seedUsers );

    return dbUsers[0];
  }

  private async insertNewProducts( user: User ) {

    await this.productservice.deleteAllProduct();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push(  this.productservice.create( product, user ) );
    });

    await Promise.all( insertPromises );

    return true;
  }
}
