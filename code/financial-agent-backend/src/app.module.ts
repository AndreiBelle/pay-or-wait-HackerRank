import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeminiModule } from './gemini/gemini.module';
import { PrismaModule } from './prisma/prisma.module';
import { DatasetModule } from './dataset/dataset.module';
import { OutputModule } from './output/output.module';
import { RunnerModule } from './runner/runner.module';

@Module({
  imports: [GeminiModule, PrismaModule, DatasetModule, OutputModule, RunnerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
