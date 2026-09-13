import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import csvParser = require('csv-parser');
import { GeminiQueueService } from '../gemini/gemini.service';
import { FinancialAgentPromptService } from '../gemini/financial-agent-prompt.service';
import { OutputCsvService } from '../output/output-csv/output-csv.service';

@Injectable()
export class MainRunnerService {
  private readonly logger = new Logger(MainRunnerService.name);

  constructor(
    private readonly geminiQueue: GeminiQueueService,
    private readonly promptService: FinancialAgentPromptService,
    private readonly outputCsv: OutputCsvService,
  ) {}

 public async iniciarProcessamentoGeral(): Promise<any> {
    this.logger.log('Iniciando varredura completa do dataset/requests.csv...');

    const caminhoRequests = path.resolve(process.cwd(), '..', '..', 'dataset', 'requests.csv');

    if (!fs.existsSync(caminhoRequests)) {
      this.logger.error(`Arquivo requests.csv não encontrado em: ${caminhoRequests}`);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      fs.createReadStream(caminhoRequests)
        .pipe(csvParser())
        .on('data', async (linha) => {
          const requestId = linha['request_id'];
          const userId = linha['user_id'];
          const requestText = linha['request_text'];

          const promptEstrategico = await this.promptService.montarPromptEstrategico(userId, requestId, requestText);
          
          // Adiciona na fila e aguarda um pequeno respiro para não sobrecarregar
          await this.geminiQueue.adicionarNaFila(requestId, userId, promptEstrategico);
        })
        .on('end', async () => {
          this.logger.log('Leitura do CSV finalizada. Aguardando processamento completo da fila...');
          
          this.logger.log('Aguardando a Inteligência Artificial processar toda a fila. (Aviso: Isso vai demorar devido à pausa de segurança de 6 segundos entre as requisições!)...');

          
          await this.geminiQueue.aguardarFilaEsvaziar();

          this.logger.log('Todos os itens foram processados pela IA. O output.csv foi gerado.');
        })
        .on('error', (erro) => reject(erro));
    });
  }
}