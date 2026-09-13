import { Module } from '@nestjs/common';
import { LeitorCsvSeguroService } from './leitor-csv-seguro/leitor-csv-seguro.service';
// Importamos o módulo inteiro do Gemini
import { GeminiModule } from '../gemini/gemini.module'; 

@Module({
  // Adicione o GeminiModule aqui nos imports
  imports: [GeminiModule], 
  providers: [LeitorCsvSeguroService],
})
export class DatasetModule {}