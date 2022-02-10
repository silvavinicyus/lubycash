import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Database from '@ioc:Adonis/Lucid/Database';
import Address from 'App/Models/Address';
import User from 'App/Models/User';
import { Kafka } from 'kafkajs';

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const {
      fullName,
      email,
      password,
      phone,
      cpfNumber,
      currentBalance,
      averageSalary,
      status,
      city,
      state,
      zipCode,
    } = request.body();

    const kafka = new Kafka({
      clientId: 'bet-lotery',
      brokers: ['localhost:9092', 'kafka:29092'],
    });

    const message = {
      full_name: fullName,
      phone,
      cpf_number: cpfNumber,
      current_balance: currentBalance,
      average_salary: averageSalary,
      state,
    };

    await Database.transaction(async (trx) => {
      const address = new Address();

      address.city = city;
      address.state = state;
      address.zipCode = zipCode;

      address.useTransaction(trx);
      await address.save();

      const user = new User();

      user.email = email;
      user.password = password;
      user.addressId = address.id;

      user.useTransaction(trx);
      await user.save();

      return user;
    });
  }
}
