import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './order.entity';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // VD: "Bàn 1"

  @Column({ default: 'AVAILABLE' })
  status: string; // AVAILABLE, OCCUPIED

  @Column({ nullable: true })
  qr_code: string; // Chuỗi token định danh QR

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];
}
