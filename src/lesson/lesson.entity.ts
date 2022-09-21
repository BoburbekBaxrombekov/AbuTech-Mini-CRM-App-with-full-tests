import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn} from 'typeorm';

@Entity()
export class LessonEntity extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  duration: string;

  @Column()
  video: string;

  @Column()
  teacherName: string

  @Column()
  courseId: number

  @CreateDateColumn()
  createdAt: Date
}