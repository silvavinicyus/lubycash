import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Statements extends BaseSchema {
  protected tableName = 'statements';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().primary();
      table.uuid('secure_id').notNullable();
      table.string('operation').notNullable();
      table.float('value').notNullable().unsigned();
      table
        .integer('sender_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table
        .integer('receiver_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
