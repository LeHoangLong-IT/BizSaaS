import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Topping } from './topping.entity';

@Entity('topping_groups')
export class ToppingGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Topping)
  @JoinTable({
    name: 'topping_group_toppings',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topping_id', referencedColumnName: 'id' },
  })
  toppings: Topping[];
}
