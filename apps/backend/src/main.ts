import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './app-setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

