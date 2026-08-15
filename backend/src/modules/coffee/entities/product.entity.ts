import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Category } from './category.entity';
import { Topping } from './topping.entity';
import { ToppingGroup } from './topping-group.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  image_url: string;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToMany(() => Topping)
  @JoinTable({
    name: 'product_toppings',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topping_id', referencedColumnName: 'id' },
  })
  toppings: Topping[];

  @ManyToMany(() => ToppingGroup)
  @JoinTable({
    name: 'product_topping_groups',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' },
  })
  toppingGroups: ToppingGroup[];
}
