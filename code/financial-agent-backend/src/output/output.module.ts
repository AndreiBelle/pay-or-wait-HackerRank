import { Module } from '@nestjs/common';
import { OutputCsvService } from './output-csv/output-csv.service';

@Module({
  providers: [OutputCsvService],
  exports: [OutputCsvService]
})
export class OutputModule {}
