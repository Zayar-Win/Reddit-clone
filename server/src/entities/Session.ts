import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({tableName:'session'})
export class Session {

    @PrimaryKey()
    id:number

    @Property()
    sid:number

    @Property({type:'text'})
    sess = ""

    @Property()
    expires_at:Date = new Date()
}
