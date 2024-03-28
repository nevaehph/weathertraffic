import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import DataType from '../lib/DataType';

@Entity()
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  //JSON Data of request
  @Column({ type: 'json' })
  data: DataType;

  //Date Time Parameter of request
  @Column({ type: 'timestamp without time zone' })
  datetime: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
