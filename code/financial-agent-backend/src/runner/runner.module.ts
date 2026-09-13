import { Module } from '@nestjs/common';
import { MainRunnerService } from './runner.service';
import { GeminiModule } from '../gemini/gemini.module';
import { OutputModule } from '../output/output.module';

@Module({
  imports:[
    GeminiModule,
    OutputModule
  ],
  providers: [MainRunnerService],
})
export class RunnerModule {}
