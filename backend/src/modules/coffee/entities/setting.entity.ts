import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;
}
