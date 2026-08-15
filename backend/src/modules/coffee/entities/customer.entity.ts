import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  name: string;

  @Column('int', { default: 0 })
  points: number;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @CreateDateColumn()
  created_at: Date;
}
