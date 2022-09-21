import {Repository} from "typeorm";
import { CourseEntity } from "../course/course.entity";
import { CustomRepository } from "../database/typeorm-ex.decorator";


@CustomRepository(CourseEntity)
export class CourseRepository extends Repository<CourseEntity> {
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
}