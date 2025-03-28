import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'datetime' })
  dueDate!: Date;

  @Column({ 
    type: 'varchar',
    length: 50,
    default: 'medium' 
  })
  priority!: string;

  @Column({ 
    type: 'varchar',
    length: 50,
    default: 'to-do' 
  })
  status!: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'boolean', default: false })
  isRecurring!: boolean;

  @Column({ type: 'simple-json', nullable: true })
  recurringPattern?: {
    frequency: string;
    interval: number;
  };

  @Column({ type: 'varchar', length: 255 })
  createdBy!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedTo?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}