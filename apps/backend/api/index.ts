import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app-setup';

export default async (req: any, res: any) => {
    const app = await NestFactory.create(AppModule);
    setupApp(app);
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp(req, res);
};
