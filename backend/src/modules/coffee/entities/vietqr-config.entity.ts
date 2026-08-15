import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('vietqr_configs')
export class VietqrConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  bank_id: string;

  @Column({ type: 'varchar', length: 100 })
  account_no: string;

  @Column({ type: 'varchar', length: 100 })
  account_name: string;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'boolean', default: true })
  show_amount: boolean;

  @Column({ type: 'boolean', default: true })
  show_account_name: boolean;

  @Column({ type: 'boolean', default: false })
  show_account_no: boolean;

  @Column({ type: 'boolean', default: false })
  show_add_info: boolean;

  @Column({ type: 'boolean', default: false })
  show_bank_name: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
