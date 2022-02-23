import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import CustomMessages from '../CustomMessages';

export default class GetStatementsValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super();
  }

  public schema = schema.create({
    params: schema.object().members({
      id: schema.number([rules.unsigned(), rules.exists({ table: 'users', column: 'id' })]),
    }),
  });
}
