import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import CustomMessages from '../CustomMessages';

export default class StoreUserValidator extends CustomMessages {
  constructor(protected ctx: HttpContextContract) {
    super();
  }

  public schema = schema.create({
    fullName: schema.string({}, [
      rules.minLength(5),
      rules.alpha({
        allow: ['space'],
      }),
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email', caseInsensitive: true }),
    ]),
    password: schema.string({}, [rules.minLength(8)]),
    phone: schema.string({}, [rules.minLength(11), rules.maxLength(14)]),
    cpfNumber: schema.string({}, [rules.minLength(11), rules.maxLength(11)]),
    averageSalary: schema.number([rules.unsigned()]),
    city: schema.string({}, [
      rules.minLength(3),
      rules.alpha({
        allow: ['space'],
      }),
    ]),
    state: schema.string({ trim: true }, [rules.minLength(2), rules.alpha()]),
    zipCode: schema.string({ trim: true }, [rules.minLength(8), rules.maxLength(9)]),
  });
}
