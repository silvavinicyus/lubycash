import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Database from '@ioc:Adonis/Lucid/Database';
import Address from 'App/Models/Address';
import Permission from 'App/Models/Permission';
import User from 'App/Models/User';
import UserPermission from 'App/Models/UserPermission';
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
      city: city,
      state: state,
      zipCode: zipCode,
      password: password,
    };

    const producerNewUser = kafka.producer();

    await producerNewUser.connect();

    await producerNewUser.send({
      topic: 'createuser',
      messages: [{ value: JSON.stringify(message) }],
    });

    producerNewUser.disconnect();

    const consumerUserCreated = kafka.consumer({ groupId: 'user_created' });
    await consumerUserCreated.connect();
    await consumerUserCreated.subscribe({ topic: 'usercreated', fromBeginning: false });

    await consumerUserCreated.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = message.value!.toString();
        const dataJson = JSON.parse(data);

        // await Database.transaction(async (trx) => {
        const address = new Address();

        address.city = city;
        address.state = state;
        address.zipCode = zipCode;

        // address.useTransaction(trx);
        await address.save();

        const user = new User();

        user.email = email;
        user.password = password;
        user.addressId = address.id;

        // user.useTransaction(trx);
        await user.save();

        const userPermission = new UserPermission();
        const permission = await Permission.findByOrFail('type', 'client');

        userPermission.userId = user.id;
        userPermission.permissionId = permission.id;

        // userPermission.useTransaction(trx);
        await userPermission.save();
        // });
      },
    });

    return response.ok({
      message: 'Your request has been received, we will send you an email when we have a result!',
    });
  }
}
