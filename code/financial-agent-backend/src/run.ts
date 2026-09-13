import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MainRunnerService } from './runner/runner.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const runner = app.get(MainRunnerService);
  await runner.iniciarProcessamentoGeral();
  
  console.log('Processamento finalizado com sucesso. Fechando aplicação...');
  await app.close();
  process.exit(0);
}

bootstrap();