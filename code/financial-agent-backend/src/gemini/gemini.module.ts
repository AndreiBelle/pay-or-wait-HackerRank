import { Module } from '@nestjs/common';
import { GeminiQueueService } from './gemini.service';
import { FinancialAgentPromptService } from './financial-agent-prompt.service';
import { OutputModule } from '../output/output.module';

@Module({
  imports: [OutputModule],
  providers: [GeminiQueueService, FinancialAgentPromptService],
  exports: [GeminiQueueService, FinancialAgentPromptService]
})
export class GeminiModule {}
