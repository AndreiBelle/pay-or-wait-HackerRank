import { Test, TestingModule } from '@nestjs/testing';
import { LeitorCsvSeguroService } from './leitor-csv-seguro.service';

describe('LeitorCsvSeguroService', () => {
  let service: LeitorCsvSeguroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeitorCsvSeguroService],
    }).compile();

    service = module.get<LeitorCsvSeguroService>(LeitorCsvSeguroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
