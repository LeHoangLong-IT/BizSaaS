import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Table } from './table.entity';
import { OrderItem } from './order-item.entity';

import { Customer } from './customer.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Table, (table) => table.orders, { nullable: true })
  table: Table;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  customer: Customer;

  @Column({ type: 'varchar', nullable: true })
  customer_name: string | null; // Tên khách hàng (cho khách vãng lai)

  @Column({ default: 'TAKEAWAY' })
  order_type: string; // DINE_IN, TAKEAWAY

  @Column({ default: 'PENDING' })
  status: string; // PENDING, PREPARING, SERVED, PAID

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total_price: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  created_at: Date;
}
