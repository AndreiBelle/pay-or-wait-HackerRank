import { Test, TestingModule } from '@nestjs/testing';
import { OutputCsvService } from './output-csv.service';

describe('OutputCsvService', () => {
  let service: OutputCsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutputCsvService],
    }).compile();

    service = module.get<OutputCsvService>(OutputCsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
