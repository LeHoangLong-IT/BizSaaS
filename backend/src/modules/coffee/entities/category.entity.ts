import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
