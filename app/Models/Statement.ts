import { DateTime } from 'luxon';
import { BaseModel, beforeCreate, column, hasOne } from '@ioc:Adonis/Lucid/Orm';
import { v4 as uuidV4 } from 'uuid';

export default class Statement extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public secureId: string;

  @column()
  public operation: string;

  @column()
  public value: number;

  @column()
  public senderId: string;

  @column()
  public receiverId: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static createUUID(statement: Statement) {
    statement.secureId = uuidV4();
  }
}
