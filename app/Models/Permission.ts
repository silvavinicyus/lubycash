import { DateTime } from 'luxon';
import { v4 as uuidV4 } from 'uuid';
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm';

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public secureId: string;

  @column()
  public type: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static createUUID(permission: Permission) {
    permission.secureId = uuidV4();
  }
}
