import { DateTime } from 'luxon';
import { BaseModel, beforeCreate, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm';
import { v4 as uuidV4 } from 'uuid';
import Hash from '@ioc:Adonis/Core/Hash';
import UserPermission from './UserPermission';

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public secureId: string;

  @column()
  public email: string;

  @column()
  public password: string;

  @column()
  public addressId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasMany(() => UserPermission)
  public userPermissions: HasMany<typeof UserPermission>;

  @beforeCreate()
  public static createUUID(user: User) {
    user.secureId = uuidV4();
  }

  @beforeCreate()
  public static async hashPassword(user: User) {
    user.password = await Hash.make(user.password);
  }
}
