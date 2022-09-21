import {Repository} from "typeorm";
import { StudentEntity } from "../student/student.entity";
import { CustomRepository } from "../database/typeorm-ex.decorator";


@CustomRepository(StudentEntity)
export class StudentRepository extends Repository<StudentEntity> {
    public async customSave(dto) {
        return this.save(await this.create(dto))
    }
    
    public async customFindAll() {
        return this.find()
    }
    
    public async customFindOne(id) {
        return this.findBy({id})
    }
    
    public async customUpdate(id, dto) {
        return this.update(id, dto)
    }
    
    public async customDelete(id) {
        return this.delete(id)
    }
    
    public async customLogin(login, password) {
        return this.findOneBy({login, password})
    }
}