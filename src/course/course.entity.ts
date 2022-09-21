import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn} from 'typeorm';

@Entity()
export class CourseEntity extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  desc: string;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date
}