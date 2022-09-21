import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn } from 'typeorm';

@Entity()
export class StudentEntity extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  @Column()
  login: string

  @Column()
  password: string

  @Column()
  loginAt: string

  @Column({default: false})
  isOnline: boolean

  @CreateDateColumn()
  createdAt: Date
  
  @Column({default: "[]"})
  courses: string
}