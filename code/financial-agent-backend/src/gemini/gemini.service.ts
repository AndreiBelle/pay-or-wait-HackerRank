import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OutputCsvService } from '../output/output-csv/output-csv.service';

@Injectable()
export class GeminiQueueService {
  private readonly logger = new Logger(GeminiQueueService.name);
  
  private filaDeEspera: any[] = [];
  
  private estaProcessando = false;
  
  private readonly TEMPO_DE_PAUSA = 6000; 
  private readonly ESPERA_INICIAL_ERRO = 10000; 

  constructor(
    private readonly prisma: PrismaService,
    private readonly outputCsv: OutputCsvService
  ) {}

  public async adicionarNaFila(originalRequestId: string, userId: string, promptTexto: string) {
    const registro = await this.prisma.processedRequest.upsert({
      where: { originalRequestId: originalRequestId },
      update: { status: 'PENDENTE' },
      create: {
        originalRequestId: originalRequestId,
        userId: userId,
        status: 'PENDENTE',
      },
    });

    this.filaDeEspera.push({
      bancoDeDadosId: registro.id,
      prompt: promptTexto,
    });

    this.logger.log(`Pedido ${originalRequestId} adicionado à fila.`);

    this.iniciarProcessamento();
  }

  private async iniciarProcessamento() {
    if (this.estaProcessando) {
      return;
    }

    this.estaProcessando = true;

    while (this.filaDeEspera.length > 0) {
      const pedidoAtual = this.filaDeEspera.shift();

      try {
        await this.chamarGeminiComTentativas(pedidoAtual);
        
        this.logger.log(`Aguardando ${this.TEMPO_DE_PAUSA / 1000} segundos para o próximo pedido...`);
        await this.pausar(this.TEMPO_DE_PAUSA);

      } catch (erro) {
        console.log('Error: ',erro)

      }
    }

    this.estaProcessando = false;
    this.logger.log('Todos os pedidos da fila foram processados.');
  }

  private async chamarGeminiComTentativas(pedido: any) {
    let tempoDeEsperaAtual = this.ESPERA_INICIAL_ERRO;
    let tentativasRestantes = 5;

    while (tentativasRestantes > 0) {
      try {


        const aiConfig = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
        const modelo = aiConfig.getGenerativeModel({ model: 'gemini-3.6-flash' });

        this.logger.log(`Enviando pedido ${pedido.bancoDeDadosId} para o Gemini...\n`);

        
        const resultado = await modelo.generateContent(pedido.prompt);
        const respostaTexto = resultado.response.text();

        const usoDeTokens = resultado.response.usageMetadata;

        // if (usoDeTokens) {
        //   await this.prisma.processedRequest.({
        //     where: { id: pedido.bancoDeDadosId },
        //     data: {
        //       status: 'CONCLUIDO',
        //       tokenUsage: {
        //         create: {
        //           inputTokens: usoDeTokens.promptTokenCount,
        //           outputTokens: usoDeTokens.candidatesTokenCount,
        //           totalTokens: usoDeTokens.totalTokenCount,
        //         },
        //       },
        //     },
        //   });
        //   this.logger.log(`Tokens salvos: ${usoDeTokens.totalTokenCount} no total.`);
        // }

        await this.outputCsv.salvarLinhaNoOutputCsv({
          request_id: pedido.originalRequestId,
          amount_safe_to_pay: 0,
          affordability_status: 'affordable_now',
          recommended_payment_method: 'full_payment',
          payment_plan: 'none',
          earliest_date_for_full_payment: '2026-04-01', 
          spending_changes_needed: 'none', 
          decision_explanation: respostaTexto
          
        });

        return;

      } catch (erro) {
        tentativasRestantes--; 
        
        this.logger.warn(`Erro na IA. \nTentativas restantes: ${tentativasRestantes}. \nMotivo: ${erro}\n`);

        if (tentativasRestantes === 0) {
          throw erro;
        }

        this.logger.log(`Pausando por ${tempoDeEsperaAtual / 1000} segundos antes de tentar de novo...`);
        await this.pausar(tempoDeEsperaAtual);
        
        tempoDeEsperaAtual = tempoDeEsperaAtual * 2;
      }
    }
  }


  public async aguardarFilaEsvaziar(): Promise<string> {
    
    return new Promise((resolve) => {
      
      const intervalo = setInterval(() => {
        
        if (this.filaDeEspera.length === 0 && !this.estaProcessando) {
          
          clearInterval(intervalo);
          
          resolve('Ok');
        }
      }, 1000); 
    });
  }

  private pausar(milissegundos: number) {
    return new Promise(resolve => setTimeout(resolve, milissegundos));
  }
}