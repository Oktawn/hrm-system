import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UsersEntity } from "./users.entity";


@Entity("refresh_tokens")
export class RefreshTokenEnity {


  @PrimaryColumn()
  tokens: string;

  @OneToOne(() => UsersEntity, (user) => user.refreshToken)
  @JoinColumn()
  user: UsersEntity;

  @Column({ type: "date" })
  expires_at: Date;

}