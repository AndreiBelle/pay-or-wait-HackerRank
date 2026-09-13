import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';
import csvParser = require('csv-parser');
import { GeminiQueueService } from '../../gemini/gemini.service';

@Injectable()
export class LeitorCsvSeguroService {
  private readonly logger = new Logger(LeitorCsvSeguroService.name);

  constructor(private readonly filaDeEspera: GeminiQueueService) {}

  public async lerArquivoDePedidos(caminhoDoArquivo: string = 'dataset'): Promise<any> {
    try {
        const itensDaPasta = await fsPromises.readdir(caminhoDoArquivo);

        const arquivosCsv = itensDaPasta.filter(arquivo => path.extname(arquivo).toLowerCase() === '.csv');

        if (arquivosCsv.length === 0) {
            this.logger.log('Nenhum arquivo CSV válido foi encontrado na pasta.');
            return;
        }

        for (const nomeArquivo of arquivosCsv) {
            const caminhoCompleto = path.join(caminhoDoArquivo, nomeArquivo);

            this.logger.log(`Iniciando a leitura segura do arquivo: ${nomeArquivo}`);

            await new Promise((resolve, reject) => {
              fs.createReadStream(caminhoCompleto)
                .pipe(csvParser())
                .on('data', async (linhaAtualDoCsv) => {
                  const request_id = 'request_id';
                  const user_id = 'user_id';
                  const request_text = 'request_text';
                  const textoParaIa = `O usuário fez o seguinte pedido financeiro: "${request_text}". Avalie se ele pode pagar.`;
                  await this.filaDeEspera.adicionarNaFila(request_id, user_id, textoParaIa);
                })
                .on('end', () => {
                  this.logger.log(`A leitura do arquivo ${nomeArquivo} foi concluída.`);
                  resolve(true); 
                })
                .on('error', (erro) => {
                  this.logger.error(`Erro ao ler o arquivo CSV \({nomeArquivo}:\){erro.message}`);
                  reject(erro); 
                });
            });
        }

        this.logger.log('Todos os arquivos da pasta foram processados com sucesso!');

    } catch (erro) {
        this.logger.error('Ocorreu um erro ao tentar ler a pasta de pedidos:', erro);
    }
  }

  private desarmarInjecaoCsv(linha: any): any {
    const linhaSegura = {};

    for (const coluna in linha) {
      let textoDoCampo = linha[coluna];

      if (textoDoCampo && typeof textoDoCampo === 'string') {
        const primeiroCaractere = textoDoCampo.charAt(0);
        if (primeiroCaractere === '=' || primeiroCaractere === '+' || primeiroCaractere === '-' || primeiroCaractere === '@') {
          textoDoCampo = "'" + textoDoCampo;
        }
      }
      
      linhaSegura[coluna] = textoDoCampo;
    }

    return linhaSegura;
  }
}