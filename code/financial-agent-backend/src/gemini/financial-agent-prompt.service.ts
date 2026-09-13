import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FinancialAgentPromptService {
  private readonly logger = new Logger(FinancialAgentPromptService.name);

public async montarPromptEstrategico(userId: string, requestId: string, requestText: string): Promise<string> {
    this.logger.log(`Carregando prompt do arquivo markdown para o pedido ${requestId}...`);

    // 1. Definimos o caminho exato onde o arquivo .md está localizado conforme a estrutura da imagem
    const caminhoDoPrompt = path.join(process.cwd(), 'src', 'gemini', 'prompts', 'financial-prompt.md');

    // 2. Lemos o conteúdo do arquivo .md de forma síncrona ou assíncrona
    if (!fs.existsSync(caminhoDoPrompt)) {
      throw new Error(`O arquivo de prompt não foi encontrado em: ${caminhoDoPrompt}`);
    }
    let templatePrompt = fs.readFileSync(caminhoDoPrompt, 'utf-8');

    // 3. Buscamos os dados nas fontes (Perfil, Eventos, Opções e Imagens)
    const perfilUsuario = await this.buscarPerfilDoUsuario(userId);
    const eventosFinanceiros = await this.buscarEventosFinanceiros(userId);
    const opcoesDePagamento = await this.buscarOpcoesDePagamento(requestId);
    const dadosMultimodais = await this.processarImagensSeNecessario(eventosFinanceiros);

    // 4. Fazemos a substituição das "tags" (placeholders) do arquivo markdown pelos dados reais
    templatePrompt = templatePrompt
      .replace('{{userId}}', userId)
      .replace('{{homeCurrency}}', perfilUsuario?.home_currency || 'USD')
      .replace('{{availableBalance}}', String(perfilUsuario?.available_balance || 0))
      .replace('{{minimumBalance}}', String(perfilUsuario?.minimum_balance_to_keep || 0))
      .replace('{{spendingPreferences}}', perfilUsuario?.spending_preferences || 'Nenhuma')
      .replace('{{requestId}}', requestId)
      .replace('{{requestText}}', requestText)
      .replace('{{financialEvents}}', JSON.stringify(eventosFinanceiros, null, 2))
      .replace('{{imageVisionData}}', dadosMultimodais ? JSON.stringify(dadosMultimodais, null, 2) : 'Nenhuma imagem necessária.')
      .replace('{{paymentOptions}}', JSON.stringify(opcoesDePagamento, null, 2));

    return templatePrompt;
  }

  private async buscarPerfilDoUsuario(userId: string) {
    return {
      user_id: userId,
      home_currency: 'USD',
      available_balance: 5000,
      minimum_balance_to_keep: 500,
      spending_preferences: 'Evitar parcelamentos com juros altos.',
    };
  }

  private async buscarEventosFinanceiros(userId: string) {
    return [
      { event_id: 'event_01', type: 'salary', amount: 3000, date: '2026-04-01' },
      { event_id: 'event_02', type: 'rent', amount: -1200, date: '2026-04-05' },
    ];
  }

  private async buscarOpcoesDePagamento(requestId: string) {
    return [
      { payment_option_id: 'opt_1', type: 'full_payment' },
      { payment_option_id: 'opt_2', type: 'installments', installments_count: 3 },
    ];
  }

  private async processarImagensSeNecessario(eventos: any[]) {
    return null;
  }
}