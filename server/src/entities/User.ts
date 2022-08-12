import { Field, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity } from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class User extends BaseEntity{
    @Field()
    @PrimaryGeneratedColumn()
    id!:number;

    @Field()
    @Column()
    lastName:string

    @Field()
    @Column()
    firstName:string

    @Field(() => String,{nullable:true})
    @Column()
    email:string
    
    @Column()
    password:string

    @OneToMany(() => Post,(post) => post.creator)
    posts : Post[]

    @OneToMany(() => Updoot,(updoot) => updoot.user)
    updoots : Updoot[];

    @Field()
    @CreateDateColumn()
    createdAt?:Date;

    @Field()
    @UpdateDateColumn()
    updatedAt?:Date
}