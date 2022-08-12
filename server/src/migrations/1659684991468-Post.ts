import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class Post1659684991468 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // console.log("hello i am here")
        // await queryRunner.addColumn('post',new TableColumn({
        //     name:"points",
        //     type:'int',
        //     default:0
        // }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
