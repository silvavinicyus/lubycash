import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UserPermissions extends BaseSchema {
  protected tableName = 'user_permissions';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().primary();
      table.uuid('secure_id').notNullable();
      table.integer('user_id').notNullable();
      table.integer('permission_id').notNullable();
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
