import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Database from '@ioc:Adonis/Lucid/Database';
import Address from 'App/Models/Address';
import User from 'App/Models/User';
import { Kafka } from 'kafkajs';

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const { fullName, email, password, phone, cpfNumber, averageSalary, city, state, zipCode } =
      request.body();

    const kafka = new Kafka({
      clientId: 'bet-lotery',
      brokers: ['kafka:29092'],
    });

    const message = {
      full_name: fullName,
      email,
      phone,
      cpf_number: cpfNumber,
      average_salary: averageSalary,
    };

    console.log(message);

    const producerNewUser = kafka.producer();

    await producerNewUser.connect();

    await producerNewUser.send({
      topic: 'createuser',
      messages: [{ value: JSON.stringify(message) }],
    });

    // await Database.transaction(async (trx) => {
    //   const address = new Address();

    //   address.city = city;
    //   address.state = state;
    //   address.zipCode = zipCode;

    //   address.useTransaction(trx);
    //   await address.save();

    //   const user = new User();

    //   user.email = email;
    //   user.password = password;
    //   user.addressId = address.id;

    //   user.useTransaction(trx);
    //   await user.save();

    //   return user;
    // });

    producerNewUser.disconnect();

    return {
      message: 'okay',
    };
  }
}
