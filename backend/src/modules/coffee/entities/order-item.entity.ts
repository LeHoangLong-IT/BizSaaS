import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { Topping } from './topping.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ default: 1 })
  quantity: number;

  @Column({ nullable: true })
  note: string; // Ghi chú (VD: ít đá, ít đường)

  @ManyToMany(() => Topping)
  @JoinTable({
    name: 'order_item_toppings',
    joinColumn: { name: 'order_item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topping_id', referencedColumnName: 'id' }
  })
  toppings: Topping[];
}
