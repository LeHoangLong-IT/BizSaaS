import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Table } from './table.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Table, (table) => table.orders)
  table: Table;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, PREPARING, SERVED, PAID

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total_price: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  created_at: Date;
}
