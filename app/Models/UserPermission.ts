import { DateTime } from 'luxon';
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import { v4 as uuidV4 } from 'uuid';
import Permission from './Permission';
import User from './User';

export default class UserPermission extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public secureId: string;

  @column()
  public userId: number;

  @column()
  public permissionId: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => Permission)
  public permission: BelongsTo<typeof Permission>;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @beforeCreate()
  public static createUUID(permission: Permission) {
    permission.secureId = uuidV4();
  }
}
